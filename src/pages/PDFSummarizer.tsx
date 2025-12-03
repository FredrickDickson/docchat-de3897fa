/**
 * PDF Summarizer Page
 * Main page for uploading PDFs and generating summaries
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles, Download, Copy, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PDFUpload from "@/components/PDFUpload";
import SummaryHistory from "@/components/SummaryHistory";
import { summarizeText, SummarizeRequest } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportAsTXT, exportAsJSON, exportAsCSV, copyToClipboard } from "@/lib/exportUtils";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageIndicator } from "@/components/pricing/UsageIndicator";
import { ChatInterface } from "@/components/chat/ChatInterface";

const PDFSummarizer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOverLimit, dailyUsage, plan, incrementUsage } = useSubscription();
  
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [summaryType, setSummaryType] = useState<'short' | 'medium' | 'detailed' | 'bullets'>('medium');
  const [domainFocus, setDomainFocus] = useState<'legal' | 'finance' | 'academic' | 'general'>('general');
  const [currentSummaryData, setCurrentSummaryData] = useState<any>(null);
  const [currentPdfId, setCurrentPdfId] = useState<string>("");

  const handleUploadComplete = async (fileId: string, text: string) => {
    setExtractedText(text);
    // Use a temporary ID if fileId is not provided or valid UUID, but ideally we get a real ID
    // For now, we'll use a generated ID if fileId is empty, but in real app we'd save PDF first
    const pdfId = fileId || crypto.randomUUID(); 
    setCurrentPdfId(pdfId);

    toast({
      title: "PDF uploaded",
      description: "Processing for chat and summary...",
    });

    // Process PDF for chat (chunking & embedding)
    if (user) {
      try {
        const { error } = await supabase.functions.invoke('process-pdf', {
          body: {
            text,
            pdfId,
            userId: user.id
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Ready for Chat",
          description: "You can now ask questions about this PDF.",
        });
      } catch (error) {
        console.error('Error processing PDF for chat:', error);
        toast({
          title: "Chat setup failed",
          description: "You can still summarize, but chat might not work.",
          variant: "destructive"
        });
      }
    }
  };

  const handleGenerateSummary = async () => {
    if (!extractedText || !user) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress (since AI generation is async)
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      // Check daily usage limit
      if (isOverLimit) {
        toast({
          title: "Daily limit reached",
          description: "You've reached your daily summary limit (3 summaries/day). Upgrade to Pro for unlimited summaries.",
          variant: "destructive",
        });
        setIsGenerating(false);
        // Redirect to pricing or show modal could go here
        navigate("/pricing");
        return;
      }

      // Generate summary
      const request: SummarizeRequest = {
        text: extractedText,
        summaryType,
        domainFocus,
      };

      const response = await summarizeText(request);

      setSummary(response.summary);
      setGenerationProgress(100);

      // Save summary to database
      const summaryData = {
        user_id: user.id,
        pdf_filename: 'uploaded.pdf', // TODO: Get actual filename from upload
        summary_text: response.summary,
        summary_type: summaryType,
        domain_focus: domainFocus,
        tokens_used: response.tokensUsed,
        cost_usd: response.cost,
      };

      const { data: insertedSummary, error: summaryError } = await supabase
        .from('summaries')
        .insert(summaryData)
        .select()
        .single();

      if (insertedSummary) {
        setCurrentSummaryData({
          ...summaryData,
          id: insertedSummary.id,
          created_at: insertedSummary.created_at,
        });
      }

      if (summaryError) {
        console.error('Error saving summary:', summaryError);
      }

      // Log usage
      const { error: usageError } = await supabase
        .from('usage_logs')
        .insert({
          user_id: user.id,
          api_cost: response.cost,
          status: 'success',
        });

      if (usageError) {
        console.error('Error logging usage:', usageError);
      }

      // Increment daily usage counter
      await incrementUsage();

      clearInterval(progressInterval);
      setGenerationProgress(100);

      toast({
        title: "Summary generated",
        description: `Generated ${summaryType} summary in ${(response.processingTime / 1000).toFixed(1)}s`,
      });
    } catch (error: any) {
      clearInterval(progressInterval);
      setGenerationProgress(0);
      console.error('Summary generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySummary = async () => {
    await copyToClipboard(summary);
    toast({
      title: "Copied to clipboard",
      description: "Summary copied successfully",
    });
  };

  const handleDownloadSummary = (format: 'txt' | 'json' | 'csv') => {
    if (!currentSummaryData) return;

    const data = {
      summary,
      filename: currentSummaryData.pdf_filename || 'summary.pdf',
      type: summaryType,
      domain: domainFocus,
      cost: currentSummaryData.cost_usd || 0,
      created_at: currentSummaryData.created_at || new Date().toISOString(),
      tokensUsed: currentSummaryData.tokens_used,
    };

    if (format === 'txt') {
      exportAsTXT(data);
    } else if (format === 'json') {
      exportAsJSON(data);
    } else if (format === 'csv') {
      exportAsCSV(data);
    }

    toast({
      title: "Downloaded",
      description: `Summary saved as ${format.toUpperCase()}`,
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg accent-gradient flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-serif text-xl font-semibold">PDF Summarizer</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create Summary</TabsTrigger>
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <UsageIndicator usage={dailyUsage} limit={3} plan={plan} />
                {/* Upload Section */}
                {!extractedText && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload PDF</CardTitle>
                  <CardDescription>
                    Upload a PDF file to generate an AI-powered summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PDFUpload onUploadComplete={handleUploadComplete} />
                </CardContent>
              </Card>
            )}

            {/* Summary Configuration */}
            {extractedText && !summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Summary</CardTitle>
                  <CardDescription>
                    Choose summary length and domain focus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Summary Length</label>
                    <Select
                      value={summaryType}
                      onValueChange={(value: any) => setSummaryType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (100 words)</SelectItem>
                        <SelectItem value="medium">Medium (150-200 words)</SelectItem>
                        <SelectItem value="detailed">Detailed (300-400 words)</SelectItem>
                        <SelectItem value="bullets">Bullet Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domain Focus</label>
                    <Select
                      value={domainFocus}
                      onValueChange={(value: any) => setDomainFocus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Generating summary...</span>
                        <span className="font-medium">{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}

                  <Button
                    variant="hero"
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Summary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Summary Result */}
            {summary && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Summary</CardTitle>
                      <CardDescription>
                        {summaryType} summary • {domainFocus} focus
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="icon" onClick={handleCopySummary} title="Copy to clipboard">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadSummary('txt')}>
                        <Download className="w-4 h-4 mr-2" />
                        TXT
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadSummary('json')}>
                        <Download className="w-4 h-4 mr-2" />
                        JSON
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadSummary('csv')}>
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/integrations')}
                        title="Export to integrations"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{summary}</p>
                  </div>
                </CardContent>
              </Card>
            )}
              </TabsContent>

              <TabsContent value="chat">
                <Card>
                  <CardHeader>
                    <CardTitle>Chat with PDF</CardTitle>
                    <CardDescription>Ask questions about your uploaded document</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {extractedText && currentPdfId ? (
                      <ChatInterface pdfId={currentPdfId} userId={user?.id || ''} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Upload a PDF in the "Create Summary" tab to start chatting.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <SummaryHistory />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default PDFSummarizer;

