import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Users, Calendar, ClipboardCheck, IndianRupee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const exportCSV = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast({ title: `✅ Exported ${rows.length} records` });
};

const AdminExportReports = () => {
  const { data: profiles = [] } = useQuery({ queryKey: ['export-profiles'], queryFn: async () => { const { data, error } = await supabase.from('profiles').select('full_name, email, role, city, created_at'); if (error) throw error; return data; } });
  const { data: sessions = [] } = useQuery({ queryKey: ['export-sessions'], queryFn: async () => { const { data, error } = await supabase.from('sessions').select('session_name, date, attendance, pillar'); if (error) throw error; return data; } });
  const { data: payments = [] } = useQuery({ queryKey: ['export-payments'], queryFn: async () => { const { data, error } = await supabase.from('payments').select('invoice_number, amount, gst_amount, total_amount, payment_date, method, status'); if (error) throw error; return data; } });

  const reports = [
    { icon: Users, title: 'User Report', desc: 'All user profiles', action: () => exportCSV('users.csv', ['Name', 'Email', 'Role', 'City', 'Joined'], profiles.map(p => [p.full_name, p.email, p.role, p.city || '', p.created_at.split('T')[0]])) },
    { icon: Calendar, title: 'Sessions Report', desc: 'All session records', action: () => exportCSV('sessions.csv', ['Name', 'Date', 'Attendance', 'Pillar'], sessions.map(s => [s.session_name || '', s.date || '', s.attendance || '', s.pillar || ''])) },
    { icon: IndianRupee, title: 'Payments Report', desc: 'All payment records', action: () => exportCSV('payments.csv', ['Invoice', 'Amount', 'GST', 'Total', 'Date', 'Method', 'Status'], payments.map(p => [p.invoice_number, String(p.amount), String(p.gst_amount), String(p.total_amount), p.payment_date || '', p.method, p.status])) },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📤 Export Reports</h1><p className="text-muted-foreground">Download data as CSV files</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(r => (
          <Card key={r.title}>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><r.icon className="w-5 h-5 text-primary" />{r.title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground mb-4">{r.desc}</p><Button onClick={r.action} className="w-full"><Download className="w-4 h-4 mr-2" />Export CSV</Button></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminExportReports;
