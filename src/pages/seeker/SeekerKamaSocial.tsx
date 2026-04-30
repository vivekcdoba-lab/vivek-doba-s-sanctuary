import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Users, Plus, Target, Smile, Globe, Star, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { formatDateDMY } from "@/lib/dateFormat";

const STORAGE_KEY = 'seeker_kama_social';
const QUOTES = [
  '"Alone we can do so little; together we can do so much." — Helen Keller',
  '"संगठन में शक्ति है।" — Unity is Strength',
  '"The quality of your life is the quality of your relationships." — Tony Robbins',
];

type SocialEntry = { date: string; person: string; quality: number; type: string; note: string };
type SocialGoal = { id: string; goal: string; done: boolean };

const FRIEND_TYPES = ['Close Friend', 'Colleague', 'Mentor', 'Community', 'Neighbour', 'Other'];

export default function SeekerKamaSocial() {
  const [entries, setEntries] = useState<SocialEntry[]>([]);
  const [goals, setGoals] = useState<SocialGoal[]>([]);
  const [person, setPerson] = useState('');
  const [quality, setQuality] = useState(7);
  const [type, setType] = useState('Close Friend');
  const [note, setNote] = useState('');
  const [goalText, setGoalText] = useState('');
  const [tab, setTab] = useState<'tracker' | 'goals'>('tracker');

  useEffect(() => {
    try { const d = localStorage.getItem(STORAGE_KEY); if (d) { const p = JSON.parse(d); setEntries(p.entries || []); setGoals(p.goals || []); } } catch {}
  }, []);
  const save = (e: SocialEntry[], g: SocialGoal[]) => { setEntries(e); setGoals(g); localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: e, goals: g })); };

  const addEntry = () => {
    if (!person.trim()) return;
    save([{ date: new Date().toISOString(), person: person.trim(), quality, type, note: note.trim() }, ...entries], goals);
    setPerson(''); setQuality(7); setNote('');
    toast({ title: '🤝 Social check-in saved!' });
  };

  const addGoal = () => {
    if (!goalText.trim()) return;
    save(entries, [...goals, { id: Date.now().toString(), goal: goalText.trim(), done: false }]);
    setGoalText('');
  };

  const toggleGoal = (id: string) => save(entries, goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
  const avgQuality = entries.length ? (entries.reduce((s, e) => s + e.quality, 0) / entries.length).toFixed(1) : '—';
  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--lotus-pink))]/10 flex items-center justify-center mx-auto"><Globe className="w-8 h-8 text-[hsl(var(--lotus-pink))]" /></div>
        <h1 className="text-2xl font-bold text-foreground">🤝 Social Life</h1>
        <p className="text-sm text-muted-foreground">Nurture meaningful connections</p>
      </div>

      {/* Quote */}
      <div className="bg-[hsl(var(--lotus-pink))]/5 border border-[hsl(var(--lotus-pink))]/20 rounded-xl p-4 text-center">
        <p className="text-sm italic text-muted-foreground">{quote}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-[hsl(var(--lotus-pink))]">{entries.length}</p>
          <p className="text-[10px] text-muted-foreground">Check-ins</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-[hsl(var(--lotus-pink))]">{avgQuality}</p>
          <p className="text-[10px] text-muted-foreground">Avg Quality</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-[hsl(var(--lotus-pink))]">{goals.filter(g => g.done).length}/{goals.length}</p>
          <p className="text-[10px] text-muted-foreground">Goals Done</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('tracker')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'tracker' ? 'bg-[hsl(var(--lotus-pink))] text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Users className="w-4 h-4 inline mr-1" /> Tracker
        </button>
        <button onClick={() => setTab('goals')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'goals' ? 'bg-[hsl(var(--lotus-pink))] text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Target className="w-4 h-4 inline mr-1" /> Goals
        </button>
      </div>

      {tab === 'tracker' ? (
        <>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <input value={person} onChange={e => setPerson(e.target.value)} placeholder="Person / Group name" className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
            <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg border border-border bg-background p-3 text-sm">
              {FRIEND_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <div>
              <label className="text-xs text-muted-foreground">Friendship Quality: {quality}/10</label>
              <input type="range" min={1} max={10} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-[hsl(var(--lotus-pink))]" />
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="How was this interaction?" className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
            <button onClick={addEntry} disabled={!person.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--lotus-pink))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"><Plus className="w-4 h-4" /> Log Interaction</button>
          </div>
          <div className="space-y-3">
            {entries.map((e, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1"><Heart className="w-3 h-3 text-[hsl(var(--lotus-pink))]" />{e.person}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[hsl(var(--lotus-pink))]/10 text-[hsl(var(--lotus-pink))] px-2 py-0.5 rounded-full">{e.type}</span>
                    <span className="text-xs font-medium text-[hsl(var(--lotus-pink))]">{e.quality}/10</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">{formatDateDMY(new Date(e.date))}</p>
                {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
              </div>
            ))}
            {entries.length === 0 && <p className="text-center text-sm text-muted-foreground">No interactions logged yet. Start connecting! 🌐</p>}
          </div>
        </>
      ) : (
        <>
          <div className="bg-card rounded-xl border border-border p-4 flex gap-2">
            <input value={goalText} onChange={e => setGoalText(e.target.value)} placeholder="e.g. Call 2 friends weekly" className="flex-1 rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
            <button onClick={addGoal} disabled={!goalText.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--lotus-pink))] text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            {goals.map(g => (
              <button key={g.id} onClick={() => toggleGoal(g.id)} className={`w-full text-left bg-card rounded-xl border border-border p-4 flex items-center gap-3 transition-opacity ${g.done ? 'opacity-60' : ''}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${g.done ? 'bg-[hsl(var(--lotus-pink))] border-[hsl(var(--lotus-pink))]' : 'border-border'}`}>
                  {g.done && <Star className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className={`text-sm ${g.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{g.goal}</span>
              </button>
            ))}
            {goals.length === 0 && <p className="text-center text-sm text-muted-foreground">Set social goals to strengthen your community bonds 🎯</p>}
          </div>
        </>
      )}
    </div>
  );
}
