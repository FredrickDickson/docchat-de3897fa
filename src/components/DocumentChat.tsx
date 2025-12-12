import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, Send, Loader2, Sparkles, ArrowLeft, Image, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  processDocument, 
  isFileSupported, 
  getAcceptString,
  getFileCategory,
  ProcessedDocument 
} from "@/lib/documentProcessor";

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

const DocumentChat = ({ onBack }: DocumentChatProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<ProcessedDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
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

    // Truncate document content if too long (keep first 15000 chars for context)
    const maxLength = 15000;
    let docText = documentContent.text;
    if (docText.length > maxLength) {
      docText = docText.substring(0, maxLength) + "\n\n[... Document truncated for processing ...]";
    }

    const systemPrompt = `You are a helpful document analysis assistant. Analyze the following document and answer the user's question accurately based on the document's content.

DOCUMENT CONTENT:
${docText}

IMPORTANT INSTRUCTIONS:
- Base your answers ONLY on the document content provided above
- If the answer is not in the document, say so clearly
- Be concise but comprehensive
- Use bullet points and formatting when appropriate
- If asked to summarize, focus on the key points`;

    // Try Puter.js first (free, user-pays model)
    if (typeof window !== 'undefined' && (window as any).puter?.ai?.chat) {
      try {
        const response = await (window as any).puter.ai.chat([
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]);
        
        if (typeof response === 'string') {
          return response;
        } else if (response?.message?.content) {
          return response.message.content;
        } else if (response?.content) {
          return response.content;
        }
        
        throw new Error("Unexpected response format");
      } catch (error) {
        console.error("Puter AI error:", error);
        throw new Error("AI service temporarily unavailable. Please try again.");
      }
    }
    
    // Fallback: Provide a basic response based on document analysis
    return generateFallbackResponse(question, docText);
  };

  const generateFallbackResponse = (question: string, docText: string): string => {
    const lowerQuestion = question.toLowerCase();
    const wordCount = docText.split(/\s+/).length;
    const charCount = docText.length;
    
    // Extract some basic info from the document
    const sentences = docText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const firstFewSentences = sentences.slice(0, 3).join('. ').trim();
    
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('summarize')) {
      return `**Document Summary:**

Based on the uploaded document (${wordCount.toLocaleString()} words):

${firstFewSentences ? `**Overview:** ${firstFewSentences}.` : 'The document contains structured content.'}

**Note:** For more detailed AI analysis, please ensure Puter.js is loaded or sign in to use our full AI features.`;
    }
    
    if (lowerQuestion.includes('key') || lowerQuestion.includes('main') || lowerQuestion.includes('important')) {
      return `**Key Information:**

The document contains approximately:
• ${wordCount.toLocaleString()} words
• ${charCount.toLocaleString()} characters
• ${sentences.length} sentences

${firstFewSentences ? `**Opening content:** "${firstFewSentences}..."` : ''}

For comprehensive AI-powered analysis, please sign in to access the full chat features.`;
    }
    
    return `I've received your question about the document.

**Document Stats:**
• Length: ${wordCount.toLocaleString()} words
• Characters: ${charCount.toLocaleString()}

${firstFewSentences ? `**Document preview:** "${firstFewSentences}..."` : ''}

For full AI-powered document analysis with detailed answers to your questions, please sign in to access our complete features.`;
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
                  PDF, Word, PowerPoint, Text, or Images (OCR) up to 100MB
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <span className="px-2 py-1 bg-muted rounded text-xs">PDF</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">DOCX</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">PPTX</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">TXT</span>
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
