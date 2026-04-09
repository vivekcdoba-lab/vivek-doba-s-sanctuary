import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { BookOpen, Plus, Calendar, Compass } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type Entry = { date: string; text: string };
const STORAGE_KEY = 'seeker_moksha_journal';

export default function SeekerMokshaJournal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntry, setNewEntry] = useState('');

  useEffect(() => { try { const d = localStorage.getItem(STORAGE_KEY); if (d) setEntries(JSON.parse(d)); } catch {} }, []);

  const add = () => {
    if (!newEntry.trim()) return;
    const updated = [{ date: new Date().toISOString(), text: newEntry.trim() }, ...entries];
    setEntries(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); setNewEntry('');
    toast({ title: '🌅 Journal entry added!' });
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--wisdom-purple))]/10 flex items-center justify-center mx-auto"><BookOpen className="w-8 h-8 text-[hsl(var(--wisdom-purple))]" /></div>
        <h1 className="text-2xl font-bold text-foreground">🌅 Inner Peace Journal</h1>
        <p className="text-sm text-muted-foreground">Cultivate stillness and awareness</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <textarea value={newEntry} onChange={e => setNewEntry(e.target.value)} rows={3} placeholder="What brought me peace today? What am I grateful for letting go?"
          className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wisdom-purple))]/30" />
        <button onClick={add} disabled={!newEntry.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--wisdom-purple))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"><Plus className="w-4 h-4" /> Add Entry</button>
      </div>
      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-2"><Calendar className="w-3 h-3" />{format(new Date(e.date), 'MMM dd, yyyy – hh:mm a')}</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{e.text}</p>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-sm text-muted-foreground">Begin your inner peace journey. ☮️</p>}
      </div>
    </div>
  );
}
