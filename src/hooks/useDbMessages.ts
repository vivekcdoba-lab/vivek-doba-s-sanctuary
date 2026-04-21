import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { encryptField, decryptMany } from '@/lib/encryption';

export interface DbMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useDbMessages(profileId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['db-messages', profileId],
    enabled: !!profileId,
    queryFn: async (): Promise<DbMessage[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const rows = (data || []) as any[];
      if (rows.length === 0) return [];
      // Batched decrypt of body_enc — single RPC call regardless of message count
      const bodyEnc = rows.map(r => r.body_enc ?? null);
      const bodies = await decryptMany(bodyEnc);
      return rows.map((r, i) => ({
        ...r,
        content: bodies[i] ?? r.content ?? '',
      })) as DbMessage[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!profileId) return;
    const channel = supabase
      .channel(`messages-${profileId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['db-messages', profileId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profileId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (msg: { sender_id: string; receiver_id: string; content: string }) => {
      const body_enc = await encryptField(msg.content);
      const { data, error } = await supabase.from('messages').insert({
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        body_enc,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-messages'] });
    },
  });
}
