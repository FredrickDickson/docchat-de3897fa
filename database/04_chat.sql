-- Chat tables for DocChat / docchat_flutter
-- This file defines:
-- - chat_sessions: a conversation between a user and the AI, usually tied to a document
-- - messages: individual messages within a session (user / assistant)

-- 1. chat_sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NULL REFERENCES public.documents(id) ON DELETE SET NULL,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- A user can see only their own chat sessions
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- A user can create chat sessions for themselves
CREATE POLICY "Users can create their own chat sessions"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- A user can update their own chat sessions (e.g. rename title)
CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- A user can delete their own chat sessions
CREATE POLICY "Users can delete their own chat sessions"
  ON public.chat_sessions
  FOR DELETE
  USING (auth.uid() = user_id);


-- 2. messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,                          -- 'user' | 'assistant' | 'system'
    content TEXT NOT NULL,
    tokens_used INT,
    cost_usd NUMERIC(10,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can see only messages that belong to their chat sessions
CREATE POLICY "Users can view their own chat messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert messages into their own sessions
CREATE POLICY "Users can insert messages into their own sessions"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- Trigger function to keep updated_at on chat_sessions in sync
CREATE OR REPLACE FUNCTION public.update_chat_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions
  SET updated_at = now()
  WHERE id = NEW.chat_session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Whenever a new message is created, update the parent chat_session.updated_at
CREATE TRIGGER chat_sessions_touch_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_session_updated_at();


