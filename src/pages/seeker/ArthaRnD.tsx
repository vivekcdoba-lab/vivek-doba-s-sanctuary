import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, Trash2, Lightbulb, FlaskConical } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const STATUSES = ['ideation', 'in_progress', 'testing', 'completed', 'paused'] as const;
const STATUS_COLORS: Record<string, string> = {
  ideation: 'bg-blue-100 text-blue-700', in_progress: 'bg-amber-100 text-amber-700',
  testing: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
  paused: 'bg-muted text-muted-foreground',
};

export default function ArthaRnD() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ project_name: '', description: '', status: 'ideation' as string, start_date: '', target_completion: '', budget: '', progress_percent: '0' });

  const { data: projects = [] } = useQuery({
    queryKey: ['rnd-projects', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('rnd_projects').select('*').eq('business_id', business!.id).order('created_at', { ascending: false });
      return data || [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      await supabase.from('rnd_projects').insert({
        business_id: business!.id, project_name: form.project_name, description: form.description,
        status: form.status, start_date: form.start_date || null, target_completion: form.target_completion || null,
        budget: form.budget ? parseFloat(form.budget) : 0, progress_percent: parseInt(form.progress_percent) || 0,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rnd-projects'] }); setAdding(false); toast.success('Project added!'); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from('rnd_projects').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rnd-projects'] }),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FlaskConical className="w-6 h-6" /> R&D / Innovation</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {STATUSES.filter(s => s !== 'paused').map(s => (
          <div key={s} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground capitalize">{s.replace('_', ' ')}</p>
            <p className="text-xl font-bold text-foreground">{projects.filter((p: any) => p.status === s).length}</p>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-foreground text-sm">New Project</h2>
          <Input placeholder="Project name *" value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} />
          <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full h-8 text-xs border border-border rounded px-2 bg-background">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-muted-foreground">Budget (₹)</label>
              <Input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} className="h-8" />
            </div>
            <div><label className="text-xs text-muted-foreground">Start</label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="h-8" /></div>
            <div><label className="text-xs text-muted-foreground">Target</label><Input type="date" value={form.target_completion} onChange={e => setForm(p => ({ ...p, target_completion: e.target.value }))} className="h-8" /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => add.mutate()} disabled={!form.project_name.trim()}><Save className="w-4 h-4 mr-1" /> Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-1" /> New Project</Button>
      )}

      {/* Kanban-style columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.filter(s => projects.some((p: any) => p.status === s)).map(s => (
          <div key={s}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{s.replace('_', ' ')}</h3>
            <div className="space-y-2">
              {projects.filter((p: any) => p.status === s).map((p: any) => (
                <div key={p.id} className="bg-card rounded-lg border border-border p-3 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-foreground">{p.project_name}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove.mutate(p.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>{p.progress_percent}%</span>
                    {p.budget > 0 && <span className="text-xs text-muted-foreground">₹{p.budget.toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
