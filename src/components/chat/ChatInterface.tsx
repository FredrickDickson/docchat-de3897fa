import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { chatWithDocument, isPuterAILoaded } from "@/lib/puterChat";

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

    if (!isPuterAILoaded()) {
      toast({
        title: "AI Not Ready",
        description: "Puter.js AI is loading. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    if (!documentText) {
      toast({
        title: "Document Not Ready",
        description: "Document text is still loading. Please wait.",
        variant: "destructive",
      });
      return;
    }

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    const tempId = Math.random().toString();
    setMessages(prev => [...prev, { id: tempId, sender: 'user', message: userMessage }]);

    try {
      // Use Puter.js AI for chat (client-side, free)
      const answer = await chatWithDocument(userMessage, documentText, 'general');
      setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', message: answer }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
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
                className={`p-3 rounded-lg max-w-[80%] text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-full bg-muted">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about this PDF..."
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
