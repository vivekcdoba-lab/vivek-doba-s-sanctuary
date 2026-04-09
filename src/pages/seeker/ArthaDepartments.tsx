import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, BarChart3 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { CHART_COLORS } from '@/components/charts/chartColors';

const DEPARTMENTS = [
  { name: 'Sales & Marketing', emoji: '📈', metrics: ['Leads', 'Conversions', 'ROI', 'Brand Awareness'] },
  { name: 'Operations', emoji: '⚙️', metrics: ['Fulfillment', 'Quality', 'Efficiency', 'Capacity'] },
  { name: 'Finance', emoji: '💰', metrics: ['Cash Flow', 'Profitability', 'Collections', 'Compliance'] },
  { name: 'HR', emoji: '👥', metrics: ['Headcount', 'Morale', 'Retention', 'Training'] },
  { name: 'Product', emoji: '🎯', metrics: ['Quality', 'Innovation', 'Customer Fit', 'Roadmap'] },
  { name: 'Customer Success', emoji: '😊', metrics: ['Satisfaction', 'Retention', 'NPS', 'Support'] },
  { name: 'Technology', emoji: '💻', metrics: ['Uptime', 'Automation', 'Tech Debt', 'Security'] },
  { name: 'Leadership', emoji: '🏆', metrics: ['Vision', 'Goal Alignment', 'Decision Speed', 'Culture'] },
];

export default function ArthaDepartments() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();
  const now = new Date();
  const [selMonth] = useState(now.getMonth() + 1);
  const [selYear] = useState(now.getFullYear());
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ health_score: 5, challenges: '', action_plan: '' });

  const { data: health = [] } = useQuery({
    queryKey: ['department-health', business?.id, selMonth, selYear],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('department_health').select('*')
        .eq('business_id', business!.id).eq('month', selMonth).eq('year', selYear);
      return data || [];
    },
  });

  const save = useMutation({
    mutationFn: async (deptName: string) => {
      const existing = health.find((h: any) => h.department_name === deptName);
      const payload = {
        business_id: business!.id, department_name: deptName,
        health_score: editForm.health_score, challenges: editForm.challenges,
        action_plan: editForm.action_plan, month: selMonth, year: selYear,
      };
      if (existing) await supabase.from('department_health').update(payload).eq('id', existing.id);
      else await supabase.from('department_health').insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['department-health'] }); setEditing(null); toast.success('Saved!'); },
    onError: (e: any) => toast.error(e.message),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  const radarData = DEPARTMENTS.map(d => {
    const h = health.find((h: any) => h.department_name === d.name);
    return { dept: d.name.split(' ')[0], score: h?.health_score || 0 };
  });

  const scoreColor = (s: number) => s >= 8 ? 'text-green-600' : s >= 5 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = (s: number) => s >= 8 ? 'bg-green-100' : s >= 5 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Department Health Tracker</h1>

      {/* Radar Chart */}
      {health.length > 0 && (
        <ChartWrapper title="Department Health Overview" emoji="📊">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Radar dataKey="score" stroke={CHART_COLORS.saffron} fill={CHART_COLORS.saffron} fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DEPARTMENTS.map(d => {
          const h = health.find((h: any) => h.department_name === d.name);
          const score = h?.health_score || 0;
          const isEditing = editing === d.name;

          return (
            <div key={d.name} className="bg-card rounded-xl border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{d.emoji} {d.name}</h3>
                <span className={`text-lg font-bold ${scoreColor(score)} ${scoreBg(score)} px-2 py-0.5 rounded-lg`}>{score || '—'}</span>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Health Score: {editForm.health_score}</label>
                    <Slider value={[editForm.health_score]} onValueChange={v => setEditForm(p => ({ ...p, health_score: v[0] }))} min={1} max={10} step={1} />
                  </div>
                  <Textarea placeholder="Key challenges..." value={editForm.challenges} onChange={e => setEditForm(p => ({ ...p, challenges: e.target.value }))} rows={2} className="text-xs" />
                  <Textarea placeholder="Action plan..." value={editForm.action_plan} onChange={e => setEditForm(p => ({ ...p, action_plan: e.target.value }))} rows={2} className="text-xs" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => save.mutate(d.name)}><Save className="w-3.5 h-3.5 mr-1" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  {h?.challenges && <p className="text-xs text-muted-foreground"><span className="font-medium">Challenges:</span> {h.challenges}</p>}
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                    setEditForm({ health_score: h?.health_score || 5, challenges: h?.challenges || '', action_plan: h?.action_plan || '' });
                    setEditing(d.name);
                  }}>Update Score</Button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
