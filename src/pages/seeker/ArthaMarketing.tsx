import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Save, Megaphone } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CHANNELS = ['Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'Twitter/X', 'Website & SEO', 'Email Marketing', 'Cold Calling', 'Networking & Events', 'Paid Advertising', 'Word of Mouth', 'PR & Media'];

export default function ArthaMarketing() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();

  const { data: strategy } = useQuery({
    queryKey: ['marketing-strategy', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('marketing_strategy').select('*').eq('business_id', business!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    target_audience: '', unique_selling_proposition: '', content_strategy: '',
    budget_monthly: '', goals_quarterly: '',
  });
  const [channels, setChannels] = useState<Record<string, { active: boolean; notes: string; status: string }>>({});

  useEffect(() => {
    if (strategy) {
      setForm({
        target_audience: strategy.target_audience || '',
        unique_selling_proposition: strategy.unique_selling_proposition || '',
        content_strategy: strategy.content_strategy || '',
        budget_monthly: strategy.budget_monthly?.toString() || '',
        goals_quarterly: strategy.goals_quarterly || '',
      });
      setChannels((strategy.marketing_channels as any) || {});
    }
  }, [strategy]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        budget_monthly: form.budget_monthly ? parseFloat(form.budget_monthly) : 0,
        marketing_channels: channels,
        business_id: business!.id,
      };
      if (strategy) {
        await supabase.from('marketing_strategy').update(payload).eq('id', strategy.id);
      } else {
        await supabase.from('marketing_strategy').insert(payload);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marketing-strategy'] }); toast.success('Saved!'); },
    onError: (e: any) => toast.error(e.message),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  const toggleChannel = (ch: string) => {
    setChannels(p => ({
      ...p,
      [ch]: { active: !p[ch]?.active, notes: p[ch]?.notes || '', status: p[ch]?.status || 'Not Started' },
    }));
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Megaphone className="w-6 h-6" /> Marketing Strategy</h1>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-foreground text-sm">🎯 Target Audience & ICP</h2>
        <Textarea value={form.target_audience} onChange={e => setForm(p => ({ ...p, target_audience: e.target.value }))}
          placeholder="Demographics, psychographics, behaviors..." rows={4} />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-foreground text-sm">💡 Unique Selling Proposition (USP)</h2>
        <Textarea value={form.unique_selling_proposition} onChange={e => setForm(p => ({ ...p, unique_selling_proposition: e.target.value }))}
          placeholder="What makes you different?" rows={3} />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">📱 Marketing Channels</h2>
        <div className="grid grid-cols-2 gap-2">
          {CHANNELS.map(ch => (
            <button key={ch} onClick={() => toggleChannel(ch)}
              className={`text-left text-xs p-2 rounded-lg border transition-colors ${channels[ch]?.active ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}>
              {channels[ch]?.active ? '✅' : '⬜'} {ch}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-foreground text-sm">📝 Content Strategy</h2>
        <Textarea value={form.content_strategy} onChange={e => setForm(p => ({ ...p, content_strategy: e.target.value }))}
          placeholder="Content pillars, themes, posting frequency..." rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <label className="text-sm font-medium text-foreground">💰 Monthly Budget (₹)</label>
          <Input type="number" value={form.budget_monthly} onChange={e => setForm(p => ({ ...p, budget_monthly: e.target.value }))} />
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <label className="text-sm font-medium text-foreground">🎯 Quarterly Goals</label>
          <Textarea value={form.goals_quarterly} onChange={e => setForm(p => ({ ...p, goals_quarterly: e.target.value }))} rows={2} />
        </div>
      </div>

      <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" /> Save Marketing Strategy</Button>
    </div>
  );
}
