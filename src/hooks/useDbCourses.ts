import { useQuery } from '@tanstack/react-query';
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
