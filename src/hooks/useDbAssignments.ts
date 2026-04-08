import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbAssignment {
  id: string;
  seeker_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  type: string;
  due_date: string;
  status: string;
  priority: string | null;
  score: number | null;
  feedback: string | null;
  created_at: string;
}

export function useDbAssignments(seekerId?: string) {
  return useQuery({
    queryKey: ['db-assignments', seekerId ?? 'all'],
    queryFn: async (): Promise<DbAssignment[]> => {
      let q = supabase.from('assignments').select('*').order('due_date', { ascending: false });
      if (seekerId) q = q.eq('seeker_id', seekerId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as DbAssignment[];
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: {
      seeker_id: string;
      title: string;
      due_date: string;
      description?: string;
      type?: string;
      priority?: string;
      course_id?: string;
    }) => {
      const { data, error } = await supabase.from('assignments').insert({
        seeker_id: assignment.seeker_id,
        title: assignment.title,
        due_date: assignment.due_date,
        description: assignment.description || null,
        type: assignment.type || 'one_time',
        priority: assignment.priority || 'medium',
        course_id: assignment.course_id || null,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-assignments'] });
    },
  });
}
