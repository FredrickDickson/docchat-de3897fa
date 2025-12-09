import { useState, useEffect, useCallback } from 'react';
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
  const fetchMessages = useCallback(async () => {
    if (!documentId) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('pdf_id', documentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        sender: msg.sender as 'user' | 'ai'
      }));
      setMessages(typedMessages);
    }
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;

    fetchMessages();

    // Subscribe to new messages for real-time updates
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
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, { ...newMessage, sender: newMessage.sender as 'user' | 'ai' }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, fetchMessages]);

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      message: question,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

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

      // Remove temp message and refresh to get real messages from DB
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      
      // Fetch latest messages to ensure we have the real ones
      await fetchMessages();

      return data;

    } catch (err: any) {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
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
    sendMessage,
    refreshMessages: fetchMessages
  };
};