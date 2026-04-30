import { useState, useEffect, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Eye, AlertTriangle, Trophy, TrendingUp, Users, Flame, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Legend } from 'recharts';
import { formatDateDMY } from "@/lib/dateFormat";

interface WorksheetRow {
  id: string;
  seeker_id: string;
  worksheet_date: string;
  morning_readiness_score: number | null;
  evening_fulfillment_score: number | null;
  dharma_score: number | null;
  artha_score: number | null;
  kama_score: number | null;
  moksha_score: number | null;
  lgt_balance_score: number | null;
  sampoorna_din_score: number | null;
  todays_win_1: string | null;
  todays_win_2: string | null;
  todays_win_3: string | null;
  aha_moment: string | null;
  is_submitted: boolean | null;
  is_draft: boolean | null;
  water_intake_glasses: number | null;
  sleep_hours: number | null;
  workout_done: boolean | null;
  non_negotiables_completed: number | null;
  non_negotiables_total: number | null;
  completion_rate_percent: number | null;
  morning_mood: string | null;
  evening_mood: string | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface BadgeWithDef {
  seeker_id: string;
  badge_id: string;
  earned_at: string;
  emoji: string;
  name: string;
}

const PILLAR_COLORS = {
  dharma: '#F97316',
  artha: '#EAB308',
  kama: '#EC4899',
  moksha: '#8B5CF6',
};

const WorksheetAnalyticsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [worksheets, setWorksheets] = useState<WorksheetRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [trendData, setTrendData] = useState<WorksheetRow[]>([]);
  const [badgeData, setBadgeData] = useState<BadgeWithDef[]>([]);

  const dateKey = formatDateDMY(selectedDate);

  // Load data
  useEffect(() => {
    loadData();
  }, [dateKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load profiles
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('role', 'seeker');

      if (profs) setProfiles(profs);

      // Load worksheets for selected date
      const { data: ws } = await supabase
        .from('daily_worksheets')
        .select('*')
        .eq('worksheet_date', dateKey);

      if (ws) setWorksheets(ws as unknown as WorksheetRow[]);

      // Load 7-day trend data
      const weekAgo = format(subDays(selectedDate, 6), 'yyyy-MM-dd');
      const { data: trend } = await supabase
        .from('daily_worksheets')
        .select('*')
        .gte('worksheet_date', weekAgo)
        .lte('worksheet_date', dateKey)
        .order('worksheet_date', { ascending: true });

      if (trend) setTrendData(trend as unknown as WorksheetRow[]);

      // Load earned badges with definitions
      const { data: badges } = await supabase
        .from('seeker_badges')
        .select('seeker_id, badge_id, earned_at');

      if (badges?.length) {
        const { data: defs } = await supabase
          .from('badge_definitions')
          .select('id, emoji, name');
        const defMap = new Map((defs || []).map(d => [d.id, d]));
        const enriched: BadgeWithDef[] = badges.map(b => {
          const def = defMap.get(b.badge_id);
          return { ...b, emoji: def?.emoji || '🏅', name: def?.name || 'Badge' };
        });
        setBadgeData(enriched);
      } else {
        setBadgeData([]);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
    setLoading(false);
  };

  const getProfile = (seekerId: string) => profiles.find(p => p.id === seekerId);
  const getBadgesForSeeker = (seekerId: string) => badgeData.filter(b => b.seeker_id === seekerId);

  // Summary stats
  const totalSeekers = profiles.length;
  const submittedToday = worksheets.filter(w => w.is_submitted).length;
  const draftToday = worksheets.filter(w => w.is_draft && !w.is_submitted).length;
  const notStarted = totalSeekers - worksheets.length;
  const avgLGT = worksheets.length > 0
    ? (worksheets.reduce((s, w) => s + (w.lgt_balance_score || 0), 0) / worksheets.length).toFixed(1)
    : '—';

  // Wins feed
  const winsFeed = useMemo(() => {
    const wins: { seekerName: string; win: string; date: string }[] = [];
    worksheets.forEach(w => {
      const name = getProfile(w.seeker_id)?.full_name || 'Unknown';
      [w.todays_win_1, w.todays_win_2, w.todays_win_3].forEach(win => {
        if (win?.trim()) wins.push({ seekerName: name, win, date: w.worksheet_date });
      });
    });
    return wins;
  }, [worksheets, profiles]);

  // AHA moments
  const ahaMoments = useMemo(() => {
    return worksheets
      .filter(w => w.aha_moment?.trim())
      .map(w => ({
        seekerName: getProfile(w.seeker_id)?.full_name || 'Unknown',
        moment: w.aha_moment!,
        date: w.worksheet_date,
      }));
  }, [worksheets, profiles]);

  // Attention needed
  const attentionNeeded = useMemo(() => {
    const alerts: { seekerName: string; seekerId: string; reasons: string[] }[] = [];

    profiles.forEach(p => {
      const ws = worksheets.find(w => w.seeker_id === p.id);
      const reasons: string[] = [];

      if (!ws) {
        reasons.push('❌ No worksheet started today');
      } else {
        if (ws.is_draft && !ws.is_submitted) reasons.push('⏳ Worksheet in draft, not submitted');
        if ((ws.morning_readiness_score || 0) < 4) reasons.push(`🔴 Low morning readiness: ${ws.morning_readiness_score?.toFixed(1)}`);
        if ((ws.lgt_balance_score || 0) < 4) reasons.push(`⚠️ Low LGT balance: ${ws.lgt_balance_score?.toFixed(1)}`);
        if ((ws.water_intake_glasses || 0) < 3) reasons.push(`💧 Low water: ${ws.water_intake_glasses} glasses`);
        if ((ws.sleep_hours || 0) < 5) reasons.push(`😴 Low sleep: ${ws.sleep_hours}h`);
      }

      if (reasons.length > 0) {
        alerts.push({ seekerName: p.full_name, seekerId: p.id, reasons });
      }
    });

    return alerts;
  }, [worksheets, profiles]);

  // LGT pillar averages for radar chart
  const pillarAverages = useMemo(() => {
    if (!worksheets.length) return [];
    const avg = (key: keyof WorksheetRow) =>
      worksheets.reduce((s, w) => s + ((w[key] as number) || 0), 0) / worksheets.length;
    return [
      { pillar: 'Dharma', value: avg('dharma_score'), fullMark: 10 },
      { pillar: 'Artha', value: avg('artha_score'), fullMark: 10 },
      { pillar: 'Kama', value: avg('kama_score'), fullMark: 10 },
      { pillar: 'Moksha', value: avg('moksha_score'), fullMark: 10 },
    ];
  }, [worksheets]);

  // 7-day trend chart data
  const trendChartData = useMemo(() => {
    const dateMap: Record<string, { date: string; lgt: number; readiness: number; fulfillment: number; count: number }> = {};
    trendData.forEach(w => {
      if (!dateMap[w.worksheet_date]) {
        dateMap[w.worksheet_date] = { date: w.worksheet_date, lgt: 0, readiness: 0, fulfillment: 0, count: 0 };
      }
      const d = dateMap[w.worksheet_date];
      d.lgt += (w.lgt_balance_score || 0);
      d.readiness += (w.morning_readiness_score || 0);
      d.fulfillment += (w.evening_fulfillment_score || 0);
      d.count++;
    });
    return Object.values(dateMap).map(d => ({
      date: format(new Date(d.date), 'dd MMM'),
      'LGT Balance': d.count ? +(d.lgt / d.count).toFixed(1) : 0,
      'Morning Readiness': d.count ? +(d.readiness / d.count).toFixed(1) : 0,
      'Evening Fulfillment': d.count ? +(d.fulfillment / d.count).toFixed(1) : 0,
    }));
  }, [trendData]);

  // Pillar distribution bar chart
  const pillarBarData = useMemo(() => {
    if (!worksheets.length) return [];
    const avg = (key: keyof WorksheetRow) =>
      +(worksheets.reduce((s, w) => s + ((w[key] as number) || 0), 0) / worksheets.length).toFixed(1);
    return [
      { name: 'Dharma', score: avg('dharma_score'), fill: PILLAR_COLORS.dharma },
      { name: 'Artha', score: avg('artha_score'), fill: PILLAR_COLORS.artha },
      { name: 'Kama', score: avg('kama_score'), fill: PILLAR_COLORS.kama },
      { name: 'Moksha', score: avg('moksha_score'), fill: PILLAR_COLORS.moksha },
    ];
  }, [worksheets]);

  // Filtered overview table
  const filteredWorksheets = useMemo(() => {
    const seekerIds = new Set(profiles.map(p => p.id));
    const allSeekers = profiles.map(p => {
      const ws = worksheets.find(w => w.seeker_id === p.id);
      return { profile: p, worksheet: ws || null };
    });

    if (!searchTerm) return allSeekers;
    const term = searchTerm.toLowerCase();
    return allSeekers.filter(s => s.profile.full_name.toLowerCase().includes(term));
  }, [profiles, worksheets, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📊 Worksheet Analytics</h1>
          <p className="text-sm text-muted-foreground">Monitor seeker worksheets, wins, and LGT balance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => subDays(d, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[160px]">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {formatDateDMY(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => subDays(d, -1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Seekers', value: totalSeekers, icon: Users, color: 'border-primary' },
          { label: 'Submitted', value: submittedToday, icon: Eye, color: 'border-green-500' },
          { label: 'In Draft', value: draftToday, icon: Flame, color: 'border-yellow-500' },
          { label: 'Not Started', value: notStarted, icon: AlertTriangle, color: notStarted > 0 ? 'border-destructive' : 'border-green-500' },
          { label: 'Avg LGT Score', value: avgLGT, icon: TrendingUp, color: 'border-primary' },
        ].map(c => (
          <div key={c.label} className={cn('bg-card rounded-xl p-4 border-l-4 shadow-sm', c.color)}>
            <div className="flex items-center gap-2 mb-1">
              <c.icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
            <p className="text-xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wins">🏆 Wins</TabsTrigger>
          <TabsTrigger value="attention">⚠️ Attention</TabsTrigger>
          <TabsTrigger value="trends">📈 Trends</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search seekers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <span className="text-sm text-muted-foreground">{filteredWorksheets.length} seekers</span>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Seeker', 'Status', 'Badges', 'Morning', 'Evening', 'LGT Balance', 'D', 'A', 'K', 'M', 'Water', 'Sleep'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWorksheets.map(({ profile, worksheet }) => (
                  <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {profile.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-foreground text-xs">{profile.full_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {worksheet?.is_submitted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✅ Submitted</span>
                      ) : worksheet?.is_draft ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">⏳ Draft</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">❌ None</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {(() => {
                        const seekerBadges = getBadgesForSeeker(profile.id);
                        if (!seekerBadges.length) return <span className="text-xs text-muted-foreground">—</span>;
                        return (
                          <div className="flex items-center gap-0.5" title={seekerBadges.map(b => b.name).join(', ')}>
                            {seekerBadges.slice(0, 4).map((b, i) => (
                              <span key={i} className="text-sm" title={b.name}>{b.emoji}</span>
                            ))}
                            {seekerBadges.length > 4 && (
                              <span className="text-[10px] text-muted-foreground ml-0.5">+{seekerBadges.length - 4}</span>
                            )}
                            <span className="ml-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{seekerBadges.length}</span>
                          </div>
                        );
                      })()}
                      <span className={cn('text-xs font-bold',
                        (worksheet?.morning_readiness_score || 0) >= 7 ? 'text-green-600' :
                        (worksheet?.morning_readiness_score || 0) >= 5 ? 'text-yellow-600' : 'text-red-500'
                      )}>
                        {worksheet?.morning_readiness_score?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn('text-xs font-bold',
                        (worksheet?.evening_fulfillment_score || 0) >= 7 ? 'text-green-600' :
                        (worksheet?.evening_fulfillment_score || 0) >= 5 ? 'text-yellow-600' : 'text-red-500'
                      )}>
                        {worksheet?.evening_fulfillment_score?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold text-white',
                        (worksheet?.lgt_balance_score || 0) >= 7 ? 'bg-green-500' :
                        (worksheet?.lgt_balance_score || 0) >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                      )}>
                        {worksheet?.lgt_balance_score?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: PILLAR_COLORS.dharma }}>{worksheet?.dharma_score || '—'}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: PILLAR_COLORS.artha }}>{worksheet?.artha_score || '—'}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: PILLAR_COLORS.kama }}>{worksheet?.kama_score || '—'}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: PILLAR_COLORS.moksha }}>{worksheet?.moksha_score || '—'}</td>
                    <td className="px-3 py-2.5 text-xs">{worksheet?.water_intake_glasses ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs">{worksheet?.sleep_hours ?? '—'}</td>
                  </tr>
                ))}
                {filteredWorksheets.length === 0 && (
                  <tr><td colSpan={12} className="text-center py-8 text-muted-foreground">No seekers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* WINS TAB */}
        <TabsContent value="wins" className="space-y-4">
          <div className="grid gap-3">
            {winsFeed.length === 0 && (
              <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
                No wins logged for this date yet
              </div>
            )}
            {winsFeed.map((w, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{w.seekerName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{w.win}</p>
                </div>
              </div>
            ))}

            {ahaMoments.length > 0 && (
              <>
                <h3 className="text-base font-bold text-foreground mt-4">💡 AHA Moments</h3>
                {ahaMoments.map((a, i) => (
                  <div key={i} className="bg-card rounded-xl border-2 border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{a.seekerName}</p>
                      <p className="text-sm text-muted-foreground mt-1 italic">"{a.moment}"</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        {/* ATTENTION TAB */}
        <TabsContent value="attention" className="space-y-3">
          {attentionNeeded.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <span className="text-3xl block mb-2">✅</span>
              <p className="text-muted-foreground">All seekers are on track today!</p>
            </div>
          ) : (
            attentionNeeded.map((alert, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 border-l-4 border-l-destructive">
                <p className="text-sm font-bold text-foreground mb-2">{alert.seekerName}</p>
                <div className="space-y-1">
                  {alert.reasons.map((r, j) => (
                    <p key={j} className="text-xs text-muted-foreground">{r}</p>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* TRENDS TAB */}
        <TabsContent value="trends" className="space-y-6">
          {/* 7-day Line Chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">📈 7-Day Score Trends (All Seekers Avg)</h3>
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="LGT Balance" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Morning Readiness" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Evening Fulfillment" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No trend data available</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">🎯 LGT Pillar Radar (Today's Avg)</h3>
              {pillarAverages.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={pillarAverages}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="pillar" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar name="Avg Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data</p>
              )}
            </div>

            {/* Bar Chart */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">📊 Pillar Distribution (Today's Avg)</h3>
              {pillarBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={pillarBarData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {pillarBarData.map((entry, index) => (
                        <Bar key={index} dataKey="score" fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorksheetAnalyticsPage;
