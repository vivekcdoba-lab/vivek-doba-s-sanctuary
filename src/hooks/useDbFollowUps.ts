import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbFollowUp {
  id: string;
  seeker_id: string;
  type: string;
  due_date: string;
  priority: string | null;
  status: string;
  notes: string | null;
  completion_notes: string | null;
  created_at: string;
}

export function useDbFollowUps() {
  return useQuery({
    queryKey: ['db-follow-ups'],
    queryFn: async (): Promise<DbFollowUp[]> => {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data || []) as DbFollowUp[];
    },
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followUp: {
      seeker_id: string;
      type: string;
      due_date: string;
      priority?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.from('follow_ups').insert({
        seeker_id: followUp.seeker_id,
        type: followUp.type,
        due_date: followUp.due_date,
        priority: followUp.priority || 'medium',
        notes: followUp.notes || null,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-follow-ups'] });
    },
  });
}
