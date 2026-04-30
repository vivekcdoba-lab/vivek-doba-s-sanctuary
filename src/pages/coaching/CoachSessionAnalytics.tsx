import { useMemo } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { BarChart3, Loader2, TrendingUp, Users, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import { formatDateDMY } from "@/lib/dateFormat";

const L = {
  title: { en: 'Session Analytics', hi: 'सत्र विश्लेषण' },
  thisMonth: { en: 'This Month', hi: 'इस महीने' },
  avgDuration: { en: 'Avg Duration', hi: 'औसत अवधि' },
  seekersCoached: { en: 'Seekers Coached', hi: 'प्रशिक्षित साधक' },
  noShowRate: { en: 'No-Show Rate', hi: 'अनुपस्थिति दर' },
  sessionsPerMonth: { en: 'Sessions Per Month', hi: 'प्रति माह सत्र' },
  topicsFrequency: { en: 'Topics Covered', hi: 'विषय कवर किए गए' },
  engagementTrend: { en: 'Engagement Trend', hi: 'सहभागिता ट्रेंड' },
  statusBreakdown: { en: 'Status Breakdown', hi: 'स्थिति विवरण' },
  bestTimeSlots: { en: 'Best Time Slots', hi: 'सर्वश्रेष्ठ समय' },
  rates: { en: 'No-Show & Reschedule Rates', hi: 'अनुपस्थिति व पुनर्निर्धारण दर' },
};

const CHART_COLORS = [
  'hsl(var(--dharma-green))', 'hsl(var(--sky-blue))', 'hsl(var(--saffron))',
  'hsl(var(--chakra-indigo))', 'hsl(var(--lotus-pink))', 'hsl(var(--wisdom-purple))',
  'hsl(var(--warning-amber))', 'hsl(var(--destructive))',
];

export default function CoachSessionAnalytics() {
  const { lang } = useCoachingLang();
  const t = (key: keyof typeof L) => L[key][lang];
  const { data: sessions = [], isLoading } = useDbSessions();
  const { data: seekers = [] } = useSeekerProfiles();

  const now = new Date();
  const thisMonthStr = format(now, 'yyyy-MM');

  // Stats
  const thisMonthSessions = useMemo(() => sessions.filter(s => s.date.startsWith(thisMonthStr) && s.status === 'completed'), [sessions, thisMonthStr]);
  const avgDuration = useMemo(() => {
    const durations = sessions.filter(s => s.duration_minutes).map(s => s.duration_minutes!);
    return durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  }, [sessions]);
  const uniqueSeekers = useMemo(() => new Set(sessions.map(s => s.seeker_id)).size, [sessions]);
  const noShowRate = useMemo(() => {
    const total = sessions.length;
    const missed = sessions.filter(s => s.status === 'missed').length;
    return total ? Math.round((missed / total) * 100) : 0;
  }, [sessions]);

  // Sessions per month (last 6)
  const monthlyData = useMemo(() => {
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM');
      months.push({ month: label, count: sessions.filter(s => s.date.startsWith(key)).length });
    }
    return months;
  }, [sessions]);

  // Topics frequency
  const topicsData = useMemo(() => {
    const freq: Record<string, number> = {};
    sessions.forEach(s => {
      const topics = Array.isArray(s.topics_covered) ? s.topics_covered : [];
      topics.forEach((tp: string) => { freq[tp] = (freq[tp] || 0) + 1; });
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
  }, [sessions]);

  // Engagement trend (weekly avg last 8 weeks)
  const engagementData = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: subMonths(now, 2), end: now }, { weekStartsOn: 1 });
    return weeks.map(weekStart => {
      const wEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const ws = formatDateDMY(weekStart);
      const we = formatDateDMY(wEnd);
      const weekSessions = sessions.filter(s => s.date >= ws && s.date <= we && s.engagement_score != null);
      const avg = weekSessions.length ? Math.round(weekSessions.reduce((a, s) => a + (s.engagement_score || 0), 0) / weekSessions.length * 10) / 10 : 0;
      return { week: format(weekStart, 'MMM d'), avg };
    });
  }, [sessions]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  // Best time slots
  const timeSlotData = useMemo(() => {
    const slots: Record<number, number> = {};
    sessions.filter(s => s.status === 'completed').forEach(s => {
      const h = parseInt(s.start_time?.split(':')[0] || '0');
      slots[h] = (slots[h] || 0) + 1;
    });
    return Object.entries(slots).sort((a, b) => Number(a[0]) - Number(b[0])).map(([hour, count]) => {
      const h = Number(hour);
      return { slot: h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`, count };
    });
  }, [sessions]);

  // No-show/reschedule rates per month
  const ratesData = useMemo(() => {
    const months: { month: string; noShow: number; reschedule: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM');
      const monthS = sessions.filter(s => s.date.startsWith(key));
      const total = monthS.length || 1;
      months.push({
        month: label,
        noShow: Math.round((monthS.filter(s => s.status === 'missed').length / total) * 100),
        reschedule: Math.round((monthS.filter(s => s.status === 'rescheduled').length / total) * 100),
      });
    }
    return months;
  }, [sessions]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-saffron" /> {t('title')}
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('thisMonth'), value: thisMonthSessions.length, icon: <TrendingUp className="w-5 h-5 text-dharma-green" />, sub: 'completed' },
          { label: t('avgDuration'), value: `${avgDuration}m`, icon: <Clock className="w-5 h-5 text-sky-blue" />, sub: 'per session' },
          { label: t('seekersCoached'), value: uniqueSeekers, icon: <Users className="w-5 h-5 text-chakra-indigo" />, sub: 'total' },
          { label: t('noShowRate'), value: `${noShowRate}%`, icon: <XCircle className="w-5 h-5 text-destructive" />, sub: 'overall' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs font-medium text-foreground">{stat.label}</div>
              <div className="text-[10px] text-muted-foreground">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sessions per month */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('sessionsPerMonth')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--saffron))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('statusBreakdown')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Topics frequency */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('topicsFrequency')}</CardTitle></CardHeader>
          <CardContent>
            {topicsData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No topics data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topicsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chakra-indigo))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Engagement trend */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('engagementTrend')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--dharma-green))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Best time slots */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('bestTimeSlots')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="slot" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--sky-blue))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* No-show & reschedule rates */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('rates')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ratesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="noShow" name="No-Show %" fill="hsl(var(--destructive))" stroke="hsl(var(--destructive))" fillOpacity={0.2} />
                <Area type="monotone" dataKey="reschedule" name="Reschedule %" fill="hsl(var(--warning-amber))" stroke="hsl(var(--warning-amber))" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
