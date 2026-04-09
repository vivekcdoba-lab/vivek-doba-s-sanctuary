import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Shield, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type SwotType = 'strength' | 'weakness' | 'opportunity' | 'threat';
const QUADRANTS: { type: SwotType; label: string; icon: any; color: string; bg: string }[] = [
  { type: 'strength', label: 'Strengths', icon: Shield, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { type: 'weakness', label: 'Weaknesses', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  { type: 'opportunity', label: 'Opportunities', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { type: 'threat', label: 'Threats', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
];

export default function ArthaSwot() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();
  const [addingType, setAddingType] = useState<SwotType | null>(null);
  const [form, setForm] = useState({ title: '', description: '', importance: 3, action_plan: '' });

  const { data: items = [] } = useQuery({
    queryKey: ['business-swot', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('business_swot_items').select('*').eq('business_id', business!.id).order('importance', { ascending: false });
      return data || [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      await supabase.from('business_swot_items').insert({
        business_id: business!.id, type: addingType!, title: form.title,
        description: form.description, importance: form.importance, action_plan: form.action_plan,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-swot'] });
      setAddingType(null);
      setForm({ title: '', description: '', importance: 3, action_plan: '' });
      toast.success('Added!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from('business_swot_items').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business-swot'] }),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">📊 SWOT Analysis</h1>

      {/* Add Form */}
      {addingType && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-foreground text-sm capitalize">Add {addingType}</h2>
          <Input placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          <div>
            <label className="text-xs text-muted-foreground">Importance: {form.importance}/5</label>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setForm(p => ({ ...p, importance: n }))}
                  className={`w-8 h-8 rounded-full border text-sm font-bold ${form.importance >= n ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>{n}</button>
              ))}
            </div>
          </div>
          {(addingType === 'weakness' || addingType === 'threat') && (
            <Textarea placeholder="Action plan to address this..." value={form.action_plan} onChange={e => setForm(p => ({ ...p, action_plan: e.target.value }))} rows={2} />
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => add.mutate()} disabled={!form.title.trim()}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAddingType(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* 2x2 Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANTS.map(q => {
          const quadItems = items.filter((i: any) => i.type === q.type);
          const Icon = q.icon;
          return (
            <div key={q.type} className={`rounded-xl border p-4 space-y-2 ${q.bg}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold text-sm flex items-center gap-1.5 ${q.color}`}>
                  <Icon className="w-4 h-4" /> {q.label} ({quadItems.length})
                </h3>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setAddingType(q.type)}><Plus className="w-3.5 h-3.5" /></Button>
              </div>
              {quadItems.map((item: any) => (
                <div key={item.id} className="bg-background/80 rounded-lg p-2.5 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{item.importance}/5</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove.mutate(item.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                  {item.action_plan && <p className="text-xs text-primary">📋 {item.action_plan}</p>}
                </div>
              ))}
              {quadItems.length === 0 && <p className="text-xs text-muted-foreground italic">No items yet</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
