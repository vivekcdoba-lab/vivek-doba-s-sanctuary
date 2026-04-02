import { useState, useEffect, useCallback } from 'react';
import {
  BadgeProgress,
  EarnedBadge,
  calculateBadgeProgress,
  fetchEarnedBadges,
  updateBadgeStreaks,
} from '@/lib/badgeEngine';

export function useBadges(seekerId: string | null) {
  const [progress, setProgress] = useState<BadgeProgress[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextBadge, setNextBadge] = useState<BadgeProgress | null>(null);

  const refresh = useCallback(async () => {
    if (!seekerId) return;
    setLoading(true);
    try {
      const [prog, earned] = await Promise.all([
        calculateBadgeProgress(seekerId),
        fetchEarnedBadges(seekerId),
      ]);
      setProgress(prog);
      setEarnedBadges(earned);

      // Find closest unearned badge
      const unearned = prog
        .filter(p => !p.isEarned && p.currentStreak > 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);
      setNextBadge(unearned[0] || null);
    } catch (err) {
      console.error('Error loading badges:', err);
    }
    setLoading(false);
  }, [seekerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const checkAndAwardBadges = useCallback(async (
    worksheetDate: string,
    worksheetData: {
      is_submitted: boolean;
      water_intake_glasses: number;
      sampoorna_din_score: number | null;
      non_negotiables_completed: number;
      non_negotiables_total: number;
      has_positive_income: boolean;
    }
  ) => {
    if (!seekerId) return [];
    const newlyEarned = await updateBadgeStreaks(seekerId, worksheetDate, worksheetData);
    if (newlyEarned.length) {
      await refresh();
    }
    return newlyEarned;
  }, [seekerId, refresh]);

  return {
    progress,
    earnedBadges,
    nextBadge,
    loading,
    refresh,
    checkAndAwardBadges,
  };
}
