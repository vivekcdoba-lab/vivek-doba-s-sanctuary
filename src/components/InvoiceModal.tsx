import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Mail, MessageSquare, X } from 'lucide-react';
import { formatINR } from '@/data/mockData';

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoice: {
    invoiceNumber: string;
    date: string;
    dueDate?: string;
    status: 'received' | 'pending' | 'overdue';
    seekerName: string;
    seekerCity: string;
    seekerState?: string;
    seekerPhone: string;
    seekerEmail: string;
    courseName: string;
    tier: string;
    duration?: string;
    description?: string;
    amount: number;
    gstAmount: number;
    totalAmount: number;
    method: string;
    transactionId?: string;
    emiInfo?: string;
  };
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'received': return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-dharma-green/10 text-dharma-green">✅ PAID</span>;
    case 'pending': return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-amber/10 text-warning-amber">⏳ PENDING</span>;
    case 'overdue': return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">🔴 OVERDUE</span>;
    default: return null;
  }
};

const InvoiceModal = ({ open, onClose, invoice }: InvoiceModalProps) => {
  const handlePrint = () => window.print();

  const handleEmail = () => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} — Vivek Doba Training Solutions`);
    const body = encodeURIComponent(`Dear ${invoice.seekerName},\n\nPlease find your invoice ${invoice.invoiceNumber} for ${formatINR(invoice.totalAmount)}.\n\nThank you for your commitment to transformation!\n\n🙏 Vivek Doba\nVivek Doba Training Solutions`);
    window.location.href = `mailto:${invoice.seekerEmail}?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = () => {
    const phone = invoice.seekerPhone.replace(/\D/g, '');
    const text = encodeURIComponent(`🙏 Namaste ${invoice.seekerName} ji,\n\nInvoice: ${invoice.invoiceNumber}\nAmount: ${formatINR(invoice.totalAmount)}\nStatus: ${invoice.status === 'received' ? 'Paid ✅' : 'Pending'}\n\nFor ${invoice.courseName} (${invoice.tier})\n\nVivek Doba Training Solutions\nvivekdoba.com | 9607050111`);
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Invoice Body */}
        <div id="invoice-printable" className="bg-white text-gray-900">
          {/* Gold Header Bar */}
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)' }} />

          <div className="p-6 sm:p-8 space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#B8860B' }}>🪷 VIVEK DOBA TRAINING SOLUTIONS</h2>
                <p className="text-[11px] text-gray-500">Spiritual Business Coach | Founder of Life's Golden Triangle</p>
                <p className="text-[11px] text-gray-500 mt-0.5">📞 9607050111 | 🌐 vivekdoba.com | 📧 info@vivekdoba.com</p>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: '#800020' }}>INVOICE</h1>
            </div>

            {/* Invoice Details Bar */}
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p><span className="text-gray-500">Invoice #:</span> <span className="font-semibold">{invoice.invoiceNumber}</span></p>
                <p><span className="text-gray-500">Invoice Date:</span> {invoice.date}</p>
                {invoice.dueDate && <p><span className="text-gray-500">Due Date:</span> {invoice.dueDate}</p>}
                <div className="mt-1">{statusBadge(invoice.status)}</div>
              </div>
              <div>
                <p><span className="text-gray-500">Payment Method:</span> {invoice.method.replace('_', ' ').toUpperCase()}</p>
                {invoice.transactionId && <p><span className="text-gray-500">Transaction ID:</span> {invoice.transactionId}</p>}
              </div>
            </div>

            {/* Bill To + Program */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
                <p className="font-semibold">{invoice.seekerName}</p>
                <p className="text-gray-500">{invoice.seekerCity}{invoice.seekerState ? `, ${invoice.seekerState}` : ''}</p>
                <p className="text-gray-500">Phone: {invoice.seekerPhone}</p>
                <p className="text-gray-500">Email: {invoice.seekerEmail}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Program Details</p>
                <p className="font-semibold">{invoice.courseName}</p>
                <p className="text-gray-500">Tier: {invoice.tier}</p>
                {invoice.duration && <p className="text-gray-500">Duration: {invoice.duration}</p>}
              </div>
            </div>

            {/* Amount Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-medium text-gray-600">Description</th>
                    <th className="text-right p-3 font-medium text-gray-600">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">
                      <p className="font-medium">{invoice.courseName}</p>
                      <p className="text-xs text-gray-500">{invoice.tier} Coaching Program</p>
                      {invoice.emiInfo && <p className="text-xs text-gray-500">{invoice.emiInfo}</p>}
                    </td>
                    <td className="p-3 text-right">{formatINR(invoice.amount)}</td>
                  </tr>
                  <tr className="border-b bg-gray-50/50">
                    <td className="p-3 text-right text-gray-500">Subtotal</td>
                    <td className="p-3 text-right">{formatINR(invoice.amount)}</td>
                  </tr>
                  <tr className="border-b bg-gray-50/50">
                    <td className="p-3 text-right text-gray-500">GST (18%)</td>
                    <td className="p-3 text-right">{formatINR(invoice.gstAmount)}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="p-3 text-right font-bold">TOTAL</td>
                    <td className="p-3 text-right font-bold text-lg">{formatINR(invoice.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-semibold text-gray-700 mb-1">Payment Details</p>
              <div className="grid grid-cols-2 gap-1 text-gray-500 text-xs">
                <p>Bank: State Bank of India</p>
                <p>UPI: vivekdoba@sbi</p>
                <p>Account: XXXXXXXXXXXX</p>
                <p>IFSC: SBIN0001234</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-3 text-center space-y-1">
              <p className="text-[10px] text-gray-400">GSTIN: 27XXXXXXXXXXXZX | PAN: XXXXX1234X</p>
              <p className="text-xs text-gray-500 italic">Thank you for your commitment to transformation! 🙏</p>
              <p className="text-[10px] text-gray-400">Vivek Doba Training Solutions | vivekdoba.com</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (hidden in print) */}
        <div className="flex gap-2 p-4 border-t print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmail} className="gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
