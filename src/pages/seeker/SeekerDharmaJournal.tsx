import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { BookOpen, Plus, Calendar, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type Entry = { date: string; text: string };
const STORAGE_KEY = 'seeker_dharma_journal';

export default function SeekerDharmaJournal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntry, setNewEntry] = useState('');

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setEntries(JSON.parse(data));
    } catch {}
  }, []);

  const addEntry = () => {
    if (!newEntry.trim()) return;
    const updated = [{ date: new Date().toISOString(), text: newEntry.trim() }, ...entries];
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewEntry('');
    toast({ title: '📖 Journal entry added!' });
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--dharma-green))]/10 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8 text-[hsl(var(--dharma-green))]" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">📖 Dharma Journal</h1>
        <p className="text-sm text-muted-foreground">Reflect on your purpose and alignment</p>
      </div>

      {/* New entry */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <label className="text-sm font-semibold text-foreground">Today's Dharma Reflection</label>
        <textarea value={newEntry} onChange={e => setNewEntry(e.target.value)} rows={3}
          placeholder="How did I live my purpose today? What aligned with my values?"
          className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--dharma-green))]/30" />
        <button onClick={addEntry} disabled={!newEntry.trim()}
          className="px-4 py-2 rounded-lg bg-[hsl(var(--dharma-green))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Past entries */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Past Reflections ({entries.length})</h3>
        {entries.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
            No journal entries yet. Start reflecting on your Dharma today. 🙏
          </div>
        ) : entries.map((e, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
              <Calendar className="w-3 h-3" />{format(new Date(e.date), 'MMM dd, yyyy – hh:mm a')}
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
