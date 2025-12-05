import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsSummary {
  event_type: string;
  total_events: number;
  total_credits: number;
}

interface DailyUsage {
  date: string;
  total_events: number;
  total_credits: number;
}

interface TopDocument {
  document_id: string;
  document_name: string;
  total_interactions: number;
  total_credits: number;
}

export const useAnalytics = (days: number = 30) => {
  const [summary, setSummary] = useState<AnalyticsSummary[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [topDocuments, setTopDocuments] = useState<TopDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Fetch analytics summary from audit_logs
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('event_type, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (auditError) throw auditError;

      // Aggregate analytics summary
      const summaryMap = new Map<string, { total_events: number; total_credits: number }>();
      auditLogs?.forEach(log => {
        const eventType = log.event_type || 'unknown';
        const credits = (log.metadata as any)?.credits || 0;
        const current = summaryMap.get(eventType) || { total_events: 0, total_credits: 0 };
        summaryMap.set(eventType, {
          total_events: current.total_events + 1,
          total_credits: current.total_credits + credits
        });
      });

      const summaryData: AnalyticsSummary[] = Array.from(summaryMap.entries()).map(([event_type, data]) => ({
        event_type,
        ...data
      }));
      setSummary(summaryData);

      // Fetch daily usage from audit_logs
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data: dailyLogs, error: dailyError } = await supabase
        .from('audit_logs')
        .select('created_at, metadata')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (dailyError) throw dailyError;

      // Aggregate daily usage
      const dailyMap = new Map<string, { total_events: number; total_credits: number }>();
      dailyLogs?.forEach(log => {
        const date = log.created_at?.split('T')[0] || '';
        const credits = (log.metadata as any)?.credits || 0;
        const current = dailyMap.get(date) || { total_events: 0, total_credits: 0 };
        dailyMap.set(date, {
          total_events: current.total_events + 1,
          total_credits: current.total_credits + credits
        });
      });

      const dailyData: DailyUsage[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        ...data
      }));
      setDailyUsage(dailyData);

      // Fetch top documents from summaries
      const { data: topDocs, error: topDocsError } = await supabase
        .from('summaries')
        .select('id, pdf_name, cost_usd')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (topDocsError) throw topDocsError;

      const topDocsData: TopDocument[] = topDocs?.map(doc => ({
        document_id: doc.id,
        document_name: doc.pdf_name || 'Unknown',
        total_interactions: 1,
        total_credits: doc.cost_usd || 0
      })) || [];
      setTopDocuments(topDocsData);

    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summary,
    dailyUsage,
    topDocuments,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
};
