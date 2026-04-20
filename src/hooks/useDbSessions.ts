import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbSession {
  id: string;
  seeker_id: string;
  course_id: string | null;
  session_number: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  location_type: string | null;
  meeting_link: string | null;
  duration_minutes: number | null;
  session_name: string | null;
  session_notes: string | null;
  key_insights: string | null;
  breakthroughs: string | null;
  topics_covered: any;
  engagement_score: number | null;
  seeker_mood: string | null;
  attendance: string | null;
  pillar: string | null;
  created_at: string;
}

export interface CoachOption {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export function useCoaches() {
  return useQuery({
    queryKey: ['coaches-picker'],
    queryFn: async (): Promise<CoachOption[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, is_also_coach')
        .or('role.eq.coach,is_also_coach.eq.true')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url ?? null,
      }));
    },
  });
}

export function useDbSessions(seekerId?: string) {
  return useQuery({
    queryKey: ['db-sessions', seekerId ?? 'all'],
    queryFn: async (): Promise<DbSession[]> => {
      let q = supabase.from('sessions').select('*').order('date', { ascending: false });
      if (seekerId) q = q.eq('seeker_id', seekerId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as DbSession[];
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: {
      seeker_id: string;
      date: string;
      start_time: string;
      end_time: string;
      session_number?: number;
      location_type?: string;
      duration_minutes?: number;
      course_id?: string;
      status?: string;
      session_notes?: string;
      coach_id?: string;
    }) => {
      const { data, error } = await supabase.from('sessions').insert({
        seeker_id: session.seeker_id,
        date: session.date,
        start_time: session.start_time,
        end_time: session.end_time,
        session_number: session.session_number || 1,
        location_type: session.location_type || 'online',
        duration_minutes: session.duration_minutes || 60,
        course_id: session.course_id || null,
        status: session.status || 'scheduled',
        session_notes: session.session_notes || null,
        coach_id: session.coach_id || null,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-sessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-sessions'] });
    },
  });
}
