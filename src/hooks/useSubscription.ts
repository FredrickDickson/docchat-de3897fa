import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface SubscriptionState {
  plan: 'free' | 'pro';
  dailyUsage: number;
  usageResetAt: string | null;
  isLoading: boolean;
  isOverLimit: boolean;
  checkLimit: () => boolean;
  incrementUsage: () => Promise<void>;
}

export const useSubscription = (): SubscriptionState => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [dailyUsage, setDailyUsage] = useState(0);
  const [usageResetAt, setUsageResetAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, daily_usage, usage_reset_at')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setPlan(data.plan as 'free' | 'pro');
        setDailyUsage(data.daily_usage || 0);
        setUsageResetAt(data.usage_reset_at);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLimit = () => {
    if (plan === 'pro') return false;
    return dailyUsage >= 3;
  };

  const incrementUsage = async () => {
    if (!user) return;

    try {
      // Optimistic update
      setDailyUsage(prev => prev + 1);

      const { error } = await supabase.rpc('increment_daily_usage', {
        user_id_param: user.id
      });

      if (error) {
        // Revert on error
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
    isLoading,
    isOverLimit: checkLimit(),
    checkLimit,
    incrementUsage
  };
};
