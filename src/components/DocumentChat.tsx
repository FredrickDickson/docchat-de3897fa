import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, Send, Loader2, Sparkles, ArrowLeft, Image, FileSpreadsheet, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  processDocument, 
  isFileSupported, 
  getAcceptString,
  getFileCategory,
  ProcessedDocument 
} from "@/lib/documentProcessor";

// Generate or get anonymous ID for rate limiting
const getAnonymousId = (): string => {
  const storageKey = 'docchat_anonymous_id';
  let id = localStorage.getItem(storageKey);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(storageKey, id);
  }
  return id;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DocumentChatProps {
  onBack: () => void;
}

// Rate limits
const ANONYMOUS_DAILY_LIMIT = 3;
const FREE_USER_DAILY_LIMIT = 5;

const SUGGESTED_QUESTIONS = [
  "Summarize this document in 3 bullet points",
  "What are the key findings?",
  "What are the main recommendations?",
  "Explain this in simple terms",
];

const DocumentChat = ({ onBack }: DocumentChatProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<ProcessedDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [chatCount, setChatCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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
    if (!isFileSupported(file)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, Word, PowerPoint, Text, or Image file",
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
    setProcessingStatus("Starting...");
    
    try {
      const result = await processDocument(file, (status) => {
        setProcessingStatus(status);
      });
      
      setDocumentContent(result);
      setIsProcessing(false);
      
      const fileCategory = getFileCategory(file);
      const fileTypeLabel = fileCategory === 'image' ? 'image (OCR processed)' : 
                           fileCategory === 'pdf' ? 'PDF document' :
                           fileCategory === 'docx' ? 'Word document' :
                           fileCategory === 'pptx' ? 'PowerPoint presentation' :
                           'text file';
      
      // Add initial assistant message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `I've analyzed **${file.name}**. This is a ${fileTypeLabel} with ${result.text.length.toLocaleString()} characters of content.\n\n${result.isOCR ? '🔍 Text was extracted using OCR.\n\n' : ''}How can I help you understand this document? You can ask me to summarize it, explain specific sections, or extract key insights.`,
        },
      ]);
      
    } catch (error: any) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process document",
        variant: "destructive",
      });
      setIsProcessing(false);
      setFile(null);
    }
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
    setDocumentContent(null);
    setMessages([]);
    setInput("");
    setProcessingStatus("");
  };

  const chatWithAI = async (question: string): Promise<string> => {
    if (!documentContent) {
      throw new Error("No document content available");
    }

    // Build conversation history for context
    const conversationHistory = messages
      .filter(m => m.id !== "welcome")
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    try {
      const { data, error } = await supabase.functions.invoke('chat-document', {
        body: {
          documentContent: documentContent.text,
          question,
          conversationHistory,
          anonymousId: !user ? getAnonymousId() : undefined
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (data?.error) {
        // Handle rate limit errors
        if (data.error === 'DAILY_LIMIT_REACHED' || data.error === 'MONTHLY_LIMIT_REACHED') {
          toast({
            title: "Chat limit reached",
            description: data.message,
            variant: "destructive",
          });
          navigate('/pricing');
          throw new Error(data.message);
        }
        if (data.error === 'INSUFFICIENT_CREDITS') {
          toast({
            title: "Out of credits",
            description: "Please purchase more credits to continue.",
            variant: "destructive",
          });
          navigate('/pricing');
          throw new Error(data.message);
        }
        throw new Error(data.error);
      }

      if (!data?.answer) {
        throw new Error('No response from AI');
      }

      setChatCount(prev => prev + 1);
      return data.answer;
    } catch (error: any) {
      console.error('Chat error:', error);
      throw new Error(error.message || 'AI service temporarily unavailable. Please try again.');
    }
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

    try {
      const response = await chatWithAI(text);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const getFileIcon = () => {
    if (!file) return <FileText className="w-5 h-5 text-primary" />;
    const category = getFileCategory(file);
    if (category === 'image') return <Image className="w-5 h-5 text-primary" />;
    if (category === 'pptx') return <FileSpreadsheet className="w-5 h-5 text-primary" />;
    return <FileText className="w-5 h-5 text-primary" />;
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
                  {getFileIcon()}
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
            {/* Rate limit indicator for anonymous/free users */}
            {!user && documentContent && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs">
                <Info className="w-3 h-3" />
                <span>{Math.max(0, ANONYMOUS_DAILY_LIMIT - chatCount)}/{ANONYMOUS_DAILY_LIMIT} free chats left</span>
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
                  accept={getAcceptString()}
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
                  All major formats supported, up to 100MB
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <span className="px-2 py-1 bg-muted rounded text-xs">PDF</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">DOCX</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">PPTX</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">TXT</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">MD</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">CSV</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">HTML</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">JPG/PNG</span>
                </div>
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
                <p className="text-sm text-muted-foreground">{processingStatus}</p>
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
                        <span className="text-sm text-muted-foreground">Analyzing document...</span>
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
              <div className="space-y-2">
                {/* Signup prompt for anonymous users */}
                {!user && chatCount >= 1 && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg py-2 px-3">
                    <Info className="w-3 h-3" />
                    <span>
                      {chatCount < ANONYMOUS_DAILY_LIMIT 
                        ? `${ANONYMOUS_DAILY_LIMIT - chatCount} free messages left today. ` 
                        : "Daily limit reached. "}
                      <button 
                        onClick={() => navigate('/auth')} 
                        className="text-primary hover:underline font-medium"
                      >
                        Sign up for {FREE_USER_DAILY_LIMIT} daily chats
                      </button>
                    </span>
                  </div>
                )}
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DocumentChat;
