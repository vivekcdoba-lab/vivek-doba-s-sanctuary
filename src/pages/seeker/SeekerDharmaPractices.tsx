import { useState, useEffect } from 'react';
import { BackToHome } from '@/components/BackToHome';
import { Sunrise, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const DEFAULT_PRACTICES = [
  { id: '1', name: 'Morning Prayer / Mantra', emoji: '🙏' },
  { id: '2', name: 'Read Sacred Text (10 min)', emoji: '📖' },
  { id: '3', name: 'Gratitude Practice', emoji: '🌟' },
  { id: '4', name: 'Acts of Service / Seva', emoji: '🤲' },
  { id: '5', name: 'Evening Reflection', emoji: '🌙' },
  { id: '6', name: 'Live by Values Today', emoji: '💎' },
];

const STORAGE_KEY = 'seeker_dharma_practices';

export default function SeekerDharmaPractices() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${today}`);
      if (data) setCompleted(JSON.parse(data));
    } catch {}
  }, [today]);

  const toggle = (id: string) => {
    const updated = { ...completed, [id]: !completed[id] };
    setCompleted(updated);
    localStorage.setItem(`${STORAGE_KEY}_${today}`, JSON.stringify(updated));
    if (!completed[id]) toast({ title: '✅ Practice completed!' });
  };

  const doneCount = Object.values(completed).filter(Boolean).length;
  const total = DEFAULT_PRACTICES.length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--dharma-green))]/10 flex items-center justify-center mx-auto">
          <Sunrise className="w-8 h-8 text-[hsl(var(--dharma-green))]" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">🙏 Daily Practices</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-4 text-center">
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="hsl(var(--dharma-green))" strokeWidth="3"
              strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{doneCount}/{total}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{pct === 100 ? '🎉 All practices complete!' : `${pct}% complete`}</p>
      </div>

      {/* Practices list */}
      <div className="space-y-2">
        {DEFAULT_PRACTICES.map(p => (
          <button key={p.id} onClick={() => toggle(p.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${completed[p.id] ? 'bg-[hsl(var(--dharma-green))]/5 border-[hsl(var(--dharma-green))]/30' : 'bg-card border-border hover:border-primary/20'}`}>
            {completed[p.id] ? (
              <CheckCircle className="w-5 h-5 text-[hsl(var(--dharma-green))] flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-lg">{p.emoji}</span>
            <span className={`text-sm font-medium ${completed[p.id] ? 'text-[hsl(var(--dharma-green))] line-through' : 'text-foreground'}`}>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
