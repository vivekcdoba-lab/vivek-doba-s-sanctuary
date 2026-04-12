import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, parseISO, differenceInDays } from 'date-fns';
import ChartWrapper from '@/components/charts/ChartWrapper';

const AdminRetention = () => {
  const { data: worksheets = [], isLoading } = useQuery({ queryKey: ['worksheets-retention'], queryFn: async () => { const { data, error } = await supabase.from('daily_worksheets').select('seeker_id, worksheet_date, is_submitted').eq('is_submitted', true).order('worksheet_date', { ascending: false }).limit(1000); if (error) throw error; return data; } });
  const { data: profiles = [] } = useQuery({ queryKey: ['profiles-retention'], queryFn: async () => { const { data, error } = await supabase.from('profiles').select('id, created_at').eq('role', 'seeker'); if (error) throw error; return data; } });

  const { monthlyActive, retentionRate } = useMemo(() => {
    const now = new Date();
    const months: Record<string, Set<string>> = {};
    for (let i = 5; i >= 0; i--) months[format(subMonths(now, i), 'yyyy-MM')] = new Set();
    worksheets.forEach(w => { const k = w.worksheet_date.slice(0, 7); if (months[k]) months[k].add(w.seeker_id); });
    const ma = Object.entries(months).map(([k, s]) => ({ month: format(parseISO(k + '-01'), 'MMM yy'), active: s.size }));
    const totalSeekers = profiles.length;
    const currentActive = ma.length > 0 ? ma[ma.length - 1].active : 0;
    return { monthlyActive: ma, retentionRate: totalSeekers > 0 ? Math.round((currentActive / totalSeekers) * 100) : 0 };
  }, [worksheets, profiles]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📉 Retention Analysis</h1><p className="text-muted-foreground">Monthly active users and retention indicators</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{monthlyActive.length > 0 ? monthlyActive[monthlyActive.length - 1].active : 0}</p><p className="text-sm text-muted-foreground">Active This Month</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-emerald-600">{retentionRate}%</p><p className="text-sm text-muted-foreground">Retention Rate</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{profiles.length}</p><p className="text-sm text-muted-foreground">Total Seekers</p></CardContent></Card>
      </div>
      <ChartWrapper title="Monthly Active Users" emoji="📊" isLoading={isLoading}>
        <ResponsiveContainer width="100%" height={300}><AreaChart data={monthlyActive}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Area type="monotone" dataKey="active" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" /></AreaChart></ResponsiveContainer>
      </ChartWrapper>
    </div>
  );
};

export default AdminRetention;
