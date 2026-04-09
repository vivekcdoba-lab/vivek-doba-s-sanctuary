import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Swords, ExternalLink } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const THREAT_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700',
};

export default function ArthaCompetitors() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ competitor_name: '', website: '', strengths: '', weaknesses: '', pricing: '', threat_level: 'medium', notes: '' });

  const { data: competitors = [] } = useQuery({
    queryKey: ['business-competitors', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('business_competitors').select('*').eq('business_id', business!.id).order('created_at');
      return data || [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      await supabase.from('business_competitors').insert({ business_id: business!.id, ...form });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business-competitors'] }); setAdding(false); toast.success('Competitor added!'); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from('business_competitors').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business-competitors'] }),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Swords className="w-6 h-6" /> Competitor Analysis</h1>

      {adding ? (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-foreground text-sm">Add Competitor</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Name *</label><Input value={form.competitor_name} onChange={e => setForm(p => ({ ...p, competitor_name: e.target.value }))} className="h-8" /></div>
            <div><label className="text-xs text-muted-foreground">Website</label><Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className="h-8" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Their Strengths</label><Textarea value={form.strengths} onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))} rows={2} /></div>
            <div><label className="text-xs text-muted-foreground">Their Weaknesses</label><Textarea value={form.weaknesses} onChange={e => setForm(p => ({ ...p, weaknesses: e.target.value }))} rows={2} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Pricing</label><Input value={form.pricing} onChange={e => setForm(p => ({ ...p, pricing: e.target.value }))} className="h-8" /></div>
            <div><label className="text-xs text-muted-foreground">Threat Level</label>
              <select value={form.threat_level} onChange={e => setForm(p => ({ ...p, threat_level: e.target.value }))}
                className="w-full h-8 text-xs border border-border rounded px-2 bg-background">
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
          </div>
          <Textarea placeholder="Notes / How we differentiate..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => add.mutate()} disabled={!form.competitor_name.trim()}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setAdding(true)} disabled={competitors.length >= 5}><Plus className="w-4 h-4 mr-1" /> Add Competitor {competitors.length >= 5 && '(max 5)'}</Button>
      )}

      {/* Comparison Table */}
      {competitors.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground font-medium">Competitor</th>
                <th className="text-left p-2 text-muted-foreground font-medium">Strengths</th>
                <th className="text-left p-2 text-muted-foreground font-medium">Weaknesses</th>
                <th className="text-left p-2 text-muted-foreground font-medium">Pricing</th>
                <th className="text-left p-2 text-muted-foreground font-medium">Threat</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c: any) => (
                <tr key={c.id} className="border-b border-border">
                  <td className="p-2">
                    <p className="font-medium text-foreground">{c.competitor_name}</p>
                    {c.website && <a href={c.website} target="_blank" rel="noopener" className="text-primary flex items-center gap-0.5"><ExternalLink className="w-3 h-3" /> Visit</a>}
                  </td>
                  <td className="p-2 text-muted-foreground">{c.strengths || '—'}</td>
                  <td className="p-2 text-muted-foreground">{c.weaknesses || '—'}</td>
                  <td className="p-2 text-muted-foreground">{c.pricing || '—'}</td>
                  <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-xs capitalize ${THREAT_COLORS[c.threat_level]}`}>{c.threat_level}</span></td>
                  <td className="p-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove.mutate(c.id)}><Trash2 className="w-3 h-3" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards for detail */}
      <div className="space-y-3">
        {competitors.map((c: any) => (
          <div key={c.id} className="bg-card rounded-xl border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">{c.competitor_name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${THREAT_COLORS[c.threat_level]}`}>{c.threat_level} threat</span>
            </div>
            {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
