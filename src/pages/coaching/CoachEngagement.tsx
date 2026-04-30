import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { Card } from '@/components/ui/card';
import { TrendingUp, FileText, Calendar, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { formatDateDMY } from "@/lib/dateFormat";

export default function CoachEngagement() {
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: sessions = [] } = useDbSessions();
  const { data: assignments = [] } = useDbAssignments();

  const last14Days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });

  const { data: worksheets = [] } = useQuery({
    queryKey: ['engagement-worksheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_worksheets')
        .select('worksheet_date, seeker_id')
        .gte('worksheet_date', format(subDays(new Date(), 13), 'yyyy-MM-dd'));
      if (error) throw error;
      return data || [];
    },
  });

  const chartData = last14Days.map(day => {
    const dateStr = formatDateDMY(day);
    return {
      date: format(day, 'dd MMM'),
      worksheets: worksheets.filter(w => w.worksheet_date === dateStr).length,
      sessions: sessions.filter(s => s.date === dateStr).length,
    };
  });

  const totalWs = worksheets.length;
  const possibleWs = seekers.length * 14;
  const wsRate = possibleWs > 0 ? ((totalWs / possibleWs) * 100).toFixed(0) : 0;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed' || a.status === 'reviewed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#FF6B00]" /> Engagement Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Last 14 days engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <FileText className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalWs}</p>
          <p className="text-xs text-muted-foreground">Worksheets Submitted</p>
          <p className="text-xs text-[#FF6B00]">{wsRate}% completion rate</p>
        </Card>
        <Card className="p-4">
          <Calendar className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{completedSessions}</p>
          <p className="text-xs text-muted-foreground">Sessions Completed</p>
        </Card>
        <Card className="p-4">
          <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{completedAssignments}</p>
          <p className="text-xs text-muted-foreground">Assignments Done</p>
        </Card>
        <Card className="p-4">
          <TrendingUp className="w-5 h-5 text-[#FF6B00] mb-2" />
          <p className="text-2xl font-bold text-foreground">{seekers.length}</p>
          <p className="text-xs text-muted-foreground">Total Seekers</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-medium text-foreground mb-3">📊 Daily Activity (14 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="worksheets" name="Worksheets" fill="#FF6B00" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sessions" name="Sessions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
