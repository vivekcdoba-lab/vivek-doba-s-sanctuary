import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import type { SeekerProfile } from './useSeekerProfiles';

/**
 * Returns the seekers the current user can act on:
 * - Admins (any admin level) → all seekers (matches useSeekerProfiles).
 * - Coaches → only seekers assigned to them via coach_seekers.
 *
 * Uses RLS to do the filtering server-side, so this is safe even if the role check
 * here is wrong: a non-admin coach simply can't read other seekers' profiles.
 */
export function useScopedSeekers() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';
  const myCoachProfileId = profile?.id || null;

  return useQuery({
    queryKey: ['scoped-seekers', isAdmin ? 'admin' : myCoachProfileId],
    enabled: !!profile,
    queryFn: async (): Promise<SeekerProfile[]> => {
      if (isAdmin) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'seeker')
          .order('full_name');
        if (error) throw error;
        return (data || []) as SeekerProfile[];
      }

      // Coach: pull assigned seeker_ids first, then fetch profiles.
      if (!myCoachProfileId) return [];
      const { data: links, error: linkErr } = await supabase
        .from('coach_seekers')
        .select('seeker_id')
        .eq('coach_id', myCoachProfileId);
      if (linkErr) throw linkErr;
      const ids = (links || []).map(l => l.seeker_id);
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids)
        .order('full_name');
      if (error) throw error;
      return (data || []) as SeekerProfile[];
    },
  });
}
