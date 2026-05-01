import { useState, useMemo } from 'react';
import { formatINR } from '@/data/mockData';
import { Clock, FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import InvoiceModal from '@/components/InvoiceModal';
import { useAuthStore } from '@/store/authStore';
import { usePayments } from '@/hooks/usePayments';
import { useSeekerLinkGroup } from '@/hooks/useSeekerLinks';
import FeeStructureForm from '@/components/FeeStructureForm';
import { useFeeStructure } from '@/hooks/useFeeStructure';
import SeekerSignedDocuments from '@/components/SeekerSignedDocuments';

type FilterType = 'all' | 'individual' | 'joint';

const SeekerPayments = () => {
  const { profile } = useAuthStore();
  const { payments, isLoading } = usePayments(); // RLS now returns own + joint payments
  const { data: linkGroup = [] } = useSeekerLinkGroup(profile?.id);
  const partner = linkGroup.find(r => r.seeker_id !== profile?.id);
  const partnerName = partner?.seeker?.full_name?.split(' ')[0] || 'partner';

  const [filter, setFilter] = useState<FilterType>('all');
  const [invoiceModal, setInvoiceModal] = useState<any>(null);

  // Filter only the seeker's own + joint payments belonging to their group
  const visiblePayments = useMemo(() => {
    return payments.filter(p => {
      // RLS already enforces this, but double-filter defensively
      if (p.seeker_id === profile?.id) return true;
      if (p.is_joint) return true;
      return false;
    });
  }, [payments, profile?.id]);

  const filtered = useMemo(() => {
    if (filter === 'individual') return visiblePayments.filter(p => !p.is_joint);
    if (filter === 'joint') return visiblePayments.filter(p => p.is_joint);
    return visiblePayments;
  }, [visiblePayments, filter]);

  const totalPaid = filtered.filter(p => p.status === 'received').reduce((s, p) => s + Number(p.total_amount), 0);
  const pendingAmount = filtered.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + Number(p.total_amount), 0);

  const openInvoice = (p: typeof payments[0]) => {
    setInvoiceModal({
      invoiceNumber: p.invoice_number,
      date: p.payment_date || p.due_date || '',
      dueDate: p.due_date,
      status: p.status as any,
      seekerName: profile?.full_name || '',
      seekerCity: '',
      seekerState: '',
      seekerPhone: '',
      seekerEmail: profile?.email || '',
      courseName: '',
      tier: '',
      amount: p.amount,
      gstAmount: p.gst_amount,
      totalAmount: p.total_amount,
      method: p.method,
      transactionId: p.transaction_id,
      isJoint: p.is_joint,
      jointWith: p.is_joint && p.seeker_id !== profile?.id ? partnerName : null,
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

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const stats = [
    { label: 'Total Paid', value: formatINR(totalPaid), border: 'border-dharma-green' },
    { label: 'Pending', value: formatINR(pendingAmount), border: pendingAmount > 0 ? 'border-warning-amber' : 'border-dharma-green' },
  ];

  const hasJointPayments = visiblePayments.some(p => p.is_joint);

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-xl font-bold text-foreground">My Payments</h1>

      {/* Fee structure — read-only (admin-managed) */}
      <FeeStructureReadOnlyCard seekerId={profile?.id} />

      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`bg-card rounded-xl p-3 shadow-sm border-l-4 ${s.border}`}>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-sm font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter chips — only show when seeker has joint payments */}
      {hasJointPayments && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { key: 'all', label: 'All', count: visiblePayments.length },
            { key: 'individual', label: 'Individual', count: visiblePayments.filter(p => !p.is_joint).length },
            { key: 'joint', label: `🤝 Joint with ${partnerName}`, count: visiblePayments.filter(p => p.is_joint).length },
          ] as { key: FilterType; label: string; count: number }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {f.label} <span className="opacity-70">({f.count})</span>
            </button>
          ))}
        </div>
      )}

      {pendingAmount > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-sm border border-warning-amber/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning-amber" />
            <p className="text-sm font-semibold text-foreground">Payment Due</p>
          </div>
          <p className="text-lg font-bold text-foreground">{formatINR(pendingAmount)}</p>
          <p className="text-xs text-muted-foreground mt-1">UPI: vivekdoba@sbi | Bank: SBI</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">💳</span>
          <p className="text-muted-foreground">
            {filter === 'all' ? 'No payment records yet.' : `No ${filter} payments to show.`}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-muted-foreground text-xs">{p.payment_date || p.due_date}</td>
                  <td className="p-3 font-semibold text-foreground">{formatINR(p.total_amount)}</td>
                  <td className="p-3">
                    {p.is_joint ? (
                      <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                        🤝 Joint{p.seeker_id !== profile?.id ? ` (paid by ${partnerName})` : ''}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Individual</Badge>
                    )}
                  </td>
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
      )}

      {invoiceModal && (
        <InvoiceModal open={!!invoiceModal} onClose={() => setInvoiceModal(null)} invoice={invoiceModal} />
      )}
    </div>
  );
};

export default SeekerPayments;

function FeeStructureReadOnlyCard({ seekerId }: { seekerId?: string }) {
  const { data } = useFeeStructure(seekerId);
  if (!seekerId || !data) return null;
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <h2 className="text-sm font-semibold text-foreground mb-3">Fee Structure / फीस संरचना</h2>
      <FeeStructureForm seekerId={seekerId} readOnly />
    </div>
  );
}

