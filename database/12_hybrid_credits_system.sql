-- Hybrid Credits System Migration
-- Adds monthly_credits and extra_credits to support hybrid subscription + pay-as-you-go model
-- This extends the existing schema from /database folder

-- 1. Add hybrid credits fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS monthly_credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS extra_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_renews_at TIMESTAMP WITH TIME ZONE;

-- 2. Add credits field to payment_transactions for credit purchases
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS credits INTEGER;

-- 2.5. Transform credits table from balance table to transaction log
-- First, preserve existing credit balances by creating a temporary backup
DO $$
DECLARE
  credits_table_exists boolean;
  has_old_schema boolean;
BEGIN
  -- Check if credits table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'credits'
  ) INTO credits_table_exists;
  
  IF credits_table_exists THEN
    -- Check if it has the old schema (credits column instead of amount)
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'credits' 
        AND column_name = 'credits'
    ) INTO has_old_schema;
    
    IF has_old_schema THEN
      -- Create temporary table to store existing balances
      CREATE TEMP TABLE IF NOT EXISTS credits_backup AS 
      SELECT user_id, credits FROM public.credits WHERE credits > 0;
      
      -- Drop the old credits table
      DROP TABLE IF EXISTS public.credits CASCADE;
    END IF;
  END IF;
END $$;

-- Create the new credits table as a transaction log
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deduction', 'monthly_reset', 'refund', 'initial_balance')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Migrate existing balances from backup if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'pg_temp_1' AND tablename LIKE 'credits_backup%') THEN
    INSERT INTO public.credits (user_id, amount, type, description, created_at)
    SELECT 
      user_id, 
      credits, 
      'initial_balance', 
      'Migrated from old credits table',
      now()
    FROM pg_temp.credits_backup;
  END IF;
END $$;

-- Enable RLS on the new credits table
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credits transaction log
DROP POLICY IF EXISTS "Users view own credits" ON public.credits;

CREATE POLICY "Users can view their own credit transactions"
  ON public.credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit transactions"
  ON public.credits FOR INSERT
  WITH CHECK (true);  -- Functions run as SECURITY DEFINER will handle authorization

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_created_at ON public.credits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_type ON public.credits(type);


-- 3. Update existing users to have default credits based on their plan
UPDATE public.users
SET monthly_credits = CASE
  WHEN plan = 'free' THEN 3
  WHEN plan = 'basic' THEN 200
  WHEN plan = 'pro' THEN 600
  WHEN plan = 'elite' THEN 1500
  ELSE 3
END
WHERE monthly_credits IS NULL OR monthly_credits = 0;

-- 4. Create function to deduct credits (monthly first, then extra)
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_cost INTEGER
) RETURNS TEXT AS $$
DECLARE
  v_monthly_credits INTEGER;
  v_extra_credits INTEGER;
  v_credit_type TEXT;
BEGIN
  -- Get current credits
  SELECT monthly_credits, extra_credits
  INTO v_monthly_credits, v_extra_credits
  FROM public.users
  WHERE id = p_user_id;
  
  -- Try monthly credits first
  IF v_monthly_credits >= p_cost THEN
    UPDATE public.users
    SET monthly_credits = monthly_credits - p_cost
    WHERE id = p_user_id;
    
    v_credit_type := 'monthly';
    
  -- Fallback to extra credits
  ELSIF v_extra_credits >= p_cost THEN
    UPDATE public.users
    SET extra_credits = extra_credits - p_cost
    WHERE id = p_user_id;
    
    v_credit_type := 'extra';
    
  ELSE
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;
  
  -- Log the deduction in credits table
  INSERT INTO public.credits (user_id, amount, type, description)
  VALUES (p_user_id, -p_cost, 'deduction', 'Credits used (' || v_credit_type || ')');
  
  RETURN v_credit_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to add extra credits (for purchases)
CREATE OR REPLACE FUNCTION public.add_extra_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Credits purchase'
) RETURNS VOID AS $$
BEGIN
  -- Add credits to user
  UPDATE public.users
  SET extra_credits = extra_credits + p_amount
  WHERE id = p_user_id;
  
  -- Log transaction in credits table
  INSERT INTO public.credits (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'purchase', p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to reset monthly credits (for subscription renewals)
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS VOID AS $$
BEGIN
  -- Reset credits based on plan for active subscriptions
  UPDATE public.users u
  SET monthly_credits = CASE
    WHEN u.plan = 'free' THEN 3
    WHEN u.plan = 'basic' THEN 200
    WHEN u.plan = 'pro' THEN 600
    WHEN u.plan = 'elite' THEN 1500
    ELSE 3
  END
  FROM public.subscriptions s
  WHERE u.id = s.user_id
    AND s.status = 'active'
    AND (u.subscription_renews_at IS NULL OR u.subscription_renews_at <= NOW());
  
  -- Update renewal date (add 30 days)
  UPDATE public.users u
  SET subscription_renews_at = COALESCE(u.subscription_renews_at, NOW()) + INTERVAL '30 days'
  FROM public.subscriptions s
  WHERE u.id = s.user_id
    AND s.status = 'active'
    AND (u.subscription_renews_at IS NULL OR u.subscription_renews_at <= NOW());
    
  -- Log reset transactions
  INSERT INTO public.credits (user_id, amount, type, description)
  SELECT 
    u.id,
    u.monthly_credits,
    'monthly_reset',
    'Monthly credits reset for ' || u.plan || ' plan'
  FROM public.users u
  JOIN public.subscriptions s ON u.id = s.user_id
  WHERE s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get total available credits
CREATE OR REPLACE FUNCTION public.get_total_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT (monthly_credits + extra_credits)
  INTO v_total
  FROM public.users
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_total, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_renews_at 
ON public.users(subscription_renews_at) 
WHERE subscription_renews_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_credits 
ON public.payment_transactions(credits) 
WHERE credits IS NOT NULL;

-- 9. Add comments for documentation
COMMENT ON COLUMN public.users.monthly_credits IS 'Credits that reset monthly based on subscription plan';
COMMENT ON COLUMN public.users.extra_credits IS 'Purchased credits that never expire';
COMMENT ON COLUMN public.users.subscription_renews_at IS 'When the monthly credits should be reset';
COMMENT ON COLUMN public.payment_transactions.credits IS 'Number of credits purchased in this transaction';

COMMENT ON FUNCTION public.deduct_credits IS 'Deducts credits from user account (monthly first, then extra). Returns credit type used.';
COMMENT ON FUNCTION public.add_extra_credits IS 'Adds purchased credits to user account and logs transaction';
COMMENT ON FUNCTION public.reset_monthly_credits IS 'Resets monthly credits for all active subscriptions (run daily via cron)';
COMMENT ON FUNCTION public.get_total_credits IS 'Returns total available credits (monthly + extra)';
