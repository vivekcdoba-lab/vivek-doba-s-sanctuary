import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface WoLAssessment {
  id: string;
  seeker_id: string;
  career_score: number;
  finance_score: number;
  health_score: number;
  family_score: number;
  romance_score: number;
  growth_score: number;
  fun_score: number;
  environment_score: number;
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

export function useWheelOfLife() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const seekerId = profile?.id;

  const history = useQuery({
    queryKey: ['wol-assessments', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wheel_of_life_assessments')
        .select('*')
        .eq('seeker_id', seekerId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WoLAssessment[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (scores: {
      career: number; finance: number; health: number; family: number;
      romance: number; growth: number; fun: number; environment: number;
      notes?: Record<string, unknown>;
    }) => {
      const values = [scores.career, scores.finance, scores.health, scores.family,
        scores.romance, scores.growth, scores.fun, scores.environment];
      const avg = parseFloat((values.reduce((a, b) => a + b, 0) / 8).toFixed(1));

      const { data, error } = await supabase
        .from('wheel_of_life_assessments')
        .insert({
          seeker_id: seekerId!,
          career_score: scores.career,
          finance_score: scores.finance,
          health_score: scores.health,
          family_score: scores.family,
          romance_score: scores.romance,
          growth_score: scores.growth,
          fun_score: scores.fun,
          environment_score: scores.environment,
          average_score: avg,
          notes: scores.notes || {},
        })
        .select()
        .single();
      if (error) throw error;
      return data as WoLAssessment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wol-assessments'] }),
  });

  // Action items
  const actions = useQuery({
    queryKey: ['assessment-actions', seekerId, 'wheel_of_life'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_actions')
        .select('*')
        .eq('seeker_id', seekerId!)
        .eq('assessment_type', 'wheel_of_life')
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
          assessment_type: 'wheel_of_life',
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
