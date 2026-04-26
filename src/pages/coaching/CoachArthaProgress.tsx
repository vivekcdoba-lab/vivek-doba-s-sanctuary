import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

export default function CoachArthaProgress() {
  const { data: seekers = [] } = useScopedSeekers();

  const { data: businesses = [] } = useQuery({
    queryKey: ['artha-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('business_profiles').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: deptHealth = [] } = useQuery({
    queryKey: ['artha-dept-health'],
    queryFn: async () => {
      const { data, error } = await supabase.from('department_health').select('business_id, health_score, department_name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: swotItems = [] } = useQuery({
    queryKey: ['artha-swot-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('business_swot_items').select('business_id, type');
      if (error) throw error;
      return data || [];
    },
  });

  const seekerBiz = seekers.map(s => {
    const biz = businesses.find(b => b.seeker_id === s.id);
    const depts = biz ? deptHealth.filter(d => d.business_id === biz.id) : [];
    const swot = biz ? swotItems.filter(sw => sw.business_id === biz.id) : [];
    const avgHealth = depts.length > 0 ? (depts.reduce((sum, d) => sum + d.health_score, 0) / depts.length).toFixed(1) : null;

    return { ...s, business: biz, deptCount: depts.length, swotCount: swot.length, avgHealth };
  });

  const withBiz = seekerBiz.filter(s => s.business);
  const withoutBiz = seekerBiz.filter(s => !s.business);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#FF6B00]" /> Artha Progress
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Business health overview across all seekers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-3xl font-bold text-foreground">{withBiz.length}</p>
          <p className="text-xs text-muted-foreground">Seekers with Business Profile</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-bold text-foreground">{swotItems.length}</p>
          <p className="text-xs text-muted-foreground">Total SWOT Items</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-bold text-foreground">{deptHealth.length}</p>
          <p className="text-xs text-muted-foreground">Dept Health Records</p>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Seeker</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Business</th>
              <th className="text-center p-3 font-medium text-muted-foreground">SWOT</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Depts</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Avg Health</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {withBiz.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{s.full_name}</td>
                <td className="p-3 text-muted-foreground">{s.business?.business_name}</td>
                <td className="p-3 text-center"><Badge variant="outline">{s.swotCount}</Badge></td>
                <td className="p-3 text-center"><Badge variant="outline">{s.deptCount}</Badge></td>
                <td className="p-3 text-center font-medium">{s.avgHealth || '—'}</td>
                <td className="p-3 text-center">
                  {s.swotCount > 0 && s.deptCount > 0
                    ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    : <XCircle className="w-4 h-4 text-amber-500 mx-auto" />}
                </td>
              </tr>
            ))}
            {withoutBiz.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 opacity-50">
                <td className="p-3 text-foreground">{s.full_name}</td>
                <td className="p-3 text-muted-foreground italic" colSpan={5}>No business profile</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
