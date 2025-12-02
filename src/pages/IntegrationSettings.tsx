/**
 * Integration Settings Page
 * Configure external service integrations (Slack, Notion, Google Docs)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Slack, FileText, ExternalLink, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationConfig {
  slack_webhook_url?: string;
  notion_api_key?: string;
  notion_database_id?: string;
  google_docs_enabled?: boolean;
}

const IntegrationSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [slackWebhook, setSlackWebhook] = useState("");
  const [notionApiKey, setNotionApiKey] = useState("");
  const [notionDatabaseId, setNotionDatabaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    // Load from user profile or a separate integrations table
    // For now, we'll use localStorage as a simple solution
    const saved = localStorage.getItem(`integrations_${user.id}`);
    if (saved) {
      const config: IntegrationConfig = JSON.parse(saved);
      setSlackWebhook(config.slack_webhook_url || "");
      setNotionApiKey(config.notion_api_key || "");
      setNotionDatabaseId(config.notion_database_id || "");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const config: IntegrationConfig = {
        slack_webhook_url: slackWebhook || undefined,
        notion_api_key: notionApiKey || undefined,
        notion_database_id: notionDatabaseId || undefined,
      };

      // Save to localStorage (in production, save to database)
      localStorage.setItem(`integrations_${user.id}`, JSON.stringify(config));

      toast({
        title: "Settings saved",
        description: "Your integration settings have been saved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = (type: 'slack' | 'notion') => {
    if (type === 'slack') {
      setSlackWebhook("");
    } else {
      setNotionApiKey("");
      setNotionDatabaseId("");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg accent-gradient flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-serif text-xl font-semibold">Integration Settings</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-semibold mb-2">Integrations</h1>
              <p className="text-muted-foreground">
                Connect external services to export summaries automatically
              </p>
            </div>

            {/* Slack Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Slack className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle>Slack</CardTitle>
                    <CardDescription>
                      Send summaries to Slack channels via webhook
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slack-webhook"
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                    />
                    {slackWebhook && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleClear('slack')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create a webhook in your Slack workspace settings
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notion Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-600" />
                  <div>
                    <CardTitle>Notion</CardTitle>
                    <CardDescription>
                      Export summaries to Notion databases
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notion-api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="notion-api-key"
                      type="password"
                      placeholder="secret_..."
                      value={notionApiKey}
                      onChange={(e) => setNotionApiKey(e.target.value)}
                    />
                    {notionApiKey && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleClear('notion')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create an integration in Notion and get your API key
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notion-database-id">Database ID</Label>
                  <Input
                    id="notion-database-id"
                    placeholder="a1b2c3d4e5f6..."
                    value={notionDatabaseId}
                    onChange={(e) => setNotionDatabaseId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The ID of the Notion database where summaries will be saved
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Google Docs Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle>Google Docs</CardTitle>
                    <CardDescription>
                      Export summaries to Google Docs (OAuth required)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect Google Account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Google Docs integration requires OAuth setup (coming soon)
                </p>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                variant="hero"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default IntegrationSettings;

