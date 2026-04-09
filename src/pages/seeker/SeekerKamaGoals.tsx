import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Heart, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type Entry = { date: string; text: string };
const STORAGE_KEY = 'seeker_kama_goals';

export default function SeekerKamaGoals() {
  const [goals, setGoals] = useState<Entry[]>([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => { try { const d = localStorage.getItem(STORAGE_KEY); if (d) setGoals(JSON.parse(d)); } catch {} }, []);

  const add = () => {
    if (!newGoal.trim()) return;
    const updated = [{ date: new Date().toISOString(), text: newGoal.trim() }, ...goals];
    setGoals(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); setNewGoal('');
    toast({ title: '❤️ Goal added!' });
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--lotus-pink))]/10 flex items-center justify-center mx-auto"><Heart className="w-8 h-8 text-[hsl(var(--lotus-pink))]" /></div>
        <h1 className="text-2xl font-bold text-foreground">💕 Relationship Goals</h1>
        <p className="text-sm text-muted-foreground">Nurture your most important connections</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <textarea value={newGoal} onChange={e => setNewGoal(e.target.value)} rows={2} placeholder="What relationship goal do you want to achieve?"
          className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
        <button onClick={add} disabled={!newGoal.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--lotus-pink))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"><Plus className="w-4 h-4" /> Add Goal</button>
      </div>
      <div className="space-y-3">
        {goals.map((g, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" />{format(new Date(g.date), 'MMM dd, yyyy')}</p>
            <p className="text-sm text-foreground">{g.text}</p>
          </div>
        ))}
        {goals.length === 0 && <p className="text-center text-sm text-muted-foreground">No goals yet. Start nurturing your relationships. 💕</p>}
      </div>
      <p className="text-[10px] text-center text-muted-foreground">Saved locally. Cloud sync coming soon 🙏</p>
    </div>
  );
}
