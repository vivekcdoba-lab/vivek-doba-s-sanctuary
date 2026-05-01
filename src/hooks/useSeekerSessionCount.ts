/**
 * useSeekerSessionCount — derived counter that respects attendance rules.
 *
 * Rules:
 *  - attendance = 'present'  → counts toward attended (consumes a session)
 *  - attendance = 'no_show'  → counts toward attended (default for missed/no-show)
 *  - attendance = 'excused'  → does NOT count (admin marked strong acceptable reason)
 *  - other / null            → not counted yet (still scheduled / pending)
 *
 * Plus: a submitted LGT Application — Information Gathering Session always
 * counts as +1 attended (it is the seeker's first session).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SeekerSessionCount {
  attended: number; // sessions consumed (incl. LGT IGS)
  excused: number;  // free re-bookings owed
  scheduledOrPending: number;
  hasLgtIgs: boolean;
}

export function useSeekerSessionCount(seekerId?: string | null) {
  return useQuery<SeekerSessionCount>({
    queryKey: ['seeker-session-count', seekerId ?? 'none'],
    enabled: !!seekerId,
    queryFn: async () => {
      const [{ data: sess }, { data: lgt }] = await Promise.all([
        supabase.from('sessions').select('id, attendance').eq('seeker_id', seekerId!),
        supabase.from('lgt_applications').select('id, status').eq('seeker_id', seekerId!).maybeSingle(),
      ]);
      const list = sess || [];
      const attendedFromSessions = list.filter(s => s.attendance === 'present' || s.attendance === 'no_show').length;
      const excused = list.filter(s => s.attendance === 'excused').length;
      const scheduledOrPending = list.filter(s => !['present', 'no_show', 'excused'].includes(s.attendance || '')).length;
      const hasLgtIgs = !!(lgt && (lgt as any).status === 'submitted');
      return {
        attended: attendedFromSessions + (hasLgtIgs ? 1 : 0),
        excused,
        scheduledOrPending,
        hasLgtIgs,
      };
    },
  });
}
