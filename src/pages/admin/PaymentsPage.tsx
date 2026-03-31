import { PAYMENTS, SEEKERS, formatINR } from '@/data/mockData';
import { Plus, Bell, FileText } from 'lucide-react';
import { useState } from 'react';
import SendReminderModal from '@/components/SendReminderModal';
import InvoiceModal from '@/components/InvoiceModal';

const PaymentsPage = () => {
  const totalRevenue = PAYMENTS.filter((p) => p.status === 'received').reduce((s, p) => s + p.total_amount, 0);
  const thisMonth = PAYMENTS.filter((p) => p.status === 'received' && p.payment_date.startsWith('2025-03')).reduce((s, p) => s + p.total_amount, 0);
  const pending = PAYMENTS.filter((p) => p.status === 'pending').reduce((s, p) => s + p.total_amount, 0);
  const overdue = PAYMENTS.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.total_amount, 0);

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

  const [reminder, setReminder] = useState<{ seeker: typeof SEEKERS[0]; payment: typeof PAYMENTS[0] } | null>(null);
  const [invoice, setInvoice] = useState<any>(null);

  const openInvoice = (p: typeof PAYMENTS[0], seeker: typeof SEEKERS[0]) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Financial Dashboard</h1>
        <button className="gradient-growth text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
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
            {PAYMENTS.map((p) => {
              const seeker = SEEKERS.find((s) => s.id === p.seeker_id);
              if (!seeker) return null;
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium text-foreground">{p.invoice_number}</td>
                  <td className="p-3 text-foreground">{seeker.full_name}</td>
                  <td className="p-3 font-semibold text-foreground">{formatINR(p.total_amount)}</td>
                  <td className="p-3 text-muted-foreground">{p.payment_date || p.due_date}</td>
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
    </div>
  );
};

export default PaymentsPage;
