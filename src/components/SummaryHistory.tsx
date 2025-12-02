/**
 * Summary History Component
 * Displays user's summary history
 */

import { useState, useEffect } from "react";
import { FileText, Calendar, Trash2, Eye, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { exportAsTXT, exportAsJSON, exportAsCSV } from "@/lib/exportUtils";

interface Summary {
  id: string;
  pdf_filename: string;
  summary_text: string;
  summary_type: string;
  domain_focus: string;
  cost_usd: number;
  created_at: string;
}

const SummaryHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchSummaries();
    }
  }, [user]);

  const fetchSummaries = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "Error loading summaries",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSummaries(data || []);
      setFilteredSummaries(data || []);
    }
    setLoading(false);
  };

  // Filter summaries based on search and filters
  useEffect(() => {
    let filtered = summaries;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        s =>
          s.pdf_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.summary_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.summary_type === filterType);
    }

    // Domain filter
    if (filterDomain !== 'all') {
      filtered = filtered.filter(s => s.domain_focus === filterDomain);
    }

    setFilteredSummaries(filtered);
  }, [summaries, searchQuery, filterType, filterDomain]);

  const handleDelete = async (summaryId: string) => {
    if (!confirm('Are you sure you want to delete this summary?')) {
      return;
    }

    const { error } = await supabase
      .from('summaries')
      .delete()
      .eq('id', summaryId);

    if (error) {
      toast({
        title: "Error deleting summary",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSummaries(summaries.filter(s => s.id !== summaryId));
      if (selectedSummary?.id === summaryId) {
        setSelectedSummary(null);
      }
      toast({
        title: "Summary deleted",
        description: "The summary has been removed",
      });
    }
  };

  const handleDownload = (summary: Summary, format: 'txt' | 'json' | 'csv') => {
    const data = {
      summary: summary.summary_text,
      filename: summary.pdf_filename,
      type: summary.summary_type,
      domain: summary.domain_focus,
      cost: summary.cost_usd,
      created_at: summary.created_at,
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'short':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'detailed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'bullets':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse text-muted-foreground">Loading summaries...</div>
        </CardContent>
      </Card>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No summaries yet</h3>
          <p className="text-muted-foreground">
            Your generated summaries will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search summaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="bullets">Bullets</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {filteredSummaries.length !== summaries.length && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredSummaries.length} of {summaries.length} summaries
        </p>
      )}

      <div className="grid gap-4">
        {filteredSummaries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No summaries found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' || filterDomain !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Your generated summaries will appear here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSummaries.map((summary) => (
          <Card key={summary.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {summary.pdf_filename}
                  </CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(summary.created_at)}
                    </span>
                    <Badge className={getTypeBadgeColor(summary.summary_type)}>
                      {summary.summary_type}
                    </Badge>
                    <Badge variant="outline">
                      {summary.domain_focus}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ${summary.cost_usd.toFixed(4)}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSummary(summary)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(summary, 'txt')}
                    title="Download as TXT"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    TXT
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(summary, 'json')}
                    title="Download as JSON"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(summary, 'csv')}
                    title="Download as CSV"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(summary.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {selectedSummary?.id === summary.id && (
              <CardContent>
                <div className="prose dark:prose-invert max-w-none max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm">{summary.summary_text}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(summary, 'txt')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(summary, 'json')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(summary, 'csv')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSummary(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )))}
      </div>
    </div>
  );
};

export default SummaryHistory;

