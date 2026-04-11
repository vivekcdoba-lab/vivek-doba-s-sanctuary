import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCoachingLang } from '@/components/CoachingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Trophy, Calendar, Target } from 'lucide-react';
import { format, subDays, startOfWeek, getDay } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CoachWorksheetStats() {
  const { lang } = useCoachingLang();

  const { data: worksheets = [] } = useQuery({
    queryKey: ['coach-ws-stats-all'],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('seeker_id, worksheet_date, is_submitted, completion_rate_percent, lgt_balance_score, dharma_score, artha_score, kama_score, moksha_score, profiles:seeker_id(full_name)')
        .gte('worksheet_date', format(subDays(new Date(), 90), 'yyyy-MM-dd'))
        .order('worksheet_date', { ascending: true });
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['coach-ws-stats-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'seeker');
      return data || [];
    },
  });

  // KPIs
  const totalSeekers = profiles.length;
  const submitted = worksheets.filter((w: any) => w.is_submitted);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySubmitted = submitted.filter((w: any) => w.worksheet_date === todayStr).length;
  const avgCompletion = submitted.length
    ? Math.round(submitted.reduce((s: number, w: any) => s + (w.completion_rate_percent || 0), 0) / submitted.length)
    : 0;

  // Submission trend (last 30 days)
  const trendData = useMemo(() => {
    const last30: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      last30.push({ date: format(subDays(new Date(), i), 'dd MMM'), count: submitted.filter((w: any) => w.worksheet_date === d).length });
    }
    return last30;
  }, [submitted]);

  // Top performers (most submissions)
  const topPerformers = useMemo(() => {
    const map: Record<string, { name: string; count: number; avgPct: number }> = {};
    submitted.forEach((w: any) => {
      const id = w.seeker_id;
      if (!map[id]) map[id] = { name: (w.profiles as any)?.full_name || 'Unknown', count: 0, avgPct: 0 };
      map[id].count++;
      map[id].avgPct += w.completion_rate_percent || 0;
    });
    return Object.values(map)
      .map(p => ({ ...p, avgPct: Math.round(p.avgPct / p.count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [submitted]);

  // At-risk (missing 3+ consecutive days)
  const atRisk = useMemo(() => {
    const seekerDates: Record<string, string[]> = {};
    submitted.forEach((w: any) => {
      if (!seekerDates[w.seeker_id]) seekerDates[w.seeker_id] = [];
      seekerDates[w.seeker_id].push(w.worksheet_date);
    });

    return profiles.filter((p: any) => {
      const dates = seekerDates[p.id] || [];
      if (dates.length === 0) return true;
      const latest = new Date(Math.max(...dates.map((d: string) => new Date(d).getTime())));
      const daysSince = Math.floor((Date.now() - latest.getTime()) / 86400000);
      return daysSince >= 3;
    }).map((p: any) => {
      const dates = seekerDates[p.id] || [];
      const daysSince = dates.length === 0 ? 99 : Math.floor((Date.now() - new Date(Math.max(...dates.map((d: string) => new Date(d).getTime()))).getTime()) / 86400000);
      return { name: p.full_name, daysSince };
    }).sort((a, b) => b.daysSince - a.daysSince);
  }, [submitted, profiles]);

  // Pillar averages
  const pillarAvg = useMemo(() => {
    const scored = submitted.filter((w: any) => w.dharma_score != null);
    if (!scored.length) return [{ name: 'Dharma', avg: 0 }, { name: 'Artha', avg: 0 }, { name: 'Kama', avg: 0 }, { name: 'Moksha', avg: 0 }];
    return [
      { name: 'Dharma', avg: Math.round(scored.reduce((s: number, w: any) => s + (w.dharma_score || 0), 0) / scored.length) },
      { name: 'Artha', avg: Math.round(scored.reduce((s: number, w: any) => s + (w.artha_score || 0), 0) / scored.length) },
      { name: 'Kama', avg: Math.round(scored.reduce((s: number, w: any) => s + (w.kama_score || 0), 0) / scored.length) },
      { name: 'Moksha', avg: Math.round(scored.reduce((s: number, w: any) => s + (w.moksha_score || 0), 0) / scored.length) },
    ];
  }, [submitted]);

  // Day-of-week analysis
  const dayOfWeek = useMemo(() => {
    const counts = Array(7).fill(0);
    submitted.forEach((w: any) => {
      const day = getDay(new Date(w.worksheet_date));
      counts[day]++;
    });
    return DAYS.map((d, i) => ({ day: d, count: counts[i] }));
  }, [submitted]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">{lang === 'en' ? 'Worksheet Analytics' : 'वर्कशीट विश्लेषण'}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Seekers', value: totalSeekers, icon: Users, color: 'text-primary' },
          { label: 'Today Submitted', value: todaySubmitted, icon: Calendar, color: 'text-green-600' },
          { label: 'Avg Completion', value: `${avgCompletion}%`, icon: Target, color: 'text-secondary' },
          { label: 'At-Risk Seekers', value: atRisk.length, icon: AlertTriangle, color: 'text-destructive' },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted"><k.icon className={`w-5 h-5 ${k.color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Submission Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Submission Trend (30 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pillar Balance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Average Pillar Scores</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pillarAvg}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {pillarAvg.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Day of week */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Best Performing Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Top Performers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topPerformers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : topPerformers.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <span className="text-lg font-bold text-muted-foreground w-6 text-right">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{p.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.count} submissions • {p.avgPct}% avg</p>
                </div>
                {i === 0 && <span className="text-lg">🥇</span>}
                {i === 1 && <span className="text-lg">🥈</span>}
                {i === 2 && <span className="text-lg">🥉</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Seekers */}
      {atRisk.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" /> At-Risk Seekers (3+ days missed)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {atRisk.slice(0, 9).map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5">
                  <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-bold text-destructive">{s.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-destructive">{s.daysSince >= 99 ? 'Never submitted' : `${s.daysSince} days ago`}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
