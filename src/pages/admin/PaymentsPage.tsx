import { SEEKERS, formatINR } from '@/data/mockData';
import { Plus, Bell, FileText } from 'lucide-react';
import { useState, useCallback } from 'react';
import SendReminderModal from '@/components/SendReminderModal';
import InvoiceModal from '@/components/InvoiceModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { usePayments } from '@/hooks/usePayments';

const PaymentsPage = () => {
  const { payments, isLoading, createPayment } = usePayments();
  const totalRevenue = payments.filter((p) => p.status === 'received').reduce((s, p) => s + Number(p.total_amount), 0);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = payments.filter((p) => p.status === 'received' && p.payment_date?.startsWith(currentMonth)).reduce((s, p) => s + Number(p.total_amount), 0);
  const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.total_amount), 0);
  const overdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + Number(p.total_amount), 0);

  const stats = [
    { label: 'Total Revenue', value: totalRevenue, gradient: 'gradient-growth' },
    { label: 'This Month', value: thisMonth, gradient: 'gradient-chakravartin' },
    { label: 'Pending', value: pending, gradient: 'gradient-saffron' },
    { label: 'Overdue', value: overdue, gradient: 'bg-destructive' },
  ];

  const statusColors: Record<string, string> = {
    received: 'bg-dharma-green/10 text-dharma-green',
    pending: 'bg-warning-amber/10 text-warning-amber',
    overdue: 'bg-destructive/10 text-destructive',
  };

  const [reminder, setReminder] = useState<{ seeker: typeof SEEKERS[0]; payment: (typeof payments)[0] } | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Record Payment form state
  const [rpSeekerId, setRpSeekerId] = useState('');
  const [rpAmount, setRpAmount] = useState('');
  const [rpMethod, setRpMethod] = useState('upi');
  const [rpTransactionId, setRpTransactionId] = useState('');
  const [rpDate, setRpDate] = useState(new Date().toISOString().split('T')[0]);

  const openInvoice = (p: typeof payments[0], seeker: typeof SEEKERS[0]) => {
    const course = seeker.course;
    setInvoice({
      invoiceNumber: p.invoice_number,
      date: p.payment_date || p.due_date || '',
      dueDate: p.due_date,
      status: p.status,
      seekerName: seeker.full_name,
      seekerCity: seeker.city,
      seekerState: seeker.state,
      seekerPhone: seeker.phone,
      seekerEmail: seeker.email,
      courseName: course?.name || '',
      tier: seeker.enrollment?.tier || '',
      duration: course?.duration,
      amount: p.amount,
      gstAmount: p.gst_amount,
      totalAmount: p.total_amount,
      method: p.method,
      transactionId: p.transaction_id,
    });
  };

  const handleRecordPayment = async () => {
    if (!rpSeekerId || !rpAmount || !rpDate) {
      toast.error('Please fill Seeker, Amount, and Date');
      return;
    }
    const amt = parseFloat(rpAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    const gst = Math.round(amt * 0.18);
    const total = amt + gst;
    const seeker = SEEKERS.find(s => s.id === rpSeekerId);
    try {
      await createPayment.mutateAsync({
        seeker_id: rpSeekerId,
        amount: amt,
        gst_amount: gst,
        total_amount: total,
        payment_date: rpDate,
        method: rpMethod,
        transaction_id: rpTransactionId || undefined,
      });
      toast.success(`Payment of ${formatINR(total)} recorded for ${seeker?.full_name || 'Seeker'}`);
      setShowRecordModal(false);
      setRpSeekerId('');
      setRpAmount('');
      setRpMethod('upi');
      setRpTransactionId('');
      setRpDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Financial Dashboard</h1>
        <button onClick={() => setShowRecordModal(true)} className="gradient-growth text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl shadow-md overflow-hidden">
            <div className={`h-1.5 ${s.gradient}`} />
            <div className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{formatINR(s.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Seeker</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {payments.map((p) => {
              const seeker = SEEKERS.find((s) => s.id === p.seeker_id);
              if (!seeker) return null;
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium text-foreground">{p.invoice_number}</td>
                  <td className="p-3 text-foreground">{seeker.full_name}</td>
                  <td className="p-3 font-semibold text-foreground">{formatINR(p.total_amount)}</td>
                  <td className="p-3 text-muted-foreground">{p.payment_date || p.due_date || '—'}</td>
                  <td className="p-3 text-muted-foreground capitalize">{p.method.replace('_', ' ')}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[p.status] || 'bg-muted text-muted-foreground'}`}>{p.status}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {p.status === 'received' && (
                        <button onClick={() => openInvoice(p, seeker)}
                          className="px-2 py-1 rounded-lg text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Invoice
                        </button>
                      )}
                      {(p.status === 'pending' || p.status === 'overdue') && (
                        <button onClick={() => setReminder({ seeker, payment: p })}
                          className="px-2 py-1 rounded-lg text-[10px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center gap-1">
                          <Bell className="w-3 h-3" /> Remind
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reminder && (
        <SendReminderModal
          open={!!reminder}
          onClose={() => setReminder(null)}
          seekerName={reminder.seeker.full_name}
          seekerPhone={reminder.seeker.phone}
          seekerEmail={reminder.seeker.email}
          context="payment"
          contextData={{
            amount: formatINR(reminder.payment.total_amount),
            courseName: reminder.seeker.course?.name,
            dueDate: reminder.payment.due_date,
          }}
        />
      )}

      {invoice && (
        <InvoiceModal open={!!invoice} onClose={() => setInvoice(null)} invoice={invoice} />
      )}

      {/* Record Payment Modal */}
      <Dialog open={showRecordModal} onOpenChange={setShowRecordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Seeker *</Label>
              <Select value={rpSeekerId} onValueChange={setRpSeekerId}>
                <SelectTrigger><SelectValue placeholder="Select seeker" /></SelectTrigger>
                <SelectContent>
                  {SEEKERS.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name} — {s.course?.name || 'N/A'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (₹) *</Label>
              <Input type="number" placeholder="e.g. 50000" value={rpAmount} onChange={e => setRpAmount(e.target.value)} />
              {rpAmount && !isNaN(parseFloat(rpAmount)) && parseFloat(rpAmount) > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  + GST 18%: {formatINR(Math.round(parseFloat(rpAmount) * 0.18))} → Total: {formatINR(parseFloat(rpAmount) + Math.round(parseFloat(rpAmount) * 0.18))}
                </p>
              )}
            </div>
            <div>
              <Label>Payment Date *</Label>
              <Input type="date" value={rpDate} onChange={e => setRpDate(e.target.value)} />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={rpMethod} onValueChange={setRpMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transaction ID</Label>
              <Input placeholder="Optional" value={rpTransactionId} onChange={e => setRpTransactionId(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowRecordModal(false)}>Cancel</Button>
              <Button type="button" onClick={handleRecordPayment} className="gradient-growth text-primary-foreground">Record Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
