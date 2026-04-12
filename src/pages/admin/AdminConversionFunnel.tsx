import { useMemo } from 'react';
import { useDbLeads } from '@/hooks/useDbLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart as ReFunnel } from 'recharts';

const STAGES = [
  { key: 'new', label: 'Enquiry' }, { key: 'contacted', label: 'Contacted' }, { key: 'discovery', label: 'Interested' },
  { key: 'consultation_scheduled', label: 'Consult Sched.' }, { key: 'consultation_done', label: 'Consult Done' },
  { key: 'proposal', label: 'Proposal' }, { key: 'followup', label: 'Follow-up' },
  { key: 'converted', label: 'Converted' }, { key: 'lost', label: 'Lost' },
];
const FUNNEL_COLORS = ['hsl(var(--muted-foreground))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))', 'hsl(142 71% 45%)', 'hsl(0 84% 60%)'];

const AdminConversionFunnel = () => {
  const { data: leads = [], isLoading } = useDbLeads();

  const funnelData = useMemo(() =>
    STAGES.map((s, i) => ({
      name: s.label,
      count: leads.filter(l => (l.stage || 'new') === s.key).length,
      fill: FUNNEL_COLORS[i],
    })),
  [leads]);

  // Cumulative funnel (leads that reached this stage or beyond)
  const cumulativeFunnel = useMemo(() => {
    const stageOrder = STAGES.map(s => s.key);
    return STAGES.slice(0, -1).map((s, i) => { // exclude 'lost'
      const count = leads.filter(l => {
        const stage = l.stage || 'new';
        return stageOrder.indexOf(stage) >= i && stage !== 'lost';
      }).length;
      return { name: s.label, value: count };
    });
  }, [leads]);

  const totalLeads = leads.length;
  const converted = leads.filter(l => l.stage === 'converted').length;
  const lost = leads.filter(l => l.stage === 'lost').length;
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
  const avgDays = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + (l.days_in_pipeline || 0), 0) / leads.length) : 0;

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conversion Funnel</h1>
        <p className="text-sm text-muted-foreground">Lead pipeline visualization</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <Users className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-xl font-bold">{totalLeads}</p>
          <p className="text-xs text-muted-foreground">Total Leads</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Target className="w-5 h-5 mx-auto text-green-500 mb-1" />
          <p className="text-xl font-bold">{conversionRate}%</p>
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <TrendingUp className="w-5 h-5 mx-auto text-blue-500 mb-1" />
          <p className="text-xl font-bold">{converted}</p>
          <p className="text-xs text-muted-foreground">Converted</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <BarChart3 className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-xl font-bold">{avgDays}d</p>
          <p className="text-xs text-muted-foreground">Avg Pipeline Days</p>
        </CardContent></Card>
      </div>

      {/* Visual Funnel */}
      <Card>
        <CardHeader><CardTitle className="text-base">Pipeline Funnel</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cumulativeFunnel.map((item, i) => {
              const maxVal = cumulativeFunnel[0]?.value || 1;
              const width = Math.max(15, (item.value / maxVal) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 text-right shrink-0">{item.name}</span>
                  <div className="flex-1 relative">
                    <div className="h-8 rounded-md flex items-center px-3 transition-all" style={{
                      width: `${width}%`,
                      background: FUNNEL_COLORS[i],
                      opacity: 0.85,
                    }}>
                      <span className="text-xs font-bold text-primary-foreground">{item.value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage distribution bar chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Leads by Stage</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {funnelData.map((entry, i) => (
                  <Bar key={i} dataKey="count" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion metrics */}
      <Card>
        <CardHeader><CardTitle className="text-base">Stage-to-Stage Conversion</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STAGES.slice(0, -2).map((s, i) => {
              const current = leads.filter(l => {
                const stageOrder = STAGES.map(x => x.key);
                return stageOrder.indexOf(l.stage || 'new') >= i && l.stage !== 'lost';
              }).length;
              const next = leads.filter(l => {
                const stageOrder = STAGES.map(x => x.key);
                return stageOrder.indexOf(l.stage || 'new') >= i + 1 && l.stage !== 'lost';
              }).length;
              const rate = current > 0 ? Math.round((next / current) * 100) : 0;
              return (
                <div key={s.key} className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">{s.label} → {STAGES[i + 1]?.label}</p>
                  <p className="text-lg font-bold text-foreground">{rate}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConversionFunnel;
