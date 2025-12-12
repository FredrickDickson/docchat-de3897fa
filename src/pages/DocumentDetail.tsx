import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DocumentChatInterface } from '@/components/chat/DocumentChatInterface';
import { SummaryGenerator } from '@/components/summary/SummaryGenerator';
import { CreditsDashboardWidget } from '@/components/dashboard/CreditsDashboardWidget';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, MessageSquare, Loader2, Download, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { processDocument, isFileSupported } from '@/lib/documentProcessor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: string;
  created_at: string;
  user_id: string;
}

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [hasChunks, setHasChunks] = useState<boolean | null>(null);

  useEffect(() => {
    if (id) {
      fetchDocument();
      checkChunks();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDocument(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load document',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const checkChunks = async () => {
    try {
      const { count, error } = await supabase
        .from('pdf_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('pdf_id', id);

      if (!error) {
        setHasChunks((count ?? 0) > 0);
      }
    } catch (error) {
      console.error('Error checking chunks:', error);
    }
  };

  const handleReprocess = async () => {
    if (!document) return;

    setIsReprocessing(true);
    try {
      // Download the file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (downloadError) throw downloadError;

      // Convert to File object
      const file = new File([fileData], document.name, { type: document.file_type });

      // Process the document to extract text
      toast({
        title: 'Processing document...',
        description: 'Extracting text from your document',
      });

      const processedDoc = await processDocument(file);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete old chunks if any
      await supabase
        .from('pdf_chunks')
        .delete()
        .eq('pdf_id', document.id);

      // Call edge function to process and store new chunks
      const { error: processError } = await supabase.functions.invoke("process-pdf", {
        body: {
          text: processedDoc.text,
          pdfId: document.id,
          userId: user.id,
        },
      });

      if (processError) throw processError;

      // Update document status
      await supabase
        .from('documents')
        .update({ status: 'ready' })
        .eq('id', document.id);

      toast({
        title: 'Success!',
        description: 'Document reprocessed. You can now chat with it.',
      });

      // Refresh chunks status
      setHasChunks(true);
      
    } catch (error: any) {
      console.error('Reprocess error:', error);
      toast({
        title: 'Reprocessing failed',
        description: error.message || 'Failed to reprocess document',
        variant: 'destructive',
      });
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    setIsDeleting(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database (cascades to chunks and messages)
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Document not found</h2>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{document.name}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
                  <span>{formatFileSize(document.file_size)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{formatDate(document.created_at)}</span>
                  <Badge variant={document.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                    {document.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs sm:text-sm">
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isDeleting} className="text-xs sm:text-sm">
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 sm:mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{document.name}" and all associated chat history and summaries. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Area - Chat & Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4 sm:mt-6">
                {document.status === 'completed' || document.status === 'ready' ? (
                  hasChunks === false ? (
                    <Card>
                      <CardContent className="py-8 sm:py-12 text-center">
                        <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-base sm:text-lg font-medium mb-2">Document Needs Processing</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This document was uploaded before text extraction was enabled for its file type.
                          Click below to process it now.
                        </p>
                        <Button onClick={handleReprocess} disabled={isReprocessing}>
                          {isReprocessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Process Document
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <DocumentChatInterface
                      documentId={document.id}
                      documentName={document.name}
                    />
                  )
                ) : (
                  <Card>
                    <CardContent className="py-8 sm:py-12 text-center">
                      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 animate-spin text-primary" />
                      <h3 className="text-base sm:text-lg font-medium mb-2">Processing Document</h3>
                      <p className="text-sm text-muted-foreground">
                        Your document is being processed. Chat will be available once processing is complete.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="summary" className="mt-4 sm:mt-6">
                {document.status === 'completed' || document.status === 'ready' ? (
                  <SummaryGenerator
                    documentId={document.id}
                    documentName={document.name}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 sm:py-12 text-center">
                      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 animate-spin text-primary" />
                      <h3 className="text-base sm:text-lg font-medium mb-2">Processing Document</h3>
                      <p className="text-sm text-muted-foreground">
                        Your document is being processed. Summary generation will be available once processing is complete.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Credits & Info */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Credits Widget */}
            <CreditsDashboardWidget />

            {/* Document Info - Collapsed on mobile */}
            <Card className="hidden sm:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Document Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">File Type</div>
                  <div>{document.file_type}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Size</div>
                  <div>{formatFileSize(document.file_size)}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Status</div>
                  <Badge variant={document.status === 'completed' ? 'default' : 'secondary'}>
                    {document.status}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Uploaded</div>
                  <div>{formatDate(document.created_at)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Tips - Hidden on mobile */}
            <Card className="hidden lg:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tips</CardTitle>
                <CardDescription className="text-xs">Get the most out of your document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Ask specific questions</div>
                    <div className="text-xs text-muted-foreground">Get better answers by being specific</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Choose summary type</div>
                    <div className="text-xs text-muted-foreground">Brief for quick overview, detailed for in-depth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;
