import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePayments } from '@/hooks/usePayments';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { AlertTriangle, Clock } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

const AdminOverduePayments = () => {
  const { payments, isLoading } = usePayments();
  const { data: seekers = [] } = useSeekerProfiles();
  const seekerMap = Object.fromEntries(seekers.map(s => [s.id, s.full_name]));
  const today = new Date();
  const overdue = payments.filter(p => p.status === 'pending' && p.due_date && new Date(p.due_date) < today);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">⚠️ Overdue Payments</h1><p className="text-muted-foreground">Payments past their due date</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-destructive">{overdue.length}</p><p className="text-sm text-muted-foreground">Overdue Payments</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">₹{overdue.reduce((s, p) => s + p.total_amount, 0).toLocaleString('en-IN')}</p><p className="text-sm text-muted-foreground">Total Overdue</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{overdue.length > 0 ? Math.max(...overdue.map(p => differenceInDays(today, parseISO(p.due_date!)))) : 0}</p><p className="text-sm text-muted-foreground">Max Days Overdue</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Overdue List</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          <Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Seeker</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Days Overdue</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>{overdue.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">🎉 No overdue payments!</TableCell></TableRow> :
              overdue.map(p => <TableRow key={p.id}><TableCell className="font-mono">{p.invoice_number}</TableCell><TableCell>{seekerMap[p.seeker_id] || 'Unknown'}</TableCell><TableCell className="font-semibold">₹{p.total_amount.toLocaleString('en-IN')}</TableCell><TableCell>{p.due_date ? format(parseISO(p.due_date), 'dd MMM yyyy') : '—'}</TableCell><TableCell><Badge variant="destructive"><Clock className="w-3 h-3 mr-1" />{differenceInDays(today, parseISO(p.due_date!))} days</Badge></TableCell><TableCell><Button size="sm" variant="outline">Send Reminder</Button></TableCell></TableRow>)}</TableBody></Table>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverduePayments;
