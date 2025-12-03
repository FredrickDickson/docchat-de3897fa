-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store PDF chunks and their embeddings
CREATE TABLE IF NOT EXISTS public.pdf_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_id UUID, -- Can link to a files table if you have one, or just store the ID
  page_number INT,
  chunk_text TEXT,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table to store chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_id UUID,
  sender TEXT CHECK (sender IN ('user', 'ai')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update subscriptions table to support multiple providers
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS provider TEXT, -- 'stripe' | 'paystack'
ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
ADD COLUMN IF NOT EXISTS last_payment_status TEXT;

-- Enable Row Level Security
ALTER TABLE public.pdf_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pdf_chunks
CREATE POLICY "Users can view their own chunks"
ON public.pdf_chunks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chunks"
ON public.pdf_chunks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chunks"
ON public.pdf_chunks FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a function to match chunks (similarity search)
CREATE OR REPLACE FUNCTION match_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pdf_chunks.id,
    pdf_chunks.chunk_text,
    1 - (pdf_chunks.embedding <=> query_embedding) AS similarity
  FROM pdf_chunks
  WHERE 1 - (pdf_chunks.embedding <=> query_embedding) > match_threshold
  AND pdf_chunks.user_id = filter_user_id
  ORDER BY pdf_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
