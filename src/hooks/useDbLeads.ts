import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbLead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  stage: string | null;
  priority: string | null;
  interested_course_id: string | null;
  current_challenge: string | null;
  notes: string | null;
  days_in_pipeline: number | null;
  next_followup_date: string | null;
  created_at: string;
}

export function useDbLeads() {
  return useQuery({
    queryKey: ['db-leads'],
    queryFn: async (): Promise<DbLead[]> => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DbLead[];
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lead: {
      name: string;
      phone?: string;
      email?: string;
      source?: string;
      interested_course_id?: string;
      priority?: string;
      current_challenge?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.from('leads').insert({
        name: lead.name,
        phone: lead.phone || null,
        email: lead.email || null,
        source: lead.source || 'Website',
        interested_course_id: lead.interested_course_id || null,
        priority: lead.priority || 'warm',
        current_challenge: lead.current_challenge || null,
        notes: lead.notes || null,
        stage: 'new',
        days_in_pipeline: 0,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; stage?: string; [key: string]: any }) => {
      const { data, error } = await supabase.from('leads').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-leads'] });
    },
  });
}
