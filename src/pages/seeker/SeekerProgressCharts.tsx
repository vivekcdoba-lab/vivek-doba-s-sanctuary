import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import BackToHome from '@/components/BackToHome';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { PILLAR_COLORS, CHART_COLORS } from '@/components/charts/chartColors';
import { useStreakCount } from '@/hooks/useStreakCount';
import { Download, TrendingUp, Target, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const STAGES = [
  { key: 'awakening', label: 'Awakening', emoji: '🌅', day: 0 },
  { key: 'tapasya', label: 'Tapasya', emoji: '🔥', day: 21 },
  { key: 'sangharsh', label: 'Sangharsh', emoji: '⚔️', day: 60 },
  { key: 'bodh', label: 'Bodh', emoji: '💡', day: 90 },
  { key: 'vistar', label: 'Vistar', emoji: '🌊', day: 120 },
  { key: 'siddhi', label: 'Siddhi', emoji: '👑', day: 180 },
];

const PILLAR_HSL: Record<string, string> = {
  dharma: 'hsl(var(--dharma-green))',
  artha: 'hsl(var(--gold-bright))',
  kama: 'hsl(var(--lotus-pink))',
  moksha: 'hsl(var(--chakra-indigo))',
};

export default function SeekerProgressCharts() {
  const { profile } = useAuthStore();
  const { data: currentStreak = 0 } = useStreakCount(profile?.id || null);

  // Assessments for LGT trend + radar
  const { data: assessments = [], isLoading: loadingAssess } = useQuery({
    queryKey: ['seeker-assessments-charts', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('seeker_assessments')
        .select('*')
        .eq('seeker_id', profile!.id)
        .eq('type', 'lgt')
        .order('created_at', { ascending: true });
      return data || [];
    },
  });

  // Worksheets for heatmap, pillar time, streaks
  const { data: worksheets = [], isLoading: loadingWs } = useQuery({
    queryKey: ['seeker-ws-charts', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('worksheet_date, is_submitted, completion_rate_percent, dharma_score, artha_score, kama_score, moksha_score, sampoorna_din_score, created_at')
        .eq('seeker_id', profile!.id)
        .eq('is_submitted', true)
        .order('worksheet_date', { ascending: true });
      return data || [];
    },
  });

  // Time slots for pillar distribution
  const { data: timeSlots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['seeker-timeslots-charts', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_time_slots')
        .select('lgt_pillar, slot_start_time, slot_end_time, worksheet_id')
        .not('lgt_pillar', 'is', null);
      // Filter client-side for user's worksheets
      return data || [];
    },
  });

  // Sessions for engagement
  const { data: sessions = [], isLoading: loadingSess } = useQuery({
    queryKey: ['seeker-sessions-charts', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('date, attendance, engagement_score, session_number')
        .eq('seeker_id', profile!.id)
        .order('date', { ascending: true });
      return data || [];
    },
  });

  // ---- Derived data ----

  // 1. LGT Score Trend
  const lgtTrend = useMemo(() => {
    return assessments.map((a: any) => {
      const scores = a.scores_json as any;
      if (!scores) return null;
      const d = scores.dharma ?? scores.Dharma ?? 0;
      const ar = scores.artha ?? scores.Artha ?? 0;
      const k = scores.kama ?? scores.Kama ?? 0;
      const m = scores.moksha ?? scores.Moksha ?? 0;
      return {
        date: new Date(a.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        score: Math.round((d + ar + k + m) / 4),
        dharma: d, artha: ar, kama: k, moksha: m,
      };
    }).filter(Boolean);
  }, [assessments]);

  // 2. Radar comparison
  const radarData = useMemo(() => {
    if (assessments.length === 0) return [];
    const extractScores = (a: any) => {
      const s = a.scores_json as any;
      if (!s) return { dharma: 0, artha: 0, kama: 0, moksha: 0 };
      return {
        dharma: s.dharma ?? s.Dharma ?? 0,
        artha: s.artha ?? s.Artha ?? 0,
        kama: s.kama ?? s.Kama ?? 0,
        moksha: s.moksha ?? s.Moksha ?? 0,
      };
    };
    const first = extractScores(assessments[0]);
    const latest = extractScores(assessments[assessments.length - 1]);
    // Find ~30 days ago
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const midAssess = [...assessments].reverse().find((a: any) => new Date(a.created_at) <= thirtyAgo);
    const mid = midAssess ? extractScores(midAssess) : first;

    return ['Dharma', 'Artha', 'Kama', 'Moksha'].map(p => ({
      pillar: p,
      'Day 0': first[p.toLowerCase() as keyof typeof first],
      '30 Days Ago': mid[p.toLowerCase() as keyof typeof mid],
      Current: latest[p.toLowerCase() as keyof typeof latest],
    }));
  }, [assessments]);

  // 3. Heatmap (last 180 days)
  const heatmapData = useMemo(() => {
    const dateSet = new Map<string, number>();
    worksheets.forEach((w: any) => {
      dateSet.set(w.worksheet_date, w.completion_rate_percent || 0);
    });
    const days = [];
    const today = new Date();
    for (let i = 179; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days.push({ date: ds, pct: dateSet.get(ds) ?? -1 });
    }
    return days;
  }, [worksheets]);

  // 4. Time Investment Pie
  const pillarTime = useMemo(() => {
    const counts: Record<string, number> = { dharma: 0, artha: 0, kama: 0, moksha: 0 };
    // Use worksheet pillar scores as proxy for time allocation
    worksheets.forEach((w: any) => {
      counts.dharma += w.dharma_score || 0;
      counts.artha += w.artha_score || 0;
      counts.kama += w.kama_score || 0;
      counts.moksha += w.moksha_score || 0;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return [
      { name: 'Dharma', value: counts.dharma, color: PILLAR_COLORS.dharma },
      { name: 'Artha', value: counts.artha, color: PILLAR_COLORS.artha },
      { name: 'Kama', value: counts.kama, color: PILLAR_COLORS.kama },
      { name: 'Moksha', value: counts.moksha, color: PILLAR_COLORS.moksha },
    ];
  }, [worksheets]);

  // 5. Streak timeline
  const streakTimeline = useMemo(() => {
    if (worksheets.length === 0) return [];
    const sorted = [...worksheets].sort((a: any, b: any) => a.worksheet_date.localeCompare(b.worksheet_date));
    const points: { date: string; streak: number }[] = [];
    let streak = 0;
    let lastDate: string | null = null;
    sorted.forEach((w: any) => {
      if (lastDate) {
        const prev = new Date(lastDate);
        const curr = new Date(w.worksheet_date);
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          streak++;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      lastDate = w.worksheet_date;
      points.push({
        date: new Date(w.worksheet_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        streak,
      });
    });
    // Take last 60 points max
    return points.slice(-60);
  }, [worksheets]);

  // 6. Session engagement
  const sessionData = useMemo(() => {
    return sessions.map((s: any) => ({
      session: `S${s.session_number || '?'}`,
      date: s.date,
      engagement: s.engagement_score || 0,
      attended: s.attendance === 'present' ? 1 : 0,
    }));
  }, [sessions]);

  // 7. Transformation stage
  const totalDaysLogged = worksheets.length;
  const currentStageIdx = useMemo(() => {
    for (let i = STAGES.length - 1; i >= 0; i--) {
      if (totalDaysLogged >= STAGES[i].day) return i;
    }
    return 0;
  }, [totalDaysLogged]);

  // Heatmap color
  const heatColor = (pct: number) => {
    if (pct < 0) return 'hsl(var(--muted))';
    if (pct < 30) return 'hsl(27 100% 60% / 0.2)';
    if (pct < 60) return 'hsl(27 100% 60% / 0.4)';
    if (pct < 90) return 'hsl(27 100% 60% / 0.7)';
    return 'hsl(27 100% 60%)';
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Progress Report', 20, 20);
    doc.setFontSize(11);
    doc.text(`Seeker: ${profile?.full_name || 'Unknown'}`, 20, 32);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 40);
    doc.text(`Total Days Logged: ${totalDaysLogged}`, 20, 52);
    doc.text(`Current Streak: ${currentStreak} days`, 20, 60);
    doc.text(`Current Stage: ${STAGES[currentStageIdx].label}`, 20, 68);
    if (lgtTrend.length > 0) {
      const latest = lgtTrend[lgtTrend.length - 1] as any;
      doc.text(`Latest LGT Score: ${latest.score}%`, 20, 80);
      doc.text(`  Dharma: ${latest.dharma} | Artha: ${latest.artha} | Kama: ${latest.kama} | Moksha: ${latest.moksha}`, 20, 88);
    }
    const monthlyConsistency = worksheets.length > 0
      ? Math.round((worksheets.filter((w: any) => {
          const d = new Date(w.worksheet_date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length / new Date().getDate()) * 100)
      : 0;
    doc.text(`This Month's Consistency: ${monthlyConsistency}%`, 20, 100);
    doc.save('VDTS_Progress_Report.pdf');
  };

  const weeks = useMemo(() => {
    const w: typeof heatmapData[number][][] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      w.push(heatmapData.slice(i, i + 7));
    }
    return w;
  }, [heatmapData]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackToHome />
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
          <Download className="w-4 h-4" /> Export PDF
        </Button>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">📊 Progress Charts</h1>
        <p className="text-sm text-muted-foreground">Your transformation journey, visualized</p>
      </div>

      {/* 7. Transformation Journey */}
      <ChartWrapper title="Transformation Journey" emoji="🛤️" isLoading={false} isEmpty={false}>
        <div className="relative flex items-center justify-between py-4">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted rounded-full -translate-y-1/2" />
          <div
            className="absolute left-0 top-1/2 h-1 rounded-full -translate-y-1/2 transition-all duration-1000"
            style={{
              width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%`,
              background: 'var(--gradient-hero)',
            }}
          />
          {STAGES.map((s, i) => {
            const isActive = i === currentStageIdx;
            const isPast = i < currentStageIdx;
            return (
              <div key={s.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                    isActive
                      ? 'border-[hsl(var(--saffron))] bg-[hsl(var(--saffron))]/20 scale-125 animate-pulse shadow-lg'
                      : isPast
                        ? 'border-[hsl(var(--saffron))] bg-[hsl(var(--saffron))]/10'
                        : 'border-border bg-card'
                  }`}
                >
                  {s.emoji}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[hsl(var(--saffron))]' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                <span className="text-[9px] text-muted-foreground">Day {s.day}</span>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          You are at <span className="font-semibold text-[hsl(var(--saffron))]">{STAGES[currentStageIdx].label}</span> stage — Day {totalDaysLogged} of 180
        </p>
      </ChartWrapper>

      {/* Grid for charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. LGT Score Trend */}
        <ChartWrapper title="LGT Score Trend" emoji="📈" isLoading={loadingAssess} isEmpty={lgtTrend.length === 0} emptyMessage="Complete LGT assessments to see your trend.">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lgtTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke={CHART_COLORS.saffron} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.saffron }} name="LGT Score" />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* 2. Pillar Balance Radar */}
        <ChartWrapper title="Pillar Balance Radar" emoji="🔷" isLoading={loadingAssess} isEmpty={radarData.length === 0} emptyMessage="Complete assessments to compare your pillar balance.">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Day 0" dataKey="Day 0" stroke={CHART_COLORS.maroon} fill={CHART_COLORS.maroon} fillOpacity={0.15} strokeWidth={1.5} />
              <Radar name="30 Days Ago" dataKey="30 Days Ago" stroke={CHART_COLORS.gold} fill={CHART_COLORS.gold} fillOpacity={0.15} strokeWidth={1.5} />
              <Radar name="Current" dataKey="Current" stroke={CHART_COLORS.saffron} fill={CHART_COLORS.saffron} fillOpacity={0.3} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* 4. Time Investment Pie */}
        <ChartWrapper title="Pillar Focus Distribution" emoji="🎯" isLoading={loadingWs} isEmpty={pillarTime.length === 0} emptyMessage="Fill worksheets to see your pillar focus.">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pillarTime} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pillarTime.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* 5. Streak Progress */}
        <ChartWrapper title="Streak Progress" emoji="🔥" isLoading={loadingWs} isEmpty={streakTimeline.length === 0} emptyMessage="Start filling worksheets to track streaks.">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={streakTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="stepAfter" dataKey="streak" stroke={CHART_COLORS.saffron} strokeWidth={2} dot={false} name="Streak Days" />
              {/* Milestone reference lines */}
              {[7, 21, 40].map(m => (
                <Line key={m} type="monotone" dataKey={() => m} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1} dot={false} name={`${m}-day`} legendType="none" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* 6. Session Engagement */}
        <ChartWrapper title="Session Engagement" emoji="🎓" isLoading={loadingSess} isEmpty={sessionData.length === 0} emptyMessage="Attend sessions to see engagement data." className="md:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="session" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="engagement" fill={CHART_COLORS.saffron} radius={[4, 4, 0, 0]} name="Engagement Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* 3. Daily Activity Heatmap (full width) */}
      <ChartWrapper title="Daily Activity Heatmap — Last 6 Months" emoji="📅" isLoading={loadingWs} isEmpty={worksheets.length === 0} emptyMessage="Complete daily worksheets to build your heatmap.">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-[3px] min-w-[600px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="w-[14px] h-[14px] rounded-sm transition-colors"
                    style={{ backgroundColor: heatColor(day.pct), opacity: day.pct < 0 ? 0.3 : 1 }}
                    title={`${day.date}: ${day.pct < 0 ? 'No worksheet' : `${day.pct}% complete`}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span>None</span>
          {[0.2, 0.4, 0.7, 1].map((op, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(27 100% 60% / ${op})` }} />
          ))}
          <span>100%</span>
        </div>
      </ChartWrapper>
    </div>
  );
}
