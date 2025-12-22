'use client';

import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    loadProfile();
  }, [user?.id]); // Only re-run when user ID changes

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // If no profile exists, create one from auth metadata
        if (profileError.code === 'PGRST116') {
          const newProfile: Partial<UserProfile> = {
            id: user.id,
            full_name: user.user_metadata?.full_name || null,
            email: user.email || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            phone: null,
            city: null,
            bio: null,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) throw createError;
          setProfile(createdProfile);
        } else {
          throw profileError;
        }
      } else {
        setProfile(data);
        if (!data.email && user.email) {
          supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('id', user.id)
            .then(({ error: updateError }) => {
              if (updateError) {
                console.error('Error updating profile email:', updateError);
              }
            });
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err as Error);
      
      // Fallback to auth metadata
      if (user) {
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          email: user.email || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          phone: null,
          city: null,
          bio: null,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { success: false, error: 'No user or profile' };

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: err as Error };
    }
  };

  const refreshProfile = () => {
    loadProfile();
  };

  // Computed values for easy access
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const userInitial = displayName.charAt(0).toUpperCase();

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    // Convenience accessors
    displayName,
    avatarUrl,
    userInitial,
  };
}
