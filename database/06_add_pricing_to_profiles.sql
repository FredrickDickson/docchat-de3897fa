-- Add pricing and usage tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS daily_usage INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create function to reset daily usage
CREATE OR REPLACE FUNCTION public.reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET daily_usage = 0,
      usage_reset_at = now() + interval '1 day'
  WHERE usage_reset_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment daily usage safely
CREATE OR REPLACE FUNCTION public.increment_daily_usage(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET daily_usage = daily_usage + 1
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
