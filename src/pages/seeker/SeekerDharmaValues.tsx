import { useState, useEffect } from 'react';
import { BackToHome } from '@/components/BackToHome';
import { Heart, Save, CheckCircle, X, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ALL_VALUES = [
  'Integrity', 'Courage', 'Compassion', 'Discipline', 'Gratitude', 'Humility', 'Service',
  'Wisdom', 'Truth', 'Faith', 'Patience', 'Perseverance', 'Justice', 'Love', 'Detachment',
  'Excellence', 'Creativity', 'Freedom', 'Family', 'Health', 'Loyalty', 'Respect',
  'Responsibility', 'Harmony', 'Growth', 'Generosity', 'Simplicity', 'Forgiveness',
  'Authenticity', 'Purpose', 'Inner Peace', 'Abundance',
];

const STORAGE_KEY = 'seeker_dharma_values';

export default function SeekerDharmaValues() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setSelected(JSON.parse(data));
    } catch {}
  }, []);

  const toggle = (v: string) => {
    setSelected(prev => prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 7 ? [...prev, v] : prev);
  };

  const remove = (v: string) => setSelected(prev => prev.filter(x => x !== v));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    setSaved(true);
    toast({ title: '✅ Values saved!' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--dharma-green))]/10 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 text-[hsl(var(--dharma-green))]" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">🌟 My Values</h1>
        <p className="text-sm text-muted-foreground">Select up to 7 core values that define you</p>
      </div>

      {/* Selected */}
      {selected.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold text-primary mb-3">My Top Values ({selected.length}/7)</h3>
          <div className="space-y-2">
            {selected.map((v, i) => (
              <div key={v} className="flex items-center gap-3 bg-primary/5 rounded-lg px-3 py-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{v}</span>
                <button onClick={() => remove(v)} className="p-1 hover:bg-destructive/10 rounded">
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All values */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">Choose from Dharmic Values</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_VALUES.map(v => (
            <button key={v} onClick={() => toggle(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selected.includes(v) ? 'bg-[hsl(var(--dharma-green))] text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full py-3 rounded-xl bg-[hsl(var(--dharma-green))] text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90">
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Values</>}
      </button>
      <p className="text-[10px] text-center text-muted-foreground">Saved locally. Cloud sync coming soon 🙏</p>
    </div>
  );
}
