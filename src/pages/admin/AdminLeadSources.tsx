import { useMemo } from 'react';
import { useDbLeads } from '@/hooks/useDbLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Megaphone, Users, Handshake, Phone, Linkedin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-1))'];

const sourceIcons: Record<string, any> = {
  Website: Globe, 'Social Media': Megaphone, Referral: Users, 'Live Event': Handshake, 'Cold Call': Phone, LinkedIn: Linkedin,
};

const AdminLeadSources = () => {
  const { data: leads = [], isLoading } = useDbLeads();

  const sourceStats = useMemo(() => {
    const map: Record<string, { total: number; converted: number; hot: number; lost: number }> = {};
    leads.forEach(l => {
      const s = l.source || 'Unknown';
      if (!map[s]) map[s] = { total: 0, converted: 0, hot: 0, lost: 0 };
      map[s].total++;
      if (l.stage === 'converted') map[s].converted++;
      if (l.stage === 'lost') map[s].lost++;
      if (l.priority === 'hot') map[s].hot++;
    });
    return Object.entries(map).map(([name, stats]) => ({
      name, ...stats,
      conversionRate: stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [leads]);

  const pieData = sourceStats.map(s => ({ name: s.name, value: s.total }));

  const conversionData = sourceStats.filter(s => s.total >= 1).map(s => ({
    name: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
    rate: s.conversionRate,
    total: s.total,
  }));

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lead Sources</h1>
        <p className="text-sm text-muted-foreground">Analyze where your leads come from</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Distribution by Source</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Conversion Rate by Source</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Source cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sourceStats.map((src, i) => {
          const IconComp = sourceIcons[src.name] || Globe;
          return (
            <Card key={src.name}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{src.name}</h3>
                      <p className="text-xs text-muted-foreground">{src.total} leads</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{src.conversionRate}% conv.</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-lg font-bold text-foreground">{src.converted}</p>
                    <p className="text-[10px] text-muted-foreground">Converted</p>
                  </div>
                  <div className="p-2 rounded bg-red-500/5">
                    <p className="text-lg font-bold text-foreground">{src.hot}</p>
                    <p className="text-[10px] text-muted-foreground">Hot</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-lg font-bold text-foreground">{src.lost}</p>
                    <p className="text-[10px] text-muted-foreground">Lost</p>
                  </div>
                </div>

                {/* Mini conversion bar */}
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${src.conversionRate}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminLeadSources;
