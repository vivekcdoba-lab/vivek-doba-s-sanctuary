import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface BadgeDefinition {
  id: string;
  badge_key: string;
  emoji: string;
  name: string;
  description: string;
  category: string;
  condition_type: string;
  condition_field: string | null;
  condition_threshold: number;
  condition_streak_days: number;
  sort_order: number;
}

export interface EarnedBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  awarded_by: string;
  notes: string | null;
  badge: BadgeDefinition;
}

export interface BadgeProgress {
  badge: BadgeDefinition;
  currentStreak: number;
  bestStreak: number;
  requiredStreak: number;
  isEarned: boolean;
  earnedAt?: string;
  progressPercent: number;
  daysRemaining: number;
}

/**
 * Fetches all badge definitions
 */
export async function fetchBadgeDefinitions(): Promise<BadgeDefinition[]> {
  const { data, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching badge definitions:', error);
    return [];
  }
  return (data || []) as unknown as BadgeDefinition[];
}

/**
 * Fetches earned badges for a seeker
 */
export async function fetchEarnedBadges(seekerId: string): Promise<EarnedBadge[]> {
  const { data: badges } = await supabase
    .from('seeker_badges')
    .select('*')
    .eq('seeker_id', seekerId);

  if (!badges?.length) return [];

  const definitions = await fetchBadgeDefinitions();
  const defMap = new Map(definitions.map(d => [d.id, d]));

  return badges.map(b => ({
    ...b,
    badge: defMap.get(b.badge_id)!,
  })).filter(b => b.badge) as unknown as EarnedBadge[];
}

/**
 * Calculates badge progress for a seeker by analyzing worksheet history
 */
export async function calculateBadgeProgress(seekerId: string): Promise<BadgeProgress[]> {
  const definitions = await fetchBadgeDefinitions();

  // Get earned badges
  const { data: earned } = await supabase
    .from('seeker_badges')
    .select('badge_id, earned_at')
    .eq('seeker_id', seekerId);

  const earnedMap = new Map((earned || []).map(e => [e.badge_id, e.earned_at]));

  // Get saved progress
  const { data: savedProgress } = await supabase
    .from('seeker_badge_progress')
    .select('*')
    .eq('seeker_id', seekerId);

  const progressMap = new Map((savedProgress || []).map(p => [p.badge_id, p]));

  return definitions.map(badge => {
    const isEarned = earnedMap.has(badge.id);
    const saved = progressMap.get(badge.id);
    const currentStreak = saved?.current_streak || 0;
    const bestStreak = saved?.best_streak || 0;
    const requiredStreak = badge.condition_streak_days;
    const progressPercent = Math.min(100, Math.round((currentStreak / requiredStreak) * 100));
    const daysRemaining = Math.max(0, requiredStreak - currentStreak);

    return {
      badge,
      currentStreak,
      bestStreak,
      requiredStreak,
      isEarned,
      earnedAt: isEarned ? earnedMap.get(badge.id) : undefined,
      progressPercent,
      daysRemaining,
    };
  });
}

/**
 * Updates badge streaks after a worksheet is saved/submitted.
 * Checks each badge condition against the worksheet data and updates progress.
 */
export async function updateBadgeStreaks(
  seekerId: string,
  worksheetDate: string,
  worksheetData: {
    is_submitted: boolean;
    water_intake_glasses: number;
    sampoorna_din_score: number | null;
    non_negotiables_completed: number;
    non_negotiables_total: number;
    has_positive_income: boolean;
  }
): Promise<string[]> {
  const definitions = await fetchBadgeDefinitions();
  const newlyEarned: string[] = [];

  // Check already earned
  const { data: earned } = await supabase
    .from('seeker_badges')
    .select('badge_id')
    .eq('seeker_id', seekerId);
  const earnedSet = new Set((earned || []).map(e => e.badge_id));

  for (const badge of definitions) {
    if (earnedSet.has(badge.id)) continue;

    // Check if today qualifies
    let qualifies = false;
    switch (badge.condition_type) {
      case 'worksheet_submitted':
        qualifies = worksheetData.is_submitted;
        break;
      case 'water_intake':
        qualifies = worksheetData.water_intake_glasses >= badge.condition_threshold;
        break;
      case 'sampoorna_score':
        qualifies = (worksheetData.sampoorna_din_score || 0) >= badge.condition_threshold;
        break;
      case 'all_non_negotiables':
        qualifies = worksheetData.non_negotiables_completed >= worksheetData.non_negotiables_total &&
          worksheetData.non_negotiables_total > 0;
        break;
      case 'positive_income':
        qualifies = worksheetData.has_positive_income;
        break;
    }

    // Get existing progress
    const { data: existing } = await supabase
      .from('seeker_badge_progress')
      .select('*')
      .eq('seeker_id', seekerId)
      .eq('badge_id', badge.id)
      .maybeSingle();

    let newStreak = 0;
    let bestStreak = existing?.best_streak || 0;

    if (qualifies) {
      // Check if yesterday also qualified (consecutive)
      const yesterday = format(subDays(new Date(worksheetDate), 1), 'yyyy-MM-dd');
      const lastDate = existing?.last_qualifying_date;

      if (lastDate === yesterday) {
        newStreak = (existing?.current_streak || 0) + 1;
      } else if (lastDate === worksheetDate) {
        // Already counted today
        newStreak = existing?.current_streak || 1;
      } else {
        newStreak = 1;
      }
      bestStreak = Math.max(bestStreak, newStreak);
    } else {
      newStreak = 0;
    }

    // Upsert progress
    if (existing) {
      await supabase
        .from('seeker_badge_progress')
        .update({
          current_streak: newStreak,
          best_streak: bestStreak,
          last_qualifying_date: qualifies ? worksheetDate : existing.last_qualifying_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('seeker_badge_progress')
        .insert({
          seeker_id: seekerId,
          badge_id: badge.id,
          current_streak: newStreak,
          best_streak: bestStreak,
          last_qualifying_date: qualifies ? worksheetDate : null,
        });
    }

    // Award badge if streak meets threshold
    if (newStreak >= badge.condition_streak_days) {
      const { error } = await supabase
        .from('seeker_badges')
        .insert({
          seeker_id: seekerId,
          badge_id: badge.id,
          awarded_by: 'system',
          notes: `Achieved ${newStreak}-day streak on ${worksheetDate}`,
        });
      if (!error) {
        newlyEarned.push(`${badge.emoji} ${badge.name}`);
        // Create notification for the seeker
        await supabase.from('worksheet_notifications').insert({
          seeker_id: seekerId,
          notification_type: 'badge_earned',
          message: `🎉 Congratulations! You earned the ${badge.emoji} ${badge.name} badge! ${badge.description}`,
          triggered_by: 'system',
        });
      }
    }
  }

  return newlyEarned;
}
