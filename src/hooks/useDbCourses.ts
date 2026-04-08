import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbCourse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  tier: string;
  duration: string | null;
  format: string | null;
  is_active: boolean;
  tagline: string | null;
  max_participants: number | null;
  gradient_colors: any;
  event_date: string | null;
  location: string | null;
  location_type: string | null;
}

export function useDbCourses() {
  return useQuery({
    queryKey: ['db-courses'],
    queryFn: async (): Promise<DbCourse[]> => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data || []) as DbCourse[];
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (course: Omit<DbCourse, 'id'>) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(course as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['db-courses'] }),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<DbCourse>) => {
      const { data, error } = await supabase
        .from('courses')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['db-courses'] }),
  });
}
