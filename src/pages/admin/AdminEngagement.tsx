import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartWrapper from '@/components/charts/ChartWrapper';

const AdminEngagement = () => {
  const { data: worksheets = [] } = useQuery({ queryKey: ['worksheets-engagement'], queryFn: async () => { const { data, error } = await supabase.from('daily_worksheets').select('id, is_submitted, completion_rate_percent, worksheet_date').order('worksheet_date', { ascending: false }).limit(1000); if (error) throw error; return data; } });
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions-engagement'], queryFn: async () => { const { data, error } = await supabase.from('sessions').select('id, attendance, date'); if (error) throw error; return data; } });
  const { data: assignments = [] } = useQuery({ queryKey: ['assignments-engagement'], queryFn: async () => { const { data, error } = await supabase.from('assignments').select('id, status'); if (error) throw error; return data; } });

  const wsSubmitted = worksheets.filter(w => w.is_submitted).length;
  const wsTotal = worksheets.length;
  const sessPresent = sessions.filter(s => s.attendance === 'present').length;
  const assCompleted = assignments.filter(a => a.status === 'completed').length;

  const barData = [
    { name: 'Worksheets', completed: wsSubmitted, total: wsTotal },
    { name: 'Sessions', completed: sessPresent, total: sessions.length },
    { name: 'Assignments', completed: assCompleted, total: assignments.length },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">🔥 Engagement Report</h1><p className="text-muted-foreground">Worksheet, session, and assignment engagement</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{wsTotal > 0 ? Math.round((wsSubmitted / wsTotal) * 100) : 0}%</p><p className="text-sm text-muted-foreground">Worksheet Completion</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-emerald-600">{sessions.length > 0 ? Math.round((sessPresent / sessions.length) * 100) : 0}%</p><p className="text-sm text-muted-foreground">Session Attendance</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{assignments.length > 0 ? Math.round((assCompleted / assignments.length) * 100) : 0}%</p><p className="text-sm text-muted-foreground">Assignment Completion</p></CardContent></Card>
      </div>
      <ChartWrapper title="Engagement Overview" emoji="📊">
        <ResponsiveContainer width="100%" height={300}><BarChart data={barData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[4,4,0,0]} /><Bar dataKey="total" fill="hsl(var(--muted))" name="Total" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
      </ChartWrapper>
    </div>
  );
};

export default AdminEngagement;
