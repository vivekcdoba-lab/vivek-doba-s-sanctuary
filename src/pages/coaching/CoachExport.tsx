import { useState } from 'react';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText, Users, Calendar, ClipboardList } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast({ title: '✅ Downloaded!', description: `${filename} exported successfully` });
}

export default function CoachExport() {
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: sessions = [] } = useDbSessions();
  const { data: assignments = [] } = useDbAssignments();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: worksheets = [] } = useQuery({
    queryKey: ['export-worksheets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('daily_worksheets')
        .select('seeker_id, worksheet_date, sampoorna_din_score, dharma_score, artha_score, kama_score, moksha_score, completion_rate_percent')
        .order('worksheet_date', { ascending: false }).limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  const exportSeekers = () => {
    const header = 'Name,Email,Phone,City,State,Occupation,Company,Gender,Joined';
    const rows = seekers.map(s => `"${s.full_name}","${s.email}","${s.phone || ''}","${s.city || ''}","${s.state || ''}","${s.occupation || ''}","${s.company || ''}","${s.gender || ''}","${format(new Date(s.created_at), 'yyyy-MM-dd')}"`);
    downloadCSV('seekers_export.csv', `${header}\n${rows.join('\n')}`);
  };

  const exportSessions = () => {
    let filtered = sessions;
    if (fromDate) filtered = filtered.filter(s => s.date >= fromDate);
    if (toDate) filtered = filtered.filter(s => s.date <= toDate);
    const header = 'Date,Seeker,Status,Duration,Notes';
    const rows = filtered.map(s => {
      const seeker = seekers.find(sk => sk.id === s.seeker_id);
      return `"${s.date}","${seeker?.full_name || s.seeker_id}","${s.status}","${s.duration_minutes || ''}","${(s.session_notes || '').replace(/"/g, '""')}"`;
    });
    downloadCSV('sessions_export.csv', `${header}\n${rows.join('\n')}`);
  };

  const exportWorksheets = () => {
    let filtered = worksheets;
    if (fromDate) filtered = filtered.filter(w => w.worksheet_date >= fromDate);
    if (toDate) filtered = filtered.filter(w => w.worksheet_date <= toDate);
    const header = 'Date,Seeker,Sampoorna,Dharma,Artha,Kama,Moksha,Completion%';
    const rows = filtered.map(w => {
      const seeker = seekers.find(s => s.id === w.seeker_id);
      return `"${w.worksheet_date}","${seeker?.full_name || w.seeker_id}",${w.sampoorna_din_score || ''},${w.dharma_score || ''},${w.artha_score || ''},${w.kama_score || ''},${w.moksha_score || ''},${w.completion_rate_percent || ''}`;
    });
    downloadCSV('worksheets_export.csv', `${header}\n${rows.join('\n')}`);
  };

  const exportAssignments = () => {
    const header = 'Title,Seeker,Due Date,Status,Score,Priority';
    const rows = assignments.map(a => {
      const seeker = seekers.find(s => s.id === a.seeker_id);
      return `"${a.title}","${seeker?.full_name || a.seeker_id}","${a.due_date}","${a.status}","${a.score || ''}","${a.priority || ''}"`;
    });
    downloadCSV('assignments_export.csv', `${header}\n${rows.join('\n')}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Download className="w-6 h-6 text-[#FF6B00]" /> Export Data
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Download data as CSV files</p>
      </div>

      <Card className="p-4">
        <h3 className="font-medium text-foreground mb-3">📅 Date Range (optional)</h3>
        <div className="flex gap-3">
          <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-40" />
          <span className="self-center text-muted-foreground">to</span>
          <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-40" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={exportSeekers}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-blue-500" /></div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Seekers List</h3>
              <p className="text-xs text-muted-foreground">{seekers.length} seekers • Name, email, city, occupation</p>
            </div>
            <Download className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={exportSessions}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-purple-500" /></div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Sessions</h3>
              <p className="text-xs text-muted-foreground">{sessions.length} sessions • Date, status, duration</p>
            </div>
            <Download className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={exportWorksheets}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center"><FileText className="w-5 h-5 text-[#FF6B00]" /></div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Worksheets</h3>
              <p className="text-xs text-muted-foreground">{worksheets.length} entries • LGT scores, completion</p>
            </div>
            <Download className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={exportAssignments}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><ClipboardList className="w-5 h-5 text-green-500" /></div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Assignments</h3>
              <p className="text-xs text-muted-foreground">{assignments.length} assignments • Status, scores</p>
            </div>
            <Download className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      </div>
    </div>
  );
}
