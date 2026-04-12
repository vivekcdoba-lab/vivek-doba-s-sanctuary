import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayments } from '@/hooks/usePayments';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { IndianRupee, TrendingUp } from 'lucide-react';
import ChartWrapper from '@/components/charts/ChartWrapper';

const AdminRevenue = () => {
  const { payments, isLoading } = usePayments();

  const { monthlyData, totalRevenue, thisMonth, lastMonth } = useMemo(() => {
    const now = new Date();
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) { const m = format(subMonths(now, i), 'yyyy-MM'); months[m] = 0; }
    let total = 0; let tm = 0; let lm = 0;
    const tmKey = format(now, 'yyyy-MM'); const lmKey = format(subMonths(now, 1), 'yyyy-MM');
    payments.filter(p => p.status === 'received').forEach(p => {
      total += p.total_amount;
      if (p.payment_date) { const k = p.payment_date.slice(0, 7); if (months[k] !== undefined) months[k] += p.total_amount; if (k === tmKey) tm += p.total_amount; if (k === lmKey) lm += p.total_amount; }
    });
    return { monthlyData: Object.entries(months).map(([k, v]) => ({ month: format(parseISO(k + '-01'), 'MMM yy'), revenue: v })), totalRevenue: total, thisMonth: tm, lastMonth: lm };
  }, [payments]);

  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📊 Revenue Dashboard</h1><p className="text-muted-foreground">Financial performance overview</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-primary">₹{totalRevenue.toLocaleString('en-IN')}</p><p className="text-sm text-muted-foreground">Total Revenue</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">₹{thisMonth.toLocaleString('en-IN')}</p><p className="text-sm text-muted-foreground">This Month</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">₹{lastMonth.toLocaleString('en-IN')}</p><p className="text-sm text-muted-foreground">Last Month</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className={`text-2xl font-bold ${growth >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{growth >= 0 ? '+' : ''}{growth}%</p><p className="text-sm text-muted-foreground">Growth</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Monthly Revenue" emoji="📈" isLoading={isLoading} isEmpty={monthlyData.length === 0}>
          <ResponsiveContainer width="100%" height={300}><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
        </ChartWrapper>
        <ChartWrapper title="Revenue Trend" emoji="📉" isLoading={isLoading} isEmpty={monthlyData.length === 0}>
          <ResponsiveContainer width="100%" height={300}><AreaChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" /></AreaChart></ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
};

export default AdminRevenue;
