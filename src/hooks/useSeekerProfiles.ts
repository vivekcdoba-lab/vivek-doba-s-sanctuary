import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SeekerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  occupation: string | null;
  company: string | null;
  dob: string | null;
  gender: string | null;
  avatar_url: string | null;
  created_at: string;
  marriage_anniversary: string | null;
  access_end_date: string | null;
}

export function useSeekerProfiles() {
  return useQuery({
    queryKey: ['seeker-profiles'],
    queryFn: async (): Promise<SeekerProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seeker')
        .order('full_name');
      if (error) throw error;
      return (data || []) as SeekerProfile[];
    },
  });
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ['all-profiles'],
    queryFn: async (): Promise<SeekerProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return (data || []) as SeekerProfile[];
    },
  });
}
