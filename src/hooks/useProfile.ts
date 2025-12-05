/**
 * useProfile Hook
 * Fetches and manages user profile data from Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // Profile doesn't exist yet
        if (fetchError.code === 'PGRST116') {
          // Create profile
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ user_id: user.id, display_name: null })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }
          setProfile(newProfile);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data);
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
};
