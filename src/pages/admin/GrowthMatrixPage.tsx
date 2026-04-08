import { useState } from 'react';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

const GrowthMatrixPage = () => {
  const { data: seekers = [], isLoading: sl } = useSeekerProfiles();
  const [selectedSeekerId, setSelectedSeekerId] = useState('');
  const seekerId = selectedSeekerId || seekers[0]?.id || '';

  const { data: assessments = [], isLoading: al } = useQuery({
    queryKey: ['seeker-assessments', seekerId],
    queryFn: async () => {
      if (!seekerId) return [];
      const { data, error } = await supabase
        .from('seeker_assessments')
        .select('*')
        .eq('seeker_id', seekerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!seekerId,
  });

  if (sl) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const seeker = seekers.find(s => s.id === seekerId);

  // Parse latest assessment scores
  const latest = assessments[0];
  const scores = latest?.scores_json as Record<string, number> | null;
  const radarData = scores
    ? Object.entries(scores).map(([dim, score]) => ({ dim, score: Number(score) }))
    : [
        { dim: 'Personal', score: 0 },
        { dim: 'Professional', score: 0 },
        { dim: 'Spiritual', score: 0 },
        { dim: 'Relations', score: 0 },
        { dim: 'Health', score: 0 },
      ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Growth Matrix</h1>
        <select value={seekerId} onChange={e => setSelectedSeekerId(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
          {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </div>

      {seekers.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center border border-border">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-muted-foreground">No seekers yet. Add seekers to view growth data.</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {seeker?.full_name} — {assessments.length > 0 ? `${assessments.length} assessments recorded` : 'No assessments yet'}
            </h3>
            {radarData.some(d => d.score > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
                  <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📈</p>
                <p className="text-sm text-muted-foreground">No assessment data yet for {seeker?.full_name}.</p>
                <p className="text-xs text-muted-foreground mt-1">Record assessments to see the growth radar.</p>
              </div>
            )}
          </div>

          {assessments.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Period</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Notes</th>
                </tr></thead>
                <tbody>
                  {assessments.map((a: any) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground">{a.created_at?.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-foreground capitalize">{a.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.period || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{a.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GrowthMatrixPage;
