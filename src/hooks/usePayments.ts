import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbPayment {
  id: string;
  seeker_id: string;
  invoice_number: string;
  amount: number;
  gst_amount: number;
  total_amount: number;
  payment_date: string | null;
  due_date: string | null;
  method: string;
  transaction_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export function usePayments(seekerId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['payments', seekerId ?? 'all'],
    queryFn: async (): Promise<DbPayment[]> => {
      let q = supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (seekerId) {
        q = q.eq('seeker_id', seekerId);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as DbPayment[];
    },
  });

  const createPayment = useMutation({
    mutationFn: async (payment: {
      seeker_id: string;
      amount: number;
      gst_amount: number;
      total_amount: number;
      payment_date: string;
      method: string;
      transaction_id?: string;
    }) => {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabase.from('payments').insert({
        seeker_id: payment.seeker_id,
        invoice_number: invoiceNumber,
        amount: payment.amount,
        gst_amount: payment.gst_amount,
        total_amount: payment.total_amount,
        payment_date: payment.payment_date,
        due_date: payment.payment_date,
        method: payment.method,
        transaction_id: payment.transaction_id || null,
        status: 'received',
      } as any).select().single();
      if (error) throw error;
      return data as unknown as DbPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  return { payments: query.data ?? [], isLoading: query.isLoading, createPayment };
}
