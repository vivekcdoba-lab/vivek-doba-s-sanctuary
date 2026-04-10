import { useMemo, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useStreakCount } from '@/hooks/useStreakCount';
import BackToHome from '@/components/BackToHome';
import Celebration from '@/components/Celebration';
import { Flame, Trophy, Target, TrendingUp, Calendar, Lock, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MILESTONES = [
  { days: 7, emoji: '🌱', label: 'Seedling', desc: '7-day streak' },
  { days: 21, emoji: '🌳', label: 'Rooted', desc: '21-day habit formed' },
  { days: 40, emoji: '🕉️', label: 'Mandala', desc: '40-day Mandala complete' },
  { days: 108, emoji: '👑', label: 'Sovereign', desc: '108-day mastery' },
];

export default function SeekerStreaks() {
  const { profile } = useAuthStore();
  const { data: currentStreak = 0 } = useStreakCount(profile?.id ?? null);
  const [celebrate, setCelebrate] = useState(false);

  const { data: worksheets = [], isLoading } = useQuery({
    queryKey: ['streaks-worksheets', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('worksheet_date, is_submitted, completion_rate_percent')
        .eq('seeker_id', profile!.id)
        .eq('is_submitted', true)
        .order('worksheet_date', { ascending: true });
      return data || [];
    },
  });

  // Best streak
  const bestStreak = useMemo(() => {
    if (!worksheets.length) return 0;
    const dates = worksheets.map(w => w.worksheet_date).sort();
    let max = 1, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) { cur++; max = Math.max(max, cur); }
      else if (diff > 1) cur = 1;
    }
    return Math.max(max, cur);
  }, [worksheets]);

  // Total days logged
  const totalDays = worksheets.length;

  // This month's consistency
  const monthConsistency = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysSoFar = Math.min(now.getDate(), daysInMonth);
    const thisMonth = worksheets.filter(w => {
      const d = new Date(w.worksheet_date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    return daysSoFar > 0 ? Math.round((thisMonth.length / daysSoFar) * 100) : 0;
  }, [worksheets]);

  // Average completion
  const avgCompletion = useMemo(() => {
    if (!worksheets.length) return 0;
    const sum = worksheets.reduce((a, w) => a + (w.completion_rate_percent || 0), 0);
    return Math.round(sum / worksheets.length);
  }, [worksheets]);

  // Last 90 days heatmap
  const heatmapDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const map = new Map(worksheets.map(w => [w.worksheet_date, w.completion_rate_percent || 0]));
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days.push({ date: ds, pct: map.get(ds) ?? -1 });
    }
    return days;
  }, [worksheets]);

  const weeks: typeof heatmapDays[] = [];
  for (let i = 0; i < heatmapDays.length; i += 7) {
    weeks.push(heatmapDays.slice(i, i + 7));
  }

  // Next milestone
  const nextMilestone = MILESTONES.find(m => currentStreak < m.days);
  const daysToNext = nextMilestone ? nextMilestone.days - currentStreak : 0;

  // Status message
  const statusMessage = currentStreak === 0
    ? "Start your journey today!"
    : currentStreak < 7
      ? `${currentStreak} day${currentStreak > 1 ? 's' : ''} and counting!`
      : currentStreak < 21
        ? `You're on fire! ${currentStreak} days strong! 🔥`
        : currentStreak < 40
          ? `Incredible discipline! ${currentStreak} days! 🌳`
          : `Legendary streak! ${currentStreak} days! 👑`;

  // Celebration trigger
  useEffect(() => {
    if (!currentStreak) return;
    const milestone = MILESTONES.find(m => m.days === currentStreak);
    if (!milestone) return;
    const key = `streak-celebrated-${milestone.days}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, 'true');
      setCelebrate(true);
    }
  }, [currentStreak]);

  const heatColor = (pct: number) => {
    if (pct < 0) return 'hsl(var(--muted))';
    if (pct < 50) return 'hsl(27 100% 60% / 0.3)';
    if (pct < 80) return 'hsl(27 100% 60% / 0.6)';
    return 'hsl(27 100% 60%)';
  };

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <BackToHome />
        <Celebration trigger={celebrate} type="fire" onComplete={() => setCelebrate(false)} />

        {/* Hero */}
        <div className="gradient-saffron rounded-2xl p-6 md:p-8 text-center text-primary-foreground relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <Flame className={`w-10 h-10 mx-auto ${currentStreak > 0 ? 'animate-pulse text-primary-foreground' : 'opacity-60'}`} />
            <p className="text-5xl md:text-7xl font-bold">{currentStreak}</p>
            <p className="text-lg font-medium">{statusMessage}</p>
            {nextMilestone && currentStreak > 0 && (
              <p className="text-sm opacity-80">
                {daysToNext} more day{daysToNext !== 1 ? 's' : ''} to reach {nextMilestone.emoji} {nextMilestone.label} badge!
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Trophy, label: 'Best Streak', value: `${bestStreak}d`, color: 'text-[hsl(var(--gold))]' },
            { icon: Calendar, label: 'Total Days', value: totalDays, color: 'text-[hsl(var(--saffron))]' },
            { icon: Target, label: 'This Month', value: `${monthConsistency}%`, color: 'text-[hsl(var(--dharma-green))]' },
            { icon: TrendingUp, label: 'Avg Completion', value: `${avgCompletion}%`, color: 'text-[hsl(var(--chakra-indigo))]' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center space-y-1">
              <s.icon className={`w-5 h-5 mx-auto ${s.color}`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">📅 Last 90 Days</h2>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-3.5 h-3.5 rounded-sm cursor-default"
                        style={{ backgroundColor: heatColor(day.pct), opacity: day.pct < 0 ? 0.35 : 1 }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {day.date}: {day.pct < 0 ? 'No entry' : `${day.pct}% complete`}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-muted/40" />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(27 100% 60% / 0.3)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(27 100% 60% / 0.6)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(27 100% 60%)' }} />
            <span>More</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">🏆 Streak Milestones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MILESTONES.map(m => {
              const earned = bestStreak >= m.days;
              const progress = Math.min(100, Math.round((currentStreak / m.days) * 100));
              return (
                <div key={m.days} className={`bg-card rounded-2xl border p-4 text-center transition-all ${earned ? 'border-[hsl(var(--saffron))]/30 shadow-md' : 'border-border opacity-60 grayscale'}`}>
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                      {!earned && (
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--saffron))" strokeWidth="2"
                          strokeDasharray={`${progress} ${100 - progress}`} strokeLinecap="round" />
                      )}
                      {earned && (
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--saffron))" strokeWidth="2"
                          strokeDasharray="100 0" />
                      )}
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">{m.emoji}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{m.label}</h3>
                  <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                  {earned ? (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-[hsl(var(--saffron))]/10 text-[hsl(var(--saffron))] text-[10px] font-medium">
                      <Star className="w-3 h-3" /> Earned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                      <Lock className="w-3 h-3" /> {progress}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recovery section */}
        {currentStreak === 0 && totalDays > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-3">
            <p className="text-3xl">🙏</p>
            <h3 className="text-base font-semibold text-foreground">Your streak paused — not lost.</h3>
            <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
              "You have the right to work, but never to the fruit of work. You should never engage in action for the sake of reward." — Bhagavad Gita 2.47
            </p>
            <Link
              to="/seeker/worksheet"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--saffron))] text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Restart your journey <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading streak data…</div>
        )}
      </div>
    </TooltipProvider>
  );
}
