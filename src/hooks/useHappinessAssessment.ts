import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface HappinessAssessment {
  id: string;
  seeker_id: string;
  life_satisfaction_score: number;
  positive_emotions_score: number;
  engagement_score: number;
  relationships_score: number;
  meaning_score: number;
  accomplishment_score: number;
  health_score: number;
  gratitude_score: number;
  average_score: number | null;
  notes: Record<string, unknown> | null;
  created_at: string;
}

export const HAPPINESS_KEYS = ['life_satisfaction', 'positive_emotions', 'engagement', 'relationships', 'meaning', 'accomplishment', 'health', 'gratitude'] as const;

export function useHappinessAssessment() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const seekerId = profile?.id;

  const history = useQuery({
    queryKey: ['happiness-assessments', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('happiness_assessments').select('*').eq('seeker_id', seekerId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as HappinessAssessment[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (scores: Record<string, number>) => {
      const vals = HAPPINESS_KEYS.map(k => scores[k] || 5);
      const avg = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
      const row: any = { seeker_id: seekerId!, average_score: avg };
      HAPPINESS_KEYS.forEach(k => { row[`${k}_score`] = scores[k] || 5; });
      const { data, error } = await supabase.from('happiness_assessments').insert([row]).select().single();
      if (error) throw error;
      return data as HappinessAssessment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['happiness-assessments'] }),
  });

  const actions = useQuery({
    queryKey: ['assessment-actions', seekerId, 'happiness'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('assessment_actions').select('*').eq('seeker_id', seekerId!).eq('assessment_type', 'happiness').order('priority', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveAction = useMutation({
    mutationFn: async (action: { action_text: string; category: string; priority: number }) => {
      const { error } = await supabase.from('assessment_actions').insert({ seeker_id: seekerId!, assessment_type: 'happiness', ...action });
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
