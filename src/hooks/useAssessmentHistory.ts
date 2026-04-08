import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface AssessmentRecord {
  id: string;
  type: string;
  scores_json: any;
  analysis_text: string | null;
  period: string | null;
  created_at: string;
}

export function useAssessmentHistory(type: string) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (data) setProfileId(data.id);
    };
    getProfile();
  }, []);

  const history = useQuery({
    queryKey: ['assessment-history', type, profileId],
    enabled: !!profileId,
    queryFn: async (): Promise<AssessmentRecord[]> => {
      const { data, error } = await supabase
        .from('seeker_assessments')
        .select('*')
        .eq('seeker_id', profileId!)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as AssessmentRecord[];
    },
  });

  const saveAssessment = useMutation({
    mutationFn: async (params: { scores: any; analysis?: string; period?: string }) => {
      if (!profileId) throw new Error('No profile');
      const { data, error } = await supabase
        .from('seeker_assessments')
        .insert({
          seeker_id: profileId,
          type,
          scores_json: params.scores,
          analysis_text: params.analysis || null,
          period: params.period || null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-history', type, profileId] });
    },
  });

  return { history: history.data || [], isLoading: history.isLoading, saveAssessment, profileId };
}
