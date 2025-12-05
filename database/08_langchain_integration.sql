-- LangChain Integration - Database Schema Updates
-- Add LangChain-specific metadata fields to summaries table

-- Add new columns for LangChain metadata
DO $$ 
BEGIN
    -- Add chunk_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'summaries' 
                   AND column_name = 'chunk_count') THEN
        ALTER TABLE public.summaries ADD COLUMN chunk_count INT DEFAULT 1;
    END IF;

    -- Add langchain_metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'summaries' 
                   AND column_name = 'langchain_metadata') THEN
        ALTER TABLE public.summaries ADD COLUMN langchain_metadata JSONB;
    END IF;

    -- Add processing_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'summaries' 
                   AND column_name = 'processing_method') THEN
        ALTER TABLE public.summaries ADD COLUMN processing_method TEXT DEFAULT 'direct';
    END IF;
END $$;

-- Create index on processing_method for analytics
CREATE INDEX IF NOT EXISTS idx_summaries_processing_method ON public.summaries(processing_method);

-- Add comment to explain the new fields
COMMENT ON COLUMN public.summaries.chunk_count IS 'Number of text chunks processed by LangChain';
COMMENT ON COLUMN public.summaries.langchain_metadata IS 'JSON metadata from LangChain processing (model, tokens, etc)';
COMMENT ON COLUMN public.summaries.processing_method IS 'Method used: langchain or direct';
