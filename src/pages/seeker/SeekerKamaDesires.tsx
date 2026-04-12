import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Sparkles, Plus, Scale, TrendingUp, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'seeker_kama_desires';
const QUOTES = [
  '"He who is not contented with what he has, would not be contented with what he would like to have." — Socrates',
  '"इच्छाओं को वश में करो, तो शांति स्वयं आएगी।" — Vedic Wisdom',
  '"Desire is the root of all suffering, but also the seed of all achievement."',
];

type DesireEntry = { id: string; desire: string; category: 'healthy' | 'unhealthy'; intensity: number; note: string; date: string };
type MaterialGoal = { id: string; goal: string; target: string; progress: number };

const CATEGORIES = [
  { value: 'healthy' as const, label: '🌿 Healthy', color: 'text-green-600 bg-green-500/10' },
  { value: 'unhealthy' as const, label: '⚠️ Unhealthy', color: 'text-red-500 bg-red-500/10' },
];

export default function SeekerKamaDesires() {
  const [entries, setEntries] = useState<DesireEntry[]>([]);
  const [materialGoals, setMaterialGoals] = useState<MaterialGoal[]>([]);
  const [desire, setDesire] = useState('');
  const [category, setCategory] = useState<'healthy' | 'unhealthy'>('healthy');
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [goalText, setGoalText] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [tab, setTab] = useState<'inventory' | 'balance' | 'goals'>('inventory');

  useEffect(() => {
    try { const d = localStorage.getItem(STORAGE_KEY); if (d) { const p = JSON.parse(d); setEntries(p.entries || []); setMaterialGoals(p.goals || []); } } catch {}
  }, []);
  const save = (e: DesireEntry[], g: MaterialGoal[]) => { setEntries(e); setMaterialGoals(g); localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: e, goals: g })); };

  const addEntry = () => {
    if (!desire.trim()) return;
    save([{ id: Date.now().toString(), desire: desire.trim(), category, intensity, note: note.trim(), date: new Date().toISOString() }, ...entries], materialGoals);
    setDesire(''); setIntensity(5); setNote('');
    toast({ title: '✨ Desire logged for reflection' });
  };

  const addGoal = () => {
    if (!goalText.trim()) return;
    save(entries, [...materialGoals, { id: Date.now().toString(), goal: goalText.trim(), target: goalTarget.trim(), progress: 0 }]);
    setGoalText(''); setGoalTarget('');
  };

  const updateProgress = (id: string, progress: number) => save(entries, materialGoals.map(g => g.id === id ? { ...g, progress } : g));

  const healthy = entries.filter(e => e.category === 'healthy');
  const unhealthy = entries.filter(e => e.category === 'unhealthy');
  const satisfactionIndex = entries.length ? Math.round((healthy.length / entries.length) * 100) : 0;
  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--lotus-pink))]/10 flex items-center justify-center mx-auto"><Sparkles className="w-8 h-8 text-[hsl(var(--lotus-pink))]" /></div>
        <h1 className="text-2xl font-bold text-foreground">✨ Desires & Satisfaction</h1>
        <p className="text-sm text-muted-foreground">Understand your desires, find balance</p>
      </div>

      <div className="bg-[hsl(var(--lotus-pink))]/5 border border-[hsl(var(--lotus-pink))]/20 rounded-xl p-4 text-center">
        <p className="text-sm italic text-muted-foreground">{quote}</p>
      </div>

      {/* Satisfaction Index */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Satisfaction Index</span>
          <span className="text-lg font-bold text-[hsl(var(--lotus-pink))]">{satisfactionIndex}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-[hsl(var(--lotus-pink))] to-[hsl(var(--lotus-pink))]/60 transition-all" style={{ width: `${satisfactionIndex}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Healthy: {healthy.length}</span>
          <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" /> Unhealthy: {unhealthy.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['inventory', 'balance', 'goals'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-[hsl(var(--lotus-pink))] text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>
        ))}
      </div>

      {tab === 'inventory' && (
        <>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <input value={desire} onChange={e => setDesire(e.target.value)} placeholder="What do you desire?" className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
            <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setCategory(c.value)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${category === c.value ? c.color + ' ring-2 ring-offset-1 ring-current' : 'bg-muted text-muted-foreground'}`}>{c.label}</button>
              ))}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Intensity: {intensity}/10</label>
              <input type="range" min={1} max={10} value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full accent-[hsl(var(--lotus-pink))]" />
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Reflect on this desire..." className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
            <button onClick={addEntry} disabled={!desire.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--lotus-pink))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"><Plus className="w-4 h-4" /> Log Desire</button>
          </div>
          <div className="space-y-3">
            {entries.map(e => (
              <div key={e.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{e.desire}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.category === 'healthy' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>{e.category === 'healthy' ? '🌿 Healthy' : '⚠️ Unhealthy'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                  <span>{format(new Date(e.date), 'MMM dd')}</span>
                  <span>Intensity: {e.intensity}/10</span>
                </div>
                {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
              </div>
            ))}
            {entries.length === 0 && <p className="text-center text-sm text-muted-foreground">Start your desire inventory for self-awareness 🪷</p>}
          </div>
        </>
      )}

      {tab === 'balance' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <Scale className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--lotus-pink))]" />
            <h3 className="font-semibold mb-2">Pleasure–Pain Balance</h3>
            <div className="flex justify-center gap-8">
              <div><p className="text-3xl font-bold text-green-600">{healthy.length}</p><p className="text-xs text-muted-foreground">Pleasure (Healthy)</p></div>
              <div className="w-px bg-border" />
              <div><p className="text-3xl font-bold text-red-400">{unhealthy.length}</p><p className="text-xs text-muted-foreground">Pain (Unhealthy)</p></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Aim for 80%+ healthy desires for a balanced Kama pillar</p>
          </div>
          {entries.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-sm font-medium mb-3">Intensity Distribution</h4>
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => {
                  const lvl = 10 - i;
                  const count = entries.filter(e => e.intensity === lvl).length;
                  return count > 0 ? (
                    <div key={lvl} className="flex items-center gap-2">
                      <span className="text-xs w-4 text-right text-muted-foreground">{lvl}</span>
                      <div className="flex-1 bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-[hsl(var(--lotus-pink))]" style={{ width: `${(count / entries.length) * 100}%` }} /></div>
                      <span className="text-xs text-muted-foreground w-4">{count}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'goals' && (
        <>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <input value={goalText} onChange={e => setGoalText(e.target.value)} placeholder="Material goal (e.g. Buy a home)" className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
            <input value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="Target (e.g. ₹50L by Dec 2026)" className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lotus-pink))]/30" />
            <button onClick={addGoal} disabled={!goalText.trim()} className="px-4 py-2 rounded-lg bg-[hsl(var(--lotus-pink))] text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"><Plus className="w-4 h-4" /> Add Goal</button>
          </div>
          <div className="space-y-3">
            {materialGoals.map(g => (
              <div key={g.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{g.goal}</span>
                  <span className="text-xs font-bold text-[hsl(var(--lotus-pink))]">{g.progress}%</span>
                </div>
                {g.target && <p className="text-[10px] text-muted-foreground mb-2">Target: {g.target}</p>}
                <input type="range" min={0} max={100} value={g.progress} onChange={e => updateProgress(g.id, Number(e.target.value))} className="w-full accent-[hsl(var(--lotus-pink))]" />
              </div>
            ))}
            {materialGoals.length === 0 && <p className="text-center text-sm text-muted-foreground">Set material goals mindfully 🎯</p>}
          </div>
        </>
      )}
    </div>
  );
}
