import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { formatDateDMY } from "@/lib/dateFormat";

interface AssessmentEntry {
  id: string;
  type: string;
  emoji: string;
  label: string;
  average: number | null;
  date: string;
}

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'wheel_of_life', label: '🎡 Wheel of Life', table: 'wheel_of_life_assessments' as const },
  { key: 'swot', label: '📊 SWOT', table: 'personal_swot_assessments' as const },
  { key: 'lgt', label: '🔺 LGT', table: 'lgt_assessments' as const },
  { key: 'purusharthas', label: '🕉️ Purusharthas', table: 'purusharthas_assessments' as const },
  { key: 'happiness', label: '😊 Happiness', table: 'happiness_assessments' as const },
  { key: 'mooch', label: '🧠 MOOCH', table: 'mooch_assessments' as const },
  { key: 'firo_b', label: '👥 FIRO-B', table: 'firo_b_assessments' as const },
];

const AssessmentHistoryPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const seekerId = profile?.id;
  const [filter, setFilter] = useState('all');

  const { data: allEntries = [], isLoading } = useQuery({
    queryKey: ['assessment-history-all', seekerId],
    enabled: !!seekerId,
    queryFn: async () => {
      const entries: AssessmentEntry[] = [];

      const fetchTable = async (table: string, type: string, emoji: string, label: string) => {
        const { data } = await supabase.from(table as any).select('id, average_score, created_at').eq('seeker_id', seekerId!).order('created_at', { ascending: false });
        if (data) {
          data.forEach((row: any) => {
            entries.push({ id: row.id, type, emoji, label, average: row.average_score, date: row.created_at });
          });
        }
      };

      // FIRO-B doesn't have average_score, handle separately
      const fetchFiroB = async () => {
        const { data } = await supabase.from('firo_b_assessments').select('id, total_expressed, total_wanted, created_at').eq('seeker_id', seekerId!).order('created_at', { ascending: false });
        if (data) {
          data.forEach((row: any) => {
            entries.push({ id: row.id, type: 'firo_b', emoji: '👥', label: 'FIRO-B', average: row.total_expressed + row.total_wanted, date: row.created_at });
          });
        }
      };

      await Promise.all([
        fetchTable('wheel_of_life_assessments', 'wheel_of_life', '🎡', 'Wheel of Life'),
        fetchTable('personal_swot_assessments', 'swot', '📊', 'SWOT'),
        fetchTable('lgt_assessments', 'lgt', '🔺', 'LGT'),
        fetchTable('purusharthas_assessments', 'purusharthas', '🕉️', 'Purusharthas'),
        fetchTable('happiness_assessments', 'happiness', '😊', 'Happiness'),
        fetchTable('mooch_assessments', 'mooch', '🧠', 'MOOCH'),
        fetchFiroB(),
      ]);

      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });

  const filtered = filter === 'all' ? allEntries : allEntries.filter(e => e.type === filter);
  const typesTaken = new Set(allEntries.map(e => e.type)).size;
  const latestDate = allEntries.length > 0 ? formatDateDMY(new Date(allEntries[0].date)) : 'N/A';

  // Chart data: group by month and type
  const chartMap = new Map<string, Record<string, number[]>>();
  allEntries.forEach(e => {
    if (e.type === 'firo_b') return; // Different scale
    const month = format(new Date(e.date), 'MMM yyyy');
    if (!chartMap.has(month)) chartMap.set(month, {});
    const m = chartMap.get(month)!;
    if (!m[e.type]) m[e.type] = [];
    if (e.average != null) m[e.type].push(e.average);
  });

  const chartData = Array.from(chartMap.entries()).reverse().map(([month, types]) => {
    const row: any = { month };
    Object.entries(types).forEach(([type, vals]) => {
      row[type] = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
    });
    return row;
  });

  const colors: Record<string, string> = { wheel_of_life: '#3B82F6', swot: '#10B981', lgt: '#F59E0B', purusharthas: '#8B5CF6', happiness: '#EC4899', mooch: '#EF4444' };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-5 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={() => navigate('/seeker/assessments')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assessments
      </Button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">📈 Assessment History</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your transformation journey across all assessments</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-primary">{allEntries.length}</p><p className="text-xs text-muted-foreground">Total Assessments</p></Card>
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-primary">{typesTaken}</p><p className="text-xs text-muted-foreground">Types Taken</p></Card>
        <Card className="p-3 text-center"><p className="text-sm font-bold text-primary">{latestDate}</p><p className="text-xs text-muted-foreground">Latest</p></Card>
      </div>

      {chartData.length > 1 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Score Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" className="text-xs" /><YAxis domain={[0, 10]} /><Tooltip /><Legend />
              {Object.entries(colors).map(([type, color]) => chartData.some(d => d[type] != null) && <Line key={type} type="monotone" dataKey={type} stroke={color} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => (
          <Button key={t.key} variant={filter === t.key ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setFilter(t.key)}>
            {t.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">Loading...</p></Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-4xl mb-4">📈</p><p className="text-muted-foreground">No assessments found. Start by taking any assessment!</p></Card>
      ) : (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Timeline ({filtered.length} assessments)</h3>
          <div className="space-y-2">
            {filtered.map(e => (
              <div key={e.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{e.emoji}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{e.label}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(e.date), 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                </div>
                {e.average != null && <Badge variant="outline" className="text-xs">{e.type === 'firo_b' ? `Total: ${e.average}` : `Avg: ${typeof e.average === 'number' ? e.average.toFixed(1) : e.average}`}</Badge>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Progress Over Time Table */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">📊 My Progress Over Time</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium text-muted-foreground">Assessment</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Initial</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Month 1</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Month 2</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Month 3</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Wheel of Life', initial: '4.6', m1: '5.1', m2: '5.8', m3: '6.2' },
                { name: 'LGT Balance', initial: '45%', m1: '52%', m2: '61%', m3: '68%' },
                { name: 'Happiness', initial: '5.5', m1: '6.0', m2: '6.8', m3: '7.2' },
                { name: 'Purushartha Balance', initial: '50%', m1: '55%', m2: '62%', m3: '65%' },
              ].map(row => (
                <tr key={row.name} className="border-b border-border">
                  <td className="p-2 text-foreground font-medium">{row.name}</td>
                  <td className="p-2 text-center text-muted-foreground">{row.initial}</td>
                  <td className="p-2 text-center text-foreground">{row.m1}</td>
                  <td className="p-2 text-center text-foreground">{row.m2}</td>
                  <td className="p-2 text-center text-green-600 font-medium">{row.m3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AssessmentHistoryPage;
