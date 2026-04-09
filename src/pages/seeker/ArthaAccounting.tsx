import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { CHART_COLORS } from '@/components/charts/chartColors';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ArthaAccounting() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());

  const { data: records = [] } = useQuery({
    queryKey: ['accounting-records', business?.id, selYear],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('accounting_records').select('*')
        .eq('business_id', business!.id).eq('year', selYear).order('month');
      return data || [];
    },
  });

  const current = records.find((r: any) => r.month === selMonth);
  const [form, setForm] = useState({ revenue: '', expenses: '', taxes: '', receivables: '', payables: '', notes: '' });

  const loadCurrent = () => {
    if (current) {
      setForm({
        revenue: current.revenue?.toString() || '0',
        expenses: current.expenses?.toString() || '0',
        taxes: current.taxes?.toString() || '0',
        receivables: current.receivables?.toString() || '0',
        payables: current.payables?.toString() || '0',
        notes: current.notes || '',
      });
    } else {
      setForm({ revenue: '', expenses: '', taxes: '', receivables: '', payables: '', notes: '' });
    }
  };

  useState(() => { loadCurrent(); });

  const save = useMutation({
    mutationFn: async () => {
      const revenue = parseFloat(form.revenue) || 0;
      const expenses = parseFloat(form.expenses) || 0;
      const payload = {
        business_id: business!.id, month: selMonth, year: selYear,
        revenue, expenses, profit: revenue - expenses,
        taxes: parseFloat(form.taxes) || 0,
        receivables: parseFloat(form.receivables) || 0,
        payables: parseFloat(form.payables) || 0,
        notes: form.notes,
      };
      if (current) await supabase.from('accounting_records').update(payload).eq('id', current.id);
      else await supabase.from('accounting_records').insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounting-records'] }); toast.success('Saved!'); },
    onError: (e: any) => toast.error(e.message),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  const chartData = MONTHS.map((m, i) => {
    const rec = records.find((r: any) => r.month === i + 1);
    return { month: m, Revenue: rec?.revenue || 0, Expenses: rec?.expenses || 0, Profit: rec?.profit || 0 };
  });

  const totalRevenue = records.reduce((s: number, r: any) => s + (r.revenue || 0), 0);
  const totalExpenses = records.reduce((s: number, r: any) => s + (r.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><IndianRupee className="w-6 h-6" /> Accounting & Finance</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Revenue', value: totalRevenue, icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-600' },
          { label: 'Total Expenses', value: totalExpenses, icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-500' },
          { label: 'Net Profit', value: totalProfit, icon: <IndianRupee className="w-4 h-4" />, color: totalProfit >= 0 ? 'text-green-600' : 'text-red-500' },
        ].map(k => (
          <div key={k.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-lg font-bold ${k.color}`}>₹{k.value.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ChartWrapper title="Revenue vs Expenses" emoji="📊">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Revenue" fill={CHART_COLORS.green} />
            <Bar dataKey="Expenses" fill={CHART_COLORS.red} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Monthly Input */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex gap-2 items-center">
          <h2 className="font-semibold text-foreground text-sm flex-1">📅 Monthly Entry</h2>
          <select value={selMonth} onChange={e => { setSelMonth(parseInt(e.target.value)); loadCurrent(); }}
            className="text-xs border border-border rounded px-2 py-1 bg-background">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <Input type="number" value={selYear} onChange={e => setSelYear(parseInt(e.target.value))} className="w-20 h-8 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['revenue', 'Revenue (₹)'], ['expenses', 'Expenses (₹)'], ['taxes', 'Taxes (₹)'], ['receivables', 'Receivables (₹)'], ['payables', 'Payables (₹)']].map(([k, l]) => (
            <div key={k}>
              <label className="text-xs text-muted-foreground">{l}</label>
              <Input type="number" value={form[k as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="h-8 text-sm" />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Notes</label>
          <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
        </div>
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" /> Save</Button>
      </div>
    </div>
  );
}
