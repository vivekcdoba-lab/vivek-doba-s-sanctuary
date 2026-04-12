import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayments } from '@/hooks/usePayments';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminExportFinancials = () => {
  const { payments } = usePayments();
  const { data: seekers = [] } = useSeekerProfiles();
  const seekerMap = Object.fromEntries(seekers.map(s => [s.id, s.full_name]));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const exportCSV = () => {
    const filtered = payments.filter(p => { if (from && p.payment_date && p.payment_date < from) return false; if (to && p.payment_date && p.payment_date > to) return false; return true; });
    const headers = ['Invoice,Seeker,Amount,GST,Total,Date,Method,Status'];
    const rows = filtered.map(p => `${p.invoice_number},${seekerMap[p.seeker_id] || 'Unknown'},${p.amount},${p.gst_amount},${p.total_amount},${p.payment_date || ''},${p.method},${p.status}`);
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `financials_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `✅ Exported ${filtered.length} records` });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📤 Export Financials</h1><p className="text-muted-foreground">Download payment data as CSV</p></div>
      <Card className="max-w-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Export Options</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><Label>From Date</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div><div><Label>To Date</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div></div>
          <p className="text-sm text-muted-foreground">{payments.length} total payment records available</p>
          <Button onClick={exportCSV} className="w-full"><Download className="w-4 h-4 mr-2" /> Export as CSV</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportFinancials;
