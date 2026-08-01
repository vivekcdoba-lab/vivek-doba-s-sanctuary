import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SessionCredits {
  enrollmentId: string | null;
  sessionsCommitted: number;
  sessionsUsed: number;
  bonusSessionsGranted: number;
  totalAllowed: number;
  earnedCredits: number;
  creditsToNextBonus: number;
  bonusCapReached: boolean;
  workshopCreditsTotal: number;
  workshopCreditsUsed: number;
  workshopCreditsRemaining: number;
  atLimit: boolean;
}

const EMPTY: SessionCredits = {
  enrollmentId: null,
  sessionsCommitted: 0,
  sessionsUsed: 0,
  bonusSessionsGranted: 0,
  totalAllowed: 0,
  earnedCredits: 0,
  creditsToNextBonus: 10,
  bonusCapReached: false,
  workshopCreditsTotal: 0,
  workshopCreditsUsed: 0,
  workshopCreditsRemaining: 0,
  atLimit: false,
};

/** Aggregated session-cap + earned-credit state for a seeker's active enrollment(s). */
export function useSessionCredits(seekerId?: string | null) {
  return useQuery<SessionCredits>({
    queryKey: ['session-credits', seekerId ?? 'none'],
    enabled: !!seekerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(
          'id, sessions_committed, sessions_used, bonus_sessions_granted, earned_credits, workshop_credits_total, workshop_credits_used, status, created_at'
        )
        .eq('seeker_id', seekerId!)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const rows = (data || []) as any[];
      if (rows.length === 0) return EMPTY;

      const primary = rows.find((r) => (r.sessions_committed ?? 0) > 0) || rows[0];
      const sum = (key: string) => rows.reduce((a, r) => a + (r[key] ?? 0), 0);

      const sessionsCommitted = primary.sessions_committed ?? 0;
      const sessionsUsed = primary.sessions_used ?? 0;
      const bonus = primary.bonus_sessions_granted ?? 0;
      const earnedCredits = primary.earned_credits ?? 0;
      const wsTotal = sum('workshop_credits_total');
      const wsUsed = sum('workshop_credits_used');
      const totalAllowed = sessionsCommitted + bonus;

      return {
        enrollmentId: primary.id,
        sessionsCommitted,
        sessionsUsed,
        bonusSessionsGranted: bonus,
        totalAllowed,
        earnedCredits,
        creditsToNextBonus: Math.max(10 - (earnedCredits % 10), 0),
        bonusCapReached: bonus >= 3,
        workshopCreditsTotal: wsTotal,
        workshopCreditsUsed: wsUsed,
        workshopCreditsRemaining: Math.max(wsTotal - wsUsed, 0),
        atLimit: totalAllowed > 0 && sessionsUsed >= totalAllowed,
      };
    },
  });
}
