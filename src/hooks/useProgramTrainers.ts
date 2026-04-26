import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TrainerRole = 'lead' | 'co_coach' | 'assistant';

export interface ProgramTrainerRow {
  id: string;
  program_id: string;
  trainer_id: string;
  role: TrainerRole;
  display_order: number | null;
  created_at: string;
  trainer?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

export interface TrainerProgramRow {
  id: string;
  program_id: string;
  trainer_id: string;
  role: TrainerRole;
  display_order: number | null;
  program?: { id: string; name: string; tier: string | null } | null;
}

/** Trainers assigned to a program (with profile join). */
export function useProgramTrainers(programId?: string | null) {
  return useQuery({
    queryKey: ['program-trainers', programId ?? 'all'],
    enabled: !!programId,
    queryFn: async (): Promise<ProgramTrainerRow[]> => {
      const { data, error } = await supabase
        .from('program_trainers')
        .select('*, trainer:profiles!program_trainers_trainer_id_fkey(id, full_name, email, avatar_url, role)')
        .eq('program_id', programId!)
        .order('display_order', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data || []) as unknown as ProgramTrainerRow[];
    },
  });
}

/** All program_trainer rows (admin: gets everything; coach: gets own). Used for counts. */
export function useAllProgramTrainers() {
  return useQuery({
    queryKey: ['program-trainers', 'all-rows'],
    queryFn: async (): Promise<ProgramTrainerRow[]> => {
      const { data, error } = await supabase.from('program_trainers').select('*');
      if (error) throw error;
      return (data || []) as ProgramTrainerRow[];
    },
  });
}

/** Programs a coach is assigned to. */
export function useTrainerPrograms(trainerProfileId?: string | null) {
  return useQuery({
    queryKey: ['trainer-programs', trainerProfileId ?? 'none'],
    enabled: !!trainerProfileId,
    queryFn: async (): Promise<TrainerProgramRow[]> => {
      const { data, error } = await supabase
        .from('program_trainers')
        .select('*, program:courses!program_trainers_program_id_fkey(id, name, tier)')
        .eq('trainer_id', trainerProfileId!)
        .order('display_order', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data || []) as unknown as TrainerProgramRow[];
    },
  });
}

export function useAssignTrainerToProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      program_id, trainer_id, role = 'co_coach', display_order,
    }: { program_id: string; trainer_id: string; role?: TrainerRole; display_order?: number }) => {
      const { data, error } = await supabase
        .from('program_trainers')
        .insert({ program_id, trainer_id, role, display_order: display_order ?? null } as any)
        .select()
        .single();
      if (error) throw error;
      // Count auto-linked seekers
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', program_id);
      return { row: data, autoLinkedCount: count ?? 0 };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['program-trainers'] });
      qc.invalidateQueries({ queryKey: ['trainer-programs'] });
      qc.invalidateQueries({ queryKey: ['coach-seekers'] });
      qc.invalidateQueries({ queryKey: ['scoped-seekers'] });
    },
  });
}

export function useUpdateTrainerRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role, display_order }: { id: string; role?: TrainerRole; display_order?: number | null }) => {
      const updates: any = {};
      if (role !== undefined) updates.role = role;
      if (display_order !== undefined) updates.display_order = display_order;
      const { error } = await supabase.from('program_trainers').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['program-trainers'] });
      qc.invalidateQueries({ queryKey: ['trainer-programs'] });
    },
  });
}

export function useRemoveTrainerFromProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from('program_trainers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['program-trainers'] });
      qc.invalidateQueries({ queryKey: ['trainer-programs'] });
    },
  });
}
