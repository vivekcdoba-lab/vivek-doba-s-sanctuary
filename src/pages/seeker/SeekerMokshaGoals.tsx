import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Compass, Plus, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type Goal = { date: string; text: string; progress: number };
const STORAGE_KEY = 'seeker_moksha_goals';

export default function SeekerMokshaGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => { try { const d = localStorage.getItem(STORAGE_KEY); if (d) setGoals(JSON.parse(d)); } catch {} }, []);

  const save = (updated: Goal[]) => { setGoals(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); };

  const add = () => {
    if (!newGoal.trim()) return;
    save([{ date: new Date().toISOString(), text: newGoal.trim(), progress: 0 }, ...goals]); setNewGoal('');
    toast({ title: '📿 Spiritual goal added!' });
  };

  const updateProgress = (i: number, p: number) => {
    const updated = [...goals]; updated[i] = { ...updated[i], progress: p }; save(updated);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--wisdom-purple))]/10 flex items-center justify-center mx-auto"><Compass className="w-8 h-8 text-[hsl(var(--wisdom-purple))]" /></div>
        <h1 className="text-2xl font-bold text-foreground">📿 Spiritual Goals</h1>
        <p className="text-sm text-muted-foreground">Set and track your spiritual aspirations</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="e.g., Meditate 20 min daily for 30 days" className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wisdom-purple))]/30" />
        <button onClick={add} disabled={!newGoal.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--wisdom-purple))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"><Plus className="w-4 h-4" /> Add Goal</button>
      </div>
      <div className="space-y-3">
        {goals.map((g, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1"><Sparkles className="w-3 h-3 text-[hsl(var(--wisdom-purple))]" />{g.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(g.date), 'MMM dd, yyyy')}</p>
              </div>
              <span className="text-xs font-medium text-[hsl(var(--wisdom-purple))]">{g.progress}%</span>
            </div>
            <input type="range" min={0} max={100} step={10} value={g.progress} onChange={e => updateProgress(i, Number(e.target.value))} className="w-full accent-[hsl(var(--wisdom-purple))]" />
          </div>
        ))}
        {goals.length === 0 && <p className="text-center text-sm text-muted-foreground">Set your first spiritual goal. ✨</p>}
      </div>
    </div>
  );
}
