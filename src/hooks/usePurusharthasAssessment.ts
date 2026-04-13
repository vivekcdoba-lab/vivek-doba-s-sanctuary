import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface PurusharthasAssessment {
  id: string;
  seeker_id: string;
  dharma_score: number;
  artha_score: number;
  kama_score: number;
  moksha_score: number;
  sub_dimensions: Record<string, unknown> | null;
  average_score: number | null;
  notes: Record<string, unknown> | null;
  created_at: string;
}

export function usePurusharthasAssessment() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const seekerId = profile?.id;

  const history = useQuery({
    queryKey: ['purusharthas-assessments', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purusharthas_assessments')
        .select('*')
        .eq('seeker_id', seekerId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PurusharthasAssessment[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (scores: { dharma: number; artha: number; kama: number; moksha: number; sub_dimensions?: Record<string, unknown>; notes?: Record<string, unknown> }) => {
      const vals = [scores.dharma, scores.artha, scores.kama, scores.moksha];
      const avg = parseFloat((vals.reduce((a, b) => a + b, 0) / 4).toFixed(1));
      const { data, error } = await supabase
        .from('purusharthas_assessments')
        .insert([{
          seeker_id: seekerId!,
          dharma_score: scores.dharma,
          artha_score: scores.artha,
          kama_score: scores.kama,
          moksha_score: scores.moksha,
          sub_dimensions: (scores.sub_dimensions || {}) as any,
          average_score: avg,
          notes: (scores.notes || {}) as any,
        }])
        .select()
        .single();
      if (error) throw error;
      return data as PurusharthasAssessment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purusharthas-assessments'] }),
  });

  const actions = useQuery({
    queryKey: ['assessment-actions', seekerId, 'purusharthas'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_actions')
        .select('*')
        .eq('seeker_id', seekerId!)
        .eq('assessment_type', 'purusharthas')
        .order('priority', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveAction = useMutation({
    mutationFn: async (action: { action_text: string; category: string; priority: number }) => {
      const { error } = await supabase.from('assessment_actions').insert({ seeker_id: seekerId!, assessment_type: 'purusharthas', ...action });
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
