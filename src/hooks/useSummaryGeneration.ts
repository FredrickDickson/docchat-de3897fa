import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SummaryType = 'brief' | 'standard' | 'detailed';

interface SummaryResult {
  summary: string;
  creditsUsed: number;
  summaryType: SummaryType;
  documentName: string;
}

export const useSummaryGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);

  const generateSummary = async (documentId: string, summaryType: SummaryType = 'standard') => {
    setIsGenerating(true);
    setError(null);
    setSummary(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error: summaryError } = await supabase.functions.invoke('summarize-pdf', {
        body: {
          documentId,
          userId: user.id,
          summaryType
        }
      });

      if (summaryError) {
        if (summaryError.message.includes('INSUFFICIENT_CREDITS')) {
          const creditCosts = { brief: 5, standard: 10, detailed: 25 };
          throw new Error(`Insufficient credits. You need ${creditCosts[summaryType]} credits for a ${summaryType} summary.`);
        }
        throw summaryError;
      }

      setSummary(data);
      return data;

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSummary = () => {
    setSummary(null);
    setError(null);
  };

  return {
    isGenerating,
    error,
    summary,
    generateSummary,
    clearSummary
  };
};
