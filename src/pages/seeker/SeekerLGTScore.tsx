import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import BackToHome from '@/components/BackToHome';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { format, subDays } from 'date-fns';

const DIMENSIONS = [
  { key: 'dharma', label: 'DHARMA', subtitle: 'Purpose', emoji: '🕉️', color: 'hsl(var(--dharma-green))', bg: 'bg-[hsl(122,46%,33%)]/10', border: 'border-[hsl(122,46%,33%)]', actions: ['Review your mission statement', 'Practice daily dharma reflection', 'Align one action with your values'] },
  { key: 'artha', label: 'ARTHA', subtitle: 'Wealth', emoji: '💰', color: 'hsl(var(--gold))', bg: 'bg-[hsl(36,87%,38%)]/10', border: 'border-[hsl(36,87%,38%)]', actions: ['Update your SWOT analysis', 'Review cash flow this week', 'Set one business goal'] },
  { key: 'kama', label: 'KAMA', subtitle: 'Desires', emoji: '❤️', color: 'hsl(var(--lotus-pink))', bg: 'bg-[hsl(340,82%,52%)]/10', border: 'border-[hsl(340,82%,52%)]', actions: ['Call a loved one today', 'Plan a family activity', 'Express gratitude to someone'] },
  { key: 'moksha', label: 'MOKSHA', subtitle: 'Liberation', emoji: '☀️', color: 'hsl(var(--wisdom-purple))', bg: 'bg-[hsl(282,68%,38%)]/10', border: 'border-[hsl(282,68%,38%)]', actions: ['Meditate for 10 minutes', 'Write in your peace journal', 'Practice conscious breathing'] },
];

function useDAKMScores(seekerId: string | null) {
  return useQuery({
    queryKey: ['dakm-scores', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      // Latest worksheet
      const { data: latest } = await supabase
        .from('daily_worksheets')
        .select('dharma_score, artha_score, kama_score, moksha_score, worksheet_date')
        .eq('seeker_id', seekerId!)
        .order('worksheet_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Last 7 days average
      const { data: weekData } = await supabase
        .from('daily_worksheets')
        .select('dharma_score, artha_score, kama_score, moksha_score')
        .eq('seeker_id', seekerId!)
        .gte('worksheet_date', weekAgo)
        .lte('worksheet_date', today);

      // Last 30 days for trend
      const { data: monthData } = await supabase
        .from('daily_worksheets')
        .select('dharma_score, artha_score, kama_score, moksha_score, worksheet_date')
        .eq('seeker_id', seekerId!)
        .gte('worksheet_date', monthAgo)
        .lte('worksheet_date', today)
        .order('worksheet_date', { ascending: true });

      const avg = (arr: any[], key: string) => {
        const vals = arr?.filter(r => r[key] != null).map(r => r[key]) || [];
        return vals.length ? Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length) : 0;
      };

      const weekAvg = {
        dharma: avg(weekData || [], 'dharma_score'),
        artha: avg(weekData || [], 'artha_score'),
        kama: avg(weekData || [], 'kama_score'),
        moksha: avg(weekData || [], 'moksha_score'),
      };

      // First half vs second half of month for trend
      const mid = Math.floor((monthData?.length || 0) / 2);
      const firstHalf = monthData?.slice(0, mid) || [];
      const secondHalf = monthData?.slice(mid) || [];
      const trends = {
        dharma: avg(secondHalf, 'dharma_score') - avg(firstHalf, 'dharma_score'),
        artha: avg(secondHalf, 'artha_score') - avg(firstHalf, 'artha_score'),
        kama: avg(secondHalf, 'kama_score') - avg(firstHalf, 'kama_score'),
        moksha: avg(secondHalf, 'moksha_score') - avg(firstHalf, 'moksha_score'),
      };

      return { latest, weekAvg, trends, monthData };
    },
  });
}

function QuadrantCard({ dim, score, trend }: { dim: typeof DIMENSIONS[0]; score: number; trend: number }) {
  const pct = Math.min(score * 10, 100); // scores are 1-10, convert to %
  const needsAttention = score < 5;

  return (
    <div className={`rounded-xl border-2 ${dim.border} ${dim.bg} p-4 flex flex-col items-center gap-2 transition-all hover:shadow-lg`}>
      <div className="text-3xl">{dim.emoji}</div>
      <h3 className="text-sm font-bold text-foreground">{dim.label}</h3>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{dim.subtitle}</p>

      {/* Circular progress */}
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke={dim.color} strokeWidth="3"
            strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{pct}%</span>
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1">
        {trend > 0 ? (
          <><TrendingUp className="w-3 h-3 text-[hsl(var(--dharma-green))]" /><span className="text-[10px] text-[hsl(var(--dharma-green))]">+{trend} this month</span></>
        ) : trend < 0 ? (
          <><TrendingDown className="w-3 h-3 text-destructive" /><span className="text-[10px] text-destructive">{trend} this month</span></>
        ) : (
          <span className="text-[10px] text-muted-foreground">Stable</span>
        )}
      </div>

      {needsAttention && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10">
          <AlertTriangle className="w-3 h-3 text-destructive" />
          <span className="text-[9px] text-destructive font-medium">Needs Attention</span>
        </div>
      )}
    </div>
  );
}

export default function SeekerLGTScore() {
  const { profile } = useAuthStore();
  const { data, isLoading } = useDAKMScores(profile?.id || null);

  const scores = data?.weekAvg || { dharma: 0, artha: 0, kama: 0, moksha: 0 };
  const trends = data?.trends || { dharma: 0, artha: 0, kama: 0, moksha: 0 };
  const overallBalance = Math.round((scores.dharma + scores.artha + scores.kama + scores.moksha) / 4);
  const lowestDim = DIMENSIONS.reduce((min, d) => (scores[d.key as keyof typeof scores] < scores[min.key as keyof typeof scores] ? d : min), DIMENSIONS[0]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Life's Golden Triangle</h1>
        <p className="text-sm text-muted-foreground">Your Purushaarth Balance Dashboard</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Overall Balance */}
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--saffron))" strokeWidth="3"
                  strokeDasharray={`${overallBalance * 10}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{overallBalance * 10}%</span>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Overall Balance Score</h2>
            <p className="text-sm text-muted-foreground mt-1">Based on your last 7 days of worksheet data</p>
          </div>

          {/* 4 Quadrants */}
          <div className="grid grid-cols-2 gap-4">
            {DIMENSIONS.map(dim => (
              <QuadrantCard key={dim.key} dim={dim} score={scores[dim.key as keyof typeof scores]} trend={trends[dim.key as keyof typeof trends]} />
            ))}
          </div>

          {/* Alert */}
          <div className="bg-card rounded-xl border-2 border-[hsl(var(--warning-amber))]/30 p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--warning-amber))]/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning-amber))]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Your {lowestDim.label} needs attention this week
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Score: {scores[lowestDim.key as keyof typeof scores]}/10 — Here's what you can do:
              </p>
              <ul className="mt-2 space-y-1">
                {lowestDim.actions.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="w-3 h-3 text-primary flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* No data message */}
          {!data?.latest && (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <p className="text-muted-foreground text-sm">
                No worksheet data yet. Complete your daily worksheet to see your LGT scores here. 🙏
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
