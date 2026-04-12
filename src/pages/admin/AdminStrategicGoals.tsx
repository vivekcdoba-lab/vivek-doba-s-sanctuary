import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Trash2 } from 'lucide-react';

interface Goal { id: string; title: string; target: string; progress: number; quarter: string }

const AdminStrategicGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(() => JSON.parse(localStorage.getItem('admin_strategic_goals') || '[]'));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', target: '', quarter: 'Q2 2026' });

  const save = (g: Goal[]) => { setGoals(g); localStorage.setItem('admin_strategic_goals', JSON.stringify(g)); };
  const add = () => { if (!form.title) return; save([...goals, { id: crypto.randomUUID(), ...form, progress: 0 }]); setForm({ title: '', target: '', quarter: 'Q2 2026' }); setOpen(false); };
  const updateProgress = (id: string, progress: number) => save(goals.map(g => g.id === id ? { ...g, progress: Math.min(100, Math.max(0, progress)) } : g));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-foreground">🎯 Strategic Goals</h1><p className="text-muted-foreground">Track organizational OKRs and targets</p></div>
        <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Goal</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>New Strategic Goal</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Goal Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Target Metric</Label><Input value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} placeholder="e.g. 100 enrollments" /></div>
              <div><Label>Quarter</Label><Input value={form.quarter} onChange={e => setForm(p => ({ ...p, quarter: e.target.value }))} /></div>
              <Button onClick={add} className="w-full">Add Goal</Button>
            </div>
          </DialogContent></Dialog></div>
      {goals.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><Target className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No strategic goals yet. Add your first OKR!</p></CardContent></Card> :
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(g => (
          <Card key={g.id}>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center justify-between"><span className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" />{g.title}</span><Button size="sm" variant="ghost" onClick={() => save(goals.filter(x => x.id !== g.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Target: {g.target || '—'}</span><Badge variant="outline">{g.quarter}</Badge></div>
              <Progress value={g.progress} className="h-3" />
              <div className="flex items-center justify-between"><span className="text-sm font-medium">{g.progress}%</span>
                <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => updateProgress(g.id, g.progress - 10)}>-10</Button><Button size="sm" variant="outline" onClick={() => updateProgress(g.id, g.progress + 10)}>+10</Button></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>}
    </div>
  );
};

export default AdminStrategicGoals;
