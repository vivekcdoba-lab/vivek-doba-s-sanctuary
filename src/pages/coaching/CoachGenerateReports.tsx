import { useState } from 'react';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, BarChart3, Download, User } from 'lucide-react';
import { format } from 'date-fns';

export default function CoachGenerateReports() {
  const { data: seekers = [] } = useSeekerProfiles();
  const [selectedSeeker, setSelectedSeeker] = useState('');

  const { data: assessments = [] } = useQuery({
    queryKey: ['coach-assessments', selectedSeeker],
    enabled: !!selectedSeeker,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_lgt_checkins')
        .select('*')
        .eq('seeker_id', selectedSeeker)
        .order('checkin_date', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: worksheetStats = [] } = useQuery({
    queryKey: ['coach-ws-stats', selectedSeeker],
    enabled: !!selectedSeeker,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_worksheets')
        .select('worksheet_date, sampoorna_din_score, dharma_score, artha_score, kama_score, moksha_score, completion_rate_percent')
        .eq('seeker_id', selectedSeeker)
        .order('worksheet_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  const handleExportCSV = () => {
    const seeker = seekers.find(s => s.id === selectedSeeker);
    const rows = worksheetStats.map(ws => `${ws.worksheet_date},${ws.sampoorna_din_score || ''},${ws.dharma_score || ''},${ws.artha_score || ''},${ws.kama_score || ''},${ws.moksha_score || ''},${ws.completion_rate_percent || ''}`);
    const csv = `Date,Sampoorna,Dharma,Artha,Kama,Moksha,Completion%\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${seeker?.full_name || 'seeker'}_report.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#FF6B00]" /> Generate Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">View assessment history and download reports per seeker</p>
      </div>

      <Card className="p-4">
        <label className="text-sm font-medium text-foreground mb-2 block">Select Seeker</label>
        <Select value={selectedSeeker} onValueChange={setSelectedSeeker}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Choose a seeker..." />
          </SelectTrigger>
          <SelectContent>
            {seekers.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {selectedSeeker && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5" /> {seekers.find(s => s.id === selectedSeeker)?.full_name}
            </h2>
            {worksheetStats.length > 0 && (
              <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] text-white text-sm hover:bg-[#e65e00] transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium text-foreground">LGT Check-ins</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">{assessments.length}</p>
              <p className="text-xs text-muted-foreground">Total check-ins recorded</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-foreground">Worksheets</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">{worksheetStats.length}</p>
              <p className="text-xs text-muted-foreground">Recent worksheets (last 30)</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-foreground">Avg Score</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {worksheetStats.length > 0 ? (worksheetStats.reduce((sum, ws) => sum + (ws.sampoorna_din_score || 0), 0) / worksheetStats.length).toFixed(1) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Average Sampoorna Din</p>
            </Card>
          </div>

          {assessments.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3">📊 Recent LGT Check-ins</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {assessments.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground w-24">{a.checkin_date}</span>
                    <Badge variant="outline">🕉️ {a.dharma_score}</Badge>
                    <Badge variant="outline">💰 {a.artha_score}</Badge>
                    <Badge variant="outline">❤️ {a.kama_score}</Badge>
                    <Badge variant="outline">☀️ {a.moksha_score}</Badge>
                    {a.overall_balance && <span className="text-xs font-medium ml-auto">Balance: {Number(a.overall_balance).toFixed(1)}</span>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {worksheetStats.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3">📝 Worksheet History</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {worksheetStats.map((ws, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground w-24">{ws.worksheet_date}</span>
                    <span className="text-sm font-medium text-foreground">Sampoorna: {ws.sampoorna_din_score ?? '—'}</span>
                    <span className="text-xs text-muted-foreground ml-auto">Completion: {ws.completion_rate_percent ?? '—'}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
