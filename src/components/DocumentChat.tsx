import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, Send, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DocumentChatProps {
  onBack: () => void;
}

const SUGGESTED_QUESTIONS = [
  "Summarize this document in 3 bullet points",
  "What are the key findings?",
  "What are the main recommendations?",
  "Explain this in simple terms",
];

// Mock responses for demo
const MOCK_RESPONSES: Record<string, string> = {
  default: `Based on my analysis of this document, here are the key points:

**Main Themes:**
• The document discusses strategic initiatives for Q4 2024
• Focus areas include digital transformation and operational efficiency
• Financial projections indicate 23% growth potential

**Key Recommendations:**
1. Invest in cloud infrastructure for scalability
2. Develop strategic partnerships with technology providers
3. Implement data-driven decision-making processes

Would you like me to elaborate on any of these points?`,
  summary: `Here's a concise summary:

**Executive Summary:**
This document outlines a comprehensive strategy for organizational growth, emphasizing three core pillars: technology adoption, talent development, and market expansion.

**Critical Numbers:**
• Projected ROI: 340% over 3 years
• Implementation timeline: 18 months
• Required investment: $2.4M

**Bottom Line:**
The proposed initiatives are well-aligned with market trends and present a strong case for immediate action.`,
  findings: `The key findings from this document are:

1. **Market Opportunity**: There's a significant gap in the current market that can be addressed through the proposed solution.

2. **Competitive Advantage**: The analysis reveals three unique differentiators compared to existing alternatives.

3. **Risk Assessment**: Moderate risk profile with clear mitigation strategies outlined.

4. **Financial Viability**: Strong unit economics with path to profitability within 24 months.

Shall I dive deeper into any of these findings?`,
};

const DocumentChat = ({ onBack }: DocumentChatProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ["application/pdf", "application/vnd.ms-powerpoint", 
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.pptx') && !file.name.endsWith('.docx')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, PowerPoint, or Word document",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    
    // Add initial assistant message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `I've analyzed **${file.name}**. This appears to be a ${file.name.endsWith('.pdf') ? 'PDF document' : file.name.endsWith('.pptx') ? 'PowerPoint presentation' : 'Word document'} with rich content.\n\nHow can I help you understand this document? You can ask me to summarize it, explain specific sections, or extract key insights.`,
      },
    ]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        await processFile(droppedFile);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        await processFile(selectedFile);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setMessages([]);
    setInput("");
  };

  const getMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("summary") || lowerQuery.includes("summarize")) {
      return MOCK_RESPONSES.summary;
    }
    if (lowerQuery.includes("finding") || lowerQuery.includes("key")) {
      return MOCK_RESPONSES.findings;
    }
    return MOCK_RESPONSES.default;
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getMockResponse(text),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <section className="min-h-screen pt-20 pb-8 bg-background">
      <div className="container mx-auto px-4 h-[calc(100vh-7rem)]">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {file && (
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {!file ? (
            /* Upload area */
            <div className="flex-1 flex items-center justify-center">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative w-full max-w-xl border-2 border-dashed rounded-2xl p-12 text-center
                  transition-all duration-300 cursor-pointer
                  ${isDragging 
                    ? "border-primary bg-primary/5 scale-[1.02]" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }
                `}
              >
                <input
                  type="file"
                  accept=".pdf,.pptx,.ppt,.doc,.docx"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                
                <p className="text-lg font-medium mb-2">
                  {isDragging ? "Drop your document here" : "Upload your document"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF, PowerPoint, or Word files up to 100MB
                </p>
                <Button variant="hero">
                  Choose file
                </Button>
              </div>
            </div>
          ) : isProcessing ? (
            /* Processing state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">Analyzing your document...</p>
                <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
              </div>
            </div>
          ) : (
            /* Chat interface */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                        {message.content.split('\n').map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={i} className="font-semibold my-1">{line.slice(2, -2)}</p>;
                          }
                          if (line.startsWith('• ')) {
                            return <p key={i} className="ml-4 my-0.5">{line}</p>;
                          }
                          if (line.match(/^\d+\.\s/)) {
                            return <p key={i} className="ml-4 my-0.5">{line}</p>;
                          }
                          return <p key={i} className="my-1">{line}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pb-4">
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSend(question)}
                      className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="border border-border rounded-2xl bg-card p-2 flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your document..."
                  className="flex-1 resize-none bg-transparent px-3 py-2 focus:outline-none min-h-[44px] max-h-32"
                  rows={1}
                />
                <Button
                  variant="hero"
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DocumentChat;
