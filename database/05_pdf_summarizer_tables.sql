-- PDF Summarizer specific tables and updates
-- This file extends the existing schema for PDF Summarizer functionality

-- Update users table to match PDF Summarizer requirements
-- Note: If users table already exists, these ALTER statements will add missing columns
DO $$ 
BEGIN
    -- Add plan_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'plan_status') THEN
        ALTER TABLE public.users ADD COLUMN plan_status TEXT NOT NULL DEFAULT 'free';
    END IF;

    -- Add daily_summary_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'daily_summary_count') THEN
        ALTER TABLE public.users ADD COLUMN daily_summary_count INT NOT NULL DEFAULT 0;
    END IF;

    -- Add last_reset_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'last_reset_date') THEN
        ALTER TABLE public.users ADD COLUMN last_reset_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Update summaries table to match PDF Summarizer requirements
-- Add pdf_filename if it doesn't exist (rename from pdf_name if needed)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'summaries' 
               AND column_name = 'pdf_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'summaries' 
                       AND column_name = 'pdf_filename') THEN
        ALTER TABLE public.summaries RENAME COLUMN pdf_name TO pdf_filename;
    END IF;

    -- Add summary_type if it doesn't exist (rename from summary_length if needed)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'summaries' 
               AND column_name = 'summary_length') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'summaries' 
                       AND column_name = 'summary_type') THEN
        ALTER TABLE public.summaries RENAME COLUMN summary_length TO summary_type;
    END IF;

    -- Add domain_focus if it doesn't exist (rename from domain if needed)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'summaries' 
               AND column_name = 'domain') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' 
                       AND table_name = 'summaries' 
                       AND column_name = 'domain_focus') THEN
        ALTER TABLE public.summaries RENAME COLUMN domain TO domain_focus;
    END IF;
END $$;

-- Create usage_logs table for tracking API costs and usage
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    summary_id UUID REFERENCES public.summaries(id) ON DELETE SET NULL,
    api_cost NUMERIC(10, 4) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success', -- success | failed | processing
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on usage_logs
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_logs
CREATE POLICY "Users can view own usage logs"
    ON public.usage_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs"
    ON public.usage_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON public.summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON public.summaries(created_at);

-- Function to reset daily summary count (to be called by cron job)
CREATE OR REPLACE FUNCTION public.reset_daily_summary_counts()
RETURNS void AS $$
BEGIN
    UPDATE public.users
    SET daily_summary_count = 0,
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE OR last_reset_date IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and increment daily usage
CREATE OR REPLACE FUNCTION public.check_daily_usage_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    current_count INT;
    reset_date DATE;
BEGIN
    -- Get user plan and current count
    SELECT plan_status, daily_summary_count, last_reset_date
    INTO user_plan, current_count, reset_date
    FROM public.users
    WHERE id = user_uuid;

    -- Reset if it's a new day
    IF reset_date IS NULL OR reset_date < CURRENT_DATE THEN
        UPDATE public.users
        SET daily_summary_count = 0,
            last_reset_date = CURRENT_DATE
        WHERE id = user_uuid;
        current_count := 0;
    END IF;

    -- Check limits: free = 3/day, pro = unlimited
    IF user_plan = 'free' AND current_count >= 3 THEN
        RETURN FALSE;
    END IF;

    -- Increment count
    UPDATE public.users
    SET daily_summary_count = daily_summary_count + 1
    WHERE id = user_uuid;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

