import { useState, useRef, useEffect } from 'react';
import { useDocumentChat } from '@/hooks/useDocumentChat';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface DocumentChatInterfaceProps {
  documentId: string;
  documentName: string;
}

export const DocumentChatInterface = ({ documentId, documentName }: DocumentChatInterfaceProps) => {
  const { messages, isLoading, error, sendMessage } = useDocumentChat(documentId);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input;
    setInput('');

    try {
      await sendMessage(question);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Chat with Document
        </CardTitle>
        <CardDescription>
          Ask questions about: {documentName}
          <Badge variant="outline" className="ml-2">1 credit per message</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Ask a question to get started!</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="px-4 pb-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this document..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
