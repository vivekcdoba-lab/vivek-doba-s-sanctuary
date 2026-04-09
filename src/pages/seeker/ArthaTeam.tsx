import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, Trash2, Users, Star } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const DEPARTMENTS = ['Sales', 'Operations', 'Finance', 'HR', 'Product', 'Customer Success', 'Tech', 'Leadership'];

export default function ArthaTeam() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', department: 'Sales', hire_date: '', performance_rating: '', notes: '' });
  const [filter, setFilter] = useState('All');

  const { data: members = [] } = useQuery({
    queryKey: ['team-members', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('*').eq('business_id', business!.id).order('created_at');
      return data || [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      await supabase.from('team_members').insert({
        business_id: business!.id, name: form.name, role: form.role,
        department: form.department, hire_date: form.hire_date || null,
        performance_rating: form.performance_rating ? parseInt(form.performance_rating) : null,
        notes: form.notes || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      setAdding(false);
      setForm({ name: '', role: '', department: 'Sales', hire_date: '', performance_rating: '', notes: '' });
      toast.success('Team member added!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from('team_members').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team-members'] }),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  const filtered = filter === 'All' ? members : members.filter((m: any) => m.department === filter);
  const deptCounts = DEPARTMENTS.map(d => ({ dept: d, count: members.filter((m: any) => m.department === d).length }));

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="w-6 h-6" /> Team Building</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-foreground">{members.length}</p>
        </div>
        {deptCounts.filter(d => d.count > 0).slice(0, 3).map(d => (
          <div key={d.dept} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">{d.dept}</p>
            <p className="text-xl font-bold text-foreground">{d.count}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {['All', ...DEPARTMENTS].map(d => (
          <button key={d} onClick={() => setFilter(d)}
            className={`px-3 py-1 text-xs rounded-full border whitespace-nowrap ${filter === d ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}>{d}</button>
        ))}
      </div>

      {/* Add */}
      {adding ? (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-foreground text-sm">Add Team Member</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Name *</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-8" /></div>
            <div><label className="text-xs text-muted-foreground">Role</label><Input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="h-8" /></div>
            <div><label className="text-xs text-muted-foreground">Department</label>
              <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                className="w-full h-8 text-xs border border-border rounded px-2 bg-background">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-muted-foreground">Hire Date</label><Input type="date" value={form.hire_date} onChange={e => setForm(p => ({ ...p, hire_date: e.target.value }))} className="h-8" /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => add.mutate()} disabled={add.isPending || !form.name.trim()}><Save className="w-4 h-4 mr-1" /> Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-1" /> Add Member</Button>
      )}

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No team members yet.</p>}
        {filtered.map((m: any) => (
          <div key={m.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {m.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.role} · {m.department}</p>
            </div>
            {m.performance_rating && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: m.performance_rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
