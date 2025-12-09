import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, Trash2, MessageSquare, Clock, LogOut, Plus, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DocumentUpload from "@/components/DocumentUpload";
import { PlanBadge } from "@/components/dashboard/PlanBadge";
import { CreditsDashboardWidget } from "@/components/dashboard/CreditsDashboardWidget";
import { HeaderCreditsDisplay } from "@/components/pricing/HeaderCreditsDisplay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from 'react-i18next';

interface DocumentRecord {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: t('dashboard_page.delete_error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      setDocuments(data || []);
    }
    setLoadingDocs(false);
  };

  const handleDelete = async (doc: DocumentRecord) => {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([doc.file_path]);

    if (storageError) {
      toast({
        title: t('dashboard_page.delete_error'),
        description: storageError.message,
        variant: "destructive",
      });
      return;
    }

    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (dbError) {
      toast({
        title: t('dashboard_page.delete_error'),
        description: dbError.message,
        variant: "destructive",
      });
    } else {
      setDocuments(documents.filter((d) => d.id !== doc.id));
      toast({
        title: t('dashboard_page.delete_success'),
        description: t('dashboard_page.delete_success'),
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t('dashboard_page.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg accent-gradient flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">{t('app_title')}</span>
          </div>
          
          {/* Desktop Header Actions */}
          <div className="hidden md:flex items-center gap-4">
            <HeaderCreditsDisplay />
            <PlanBadge />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <HeaderCreditsDisplay />
              <PlanBadge />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-1">
              {t('dashboard_page.welcome', { name: getDisplayName() })}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {t('dashboard_page.subtitle')}
            </p>
          </div>

          {/* Credits Widget */}
          <div className="mb-8">
            <CreditsDashboardWidget />
          </div>

          {/* Action Buttons */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row gap-3">
            <Button variant="hero" onClick={() => setShowUpload(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard_page.upload_button')}
            </Button>
            <Button variant="outline" onClick={() => navigate("/summarizer")} className="w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" />
              {t('dashboard_page.summarizer_button')}
            </Button>
          </div>

          {/* Upload Modal */}
          {showUpload && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="w-full max-w-xl mx-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('summarizer.upload_card.title')}</CardTitle>
                    <CardDescription>
                      {t('summarizer.upload_card.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      onUploadComplete={() => {
                        setShowUpload(false);
                        fetchDocuments();
                      }}
                      onCancel={() => setShowUpload(false)}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Documents List */}
          {loadingDocs ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('dashboard_page.loading')}
            </div>
          ) : documents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">{t('dashboard_page.empty_title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard_page.empty_desc')}
                </p>
                <Button variant="hero" onClick={() => setShowUpload(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('dashboard_page.upload_button')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-card transition-shadow">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm md:text-base">{doc.name}</h3>
                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(doc.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-13 sm:ml-0">
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => navigate(`/document/${doc.id}`)}
                          className="flex-1 sm:flex-none"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {t('dashboard_page.open_button')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
