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
// Removed broken client-side API - using edge functions instead
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportAsTXT, exportAsJSON, exportAsCSV, copyToClipboard } from "@/lib/exportUtils";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageIndicator } from "@/components/pricing/UsageIndicator";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useTranslation } from 'react-i18next';

const PDFSummarizer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOverLimit, dailyUsage, plan, incrementUsage } = useSubscription();
  const { t } = useTranslation();

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
    if (!extractedText || !user || !currentPdfId) {
      toast({
        title: "Cannot generate summary",
        description: !extractedText ? "Please upload a PDF first" : !currentPdfId ? "PDF not processed yet" : "Not authenticated",
        variant: "destructive",
      });
      return;
    }

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

      // Map summary types to edge function format
      const edgeFunctionSummaryType = summaryType === 'short' ? 'brief' :
        summaryType === 'detailed' ? 'detailed' :
          'standard';

      const { data, error: summaryError } = await supabase.functions.invoke('summarize-pdf', {
        body: {
          documentId: currentPdfId,
          userId: user.id,
          summaryType: edgeFunctionSummaryType
        }
      });

      if (summaryError) {
        throw new Error(`Summarization failed: ${summaryError.message || 'Unknown error'}`);
      }

      // Check for application-level error returned with 200 status
      if (data?.error) {
        if (data.logs) {
          console.groupCollapsed('Edge Function Logs (Error)');
          data.logs.forEach((log: string) => console.log(log));
          console.groupEnd();
        }

        if (data.error === 'INSUFFICIENT_CREDITS') {
          throw new Error('Insufficient credits. Please add credits to continue.');
        }
        throw new Error(`Summarization failed: ${data.error}`);
      }

      // Log success logs if available
      if (data?.logs) {
        console.groupCollapsed('Edge Function Logs (Success)');
        data.logs.forEach((log: string) => console.log(log));
        console.groupEnd();
      }


      const response = { summary: data.summary, tokensUsed: 0, cost: data.creditsUsed, processingTime: 0 };

      setSummary(response.summary);
      setGenerationProgress(100);

      // Store basic summary data for export functionality
      setCurrentSummaryData({
        pdf_filename: data.documentName || 'uploaded.pdf',
        summary_text: response.summary,
        summary_type: summaryType,
        domain_focus: domainFocus,
        cost_usd: response.cost,
        created_at: new Date().toISOString(),
        tokens_used: response.tokensUsed,
      });

      // Increment daily usage counter
      await incrementUsage();

      clearInterval(progressInterval);
      setGenerationProgress(100);

      toast({
        title: "Summary generated",
        description: `Generated ${summaryType} summary successfully`,
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
                <span className="font-serif text-xl font-semibold">{t('summarizer.title')}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">{t('summarizer.tabs.create')}</TabsTrigger>
                <TabsTrigger value="chat">{t('summarizer.tabs.chat')}</TabsTrigger>
                <TabsTrigger value="history">{t('summarizer.tabs.history')}</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <UsageIndicator usage={dailyUsage} plan={plan} />
                {/* Upload Section */}
                {!extractedText && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('summarizer.upload_card.title')}</CardTitle>
                      <CardDescription>
                        {t('summarizer.upload_card.description')}
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
                      <CardTitle>{t('summarizer.config_card.title')}</CardTitle>
                      <CardDescription>
                        {t('summarizer.config_card.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('summarizer.config_card.length_label')}</label>
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
                        <label className="text-sm font-medium">{t('summarizer.config_card.domain_label')}</label>
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
                            <span className="text-muted-foreground">{t('summarizer.config_card.generating')}</span>
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
                            {t('summarizer.config_card.generating')}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('summarizer.config_card.generate_button')}
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
                          <CardTitle>{t('summarizer.result_card.title')}</CardTitle>
                          <CardDescription>
                            {summaryType} summary • {domainFocus} focus
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="outline" size="icon" onClick={handleCopySummary} title={t('summarizer.result_card.copy_button')}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadSummary('txt')}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('summarizer.result_card.download_txt')}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadSummary('json')}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('summarizer.result_card.download_json')}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadSummary('csv')}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('summarizer.result_card.download_csv')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/integrations')}
                            title="Export to integrations"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('summarizer.result_card.export')}
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
                    <CardTitle>{t('summarizer.chat_card.title')}</CardTitle>
                    <CardDescription>{t('summarizer.chat_card.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {extractedText && currentPdfId ? (
                      <ChatInterface pdfId={currentPdfId} userId={user?.id || ''} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>{t('summarizer.chat_card.empty_state')}</p>
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

