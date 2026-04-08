import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Save, Send, Clock, Sun, Sunrise, Coffee, Briefcase, Moon, Star } from 'lucide-react';
import BackToHome from '@/components/BackToHome';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface TimePhase {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  timeRange: string;
  color: string;
  startHour: number;
  endHour: number;
  content: React.ReactNode;
}

const SeekerDailyLog = () => {
  const { toast } = useToast();
  const currentHour = new Date().getHours();
  const today = new Date();
  const dayNumber = Math.floor((today.getTime() - new Date('2024-08-15').getTime()) / 86400000);

  // Determine which phase to auto-open based on current time
  const getActivePhase = () => {
    if (currentHour >= 3 && currentHour < 9) return 'brahma-morning';
    if (currentHour >= 9 && currentHour < 12) return 'peak-focus';
    if (currentHour >= 12 && currentHour < 15) return 'midday';
    if (currentHour >= 15 && currentHour < 19) return 'afternoon';
    if (currentHour >= 19 && currentHour < 23) return 'evening';
    return 'night';
  };

  const [openSections, setOpenSections] = useState<string[]>([getActivePhase()]);

  // Morning Sadhana state
  const [wakeTime, setWakeTime] = useState('05:30');
  const [moodScore, setMoodScore] = useState(7);
  const [energyScore, setEnergyScore] = useState(8);
  const [gratitudes, setGratitudes] = useState(['', '', '']);
  const [morningChecks, setMorningChecks] = useState<Record<string, boolean>>({});
  const [affirmationCount, setAffirmationCount] = useState(3);
  const [dayRating, setDayRating] = useState(0);
  const [bodyScores, setBodyScores] = useState<Record<string, number>>({});
  const [flexibleNotes, setFlexibleNotes] = useState<Record<string, string>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleCheck = (key: string) => {
    setMorningChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setBodyScore = (key: string, val: number) => {
    setBodyScores(prev => ({ ...prev, [key]: val }));
  };

  const CheckItem = ({ label, id }: { label: string; id: string }) => (
    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer py-1">
      <input type="checkbox" checked={morningChecks[id] || false} onChange={() => toggleCheck(id)} className="accent-primary w-4 h-4 rounded" />
      <span className={morningChecks[id] ? 'line-through text-muted-foreground' : ''}>{label}</span>
    </label>
  );

  const ScoreSlider = ({ label, field, icon }: { label: string; field: string; icon?: string }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground w-32">{icon && <span className="mr-1">{icon}</span>}{label}</span>
      <input type="range" min="1" max="10" value={bodyScores[field] || 7} onChange={(e) => setBodyScore(field, +e.target.value)} className="flex-1 accent-primary" />
      <span className="text-sm font-semibold text-primary w-10 text-right">{bodyScores[field] || 7}/10</span>
    </div>
  );

  const FlexibleTimeBlock = ({ phaseId }: { phaseId: string }) => (
    <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-dashed border-border">
      <p className="text-xs font-semibold text-muted-foreground mb-2">🕐 Flexible / Custom Activity</p>
      <Input placeholder="What else did you do in this time?" className="mb-2" value={flexibleNotes[`${phaseId}-activity`] || ''} onChange={(e) => setFlexibleNotes(p => ({ ...p, [`${phaseId}-activity`]: e.target.value }))} />
      <Textarea placeholder="Notes or details..." rows={2} value={flexibleNotes[`${phaseId}-notes`] || ''} onChange={(e) => setFlexibleNotes(p => ({ ...p, [`${phaseId}-notes`]: e.target.value }))} />
    </div>
  );

  // Calculate completion
  const totalItems = 35;
  const completedItems = Object.values(morningChecks).filter(Boolean).length + (dayRating > 0 ? 1 : 0) + gratitudes.filter(g => g.trim()).length;
  const completionPercent = Math.round((completedItems / totalItems) * 100);

  const phases: TimePhase[] = [
    {
      id: 'brahma-morning',
      title: '🌅 Brahma Muhurta & Morning Sadhana',
      subtitle: 'Sacred awakening · Mandatory rituals',
      icon: '🌅',
      timeRange: '3:00 AM – 9:00 AM',
      color: 'bg-gradient-to-r from-amber-500 to-orange-500',
      startHour: 3,
      endHour: 9,
      content: (
        <div className="space-y-4">
          {/* Wake Time */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
            <div>
              <p className="text-sm font-semibold text-foreground">⏰ Wake Time</p>
              <p className="text-xs text-muted-foreground">Brahma Muhurta ideal: before 5:30 AM</p>
            </div>
            <Input type="time" className="w-28" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
          </div>

          {/* Mandatory Morning Rituals */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🙏 Mandatory Morning Rituals</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <CheckItem label="Brahma Muhurta Wake-Up" id="brahma-wake" />
              <CheckItem label="Puja / Aarti / Archana" id="puja" />
              <CheckItem label="Meditation (Dhyana) – 20 min" id="meditation" />
              <CheckItem label="Pranayama / Breathing" id="pranayama" />
              <CheckItem label="Mantra Chanting / Japa" id="japa" />
              <CheckItem label="Prayer / Prarthana" id="prayer" />
              <CheckItem label="Yoga Asanas / Exercise" id="exercise" />
              <CheckItem label="Cold Shower / Hydrotherapy" id="cold-shower" />
              <CheckItem label="No screen first 30 min" id="no-screen" />
              <CheckItem label="Water intake (2+ glasses)" id="water" />
            </div>
          </div>

          {/* Gratitudes */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🙏 Morning Gratitudes</p>
            {gratitudes.map((g, i) => (
              <Input key={i} placeholder={`Grateful for... #${i + 1}`} className="mb-1.5" value={g} onChange={(e) => { const n = [...gratitudes]; n[i] = e.target.value; setGratitudes(n); }} />
            ))}
          </div>

          {/* Morning Affirmations */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">✨ Morning Affirmations</p>
            <div className="glass-card p-3 border border-primary/20 mb-2">
              <p className="text-sm italic text-foreground">"I am a divine being on a sacred journey of transformation."</p>
              <p className="text-xs text-muted-foreground mt-1">"मी एक दिव्य व्यक्ती आहे, परिवर्तनाच्या पवित्र प्रवासावर."</p>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-foreground">Times repeated:</span>
              <Input type="number" value={affirmationCount} onChange={(e) => setAffirmationCount(+e.target.value)} className="w-16" min="0" />
            </div>
            <Textarea placeholder="I am..." rows={2} className="mb-1.5" />
            <Textarea placeholder="I attract..." rows={2} className="mb-1.5" />
            <CheckItem label="Sankalp (Daily intention) written" id="sankalp" />
          </div>

          {/* Mood & Energy */}
          <div className="p-3 rounded-lg bg-card border border-border space-y-3">
            <p className="text-sm font-semibold text-foreground">🎯 Morning Check-In</p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground w-20">Mood</span>
              <input type="range" min="1" max="10" value={moodScore} onChange={(e) => setMoodScore(+e.target.value)} className="flex-1 accent-primary" />
              <span className="text-sm font-semibold text-primary">{moodScore}/10</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground w-20">Energy</span>
              <input type="range" min="1" max="10" value={energyScore} onChange={(e) => setEnergyScore(+e.target.value)} className="flex-1 accent-primary" />
              <span className="text-sm font-semibold text-primary">{energyScore}/10</span>
            </div>
          </div>

          {/* Healthy Breakfast & Reading */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🍳 Morning Nourishment & Learning</p>
            <CheckItem label="Healthy Breakfast eaten" id="breakfast" />
            <CheckItem label="Read / Listen to something uplifting" id="reading" />
            <CheckItem label="Journaling / Reflection done" id="journaling" />
            <CheckItem label="Visualization / Sankalp Shakti" id="visualization" />
          </div>

          <FlexibleTimeBlock phaseId="brahma-morning" />
        </div>
      ),
    },
    {
      id: 'peak-focus',
      title: '☀️ Peak Focus & Deep Work',
      subtitle: 'Maximum productivity · Artha & Dharma',
      icon: '☀️',
      timeRange: '9:00 AM – 12:00 PM',
      color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      startHour: 9,
      endHour: 12,
      content: (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">💼 Work & Business (Artha)</p>
            <CheckItem label="Deep Work / Focus Block started" id="deep-work" />
            <CheckItem label="Top Priority #1 tackled" id="priority1" />
            <CheckItem label="Client Calls / Meetings done" id="client-calls" />
            <CheckItem label="Sales / Follow-up completed" id="sales" />
            <Input placeholder="Top priority task for today..." className="mt-2" />
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">📚 Learning & Growth (Dharma)</p>
            <CheckItem label="Course / Webinar / Skill work" id="learning" />
            <CheckItem label="LGT Worksheet started" id="lgt-worksheet" />
            <Textarea placeholder="Key learning focus today..." rows={2} />
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">📋 Assignment & Coaching</p>
            <div className="bg-muted/50 rounded-lg p-3 mb-2">
              <p className="text-sm font-medium text-foreground">Today's Assignment: Vision Board Creation</p>
              <p className="text-xs text-muted-foreground">Due: 05/04/2025</p>
            </div>
            <CheckItem label="Completed today's assignment" id="assignment-done" />
            <Textarea placeholder="Key learning from assignment..." rows={2} />
          </div>

          <div className="p-3 rounded-lg bg-card border border-border space-y-2">
            <p className="text-sm font-semibold text-foreground">⚡ Mid-Morning Energy</p>
            <ScoreSlider label="Focus" field="focus-morning" icon="🎯" />
            <ScoreSlider label="Productivity" field="productivity-morning" icon="📈" />
          </div>

          <FlexibleTimeBlock phaseId="peak-focus" />
        </div>
      ),
    },
    {
      id: 'midday',
      title: '🍽️ Midday Nourishment & Reset',
      subtitle: 'Refuel body & mind',
      icon: '🍽️',
      timeRange: '12:00 PM – 3:00 PM',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      startHour: 12,
      endHour: 15,
      content: (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🍛 Lunch & Health</p>
            <CheckItem label="Healthy Lunch taken" id="lunch" />
            <CheckItem label="Water intake on track" id="water-midday" />
            <CheckItem label="Supplements / Vitamins taken" id="supplements" />
            <CheckItem label="Short Walk / Stretch after lunch" id="post-lunch-walk" />
            <CheckItem label="Power Nap (15-20 min)" id="power-nap" />
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">💰 Financial Check (Artha)</p>
            <CheckItem label="Money review done" id="money-review" />
            <CheckItem label="Invoice / Admin cleared" id="admin-cleared" />
            <Input placeholder="Income earned today (₹)..." className="mb-1.5" />
            <Input placeholder="Expenses today (₹)..." />
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🔄 Afternoon Reset</p>
            <CheckItem label="Afternoon Chai / Snack (mindful)" id="chai" />
            <CheckItem label="Email & Communication cleared" id="email" />
            <Textarea placeholder="AHA moment so far today! 💡" rows={2} />
          </div>

          <FlexibleTimeBlock phaseId="midday" />
        </div>
      ),
    },
    {
      id: 'afternoon',
      title: '🌤️ Afternoon Flow & Relationships',
      subtitle: 'Kama · Connections · Creative work',
      icon: '🌤️',
      timeRange: '3:00 PM – 7:00 PM',
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      startHour: 15,
      endHour: 19,
      content: (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">💼 Continued Work & Meetings</p>
            <CheckItem label="Follow-up calls / Networking" id="follow-up" />
            <CheckItem label="Content Creation / Marketing" id="content" />
            <CheckItem label="Business Development" id="biz-dev" />
            <CheckItem label="LGT Coaching Session attended" id="coaching-session" />
            <Textarea placeholder="Meeting notes / outcomes..." rows={2} />
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">👨‍👩‍👧 Relationships & Kama</p>
            <CheckItem label="Quality family time" id="family-time" />
            <CheckItem label="Children / Parenting time" id="children" />
            <CheckItem label="Friends / Social connection" id="friends" />
            <CheckItem label="Community / Seva" id="community" />
            <CheckItem label="Hobby / Creative expression" id="hobby" />
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🏃 Afternoon Body Care</p>
            <CheckItem label="Evening workout / Sports" id="evening-workout" />
            <CheckItem label="Walk / Outdoor activity" id="walk" />
            <ScoreSlider label="Energy" field="energy-afternoon" icon="⚡" />
          </div>

          <FlexibleTimeBlock phaseId="afternoon" />
        </div>
      ),
    },
    {
      id: 'evening',
      title: '🌙 Evening Reflection & Wind-Down',
      subtitle: 'Gratitude · Wins · Self-assessment',
      icon: '🌙',
      timeRange: '7:00 PM – 11:00 PM',
      color: 'bg-gradient-to-r from-violet-500 to-purple-600',
      startHour: 19,
      endHour: 23,
      content: (
        <div className="space-y-4">
          {/* Evening Aarti */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🙏 Evening Rituals</p>
            <CheckItem label="Evening Aarti / Prayer" id="evening-aarti" />
            <CheckItem label="Dinner (mindful eating)" id="dinner" />
            <CheckItem label="Digital Detox started" id="digital-detox" />
            <CheckItem label="Self-Love Ritual / Mirror Work" id="self-love" />
            <CheckItem label="Gratitude Journaling" id="gratitude-journal" />
          </div>

          {/* Wins */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🏆 Today's Wins (Aaj Ki Jeet)</p>
            {[1, 2, 3].map((i) => <Input key={i} placeholder={`Win #${i}`} className="mb-1.5" />)}
          </div>

          {/* Evening Gratitudes */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🙏 Evening Gratitudes</p>
            {[1, 2, 3, 4, 5].map((i) => <Input key={i} placeholder={`Evening Gratitude #${i}`} className="mb-1.5" />)}
            <Textarea placeholder="Acts of kindness / Seva today..." rows={2} className="mt-1" />
          </div>

          {/* Body-Mind-Soul Assessment */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-3">🧘 Body-Mind-Soul Self-Rating</p>
            {[
              { label: 'BODY 🏋️', bg: 'bg-orange-50 dark:bg-orange-900/10', items: ['Health', 'Exercise', 'Water Intake', 'Sleep Quality'] },
              { label: 'MIND 🧠', bg: 'bg-blue-50 dark:bg-blue-900/10', items: ['Clarity', 'Focus', 'Stress Level', 'Creativity'] },
              { label: 'SOUL 🕉️', bg: 'bg-violet-50 dark:bg-violet-900/10', items: ['Inner Peace', 'Spiritual Practice', 'Dharma Alignment', 'Gratitude'] },
            ].map((section) => (
              <div key={section.label} className={`${section.bg} rounded-lg p-3 mb-2`}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{section.label}</p>
                {section.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-foreground w-28">{item}</span>
                    <input type="range" min="1" max="10" value={bodyScores[`${section.label}-${item}`] || 7} onChange={(e) => setBodyScore(`${section.label}-${item}`, +e.target.value)} className="flex-1 accent-primary" />
                    <span className="text-xs font-medium text-primary w-8 text-right">{bodyScores[`${section.label}-${item}`] || 7}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Reflection */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">📝 Evening Reflection</p>
            <Textarea placeholder="How was your day overall?" rows={3} className="mb-2" />
            <Textarea placeholder="Biggest challenge today..." rows={2} className="mb-2" />
            <Textarea placeholder="Limiting belief identified + replacement..." rows={2} className="mb-2" />
            <Textarea placeholder="AHA moment! 💡" rows={2} />
          </div>

          {/* Purusharthas */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🕉️ Purusharthas Reflection</p>
            {[
              { name: 'Dharma', color: 'text-orange-600 dark:text-orange-400', emoji: '🟠' },
              { name: 'Artha', color: 'text-yellow-600 dark:text-yellow-400', emoji: '💛' },
              { name: 'Kama', color: 'text-pink-600 dark:text-pink-400', emoji: '🩷' },
              { name: 'Moksha', color: 'text-violet-600 dark:text-violet-400', emoji: '🟣' },
            ].map((p) => (
              <div key={p.name} className="mb-2">
                <p className={`text-sm font-semibold ${p.color}`}>{p.emoji} {p.name}</p>
                <Textarea placeholder={`${p.name} reflection...`} rows={2} className="mt-1" />
              </div>
            ))}
          </div>

          {/* Tomorrow Prep */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🎯 Tomorrow's Preparation</p>
            {[1, 2, 3].map((i) => <Input key={i} placeholder={`Tomorrow Priority #${i}`} className="mb-1.5" />)}
            <CheckItem label="Clothes / bag prepared" id="prep-clothes" />
            <CheckItem label="Alarm set for Brahma Muhurta" id="prep-alarm" />
          </div>

          {/* Day Rating */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">⭐ Day Rating</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-foreground">Overall:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setDayRating(s)} className={`text-2xl transition-transform hover:scale-110 ${s <= dayRating ? '' : 'opacity-30'}`}>⭐</button>
              ))}
            </div>
            <Input placeholder="Day in one word..." />
          </div>

          <FlexibleTimeBlock phaseId="evening" />
        </div>
      ),
    },
    {
      id: 'night',
      title: '🌑 Night Rest & Sleep',
      subtitle: 'Recovery · Yoga Nidra · Deep sleep',
      icon: '🌑',
      timeRange: '11:00 PM – 3:00 AM',
      color: 'bg-gradient-to-r from-indigo-800 to-slate-900',
      startHour: 23,
      endHour: 3,
      content: (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">😴 Sleep Preparation</p>
            <CheckItem label="All screens off" id="screens-off" />
            <CheckItem label="Yoga Nidra / Relaxation" id="yoga-nidra" />
            <CheckItem label="Silent Sitting / Contemplation" id="contemplation" />
            <CheckItem label="Sleep Preparation complete" id="sleep-prep" />
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🛏️ Sleep Tracking</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sleep Time</p>
                <Input type="time" defaultValue="22:30" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Wake</p>
                <Input type="time" defaultValue="05:00" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">Sleep Quality</span>
              <input type="range" min="1" max="10" value={bodyScores['sleep-quality'] || 7} onChange={(e) => setBodyScore('sleep-quality', +e.target.value)} className="flex-1 accent-primary" />
              <span className="text-sm font-semibold text-primary">{bodyScores['sleep-quality'] || 7}/10</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-sm font-semibold text-foreground mb-2">🌟 Last Thought of the Day</p>
            <Textarea placeholder="One positive thought before sleep..." rows={2} />
          </div>

          <FlexibleTimeBlock phaseId="night" />
        </div>
      ),
    },
  ];

  // Progress bar always visible
  const isAvailable = (phase: TimePhase) => {
    // Night phase wraps around midnight
    if (phase.id === 'night') return currentHour >= 23 || currentHour < 3;
    return true; // All phases always visible
  };

  const isCurrentPhase = (phase: TimePhase) => {
    if (phase.id === 'night') return currentHour >= 23 || currentHour < 3;
    return currentHour >= phase.startHour && currentHour < phase.endHour;
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <BackToHome />

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Daily Transformation Log</h1>
        <p className="text-sm text-muted-foreground">
          {today.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })} · Day {dayNumber} · <span className="text-green-600 dark:text-green-400">Auto-saved ✓</span>
        </p>
      </div>

      {/* Overall Progress */}
      <div className="p-3 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">📊 Today's Completion</span>
          <span className="text-sm font-bold text-primary">{completionPercent}%</span>
        </div>
        <Progress value={completionPercent} className="h-2.5" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{completedItems} of {totalItems} items done</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Current: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Time Phases */}
      <div className="space-y-2">
        {phases.map((phase) => {
          const isCurrent = isCurrentPhase(phase);
          return (
            <div key={phase.id} className={`bg-card rounded-xl border overflow-hidden ${isCurrent ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
              <button onClick={() => toggleSection(phase.id)} className={`w-full flex items-center justify-between p-4 ${phase.color} text-white`}>
                <div className="text-left">
                  <span className="font-semibold text-sm block">{phase.title}</span>
                  <span className="text-xs opacity-80">{phase.timeRange} · {phase.subtitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrent && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">NOW</span>}
                  {openSections.includes(phase.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {openSections.includes(phase.id) && <div className="p-4">{phase.content}</div>}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pb-8">
        <button onClick={() => toast({ title: 'Draft saved! 🙏' })} className="flex-1 py-3 rounded-xl border border-primary text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
          <Save className="w-4 h-4" /> Save Draft
        </button>
        <button onClick={() => toast({ title: 'Log submitted! Keep growing! 🌟' })} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Send className="w-4 h-4" /> Submit Log
        </button>
      </div>
    </div>
  );
};

export default SeekerDailyLog;
