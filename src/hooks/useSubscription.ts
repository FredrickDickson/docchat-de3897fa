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
      // Fetch from users table (primary source of truth)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan, daily_usage, usage_reset_at, subscription_renews_at')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user data:', userError);
      }

      if (userData) {
        setPlan(userData.plan as 'free' | 'basic' | 'pro' | 'elite');
        setDailyUsage(userData.daily_usage || 0);
        setUsageResetAt(userData.usage_reset_at);
        setSubscriptionEnd(userData.subscription_renews_at);
      }

      // Also check subscription table for more details
      await refreshSubscription();
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

  // Plan-based daily limits (free registered users get 5 daily chats)
  const PLAN_LIMITS: Record<string, number | null> = {
    'free': 5,
    'basic': null, // Uses credits (500 monthly messages)
    'pro': null, // Unlimited (uses credits)
    'elite': null, // Unlimited (uses credits)
  };

  const checkLimit = () => {
    const limit = PLAN_LIMITS[plan];
    if (limit === null) return false; // No limit for pro/elite
    return dailyUsage >= limit;
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
