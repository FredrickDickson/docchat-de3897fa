import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { getAnonId } from "@/utils/anon";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  created_at?: string;
}

interface ChatInterfaceProps {
  pdfId: string;
  userId?: string;
}

const FREE_DAILY_CHAT_LIMIT = 5;

export const ChatInterface = ({ pdfId, userId }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { plan, dailyUsage, incrementUsage } = useSubscription();

  // Fetch existing chat history from Supabase
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!pdfId) {
        setIsLoadingHistory(false);
        return;
      }

      if (!userId) {
          setIsLoadingHistory(false);
          return;
      }

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('pdf_id', pdfId)
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching chat history:', error);
        } else if (data) {
          const typedMessages: Message[] = data.map(msg => ({
            id: msg.id,
            sender: msg.sender as 'user' | 'ai',
            message: msg.message,
            created_at: msg.created_at || undefined
          }));
          setMessages(typedMessages);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();

    // Subscribe to new messages for real-time updates (only for logged in users)
    if (userId) {
        const channel = supabase
          .channel(`chat-${pdfId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `pdf_id=eq.${pdfId}`
            },
            (payload) => {
              const newMsg = payload.new as any;
              // Only add if it belongs to this user
              if (newMsg.user_id === userId) {
                setMessages(prev => {
                  // Check if message already exists
                  if (prev.some(m => m.id === newMsg.id)) return prev;
                  return [...prev, {
                    id: newMsg.id,
                    sender: newMsg.sender as 'user' | 'ai',
                    message: newMsg.message,
                    created_at: newMsg.created_at
                  }];
                });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
    }
  }, [pdfId, userId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if free user has exceeded daily limit
    if (userId && plan === 'free' && dailyUsage >= FREE_DAILY_CHAT_LIMIT) {
      toast({
        title: 'Daily limit reached',
        description: 'You have used all your free daily chats. Upgrade to continue.',
        variant: 'destructive',
      });
      navigate('/pricing');
      return;
    }

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    // Optimistically add user message with temp ID
    const tempUserMsgId = `temp-user-${Date.now()}`;
    const tempAiMsgId = `temp-ai-${Date.now()}`;
    
    setMessages(prev => [...prev, { id: tempUserMsgId, sender: 'user', message: userMessage }]);
    setMessages(prev => [...prev, { id: tempAiMsgId, sender: 'ai', message: '' }]);

    try {
      const anonId = !userId ? getAnonId() : undefined;
      
      // Call the edge function which stores messages and uses DeepSeek
      const { data, error } = await supabase.functions.invoke('query-document', {
        body: {
          documentId: pdfId,
          question: userMessage,
          userId: userId,
          anonId: anonId
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      // Update AI message with response (real messages will come via realtime)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempAiMsgId 
            ? { ...msg, message: data.answer }
            : msg
        )
      );
      
      // Increment daily usage after successful message
      if (userId) {
          await incrementUsage();
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      // Remove temp messages on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMsgId && msg.id !== tempAiMsgId));
      
      // Check for insufficient credits and redirect to pricing
      if (error.message?.includes('INSUFFICIENT_CREDITS') || error.message?.includes('Insufficient credits')) {
        toast({
          title: "Insufficient credits",
          description: "You have run out of credits. Please purchase more to continue.",
          variant: "destructive",
        });
        navigate('/pricing');
      } else if (error.message?.includes('Daily free chats used') || error.message?.includes('Daily free chats exhausted')) {
          toast({
            title: "Daily limit reached",
            description: error.message,
            variant: "destructive",
          });
          if (!userId) {
              // Maybe prompt to sign up?
          } else {
              navigate('/pricing');
          }
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to get response from AI. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingHistory && userId) {
    return (
      <div className="flex flex-col h-[600px] border rounded-lg bg-background items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-background">
      <div className="px-4 py-2 border-b flex items-center justify-between">
        <span className="text-sm font-medium">Chat with Document</span>
        <Badge variant="outline" className="text-xs">
            {userId ? '1 credit per message' : 'Free anonymous chat'}
        </Badge>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ask a question about this document to get started.</p>
              <p className="text-xs mt-2">
                  {userId ? 'Chat history is automatically saved.' : 'Chat history is not saved for anonymous users.'}
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`p-2 rounded-full ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.message || (msg.sender === 'ai' && isLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse animation-delay-150">●</span>
                    <span className="animate-pulse animation-delay-300">●</span>
                  </span>
                ) : msg.message)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="Ask a question about this PDF..."
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};
