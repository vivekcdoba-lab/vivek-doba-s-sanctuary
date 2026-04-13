import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface LgtAssessment {
  id: string;
  seeker_id: string;
  dharma_score: number;
  artha_score: number;
  kama_score: number;
  moksha_score: number;
  average_score: number | null;
  notes: Record<string, unknown> | null;
  created_at: string;
}

export interface AssessmentAction {
  id: string;
  seeker_id: string;
  assessment_type: string;
  assessment_id: string | null;
  action_text: string;
  category: string | null;
  priority: number;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export function useLgtAssessment() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const seekerId = profile?.id;

  const history = useQuery({
    queryKey: ['lgt-assessments', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lgt_assessments')
        .select('*')
        .eq('seeker_id', seekerId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LgtAssessment[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (scores: {
      dharma: number; artha: number; kama: number; moksha: number;
      notes?: Record<string, unknown>;
    }) => {
      const vals = [scores.dharma, scores.artha, scores.kama, scores.moksha];
      const avg = parseFloat((vals.reduce((a, b) => a + b, 0) / 4).toFixed(1));

      const { data, error } = await supabase
        .from('lgt_assessments')
        .insert([{
          seeker_id: seekerId!,
          dharma_score: scores.dharma,
          artha_score: scores.artha,
          kama_score: scores.kama,
          moksha_score: scores.moksha,
          average_score: avg,
          notes: (scores.notes || {}) as any,
        }])
        .select()
        .single();
      if (error) throw error;
      return data as LgtAssessment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lgt-assessments'] }),
  });

  const actions = useQuery({
    queryKey: ['assessment-actions', seekerId, 'lgt'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_actions')
        .select('*')
        .eq('seeker_id', seekerId!)
        .eq('assessment_type', 'lgt')
        .order('priority', { ascending: true });
      if (error) throw error;
      return data as AssessmentAction[];
    },
  });

  const saveAction = useMutation({
    mutationFn: async (action: { action_text: string; category: string; priority: number; assessment_id?: string; due_date?: string }) => {
      const { error } = await supabase
        .from('assessment_actions')
        .insert({
          seeker_id: seekerId!,
          assessment_type: 'lgt',
          ...action,
        });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment-actions'] }),
  });

  const toggleAction = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('assessment_actions')
        .update({
          status: completed ? 'completed' : 'pending',
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment-actions'] }),
  });

  return {
    history: history.data || [],
    isLoading: history.isLoading,
    saveAssessment,
    actions: actions.data || [],
    actionsLoading: actions.isLoading,
    saveAction,
    toggleAction,
  };
}
