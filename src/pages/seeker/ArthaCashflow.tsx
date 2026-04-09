import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { CHART_COLORS } from '@/components/charts/chartColors';
import { format } from 'date-fns';

const INFLOW_CATS = ['Sales', 'Investment', 'Loan', 'Refund', 'Other'];
const OUTFLOW_CATS = ['Salary', 'Rent', 'Inventory', 'Marketing', 'Utilities', 'Tax', 'Other'];

export default function ArthaCashflow() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), type: 'inflow' as 'inflow' | 'outflow', category: 'Sales', amount: '', description: '' });

  const { data: records = [] } = useQuery({
    queryKey: ['cashflow-records', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('cashflow_records').select('*').eq('business_id', business!.id).order('date', { ascending: false }).limit(100);
      return data || [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(form.amount) || 0;
      const lastBalance = records.length > 0 ? (records[0] as any).balance_after || 0 : 0;
      const newBalance = form.type === 'inflow' ? lastBalance + amount : lastBalance - amount;
      await supabase.from('cashflow_records').insert({
        business_id: business!.id, date: form.date, type: form.type,
        category: form.category, amount, description: form.description,
        balance_after: newBalance,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashflow-records'] });
      setAdding(false);
      setForm({ date: format(new Date(), 'yyyy-MM-dd'), type: 'inflow', category: 'Sales', amount: '', description: '' });
      toast.success('Entry added!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  const balance = records.length > 0 ? (records[0] as any).balance_after || 0 : 0;
  const thisMonthIn = records.filter((r: any) => r.type === 'inflow' && r.date?.startsWith(format(new Date(), 'yyyy-MM'))).reduce((s: number, r: any) => s + (r.amount || 0), 0);
  const thisMonthOut = records.filter((r: any) => r.type === 'outflow' && r.date?.startsWith(format(new Date(), 'yyyy-MM'))).reduce((s: number, r: any) => s + (r.amount || 0), 0);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Wallet className="w-6 h-6" /> Cash Flow Tracker</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Current Balance</p>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>₹{balance.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ArrowUpRight className="w-3 h-3 text-green-600" /> Inflows</p>
          <p className="text-lg font-bold text-green-600">₹{thisMonthIn.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ArrowDownRight className="w-3 h-3 text-red-500" /> Outflows</p>
          <p className="text-lg font-bold text-red-500">₹{thisMonthOut.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Add Entry */}
      {adding ? (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-foreground text-sm">New Entry</h2>
          <div className="flex gap-2">
            {(['inflow', 'outflow'] as const).map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, type: t, category: t === 'inflow' ? 'Sales' : 'Salary' }))}
                className={`px-3 py-1.5 text-xs rounded-full border ${form.type === t ? (t === 'inflow' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700') : 'border-border text-muted-foreground'}`}>
                {t === 'inflow' ? '↑ Inflow' : '↓ Outflow'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Date</label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="h-8" /></div>
            <div><label className="text-xs text-muted-foreground">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full h-8 text-xs border border-border rounded px-2 bg-background">
                {(form.type === 'inflow' ? INFLOW_CATS : OUTFLOW_CATS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-muted-foreground">Amount (₹)</label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="h-8" /></div>
            <div><label className="text-xs text-muted-foreground">Description</label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-8" /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => add.mutate()} disabled={add.isPending}><Save className="w-4 h-4 mr-1" /> Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-1" /> Add Entry</Button>
      )}

      {/* Transaction List */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {records.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No cash flow entries yet.</p>}
        {records.slice(0, 20).map((r: any) => (
          <div key={r.id} className="flex items-center gap-3 p-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.type === 'inflow' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {r.type === 'inflow' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{r.description || r.category}</p>
              <p className="text-xs text-muted-foreground">{r.date} · {r.category}</p>
            </div>
            <p className={`text-sm font-bold ${r.type === 'inflow' ? 'text-green-600' : 'text-red-500'}`}>
              {r.type === 'inflow' ? '+' : '-'}₹{(r.amount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
