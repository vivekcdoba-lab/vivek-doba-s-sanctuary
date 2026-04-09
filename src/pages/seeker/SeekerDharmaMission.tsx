import { useState, useEffect } from 'react';
import { BackToHome } from '@/components/BackToHome';
import { Target, Sparkles, Save, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PROMPTS = [
  "What impact do I want to create in this world?",
  "What would I do if success was guaranteed?",
  "What problems am I most passionate about solving?",
  "What legacy do I want to leave behind?",
];

const STORAGE_KEY = 'seeker_dharma_mission';

export default function SeekerDharmaMission() {
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) { const p = JSON.parse(data); setMission(p.mission || ''); setVision(p.vision || ''); }
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mission, vision, updatedAt: new Date().toISOString() }));
    setSaved(true);
    toast({ title: '✅ Mission saved!' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--dharma-green))]/10 flex items-center justify-center mx-auto">
          <Target className="w-8 h-8 text-[hsl(var(--dharma-green))]" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">🎯 My Mission</h1>
        <p className="text-sm text-muted-foreground">Define your life's purpose with clarity</p>
      </div>

      {/* Prompts */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-xs font-semibold text-primary mb-3">💡 Reflection Prompts</h3>
        <div className="space-y-2">
          {PROMPTS.map((p, i) => (
            <p key={i} className="text-sm text-muted-foreground italic flex items-start gap-2">
              <Sparkles className="w-3 h-3 mt-1 text-primary flex-shrink-0" />{p}
            </p>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <label className="text-sm font-semibold text-foreground">My Life Mission Statement</label>
        <textarea value={mission} onChange={e => setMission(e.target.value)} rows={4} placeholder="I exist to..."
          className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Vision */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <label className="text-sm font-semibold text-foreground">My 10-Year Vision</label>
        <textarea value={vision} onChange={e => setVision(e.target.value)} rows={4} placeholder="In 10 years, I see myself..."
          className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <button onClick={handleSave}
        className="w-full py-3 rounded-xl bg-[hsl(var(--dharma-green))] text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Mission</>}
      </button>
      <p className="text-[10px] text-center text-muted-foreground">Saved locally. Cloud sync coming soon 🙏</p>
    </div>
  );
}
