import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeeStructureFields {
  feePerSession: string;
  numSessions: number | '';
  coachingDuration: string;
  handHoldingSupport: string;
  totalProgramDuration: string;
  startDate: string;
  endDate: string;
  totalFeesExclGst: number | '';
  gstAmount: number | '';
  totalInvestment: number | '';
  paymentPlan: 'full' | 'installments' | '';
  installmentSchedule: string;
  modeOfPayment: string[];
  amountPaidToday: number | '';
  balanceDue: number | '';
  // --- NEW (additive) ---
  primary_course_id?: string | null;
  bundled_course_ids?: string[];
  include_gst?: boolean;
  gst_rate?: number;
  discount_amount?: number | '';
  discount_reason?: string;
  // computed snapshots, persisted for reporting
  subtotal_amount?: number;
  total_sessions?: number;
}

export const defaultFeeStructure: FeeStructureFields = {
  feePerSession: 'INR 30,000 per session + GST @ 18%',
  numSessions: '',
  coachingDuration: '6 months',
  handHoldingSupport: '6 months',
  totalProgramDuration: '12 months',
  startDate: '',
  endDate: '',
  totalFeesExclGst: '',
  gstAmount: '',
  totalInvestment: '',
  paymentPlan: '',
  installmentSchedule: '',
  modeOfPayment: [],
  amountPaidToday: '',
  balanceDue: '',
  primary_course_id: null,
  bundled_course_ids: [],
  include_gst: true,
  gst_rate: 18,
  discount_amount: '',
  discount_reason: '',
  subtotal_amount: 0,
  total_sessions: 0,
};

export function useFeeStructure(seekerId?: string | null) {
  return useQuery({
    queryKey: ['fee-structure', seekerId ?? 'none'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agreements')
        .select('*')
        .eq('client_id', seekerId!)
        .eq('type', 'fee_structure')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      seekerId,
      fields,
      existingId,
    }: { seekerId: string; fields: FeeStructureFields; existingId?: string | null }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();
      if (!profile) throw new Error('Profile not found');

      if (existingId) {
        const { error } = await supabase
          .from('agreements')
          .update({ fields_json: fields as any, signed_at: new Date().toISOString() })
          .eq('id', existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('agreements').insert({
          client_id: seekerId,
          coach_id: profile.id,
          type: 'fee_structure',
          fields_json: fields as any,
          signed_at: new Date().toISOString(),
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fee-structure', vars.seekerId] });
    },
  });
}
