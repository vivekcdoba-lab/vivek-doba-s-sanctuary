import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SeekerLinkRow {
  id: string;
  group_id: string;
  seeker_id: string;
  relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'custom';
  relationship_label: string | null;
  linked_by: string | null;
  created_at: string;
  seeker?: { id: string; full_name: string; email: string };
}

/** Fetch the link partners for a single seeker (excludes the seeker's own row).
 *  Uses a SECURITY DEFINER RPC so we can read partner profile names/emails
 *  without requiring direct profiles RLS access. */
export function useSeekerLinkGroup(seekerId: string | null | undefined) {
  return useQuery({
    queryKey: ['seeker-link-group', seekerId],
    enabled: !!seekerId,
    queryFn: async (): Promise<SeekerLinkRow[]> => {
      // Step 1: find this seeker's own seeker_links row to get the group_id.
      // Admins have full SELECT via RLS; seekers can read their own row.
      const { data: own } = await supabase
        .from('seeker_links')
        .select('group_id')
        .eq('seeker_id', seekerId!)
        .maybeSingle();

      if (own?.group_id) {
        const { data: rows, error: rowsErr } = await supabase
          .from('seeker_links')
          .select('id, group_id, seeker_id, relationship, relationship_label, linked_by, created_at, seeker:seeker_id(id, full_name, email)')
          .eq('group_id', own.group_id);
        if (rowsErr) throw rowsErr;
        return (rows as any[]) as SeekerLinkRow[];
      }

      // Fallback: SECURITY DEFINER RPC (covers cases where direct SELECT is restricted).
      const { data: rpcData } = await supabase.rpc('get_linked_seekers_basic', {
        _seeker_id: seekerId!,
      });
      return ((rpcData || []) as any[]).map(r => ({
        id: r.link_id,
        group_id: r.group_id,
        seeker_id: r.partner_id,
        relationship: r.relationship,
        relationship_label: r.relationship_label,
        linked_by: null,
        created_at: '',
        seeker: { id: r.partner_id, full_name: r.full_name, email: r.email },
      })) as SeekerLinkRow[];
    },
  });
}

/** Admin: fetch every link group across the system. */
export function useAllSeekerLinks() {
  return useQuery({
    queryKey: ['admin-seeker-links'],
    queryFn: async (): Promise<SeekerLinkRow[]> => {
      const { data, error } = await supabase
        .from('seeker_links')
        .select('id, group_id, seeker_id, relationship, relationship_label, linked_by, created_at, seeker:seeker_id(id, full_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]) as SeekerLinkRow[];
    },
  });
}

/** Admin: link two seekers. Creates a new group_id and inserts both rows.
 *  When `replace = true`, any existing link group containing either seeker is
 *  removed first, so admins can update/replace links without manual unlink. */
export function useLinkSeekers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      primary_seeker_id: string;
      partner_seeker_id: string;
      relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'custom';
      relationship_label?: string;
      linked_by: string; // admin profile id
      replace?: boolean;
    }) => {
      if (input.primary_seeker_id === input.partner_seeker_id) {
        throw new Error('Cannot link a seeker to themselves');
      }
      // Find existing group_ids for either seeker
      const { data: existing } = await supabase
        .from('seeker_links')
        .select('seeker_id, group_id')
        .in('seeker_id', [input.primary_seeker_id, input.partner_seeker_id]);

      if (existing && existing.length > 0) {
        if (!input.replace) {
          throw new Error('One of the selected seekers is already linked. Unlink them first.');
        }
        // Replace flow: delete all existing groups touching either seeker
        const groupIds = Array.from(new Set(existing.map(r => r.group_id)));
        const { error: delErr } = await supabase
          .from('seeker_links')
          .delete()
          .in('group_id', groupIds);
        if (delErr) throw delErr;
      }

      // Generate a shared group_id (uuid v4 from crypto)
      const group_id = (crypto as any).randomUUID();

      // Map "child" relationship asymmetrically: when linking parent -> child,
      // primary is parent, partner is child. We store relationship per-row.
      // For symmetrical relationships (spouse, sibling, custom) both rows share the same value.
      const symmetric = input.relationship !== 'parent' && input.relationship !== 'child';

      const rows = [
        {
          group_id,
          seeker_id: input.primary_seeker_id,
          relationship: input.relationship,
          relationship_label: input.relationship_label || null,
          linked_by: input.linked_by,
        },
        {
          group_id,
          seeker_id: input.partner_seeker_id,
          relationship: symmetric
            ? input.relationship
            : input.relationship === 'parent'
            ? 'child'
            : 'parent',
          relationship_label: input.relationship_label || null,
          linked_by: input.linked_by,
        },
      ];

      const { error } = await supabase.from('seeker_links').insert(rows);
      if (error) throw error;
      return { group_id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-link-group'] });
      queryClient.invalidateQueries({ queryKey: ['admin-seeker-links'] });
    },
  });
}

/** Admin: unlink an entire group (deletes all rows sharing the group_id). */
export function useUnlinkSeekers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (group_id: string) => {
      const { error } = await supabase.from('seeker_links').delete().eq('group_id', group_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-link-group'] });
      queryClient.invalidateQueries({ queryKey: ['admin-seeker-links'] });
    },
  });
}

export const RELATIONSHIP_LABELS: Record<SeekerLinkRow['relationship'], string> = {
  spouse: 'Spouse',
  parent: 'Parent',
  child: 'Child',
  sibling: 'Sibling',
  custom: 'Custom',
};

export const RELATIONSHIP_EMOJIS: Record<SeekerLinkRow['relationship'], string> = {
  spouse: '💑',
  parent: '👨‍👧',
  child: '👶',
  sibling: '👫',
  custom: '🤝',
};
