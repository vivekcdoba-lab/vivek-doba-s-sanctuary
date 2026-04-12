import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { Award } from 'lucide-react';

const AdminCoachPerformance = () => {
  const { data: profiles = [] } = useQuery({ queryKey: ['coach-profiles'], queryFn: async () => { const { data, error } = await supabase.from('profiles').select('id, full_name, role').in('role', ['admin', 'coach']); if (error) throw error; return data; } });
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions-perf'], queryFn: async () => { const { data, error } = await supabase.from('sessions').select('id, seeker_id, attendance, engagement_score, date'); if (error) throw error; return data; } });

  const coachData = useMemo(() => {
    // For now, aggregate all sessions as coach performance (since sessions don't have coach_id, we show aggregate)
    const totalSessions = sessions.length;
    const presentCount = sessions.filter(s => s.attendance === 'present').length;
    const avgEngagement = sessions.filter(s => s.engagement_score).reduce((s, x) => s + (x.engagement_score || 0), 0) / (sessions.filter(s => s.engagement_score).length || 1);
    return { totalSessions, presentCount, avgEngagement: Math.round(avgEngagement * 10) / 10 };
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">🏅 Coach Performance</h1><p className="text-muted-foreground">Session delivery and engagement metrics</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{coachData.totalSessions}</p><p className="text-sm text-muted-foreground">Total Sessions</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-emerald-600">{coachData.totalSessions > 0 ? Math.round((coachData.presentCount / coachData.totalSessions) * 100) : 0}%</p><p className="text-sm text-muted-foreground">Attendance Rate</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{coachData.avgEngagement}/10</p><p className="text-sm text-muted-foreground">Avg Engagement Score</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" /> Coaches & Admins</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
            <TableBody>{profiles.map(p => <TableRow key={p.id}><TableCell className="font-medium">{p.full_name}</TableCell><TableCell><Badge variant={p.role === 'admin' ? 'default' : 'secondary'}>{p.role}</Badge></TableCell></TableRow>)}</TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCoachPerformance;
