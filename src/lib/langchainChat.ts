/**
 * LangChain Chat Utility
 * AI chat functionality using Supabase Edge Functions with LangChain/DeepSeek
 */

import { supabase } from '@/integrations/supabase/client';
import { getAnonId } from '@/utils/anon';

/**
 * Chat with document using LangChain via edge function
 * @param documentId - The document ID
 * @param question - User's question
 * @param userId - User ID (optional, will use anonymous ID if not provided)
 * @returns AI response
 */
export const chatWithDocument = async (
  documentId: string,
  question: string,
  userId?: string
): Promise<string> => {
  try {
    const body: any = {
      documentId,
      question
    };

    if (userId) {
      body.userId = userId;
    } else {
      body.anonId = getAnonId();
    }

    const { data, error } = await supabase.functions.invoke('query-document', {
      body
    });

    if (error) {
      if (error.message.includes('INSUFFICIENT_CREDITS')) {
        throw new Error('Insufficient credits. Chat requires 1 credit per message.');
      }
      throw new Error(error.message || 'Chat failed');
    }

    if (!data || !data.answer) {
      throw new Error('No response from AI');
    }

    return data.answer;
  } catch (error) {
    console.error('LangChain chat error:', error);
    throw new Error(`Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if LangChain chat is available (always true for edge function)
 */
export const isPuterAILoaded = (): boolean => {
  return true; // Always available via edge function
};
