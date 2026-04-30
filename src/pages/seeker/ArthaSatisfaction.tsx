import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, Star, SmilePlus, Check } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDateDMY } from "@/lib/dateFormat";

const CATEGORIES = ['Product', 'Service', 'Support', 'General'];

export default function ArthaSatisfaction() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ client_name: '', feedback_date: formatDateDMY(new Date()), rating: 5, feedback_text: '', category: 'General', response_action: '' });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['client-feedback', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('client_feedback').select('*').eq('business_id', business!.id).order('feedback_date', { ascending: false });
      return data || [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      await supabase.from('client_feedback').insert({ business_id: business!.id, ...form });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['client-feedback'] }); setAdding(false); toast.success('Feedback added!'); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleResolved = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      await supabase.from('client_feedback').update({ resolved: !resolved }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-feedback'] }),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((s: number, f: any) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '—';
  const pending = feedbacks.filter((f: any) => !f.resolved).length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><SmilePlus className="w-6 h-6" /> Client Satisfaction</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Avg Rating</p>
          <p className="text-xl font-bold text-amber-500">{avgRating} ⭐</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Feedback</p>
          <p className="text-xl font-bold text-foreground">{feedbacks.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Pending Action</p>
          <p className="text-xl font-bold text-red-500">{pending}</p>
        </div>
      </div>

      {adding ? (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-foreground text-sm">Add Feedback</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Client Name *</label><Input value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} className="h-8" /></div>
            <div><label className="text-xs text-muted-foreground">Date</label><Input type="date" value={form.feedback_date} onChange={e => setForm(p => ({ ...p, feedback_date: e.target.value }))} className="h-8" /></div>
          </div>
          <div><label className="text-xs text-muted-foreground">Rating</label>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(r => (
                <button key={r} onClick={() => setForm(p => ({ ...p, rating: r }))}>
                  <Star className={`w-6 h-6 ${r <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                </button>
              ))}
            </div>
          </div>
          <div><label className="text-xs text-muted-foreground">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full h-8 text-xs border border-border rounded px-2 bg-background">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Textarea placeholder="Feedback details..." value={form.feedback_text} onChange={e => setForm(p => ({ ...p, feedback_text: e.target.value }))} rows={2} />
          <Input placeholder="Response action taken..." value={form.response_action} onChange={e => setForm(p => ({ ...p, response_action: e.target.value }))} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => add.mutate()} disabled={!form.client_name.trim()}><Save className="w-4 h-4 mr-1" /> Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-1" /> Add Feedback</Button>
      )}

      <div className="space-y-2">
        {feedbacks.map((f: any) => (
          <div key={f.id} className="bg-card rounded-xl border border-border p-3 flex items-start gap-3">
            <button onClick={() => toggleResolved.mutate({ id: f.id, resolved: f.resolved })}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${f.resolved ? 'bg-green-500 border-green-500' : 'border-border'}`}>
              {f.resolved && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{f.client_name}</p>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{f.category}</span>
              </div>
              <div className="flex items-center gap-0.5 my-0.5">
                {Array.from({ length: f.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
              {f.feedback_text && <p className="text-xs text-muted-foreground">{f.feedback_text}</p>}
              <p className="text-xs text-muted-foreground mt-1">{f.feedback_date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
