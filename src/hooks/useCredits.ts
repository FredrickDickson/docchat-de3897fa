import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserCredits {
  monthlyCredits: number;
  extraCredits: number;
  plan: string;
  subscriptionRenewsAt: string | null;
}

export const useCredits = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Fetch credits from users table (hybrid credits system)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('monthly_credits, extra_credits, plan, subscription_renews_at')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      setCredits({
        monthlyCredits: userData?.monthly_credits || 0,
        extraCredits: userData?.extra_credits || 0,
        plan: userData?.plan || 'free',
        subscriptionRenewsAt: userData?.subscription_renews_at || null
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        () => {
          fetchCredits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    credits,
    isLoading,
    error,
    refetch: fetchCredits
  };
};
