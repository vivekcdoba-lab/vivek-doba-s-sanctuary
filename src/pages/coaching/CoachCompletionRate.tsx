import { useMemo } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { differenceInDays, parseISO, format, subMonths } from 'date-fns';
import { PieChart as PieChartIcon, Loader2, AlertTriangle, TrendingUp, Users, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line, Legend } from 'recharts';

const L = {
  title: { en: 'Completion Rate', hi: 'पूर्णता दर' },
  overall: { en: 'Overall Completion', hi: 'कुल पूर्णता' },
  bySeeker: { en: 'By Seeker', hi: 'साधक अनुसार' },
  byType: { en: 'By Type', hi: 'प्रकार अनुसार' },
  overdueTrends: { en: 'Overdue Trends', hi: 'अतिदेय रुझान' },
  atRisk: { en: 'At-Risk Seekers', hi: 'जोखिम वाले साधक' },
  monthlyComparison: { en: 'Monthly Comparison', hi: 'मासिक तुलना' },
  completed: { en: 'Completed', hi: 'पूर्ण' },
  pending: { en: 'Pending', hi: 'लंबित' },
  overdue: { en: 'Overdue', hi: 'अतिदेय' },
  noAtRisk: { en: 'No at-risk seekers! 🎉', hi: 'कोई जोखिम वाले साधक नहीं! 🎉' },
  overdueAssignments: { en: 'overdue assignments', hi: 'अतिदेय कार्य' },
};

const CHART_COLORS = [
  'hsl(var(--dharma-green))', 'hsl(var(--saffron))', 'hsl(var(--destructive))',
  'hsl(var(--sky-blue))', 'hsl(var(--chakra-indigo))', 'hsl(var(--wisdom-purple))',
];

export default function CoachCompletionRate() {
  const { lang } = useCoachingLang();
  const t = (key: keyof typeof L) => L[key][lang];
  const { data: assignments = [], isLoading } = useDbAssignments();
  const { data: seekers = [] } = useScopedSeekers();

  const today = new Date();

  // Overall stats
  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter(a => ['completed', 'reviewed'].includes(a.status)).length;
    const overdue = assignments.filter(a => !['completed', 'reviewed'].includes(a.status) && differenceInDays(today, parseISO(a.due_date)) > 0).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, overdue, rate };
  }, [assignments, today]);

  // By seeker breakdown
  const bySeekerData = useMemo(() => {
    const map: Record<string, { total: number; completed: number; overdue: number }> = {};
    assignments.forEach(a => {
      if (!map[a.seeker_id]) map[a.seeker_id] = { total: 0, completed: 0, overdue: 0 };
      map[a.seeker_id].total++;
      if (['completed', 'reviewed'].includes(a.status)) map[a.seeker_id].completed++;
      else if (differenceInDays(today, parseISO(a.due_date)) > 0) map[a.seeker_id].overdue++;
    });
    return Object.entries(map)
      .map(([id, d]) => ({
        name: seekers.find(s => s.id === id)?.full_name?.split(' ')[0] || 'Unknown',
        seekerId: id,
        rate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
        completed: d.completed,
        total: d.total,
        overdue: d.overdue,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [assignments, seekers, today]);

  // By type
  const byTypeData = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    assignments.forEach(a => {
      const type = a.type || 'one_time';
      if (!map[type]) map[type] = { total: 0, completed: 0 };
      map[type].total++;
      if (['completed', 'reviewed'].includes(a.status)) map[type].completed++;
    });
    return Object.entries(map).map(([name, d]) => ({
      name: name.replace('_', ' '),
      rate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
      total: d.total,
      completed: d.completed,
    }));
  }, [assignments]);

  // At-risk seekers (2+ overdue)
  const atRiskSeekers = useMemo(() => {
    return bySeekerData.filter(s => s.overdue >= 2).sort((a, b) => b.overdue - a.overdue);
  }, [bySeekerData]);

  // Monthly comparison (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { month: string; completed: number; assigned: number; rate: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(today, i);
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM');
      const monthAssignments = assignments.filter(a => a.created_at.startsWith(key));
      const completed = monthAssignments.filter(a => ['completed', 'reviewed'].includes(a.status)).length;
      const total = monthAssignments.length;
      months.push({ month: label, completed, assigned: total, rate: total > 0 ? Math.round((completed / total) * 100) : 0 });
    }
    return months;
  }, [assignments, today]);

  // Overdue trends (per month)
  const overdueTrends = useMemo(() => {
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(today, i);
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM');
      const count = assignments.filter(a => a.due_date.startsWith(key) && !['completed', 'reviewed'].includes(a.status) && differenceInDays(today, parseISO(a.due_date)) > 0).length;
      months.push({ month: label, count });
    }
    return months;
  }, [assignments, today]);

  // Pie data
  const pieData = [
    { name: t('completed'), value: stats.completed },
    { name: t('pending'), value: stats.pending - stats.overdue },
    { name: t('overdue'), value: stats.overdue },
  ].filter(d => d.value > 0);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <PieChartIcon className="w-6 h-6 text-saffron" /> {t('title')}
      </h1>

      {/* Stat cards with progress circle */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('overall'), value: `${stats.rate}%`, icon: <Target className="w-5 h-5 text-primary" />, sub: `${stats.completed}/${stats.total}` },
          { label: t('completed'), value: stats.completed, icon: <TrendingUp className="w-5 h-5 text-dharma-green" />, sub: 'assignments' },
          { label: t('overdue'), value: stats.overdue, icon: <AlertTriangle className="w-5 h-5 text-destructive" />, sub: 'need attention' },
          { label: t('atRisk'), value: atRiskSeekers.length, icon: <Users className="w-5 h-5 text-warning-amber" />, sub: 'seekers' },
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

      {/* Overall completion progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{t('overall')}</span>
            <span className="text-sm font-bold text-foreground">{stats.rate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="rounded-full h-3 transition-all duration-500"
              style={{ width: `${stats.rate}%`, background: stats.rate >= 70 ? 'hsl(var(--dharma-green))' : stats.rate >= 40 ? 'hsl(var(--saffron))' : 'hsl(var(--destructive))' }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status distribution pie */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('overall')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By type */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('byType')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip />
                <Bar dataKey="rate" fill="hsl(var(--chakra-indigo))" radius={[4, 4, 0, 0]} name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By seeker */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('bySeeker')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(220, bySeekerData.length * 30)}>
              <BarChart data={bySeekerData.slice(0, 15)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} name="Completion %">
                  {bySeekerData.slice(0, 15).map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 70 ? 'hsl(var(--dharma-green))' : entry.rate >= 40 ? 'hsl(var(--saffron))' : 'hsl(var(--destructive))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly comparison */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('monthlyComparison')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="assigned" stroke="hsl(var(--sky-blue))" strokeWidth={2} dot={{ r: 3 }} name="Assigned" />
                <Line type="monotone" dataKey="completed" stroke="hsl(var(--dharma-green))" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overdue trends */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('overdueTrends')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overdueTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* At-risk seekers */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> {t('atRisk')}
          </CardTitle></CardHeader>
          <CardContent>
            {atRiskSeekers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">{t('noAtRisk')}</p>
            ) : (
              <div className="space-y-2">
                {atRiskSeekers.map(s => (
                  <div key={s.seekerId} className="flex items-center justify-between p-2 bg-destructive/5 rounded-lg border border-destructive/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">{seekers.find(sk => sk.id === s.seekerId)?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{s.rate}% completion • {s.completed}/{s.total}</p>
                    </div>
                    <Badge variant="destructive">{s.overdue} {t('overdueAssignments')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
