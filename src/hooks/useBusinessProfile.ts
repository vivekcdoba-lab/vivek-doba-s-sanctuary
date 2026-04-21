import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { encryptField, decryptField, hashForLookup } from '@/lib/encryption';

interface BusinessSensitive {
  gst_number?: string;
  pan?: string;
  bank_account?: string;
  ifsc?: string;
  revenue?: string;
}

interface BusinessInput {
  business_name: string;
  industry?: string;
  tagline?: string;
  founded_year?: number;
  team_size?: number;
  revenue_range?: string;
  website?: string;
  // sensitive (will be encrypted)
  gst_number?: string;
  pan?: string;
  bank_account?: string;
  ifsc?: string;
  revenue?: string;
}

async function buildEncryptedPayload(vals: BusinessSensitive) {
  const [gst_number_enc, pan_enc, bank_account_enc, ifsc_enc, revenue_enc, gst_hash, pan_hash] =
    await Promise.all([
      encryptField(vals.gst_number),
      encryptField(vals.pan),
      encryptField(vals.bank_account),
      encryptField(vals.ifsc),
      encryptField(vals.revenue),
      hashForLookup(vals.gst_number),
      hashForLookup(vals.pan),
    ]);
  const payload: Record<string, any> = {};
  if (vals.gst_number !== undefined) { payload.gst_number_enc = gst_number_enc; payload.gst_hash = gst_hash; }
  if (vals.pan !== undefined) { payload.pan_enc = pan_enc; payload.pan_hash = pan_hash; }
  if (vals.bank_account !== undefined) payload.bank_account_enc = bank_account_enc;
  if (vals.ifsc !== undefined) payload.ifsc_enc = ifsc_enc;
  if (vals.revenue !== undefined) payload.revenue_enc = revenue_enc;
  return payload;
}

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
      if (!data) return null;
      // Decrypt sensitive fields lazily (single-row page → 5 small RPCs in parallel)
      const [gst_number, pan, bank_account, ifsc, revenue] = await Promise.all([
        decryptField((data as any).gst_number_enc),
        decryptField((data as any).pan_enc),
        decryptField((data as any).bank_account_enc),
        decryptField((data as any).ifsc_enc),
        decryptField((data as any).revenue_enc),
      ]);
      return { ...data, gst_number, pan, bank_account, ifsc, revenue } as any;
    },
  });

  const createBusiness = useMutation({
    mutationFn: async (vals: BusinessInput) => {
      const { gst_number, pan, bank_account, ifsc, revenue, ...plain } = vals;
      const enc = await buildEncryptedPayload({ gst_number, pan, bank_account, ifsc, revenue });
      const { data, error } = await supabase
        .from('business_profiles')
        .insert({ ...plain, ...enc, seeker_id: profile!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business-profile'] }); toast.success('Business profile created!'); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateBusiness = useMutation({
    mutationFn: async (vals: Partial<BusinessInput>) => {
      const { gst_number, pan, bank_account, ifsc, revenue, ...plain } = vals;
      const enc = await buildEncryptedPayload({ gst_number, pan, bank_account, ifsc, revenue });
      const { error } = await supabase
        .from('business_profiles')
        .update({ ...plain, ...enc } as any)
        .eq('id', business!.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business-profile'] }); toast.success('Updated!'); },
    onError: (e: any) => toast.error(e.message),
  });

  return { business, isLoading, createBusiness, updateBusiness };
}
