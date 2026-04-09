import BackToHome from '@/components/BackToHome';
import { Building2, TrendingUp, Users, SmilePlus, IndianRupee } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { CHART_COLORS } from '@/components/charts/chartColors';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DEPARTMENTS = ['Sales & Marketing', 'Operations', 'Finance', 'HR', 'Product', 'Customer Success', 'Technology', 'Leadership'];
const DEPT_EMOJIS: Record<string, string> = {
  'Sales & Marketing': '📈', 'Operations': '⚙️', 'Finance': '💰', 'HR': '👥',
  'Product': '🎯', 'Customer Success': '😊', 'Technology': '💻', 'Leadership': '🏆',
};

export default function SeekerArthaDashboard() {
  const { business, isLoading } = useBusinessProfile();
  const now = new Date();

  const { data: health = [] } = useQuery({
    queryKey: ['dept-health-dashboard', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('department_health').select('*')
        .eq('business_id', business!.id).eq('month', now.getMonth() + 1).eq('year', now.getFullYear());
      return data || [];
    },
  });

  const { data: accounting } = useQuery({
    queryKey: ['accounting-latest', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('accounting_records').select('*')
        .eq('business_id', business!.id).order('year', { ascending: false }).order('month', { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  const { data: teamCount = 0 } = useQuery({
    queryKey: ['team-count', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { count } = await supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('business_id', business!.id);
      return count || 0;
    },
  });

  const { data: avgSat } = useQuery({
    queryKey: ['avg-satisfaction', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('client_feedback').select('rating').eq('business_id', business!.id);
      if (!data || data.length === 0) return null;
      return (data.reduce((s, f) => s + f.rating, 0) / data.length).toFixed(1);
    },
  });

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  if (!business) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <BackToHome />
        <div className="text-center py-12 space-y-4">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Set Up Your Business</h1>
          <p className="text-muted-foreground">Create your business profile to unlock the Artha module</p>
          <Link to="/seeker/artha/profile"><Button>Get Started</Button></Link>
        </div>
      </div>
    );
  }

  const radarData = DEPARTMENTS.map(d => {
    const h = health.find((h: any) => h.department_name === d);
    return { dept: d.split(' ')[0], score: h?.health_score || 0 };
  });
  const avgScore = health.length > 0 ? (health.reduce((s: number, h: any) => s + h.health_score, 0) / health.length).toFixed(1) : '—';
  const scoreColor = (s: number) => s >= 8 ? 'text-green-600' : s >= 5 ? 'text-amber-500' : 'text-destructive';
  const scoreBg = (s: number) => s >= 8 ? 'bg-green-100' : s >= 5 ? 'bg-amber-100' : 'bg-red-100';
  const profitMargin = accounting && accounting.revenue ? ((((accounting.revenue || 0) - (accounting.expenses || 0)) / accounting.revenue) * 100).toFixed(0) : '—';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackToHome />
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="w-6 h-6 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{business.business_name}</h1>
          <p className="text-xs text-muted-foreground">{business.industry} · Artha Score: {avgScore}/10</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Revenue', value: accounting?.revenue ? `₹${(accounting.revenue / 100000).toFixed(1)}L` : '—', icon: <IndianRupee className="w-4 h-4" />, sub: 'This month' },
          { label: 'Profit Margin', value: `${profitMargin}%`, icon: <TrendingUp className="w-4 h-4" />, sub: 'Current' },
          { label: 'Team Size', value: teamCount.toString(), icon: <Users className="w-4 h-4" />, sub: 'Members' },
          { label: 'Client Sat.', value: avgSat ? `${avgSat}/5 ⭐` : '—', icon: <SmilePlus className="w-4 h-4" />, sub: 'Average' },
        ].map(k => (
          <div key={k.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-lg font-bold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Radar */}
      {health.length > 0 && (
        <ChartWrapper title="Department Health" emoji="📊">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid /><PolarAngleAxis dataKey="dept" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Radar dataKey="score" stroke={CHART_COLORS.saffron} fill={CHART_COLORS.saffron} fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {/* Department Grid */}
      <h2 className="font-semibold text-foreground text-sm">🏢 Department Health</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DEPARTMENTS.map(d => {
          const h = health.find((h: any) => h.department_name === d);
          const score = h?.health_score || 0;
          return (
            <Link to="/seeker/artha/departments" key={d} className="bg-card rounded-xl border border-border p-3 text-center hover:shadow-md transition-shadow">
              <p className="text-xl mb-1">{DEPT_EMOJIS[d]}</p>
              <p className="text-xs font-medium text-foreground">{d}</p>
              <p className={`text-lg font-bold mt-1 ${score ? scoreColor(score) : 'text-muted-foreground'}`}>{score || '—'}</p>
              {h?.challenges && <p className="text-xs text-muted-foreground truncate mt-1">{h.challenges}</p>}
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link to="/seeker/artha/accounting"><Button size="sm" variant="outline">💵 Add Monthly Numbers</Button></Link>
        <Link to="/seeker/artha/swot"><Button size="sm" variant="outline">📊 SWOT Analysis</Button></Link>
        <Link to="/seeker/artha/departments"><Button size="sm" variant="outline">📈 Update Health</Button></Link>
        <Link to="/seeker/artha/vision"><Button size="sm" variant="outline">🎯 Vision & Mission</Button></Link>
      </div>
    </div>
  );
}
