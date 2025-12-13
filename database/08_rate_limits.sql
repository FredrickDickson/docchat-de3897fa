-- Create table for anonymous usage tracking
CREATE TABLE IF NOT EXISTS public.anonymous_usage (
  anon_id UUID PRIMARY KEY,
  chat_count INTEGER DEFAULT 0,
  ocr_count INTEGER DEFAULT 0,
  last_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for registered user usage tracking (daily limits)
CREATE TABLE IF NOT EXISTS public.user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_count INTEGER DEFAULT 0,
  ocr_count INTEGER DEFAULT 0,
  last_reset DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.anonymous_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Policies for anonymous_usage
-- Allow anyone to insert/update based on anon_id (since they are anonymous, we can't restrict by auth.uid())
-- Ideally this should be restricted to service role only if we only access it from Edge Functions.
-- If we access from client, we need policies. But the guide says "Backend logic", so we can keep it private/service role only.
-- However, for development/testing it might be useful to have access.
-- Let's stick to service role access for now as the enforcement is in Edge Functions.

-- Policies for user_usage
CREATE POLICY "Users can view their own usage"
ON public.user_usage FOR SELECT
USING (auth.uid() = user_id);

-- We don't want users to update their own usage directly from client, only read.
-- Updates should happen via Edge Functions (service role).
