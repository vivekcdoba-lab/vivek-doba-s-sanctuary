import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Brain, Plus, BookOpen, Eye, Feather, Sparkles, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'seeker_moksha_consciousness';
const QUOTES = [
  '"You are not a drop in the ocean. You are the entire ocean in a drop." — Rumi',
  '"अहं ब्रह्मास्मि" — I am the Infinite (Brihadaranyaka Upanishad)',
  '"The mind is everything. What you think, you become." — Buddha',
  '"तत्त्वमसि — Thou art That" — Chandogya Upanishad',
];

type JournalEntry = { id: string; date: string; type: 'awareness' | 'ego' | 'reading' | 'teaching'; title: string; content: string; level: number };

const ENTRY_TYPES = [
  { value: 'awareness' as const, label: '👁️ Awareness', icon: Eye },
  { value: 'ego' as const, label: '🪷 Ego Work', icon: Sun },
  { value: 'reading' as const, label: '📖 Reading', icon: BookOpen },
  { value: 'teaching' as const, label: '🙏 Guru Notes', icon: Sparkles },
];

const CONSCIOUSNESS_LEVELS = [
  { level: 1, name: 'Mūlādhāra', label: 'Survival', color: 'bg-red-500' },
  { level: 2, name: 'Svādhiṣṭhāna', label: 'Desire', color: 'bg-orange-500' },
  { level: 3, name: 'Maṇipūra', label: 'Willpower', color: 'bg-yellow-500' },
  { level: 4, name: 'Anāhata', label: 'Love', color: 'bg-green-500' },
  { level: 5, name: 'Viśuddha', label: 'Truth', color: 'bg-sky-500' },
  { level: 6, name: 'Ājñā', label: 'Insight', color: 'bg-indigo-500' },
  { level: 7, name: 'Sahasrāra', label: 'Unity', color: 'bg-purple-600' },
];

export default function SeekerMokshaConsciousness() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [type, setType] = useState<JournalEntry['type']>('awareness');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState(4);
  const [tab, setTab] = useState<'journal' | 'evolution' | 'exercises'>('journal');

  useEffect(() => { try { const d = localStorage.getItem(STORAGE_KEY); if (d) setEntries(JSON.parse(d)); } catch {} }, []);
  const save = (e: JournalEntry[]) => { setEntries(e); localStorage.setItem(STORAGE_KEY, JSON.stringify(e)); };

  const addEntry = () => {
    if (!title.trim()) return;
    save([{ id: Date.now().toString(), date: new Date().toISOString(), type, title: title.trim(), content: content.trim(), level }, ...entries]);
    setTitle(''); setContent('');
    toast({ title: '🕉️ Journal entry saved' });
  };

  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];
  const avgLevel = entries.length ? (entries.reduce((s, e) => s + e.level, 0) / entries.length).toFixed(1) : '—';
  const typeCount = (t: string) => entries.filter(e => e.type === t).length;

  const EGO_EXERCISES = [
    { title: 'Observer Meditation', desc: 'Sit quietly for 10 min. Watch your thoughts without engaging. Notice the gap between "I" and thoughts.' },
    { title: 'Identity Inquiry', desc: 'Ask "Who am I?" repeatedly. Each answer, ask "Who observes this?" Go deeper each time.' },
    { title: 'Surrender Practice', desc: 'Choose one outcome today that you release attachment to. Write it down and let it go.' },
    { title: 'Gratitude Dissolves Ego', desc: 'List 5 things you received today that you did nothing to earn. Feel the grace.' },
    { title: 'Mirror Journaling', desc: 'Write about a recent conflict. Now rewrite it from the other person\'s perspective completely.' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--wisdom-purple))]/10 flex items-center justify-center mx-auto"><Brain className="w-8 h-8 text-[hsl(var(--wisdom-purple))]" /></div>
        <h1 className="text-2xl font-bold text-foreground">🕉️ Consciousness Evolution</h1>
        <p className="text-sm text-muted-foreground">Track your spiritual growth and awareness</p>
      </div>

      <div className="bg-[hsl(var(--wisdom-purple))]/5 border border-[hsl(var(--wisdom-purple))]/20 rounded-xl p-4 text-center">
        <p className="text-sm italic text-muted-foreground">{quote}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {ENTRY_TYPES.map(t => (
          <div key={t.value} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold text-[hsl(var(--wisdom-purple))]">{typeCount(t.value)}</p>
            <p className="text-[9px] text-muted-foreground">{t.label.split(' ')[1]}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['journal', 'evolution', 'exercises'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-[hsl(var(--wisdom-purple))] text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>
        ))}
      </div>

      {tab === 'journal' && (
        <>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {ENTRY_TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)} className={`py-2 rounded-lg text-xs font-medium transition-colors ${type === t.value ? 'bg-[hsl(var(--wisdom-purple))]/15 text-[hsl(var(--wisdom-purple))] ring-1 ring-[hsl(var(--wisdom-purple))]/30' : 'bg-muted text-muted-foreground'}`}>{t.label}</button>
              ))}
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title / Book / Teaching" className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wisdom-purple))]/30" />
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Your reflections, insights, learnings..." className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--wisdom-purple))]/30" />
            <div>
              <label className="text-xs text-muted-foreground">Consciousness Level: {level} — {CONSCIOUSNESS_LEVELS[level - 1]?.name}</label>
              <input type="range" min={1} max={7} value={level} onChange={e => setLevel(Number(e.target.value))} className="w-full accent-[hsl(var(--wisdom-purple))]" />
              <div className="flex justify-between text-[8px] text-muted-foreground">
                <span>Survival</span><span>Unity</span>
              </div>
            </div>
            <button onClick={addEntry} disabled={!title.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--wisdom-purple))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"><Feather className="w-4 h-4" /> Save Entry</button>
          </div>
          <div className="space-y-3">
            {entries.map(e => {
              const typeInfo = ENTRY_TYPES.find(t => t.value === e.type) || ENTRY_TYPES[0];
              const levelInfo = CONSCIOUSNESS_LEVELS[e.level - 1];
              return (
                <div key={e.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{e.title}</span>
                    <span className="text-[10px] bg-[hsl(var(--wisdom-purple))]/10 text-[hsl(var(--wisdom-purple))] px-2 py-0.5 rounded-full">{typeInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                    <span>{format(new Date(e.date), 'MMM dd, yyyy')}</span>
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${levelInfo?.color || 'bg-muted'}`} />
                      {levelInfo?.name} ({levelInfo?.label})
                    </span>
                  </div>
                  {e.content && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{e.content}</p>}
                </div>
              );
            })}
            {entries.length === 0 && <p className="text-center text-sm text-muted-foreground">Begin your consciousness journal 🧘</p>}
          </div>
        </>
      )}

      {tab === 'evolution' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Average Consciousness Level</p>
            <p className="text-4xl font-bold text-[hsl(var(--wisdom-purple))]">{avgLevel}</p>
            {entries.length > 0 && <p className="text-xs text-muted-foreground mt-1">{CONSCIOUSNESS_LEVELS[Math.round(Number(avgLevel)) - 1]?.name}</p>}
          </div>
          {/* Chakra ladder */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="text-sm font-medium mb-4">Chakra Evolution Ladder</h4>
            <div className="space-y-2">
              {[...CONSCIOUSNESS_LEVELS].reverse().map(cl => {
                const count = entries.filter(e => e.level === cl.level).length;
                return (
                  <div key={cl.level} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${cl.color}`} />
                    <span className="text-xs w-24">{cl.name}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${cl.color} transition-all`} style={{ width: entries.length ? `${(count / entries.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'exercises' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Daily exercises to dissolve ego and expand awareness:</p>
          {EGO_EXERCISES.map((ex, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-1"><Sun className="w-4 h-4 text-[hsl(var(--wisdom-purple))]" />{ex.title}</h4>
              <p className="text-xs text-muted-foreground">{ex.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
