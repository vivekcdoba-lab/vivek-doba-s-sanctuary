import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import type { SwotScores, SwotItem } from '@/components/swot-assessment/swotData';
import { getSwotBalance } from '@/components/swot-assessment/swotData';

export interface SwotAssessment {
  id: string;
  seeker_id: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  overall_notes: string | null;
  strength_count: number;
  weakness_count: number;
  opportunity_count: number;
  threat_count: number;
  balance_score: number | null;
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

export function useSwotAssessment() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const seekerId = profile?.id;

  const history = useQuery({
    queryKey: ['swot-assessments', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_swot_assessments')
        .select('*')
        .eq('seeker_id', seekerId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        strengths: Array.isArray(d.strengths) ? d.strengths : [],
        weaknesses: Array.isArray(d.weaknesses) ? d.weaknesses : [],
        opportunities: Array.isArray(d.opportunities) ? d.opportunities : [],
        threats: Array.isArray(d.threats) ? d.threats : [],
      })) as SwotAssessment[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (scores: SwotScores & { overall_notes?: string }) => {
      const balance = getSwotBalance(scores);
      const { data, error } = await supabase
        .from('personal_swot_assessments')
        .insert([{
          seeker_id: seekerId!,
          strengths: scores.strengths as any,
          weaknesses: scores.weaknesses as any,
          opportunities: scores.opportunities as any,
          threats: scores.threats as any,
          overall_notes: scores.overall_notes || null,
          strength_count: scores.strengths.length,
          weakness_count: scores.weaknesses.length,
          opportunity_count: scores.opportunities.length,
          threat_count: scores.threats.length,
          balance_score: parseFloat((balance.overallBalance * 100).toFixed(1)),
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swot-assessments'] }),
  });

  const actions = useQuery({
    queryKey: ['assessment-actions', seekerId, 'swot'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_actions')
        .select('*')
        .eq('seeker_id', seekerId!)
        .eq('assessment_type', 'swot')
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
          assessment_type: 'swot',
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
