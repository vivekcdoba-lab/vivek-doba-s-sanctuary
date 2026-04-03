import { useState } from 'react';
import { ChevronDown, ChevronUp, Save, Send } from 'lucide-react';
import BackToHome from '@/components/BackToHome';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  content: React.ReactNode;
}

const SeekerDailyLog = () => {
  const [openSections, setOpenSections] = useState<string[]>(['morning']);
  const { toast } = useToast();
  const [moodScore, setMoodScore] = useState(7);
  const [energyScore, setEnergyScore] = useState(8);
  const [gratitudes, setGratitudes] = useState(['', '', '']);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const sections: Section[] = [
    {
      id: 'morning', title: 'Morning Sadhana', icon: '🌅', color: 'gradient-saffron',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Wake Time</span><Input type="time" className="w-28" defaultValue="05:30" /></div>
          <div className="space-y-2">
            {['Meditation (20 min)', 'Prayer', 'Exercise', 'Reading', 'Journaling', 'Cold Shower'].map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm text-foreground cursor-pointer"><input type="checkbox" className="accent-primary w-4 h-4" />{p}</label>
            ))}
          </div>
          <div><p className="text-sm font-medium text-foreground mb-1">Gratitudes (3)</p>{gratitudes.map((g, i) => <Input key={i} placeholder={`Grateful for... #${i + 1}`} className="mb-1.5" value={g} onChange={(e) => { const n = [...gratitudes]; n[i] = e.target.value; setGratitudes(n); }} />)}</div>
          <div className="flex items-center gap-3"><span className="text-sm text-foreground">Mood</span><input type="range" min="1" max="10" value={moodScore} onChange={(e) => setMoodScore(+e.target.value)} className="flex-1 accent-primary" /><span className="text-sm font-semibold text-primary">{moodScore}/10</span></div>
          <div className="flex items-center gap-3"><span className="text-sm text-foreground">Energy</span><input type="range" min="1" max="10" value={energyScore} onChange={(e) => setEnergyScore(+e.target.value)} className="flex-1 accent-primary" /><span className="text-sm font-semibold text-primary">{energyScore}/10</span></div>
        </div>
      ),
    },
    {
      id: 'affirmations', title: 'Affirmations', icon: '✨', color: 'gradient-chakravartin',
      content: (
        <div className="space-y-3">
          <div className="glass-card p-3 border border-primary/20"><p className="text-sm italic text-foreground">"I am a divine being on a sacred journey of transformation."</p><p className="text-xs font-devanagari text-muted-foreground mt-1">"मी एक दिव्य व्यक्ती आहे, परिवर्तनाच्या पवित्र प्रवासावर."</p></div>
          <div className="flex items-center gap-2"><span className="text-sm text-foreground">Times repeated:</span><Input type="number" defaultValue="3" className="w-16" min="0" /></div>
          <Textarea placeholder="I am..." rows={2} />
          <Textarea placeholder="I attract..." rows={2} />
          <Textarea placeholder="Reflection on today's affirmation..." rows={3} />
        </div>
      ),
    },
    {
      id: 'learning', title: 'Assignment & Learning', icon: '📚', color: 'gradient-sacred',
      content: (
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3"><p className="text-sm font-medium text-foreground">Today's Assignment: Vision Board Creation</p><p className="text-xs text-muted-foreground">Due: 05/04/2025</p></div>
          <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" className="accent-primary w-4 h-4" />Completed today's assignment</label>
          <Textarea placeholder="Key learning from today..." rows={3} />
          <Textarea placeholder="AHA moment! 💡" rows={2} />
        </div>
      ),
    },
    {
      id: 'wins', title: 'Wins & Gratitude', icon: '🏆', color: 'gradient-growth',
      content: (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Input key={i} placeholder={`Win #${i}`} />)}
          <div className="gold-divider my-2" />
          {[1, 2, 3, 4, 5].map((i) => <Input key={i} placeholder={`Gratitude #${i}`} />)}
          <Textarea placeholder="Acts of kindness / Seva today..." rows={2} />
        </div>
      ),
    },
    {
      id: 'body-mind-soul', title: 'Body-Mind-Soul', icon: '🧘', color: 'gradient-hero',
      content: (
        <div className="space-y-4">
          {[
            { label: 'BODY', bg: 'bg-dharma-green/5', items: ['Health', 'Exercise', 'Water', 'Sleep'] },
            { label: 'MIND', bg: 'bg-sky-blue/5', items: ['Clarity', 'Focus', 'Stress', 'Creativity'] },
            { label: 'SOUL', bg: 'bg-gold/5', items: ['Inner Peace', 'Spiritual Practice', 'Dharma Alignment', 'Gratitude'] },
          ].map((section) => (
            <div key={section.label} className={`${section.bg} rounded-lg p-3`}>
              <p className="text-xs font-semibold text-muted-foreground mb-2">{section.label}</p>
              {section.items.map((item) => (
                <div key={item} className="flex items-center gap-2 mb-1.5"><span className="text-xs text-foreground w-28">{item}</span><input type="range" min="1" max="10" defaultValue="7" className="flex-1 accent-primary" /><span className="text-xs text-muted-foreground w-8">7</span></div>
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'evening', title: 'Evening Reflection', icon: '🌙', color: 'bg-wisdom-purple',
      content: (
        <div className="space-y-3">
          <Textarea placeholder="How was your day?" rows={3} />
          <Textarea placeholder="Biggest challenge today..." rows={2} />
          <Textarea placeholder="Limiting belief identified + replacement..." rows={2} />
          <div><p className="text-sm font-medium text-foreground mb-1">Tomorrow's Top 3:</p>{[1, 2, 3].map((i) => <Input key={i} placeholder={`Priority #${i}`} className="mb-1.5" />)}</div>
          <div className="flex items-center gap-2"><span className="text-sm text-foreground">Day Rating:</span>{[1, 2, 3, 4, 5].map((s) => <button key={s} className="text-xl hover:scale-110 transition-transform">⭐</button>)}</div>
          <Input placeholder="Day in one word..." />
        </div>
      ),
    },
    {
      id: 'purusharthas', title: 'Purusharthas', icon: '🕉️', color: 'gradient-maroon',
      content: (
        <div className="space-y-3">
          {[{ name: 'Dharma', color: 'text-saffron' }, { name: 'Artha', color: 'text-gold' }, { name: 'Kama', color: 'text-lotus-pink' }, { name: 'Moksha', color: 'text-wisdom-purple' }].map((p) => (
            <div key={p.name}><p className={`text-sm font-semibold ${p.color}`}>{p.name}</p><Textarea placeholder={`${p.name} reflection...`} rows={2} className="mt-1" /></div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <BackToHome />
      <div>
        <h1 className="text-xl font-bold text-foreground">Daily Transformation Log</h1>
        <p className="text-sm text-muted-foreground">31/03/2025 · Day 168 · <span className="text-dharma-green">Auto-saved ✓</span></p>
      </div>

      <div className="w-full bg-muted rounded-full h-2"><div className="gradient-growth h-2 rounded-full transition-all" style={{ width: '35%' }} /></div>

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <button onClick={() => toggleSection(section.id)} className={`w-full flex items-center justify-between p-4 ${section.color} text-primary-foreground`}>
              <span className="font-semibold text-sm">{section.icon} {section.title}</span>
              {openSections.includes(section.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.includes(section.id) && <div className="p-4">{section.content}</div>}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pb-8">
        <button onClick={() => toast({ title: 'Draft saved! 🙏' })} className="flex-1 py-3 rounded-xl border border-primary text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/5">
          <Save className="w-4 h-4" /> Save Draft
        </button>
        <button onClick={() => toast({ title: 'Log submitted! Keep growing! 🌟' })} className="flex-1 py-3 rounded-xl gradient-saffron text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90">
          <Send className="w-4 h-4" /> Submit Log
        </button>
      </div>
    </div>
  );
};

export default SeekerDailyLog;
