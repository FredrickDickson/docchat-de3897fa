-- Fix Summaries Table Schema
-- Adds missing columns that the summarize-pdf Edge Function expects

-- Add missing columns to summaries table
ALTER TABLE public.summaries 
ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS credits_used INTEGER,
ADD COLUMN IF NOT EXISTS model_used TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_summaries_document_id ON public.summaries(document_id);
CREATE INDEX IF NOT EXISTS idx_summaries_user_created ON public.summaries(user_id, created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN public.summaries.document_id IS 'Reference to the document that was summarized';
COMMENT ON COLUMN public.summaries.credits_used IS 'Number of credits consumed for this summary';
COMMENT ON COLUMN public.summaries.model_used IS 'AI model used for summarization (e.g., deepseek-chat)';

-- Update RLS policies to allow Edge Functions to insert with document_id
-- The existing policies should work, but let's ensure service role can insert
DROP POLICY IF EXISTS "Service role can insert summaries" ON public.summaries;
CREATE POLICY "Service role can insert summaries"
  ON public.summaries FOR INSERT
  WITH CHECK (true);  -- Edge Functions run with service role key
