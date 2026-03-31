import { useState } from 'react';
import { PAYMENTS, SEEKERS, COURSES, formatINR } from '@/data/mockData';
import { CreditCard, IndianRupee, Clock, FileText } from 'lucide-react';
import InvoiceModal from '@/components/InvoiceModal';

const SeekerPayments = () => {
  const seeker = SEEKERS[0]; // Current seeker (Rahul Patil for demo)
  const seekerPayments = PAYMENTS.filter(p => p.seeker_id === seeker.id);
  const course = seeker.course;

  const totalFee = course?.price || 0;
  const totalPaid = seekerPayments.filter(p => p.status === 'received').reduce((s, p) => s + p.total_amount, 0);
  const balance = totalFee - totalPaid;

  const [invoiceModal, setInvoiceModal] = useState<any>(null);

  const openInvoice = (p: typeof PAYMENTS[0]) => {
    setInvoiceModal({
      invoiceNumber: p.invoice_number,
      date: p.payment_date || p.due_date || '',
      dueDate: p.due_date,
      status: p.status as any,
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

  const statusBadge = (status: string) => {
    switch (status) {
      case 'received': return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-dharma-green/10 text-dharma-green">✅ Paid</span>;
      case 'pending': return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-amber/10 text-warning-amber">⏳ Due Soon</span>;
      case 'overdue': return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive">🔴 Overdue</span>;
      default: return null;
    }
  };

  const stats = [
    { label: 'Total Course Fee', value: formatINR(totalFee), border: 'border-primary' },
    { label: 'Amount Paid', value: formatINR(totalPaid), border: 'border-dharma-green' },
    { label: 'Balance', value: formatINR(balance), border: balance > 0 ? 'border-warning-amber' : 'border-dharma-green' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-xl font-bold text-foreground">My Payments</h1>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`bg-card rounded-xl p-3 shadow-sm border-l-4 ${s.border}`}>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-sm font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Next Payment Due */}
      {balance > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-sm border border-warning-amber/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning-amber" />
            <p className="text-sm font-semibold text-foreground">Next Payment Due</p>
          </div>
          <p className="text-lg font-bold text-foreground">{formatINR(Math.ceil(balance / 3))}</p>
          <p className="text-xs text-muted-foreground mt-1">UPI: vivekdoba@sbi | Bank: SBI A/C XXXXXXXXXXXX, IFSC SBIN0001234</p>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {seekerPayments.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-3 text-muted-foreground text-xs">{p.payment_date || p.due_date}</td>
                <td className="p-3 font-semibold text-foreground">{formatINR(p.total_amount)}</td>
                <td className="p-3">{statusBadge(p.status)}</td>
                <td className="p-3">
                  {p.status === 'received' && (
                    <button onClick={() => openInvoice(p)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <FileText className="w-3 h-3" /> View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoiceModal && (
        <InvoiceModal open={!!invoiceModal} onClose={() => setInvoiceModal(null)} invoice={invoiceModal} />
      )}
    </div>
  );
};

export default SeekerPayments;
