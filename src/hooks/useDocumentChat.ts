import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  created_at: string;
}

export const useDocumentChat = (documentId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing messages
  useEffect(() => {
    if (!documentId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('pdf_id', documentId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        // Type assertion to ensure sender is properly typed
        const typedMessages: Message[] = (data || []).map(msg => ({
          ...msg,
          sender: msg.sender as 'user' | 'ai'
        }));
        setMessages(typedMessages);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `pdf_id=eq.${documentId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error: queryError } = await supabase.functions.invoke('query-document', {
        body: {
          documentId,
          question,
          userId: user.id
        }
      });

      if (queryError) {
        if (queryError.message.includes('INSUFFICIENT_CREDITS')) {
          throw new Error('Insufficient credits. Please purchase more credits to continue.');
        }
        throw queryError;
      }

      // Messages are added via realtime subscription
      return data;

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage
  };
};
