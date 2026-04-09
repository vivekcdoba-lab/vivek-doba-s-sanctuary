import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Users, Plus, Calendar, Smile, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type Entry = { date: string; person: string; score: number; note: string };
const STORAGE_KEY = 'seeker_kama_family';

export default function SeekerKamaFamily() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [person, setPerson] = useState('');
  const [score, setScore] = useState(7);
  const [note, setNote] = useState('');

  useEffect(() => { try { const d = localStorage.getItem(STORAGE_KEY); if (d) setEntries(JSON.parse(d)); } catch {} }, []);

  const add = () => {
    if (!person.trim()) return;
    const updated = [{ date: new Date().toISOString(), person: person.trim(), score, note: note.trim() }, ...entries];
    setEntries(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPerson(''); setScore(7); setNote('');
    toast({ title: '👨‍👩‍👧‍👦 Family check-in saved!' });
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--lotus-pink))]/10 flex items-center justify-center mx-auto"><Users className="w-8 h-8 text-[hsl(var(--lotus-pink))]" /></div>
        <h1 className="text-2xl font-bold text-foreground">👨‍👩‍👧‍👦 Family Harmony</h1>
        <p className="text-sm text-muted-foreground">Track and nurture your family relationships</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <input value={person} onChange={e => setPerson(e.target.value)} placeholder="Family member name" className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
        <div>
          <label className="text-xs text-muted-foreground">Harmony Score: {score}/10</label>
          <input type="range" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))} className="w-full accent-[hsl(var(--lotus-pink))]" />
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="What's going well? What needs attention?" className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
        <button onClick={add} disabled={!person.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--lotus-pink))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"><Plus className="w-4 h-4" /> Save Check-in</button>
      </div>
      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground flex items-center gap-1"><Heart className="w-3 h-3 text-[hsl(var(--lotus-pink))]" />{e.person}</span>
              <span className="text-xs font-medium text-[hsl(var(--lotus-pink))]">{e.score}/10</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-1">{format(new Date(e.date), 'MMM dd, yyyy')}</p>
            {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-sm text-muted-foreground">No check-ins yet. Start tracking family harmony. 🏡</p>}
      </div>
    </div>
  );
}
