import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export type AccessMap = Record<string, boolean>;

async function fetchAccess(seekerId: string): Promise<AccessMap> {
  const { data, error } = await supabase
    .from('seeker_module_access')
    .select('module_key, is_enabled')
    .eq('seeker_id', seekerId);
  if (error) throw error;
  const map: AccessMap = {};
  (data || []).forEach((row: any) => { map[row.module_key] = row.is_enabled; });
  return map;
}

export function useSeekerModuleAccess(seekerId: string | null | undefined) {
  return useQuery({
    queryKey: ['seeker-module-access', seekerId],
    enabled: !!seekerId,
    queryFn: () => fetchAccess(seekerId!),
  });
}

export function useMyModuleAccess() {
  const { profile } = useAuthStore();
  const seekerId = profile?.role === 'seeker' ? profile.id : null;
  const q = useQuery({
    queryKey: ['my-module-access', seekerId],
    enabled: !!seekerId,
    queryFn: () => fetchAccess(seekerId!),
    staleTime: 60_000,
  });
  return { ...q, accessMap: q.data || {}, isSeeker: !!seekerId };
}

export function useUpdateSeekerModuleAccess(seekerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entries: Array<{ module_key: string; is_enabled: boolean }>) => {
      if (entries.length === 0) return;
      const { data: me } = await supabase.auth.getUser();
      const { data: meProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', me.user?.id || '')
        .maybeSingle();

      const rows = entries.map(e => ({
        seeker_id: seekerId,
        module_key: e.module_key,
        is_enabled: e.is_enabled,
        updated_by: meProfile?.id || null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('seeker_module_access')
        .upsert(rows, { onConflict: 'seeker_id,module_key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seeker-module-access', seekerId] });
      qc.invalidateQueries({ queryKey: ['my-module-access'] });
    },
  });
}
