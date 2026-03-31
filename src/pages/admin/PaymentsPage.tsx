import { PAYMENTS, SEEKERS, formatINR } from '@/data/mockData';
import { Plus, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

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
          </tr></thead>
          <tbody>
            {PAYMENTS.map((p) => {
              const seeker = SEEKERS.find((s) => s.id === p.seeker_id);
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium text-foreground">{p.invoice_number}</td>
                  <td className="p-3 text-foreground">{seeker?.full_name}</td>
                  <td className="p-3 font-semibold text-foreground">{formatINR(p.total_amount)}</td>
                  <td className="p-3 text-muted-foreground">{p.payment_date || p.due_date}</td>
                  <td className="p-3 text-muted-foreground capitalize">{p.method.replace('_', ' ')}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[p.status] || 'bg-muted text-muted-foreground'}`}>{p.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;
