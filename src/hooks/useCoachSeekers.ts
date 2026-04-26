import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CoachSeekerRow {
  id: string;
  coach_id: string;
  seeker_id: string;
  assigned_by: string | null;
  assigned_at: string;
  is_primary: boolean;
}

/** All coach↔seeker rows visible to the caller (admin: everything; coach: their own rows). */
export function useCoachSeekers(coachId?: string) {
  return useQuery({
    queryKey: ['coach-seekers', coachId ?? 'all'],
    queryFn: async (): Promise<CoachSeekerRow[]> => {
      let q = supabase.from('coach_seekers').select('*').order('assigned_at', { ascending: false });
      if (coachId) q = q.eq('coach_id', coachId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as CoachSeekerRow[];
    },
  });
}

/** Admin: assign one or more seekers to a coach (idempotent — skips existing pairs). */
export function useAssignSeekersToCoach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      coach_id, seeker_ids, assigned_by, is_primary = true,
    }: { coach_id: string; seeker_ids: string[]; assigned_by: string; is_primary?: boolean }) => {
      if (!coach_id || seeker_ids.length === 0) throw new Error('Coach and at least one seeker required');
      const rows = seeker_ids.map(sid => ({
        coach_id, seeker_id: sid, assigned_by, is_primary,
      }));
      // Use upsert to ignore duplicates without erroring
      const { error } = await supabase
        .from('coach_seekers')
        .upsert(rows as any, { onConflict: 'coach_id,seeker_id', ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-seekers'] });
      queryClient.invalidateQueries({ queryKey: ['scoped-seekers'] });
    },
  });
}

/** Admin: unassign a single coach↔seeker pair. */
export function useUnassignSeeker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ coach_id, seeker_id }: { coach_id: string; seeker_id: string }) => {
      const { error } = await supabase
        .from('coach_seekers')
        .delete()
        .eq('coach_id', coach_id)
        .eq('seeker_id', seeker_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-seekers'] });
      queryClient.invalidateQueries({ queryKey: ['scoped-seekers'] });
    },
  });
}

/** Admin: move a seeker from one coach to another (atomic-ish: insert new, then delete old). */
export function useReassignSeeker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      seeker_id, from_coach_id, to_coach_id, assigned_by,
    }: { seeker_id: string; from_coach_id: string; to_coach_id: string; assigned_by: string }) => {
      const { error: insErr } = await supabase
        .from('coach_seekers')
        .upsert({ coach_id: to_coach_id, seeker_id, assigned_by, is_primary: true } as any,
          { onConflict: 'coach_id,seeker_id', ignoreDuplicates: true });
      if (insErr) throw insErr;
      const { error: delErr } = await supabase
        .from('coach_seekers')
        .delete()
        .eq('coach_id', from_coach_id)
        .eq('seeker_id', seeker_id);
      if (delErr) throw delErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-seekers'] });
      queryClient.invalidateQueries({ queryKey: ['scoped-seekers'] });
    },
  });
}
