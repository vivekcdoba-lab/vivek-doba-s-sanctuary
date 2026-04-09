import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function useBusinessProfile() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();

  const { data: business, isLoading } = useQuery({
    queryKey: ['business-profile', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('seeker_id', profile!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const createBusiness = useMutation({
    mutationFn: async (vals: { business_name: string; industry?: string; tagline?: string; founded_year?: number; team_size?: number; revenue_range?: string; website?: string }) => {
      const { data, error } = await supabase
        .from('business_profiles')
        .insert({ ...vals, seeker_id: profile!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business-profile'] }); toast.success('Business profile created!'); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateBusiness = useMutation({
    mutationFn: async (vals: { business_name?: string; industry?: string; tagline?: string; founded_year?: number; team_size?: number; revenue_range?: string; website?: string }) => {
      const { error } = await supabase
        .from('business_profiles')
        .update(vals)
        .eq('id', business!.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business-profile'] }); toast.success('Updated!'); },
    onError: (e: any) => toast.error(e.message),
  });

  return { business, isLoading, createBusiness, updateBusiness };
}
