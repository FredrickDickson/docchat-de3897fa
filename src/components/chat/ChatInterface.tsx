import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { chatWithDocument, isPuterAILoaded } from "@/lib/langchainChat";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  message: string;
}

interface ChatInterfaceProps {
  pdfId: string;
  userId: string;
}

export const ChatInterface = ({ pdfId, userId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documentText, setDocumentText] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch document text on mount
  useEffect(() => {
    const fetchDocumentText = async () => {
      try {
        // Try files table first
        const { data: fileData } = await supabase
          .from('files')
          .select('extracted_text')
          .eq('id', pdfId)
          .maybeSingle();

        if (fileData?.extracted_text) {
          setDocumentText(fileData.extracted_text);
          return;
        }

        // Try pdf_chunks table
        const { data: chunks } = await supabase
          .from('pdf_chunks')
          .select('chunk_text')
          .eq('pdf_id', pdfId)
          .order('page_number');

        if (chunks && chunks.length > 0) {
          setDocumentText(chunks.map(c => c.chunk_text).join('\n\n'));
        }
      } catch (error) {
        console.error('Error fetching document text:', error);
      }
    };

    fetchDocumentText();
  }, [pdfId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    const userMsgId = Math.random().toString();
    const aiMsgId = Math.random().toString();
    
    // Add user message
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', message: userMessage }]);
    
    // Add loading AI message
    setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', message: '' }]);

    try {
      // Use LangChain via edge function for chat
      const response = await chatWithDocument(pdfId, userMessage, userId);
      
      // Update AI message with response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, message: response }
            : msg
        )
      );
    } catch (error: any) {
      console.error('Chat error:', error);
      // Update AI message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, message: `Error: ${error.message || 'Failed to get response from AI'}` }
            : msg
        )
      );
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-background">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ask a question about this document to get started.</p>
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
