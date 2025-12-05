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

      // Fetch credits from credits table
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') throw creditsError;

      // Fetch plan info from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Fetch subscription info
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('current_period_end')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;

      setCredits({
        monthlyCredits: creditsData?.credits || 0,
        extraCredits: 0, // Can be calculated separately if needed
        plan: profileData?.plan || 'free',
        subscriptionRenewsAt: subData?.current_period_end || null
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
