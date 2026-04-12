import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import ChartWrapper from '@/components/charts/ChartWrapper';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6'];

const AdminUserGrowth = () => {
  const { data: profiles = [], isLoading } = useQuery({ queryKey: ['profiles-growth'], queryFn: async () => { const { data, error } = await supabase.from('profiles').select('id, role, created_at'); if (error) throw error; return data; } });

  const { monthlyData, roleData } = useMemo(() => {
    const now = new Date();
    const months: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) months[format(subMonths(now, i), 'yyyy-MM')] = 0;
    profiles.forEach(p => { const k = p.created_at.slice(0, 7); if (months[k] !== undefined) months[k]++; });
    let cumulative = 0;
    const monthly = Object.entries(months).map(([k, v]) => { cumulative += v; return { month: format(parseISO(k + '-01'), 'MMM yy'), users: v, total: cumulative }; });
    const roles: Record<string, number> = {};
    profiles.forEach(p => { roles[p.role] = (roles[p.role] || 0) + 1; });
    return { monthlyData: monthly, roleData: Object.entries(roles).map(([name, value]) => ({ name, value })) };
  }, [profiles]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📈 User Growth</h1><p className="text-muted-foreground">User registration trends and role distribution</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{profiles.length}</p><p className="text-sm text-muted-foreground">Total Users</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{profiles.filter(p => { const d = new Date(p.created_at); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length}</p><p className="text-sm text-muted-foreground">New This Month</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{profiles.filter(p => p.role === 'seeker').length}</p><p className="text-sm text-muted-foreground">Total Seekers</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Registration Trend" emoji="📊" isLoading={isLoading}>
          <ResponsiveContainer width="100%" height={300}><AreaChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" /></AreaChart></ResponsiveContainer>
        </ChartWrapper>
        <ChartWrapper title="Users by Role" emoji="👥" isLoading={isLoading} isEmpty={roleData.length === 0}>
          <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={roleData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
};

export default AdminUserGrowth;
