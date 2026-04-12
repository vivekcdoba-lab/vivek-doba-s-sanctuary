import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePayments } from '@/hooks/usePayments';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { Search, FileText } from 'lucide-react';

const AdminInvoices = () => {
  const { payments, isLoading } = usePayments();
  const { data: seekers = [] } = useSeekerProfiles();
  const [search, setSearch] = useState('');
  const seekerMap = Object.fromEntries(seekers.map(s => [s.id, s.full_name]));
  const filtered = payments.filter(p => p.invoice_number.toLowerCase().includes(search.toLowerCase()) || (seekerMap[p.seeker_id] || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">🧾 Invoices</h1><p className="text-muted-foreground">All payment invoices</p></div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" /><Input placeholder="Search invoices..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Invoice Records ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          <Table><TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Seeker</TableHead><TableHead>Amount</TableHead><TableHead>GST</TableHead><TableHead>Total</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found</TableCell></TableRow> :
              filtered.map(p => <TableRow key={p.id}><TableCell className="font-mono text-sm">{p.invoice_number}</TableCell><TableCell>{seekerMap[p.seeker_id] || 'Unknown'}</TableCell><TableCell>₹{p.amount.toLocaleString('en-IN')}</TableCell><TableCell>₹{p.gst_amount.toLocaleString('en-IN')}</TableCell><TableCell className="font-semibold">₹{p.total_amount.toLocaleString('en-IN')}</TableCell><TableCell>{p.payment_date || '—'}</TableCell><TableCell><Badge variant={p.status === 'received' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell></TableRow>)}</TableBody></Table>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvoices;
