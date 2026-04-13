import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface FiroBAssessment {
  id: string;
  seeker_id: string;
  expressed_inclusion: number;
  wanted_inclusion: number;
  expressed_control: number;
  wanted_control: number;
  expressed_affection: number;
  wanted_affection: number;
  total_expressed: number | null;
  total_wanted: number | null;
  notes: Record<string, unknown> | null;
  created_at: string;
}

export function useFiroBAssessment() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const seekerId = profile?.id;

  const history = useQuery({
    queryKey: ['firo-b-assessments', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('firo_b_assessments').select('*').eq('seeker_id', seekerId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as FiroBAssessment[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (scores: { eI: number; wI: number; eC: number; wC: number; eA: number; wA: number }) => {
      const totalE = scores.eI + scores.eC + scores.eA;
      const totalW = scores.wI + scores.wC + scores.wA;
      const { data, error } = await supabase.from('firo_b_assessments').insert([{
        seeker_id: seekerId!,
        expressed_inclusion: scores.eI,
        wanted_inclusion: scores.wI,
        expressed_control: scores.eC,
        wanted_control: scores.wC,
        expressed_affection: scores.eA,
        wanted_affection: scores.wA,
        total_expressed: totalE,
        total_wanted: totalW,
      }]).select().single();
      if (error) throw error;
      return data as FiroBAssessment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['firo-b-assessments'] }),
  });

  const actions = useQuery({
    queryKey: ['assessment-actions', seekerId, 'firo_b'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('assessment_actions').select('*').eq('seeker_id', seekerId!).eq('assessment_type', 'firo_b').order('priority', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveAction = useMutation({
    mutationFn: async (action: { action_text: string; category: string; priority: number }) => {
      const { error } = await supabase.from('assessment_actions').insert({ seeker_id: seekerId!, assessment_type: 'firo_b', ...action });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment-actions'] }),
  });

  const toggleAction = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from('assessment_actions').update({ status: completed ? 'completed' : 'pending', completed_at: completed ? new Date().toISOString() : null }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment-actions'] }),
  });

  return { history: history.data || [], isLoading: history.isLoading, saveAssessment, actions: actions.data || [], saveAction, toggleAction };
}
