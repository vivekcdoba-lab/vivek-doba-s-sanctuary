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

/** Fetch the link group for a single seeker (their own row + all partners in the same group). */
export function useSeekerLinkGroup(seekerId: string | null | undefined) {
  return useQuery({
    queryKey: ['seeker-link-group', seekerId],
    enabled: !!seekerId,
    queryFn: async (): Promise<SeekerLinkRow[]> => {
      // 1. Find this seeker's group_id
      const { data: own } = await supabase
        .from('seeker_links')
        .select('group_id')
        .eq('seeker_id', seekerId!)
        .maybeSingle();
      if (!own?.group_id) return [];

      // 2. Fetch all rows in that group with seeker profile info
      const { data, error } = await supabase
        .from('seeker_links')
        .select('id, group_id, seeker_id, relationship, relationship_label, linked_by, created_at, seeker:seeker_id(id, full_name, email)')
        .eq('group_id', own.group_id);
      if (error) throw error;
      return (data as any[]) as SeekerLinkRow[];
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

/** Admin: link two seekers. Creates a new group_id and inserts both rows. */
export function useLinkSeekers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      primary_seeker_id: string;
      partner_seeker_id: string;
      relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'custom';
      relationship_label?: string;
      linked_by: string; // admin profile id
    }) => {
      if (input.primary_seeker_id === input.partner_seeker_id) {
        throw new Error('Cannot link a seeker to themselves');
      }
      // Reject if either seeker already in a group
      const { data: existing } = await supabase
        .from('seeker_links')
        .select('seeker_id')
        .in('seeker_id', [input.primary_seeker_id, input.partner_seeker_id]);
      if (existing && existing.length > 0) {
        throw new Error('One of the selected seekers is already linked. Unlink them first.');
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
