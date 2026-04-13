import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface MoochAssessment {
  id: string;
  seeker_id: string;
  overthinking_score: number;
  negativity_score: number;
  comparison_score: number;
  fear_score: number;
  attachment_score: number;
  resistance_score: number;
  average_score: number | null;
  notes: Record<string, unknown> | null;
  created_at: string;
}

export const MOOCH_KEYS = ['overthinking', 'negativity', 'comparison', 'fear', 'attachment', 'resistance'] as const;

export function useMoochAssessment() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const seekerId = profile?.id;

  const history = useQuery({
    queryKey: ['mooch-assessments', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('mooch_assessments').select('*').eq('seeker_id', seekerId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as MoochAssessment[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (scores: Record<string, number>) => {
      const vals = MOOCH_KEYS.map(k => scores[k] || 5);
      const avg = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
      const row: any = { seeker_id: seekerId!, average_score: avg };
      MOOCH_KEYS.forEach(k => { row[`${k}_score`] = scores[k] || 5; });
      const { data, error } = await supabase.from('mooch_assessments').insert([row]).select().single();
      if (error) throw error;
      return data as MoochAssessment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mooch-assessments'] }),
  });

  const actions = useQuery({
    queryKey: ['assessment-actions', seekerId, 'mooch'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('assessment_actions').select('*').eq('seeker_id', seekerId!).eq('assessment_type', 'mooch').order('priority', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveAction = useMutation({
    mutationFn: async (action: { action_text: string; category: string; priority: number }) => {
      const { error } = await supabase.from('assessment_actions').insert({ seeker_id: seekerId!, assessment_type: 'mooch', ...action });
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
