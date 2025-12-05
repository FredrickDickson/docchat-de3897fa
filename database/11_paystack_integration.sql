-- Paystack Integration - Database Schema Updates
-- Add Paystack-specific fields and create payment transactions table

-- 1. Update subscriptions table with Paystack fields
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_email_token TEXT;

-- 2. Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed
  plan TEXT NOT NULL, -- free | basic | pro
  interval TEXT NOT NULL, -- monthly | annual
  paystack_data JSONB,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.payment_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.payment_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only system can update (via service role)
CREATE POLICY "Service role can update transactions" 
ON public.payment_transactions FOR UPDATE
USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id 
ON public.payment_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference 
ON public.payment_transactions(reference);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
ON public.payment_transactions(status);

-- Trigger for updated_at
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comment on table
COMMENT ON TABLE public.payment_transactions IS 'Stores Paystack payment transaction records';
