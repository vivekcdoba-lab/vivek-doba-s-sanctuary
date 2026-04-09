import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Save, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const DEFAULT_STAGES = ['Lead/Prospect', 'Initial Contact', 'Discovery', 'Presentation', 'Negotiation', 'Closing', 'Onboarding'];

export default function ArthaSales() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();

  const { data: strategy } = useQuery({
    queryKey: ['sales-strategy', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('sales_strategy').select('*').eq('business_id', business!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    sales_channels: '', pricing_strategy: '', sales_targets_monthly: '',
    conversion_goals: '', sales_scripts: '',
  });
  const [stages, setStages] = useState<{ name: string; description: string }[]>(DEFAULT_STAGES.map(s => ({ name: s, description: '' })));
  const [objections, setObjections] = useState<{ objection: string; response: string }[]>([
    { objection: "It's too expensive", response: '' },
    { objection: 'I need to think about it', response: '' },
    { objection: "I'm working with someone else", response: '' },
  ]);

  useEffect(() => {
    if (strategy) {
      setForm({
        sales_channels: strategy.sales_channels || '',
        pricing_strategy: strategy.pricing_strategy || '',
        sales_targets_monthly: strategy.sales_targets_monthly?.toString() || '',
        conversion_goals: strategy.conversion_goals || '',
        sales_scripts: strategy.sales_scripts || '',
      });
      if (Array.isArray(strategy.sales_process) && (strategy.sales_process as any[]).length > 0) setStages(strategy.sales_process as any);
      if (Array.isArray(strategy.key_objections) && (strategy.key_objections as any[]).length > 0) setObjections(strategy.key_objections as any);
    }
  }, [strategy]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form, sales_targets_monthly: form.sales_targets_monthly ? parseFloat(form.sales_targets_monthly) : 0,
        sales_process: stages, key_objections: objections, business_id: business!.id,
      };
      if (strategy) await supabase.from('sales_strategy').update(payload).eq('id', strategy.id);
      else await supabase.from('sales_strategy').insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales-strategy'] }); toast.success('Saved!'); },
    onError: (e: any) => toast.error(e.message),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="w-6 h-6" /> Sales Strategy</h1>

      {/* Sales Process */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">🔄 Sales Process Stages</h2>
        {stages.map((s, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="bg-primary/10 text-primary text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">{i + 1}</span>
            <div className="flex-1 space-y-1">
              <Input value={s.name} onChange={e => { const n = [...stages]; n[i].name = e.target.value; setStages(n); }} placeholder="Stage name" className="h-8 text-sm" />
              <Input value={s.description} onChange={e => { const n = [...stages]; n[i].description = e.target.value; setStages(n); }} placeholder="Key activities..." className="h-8 text-xs" />
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 mt-1" onClick={() => setStages(p => p.filter((_, j) => j !== i))}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setStages(p => [...p, { name: '', description: '' }])}><Plus className="w-3.5 h-3.5 mr-1" /> Add Stage</Button>
      </div>

      {/* Pricing & Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <label className="text-sm font-medium text-foreground">💰 Pricing Strategy</label>
          <Textarea value={form.pricing_strategy} onChange={e => setForm(p => ({ ...p, pricing_strategy: e.target.value }))} placeholder="Fixed, hourly, subscription..." rows={3} />
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <label className="text-sm font-medium text-foreground">🎯 Monthly Revenue Target (₹)</label>
          <Input type="number" value={form.sales_targets_monthly} onChange={e => setForm(p => ({ ...p, sales_targets_monthly: e.target.value }))} />
          <label className="text-sm font-medium text-foreground mt-2">📊 Conversion Goals</label>
          <Input value={form.conversion_goals} onChange={e => setForm(p => ({ ...p, conversion_goals: e.target.value }))} placeholder="e.g., 30% lead-to-close" />
        </div>
      </div>

      {/* Objections */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">🛡️ Objection Handling</h2>
        {objections.map((o, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <Input value={o.objection} onChange={e => { const n = [...objections]; n[i].objection = e.target.value; setObjections(n); }} className="text-sm font-medium h-8" />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setObjections(p => p.filter((_, j) => j !== i))}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
            <Textarea value={o.response} onChange={e => { const n = [...objections]; n[i].response = e.target.value; setObjections(n); }} placeholder="Response script..." rows={2} className="text-xs" />
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setObjections(p => [...p, { objection: '', response: '' }])}><Plus className="w-3.5 h-3.5 mr-1" /> Add Objection</Button>
      </div>

      {/* Sales Scripts */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">📜 Sales Scripts & Notes</h2>
        <Textarea value={form.sales_scripts} onChange={e => setForm(p => ({ ...p, sales_scripts: e.target.value }))} placeholder="Cold call script, discovery questions, closing techniques..." rows={5} />
      </div>

      <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" /> Save Sales Strategy</Button>
    </div>
  );
}
