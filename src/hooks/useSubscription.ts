import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface SubscriptionState {
  plan: 'free' | 'basic' | 'pro' | 'elite';
  dailyUsage: number;
  usageResetAt: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  isOverLimit: boolean;
  checkLimit: () => boolean;
  incrementUsage: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

export const useSubscription = (): SubscriptionState => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<'free' | 'basic' | 'pro' | 'elite'>('free');
  const [dailyUsage, setDailyUsage] = useState(0);
  const [usageResetAt, setUsageResetAt] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        setPlan(data.plan as 'free' | 'basic' | 'pro' | 'elite');
        setSubscriptionEnd(data.subscription_end);
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  }, [user]);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Check Stripe subscription status
      await refreshSubscription();

      // Fetch local profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, daily_usage, usage_reset_at')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPlan(data.plan as 'free' | 'basic' | 'pro' | 'elite');
        setDailyUsage(data.daily_usage || 0);
        setUsageResetAt(data.usage_reset_at);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshSubscription]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Auto-refresh subscription every minute
  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime changes for instant updates
    const channel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` },
        () => refreshSubscription()
      )
      .on( // Also listen to users table
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        () => refreshSubscription()
      )
      .subscribe();

    const interval = setInterval(() => {
      refreshSubscription();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user, refreshSubscription]);

  const checkLimit = () => {
    if (plan === 'pro') return false;
    return dailyUsage >= 3;
  };

  const incrementUsage = async () => {
    if (!user) return;

    try {
      setDailyUsage(prev => prev + 1);

      const { error } = await supabase.rpc('increment_daily_usage', {
        user_id_param: user.id
      });

      if (error) {
        setDailyUsage(prev => prev - 1);
        console.error('Error incrementing usage:', error);
        toast({
          title: "Error updating usage",
          description: "Could not update your usage count.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in incrementUsage:', error);
    }
  };

  return {
    plan,
    dailyUsage,
    usageResetAt,
    subscriptionEnd,
    isLoading,
    isOverLimit: checkLimit(),
    checkLimit,
    incrementUsage,
    refreshSubscription
  };
};
