import { useState } from 'react';
import { Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

const breathingPatterns = [
  { name: '4-4 Calm', inhale: 4, hold: 0, exhale: 4 },
  { name: '4-7-8 Relaxing', inhale: 4, hold: 7, exhale: 8 },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4 },
];

const SacredSpace = () => {
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(timerMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathScale, setBreathScale] = useState(1);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [mantra, setMantra] = useState("ॐ नमः शिवाय");

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { setIsRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const startTimer = (mins: number) => { setTimerMinutes(mins); setSecondsLeft(mins * 60); setIsRunning(true); };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto" style={{ background: 'linear-gradient(180deg, hsl(252 60% 11%), hsl(260 50% 8%))' }}>
      {/* Header */}
      <div className="text-center pt-4">
        <Sparkles className="w-8 h-8 text-gold mx-auto mb-2" />
        <h1 className="text-xl font-bold text-primary-foreground">Sacred Space</h1>
        <p className="text-sm text-primary-foreground/50">Your sanctuary of peace</p>
      </div>

      {/* Meditation Timer */}
      <div className="glass-card p-6 text-center">
        <p className="text-sm font-semibold text-primary mb-4">Meditation Timer</p>
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(36 87% 38%)" strokeWidth="4"
              strokeDasharray="283" strokeDashoffset={283 - (283 * (1 - secondsLeft / (timerMinutes * 60)))}
              strokeLinecap="round" transform="rotate(-90 50 50)" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-foreground">{formatTime(secondsLeft)}</span>
          </div>
        </div>
        <div className="flex justify-center gap-2 mb-4">
          {[5, 10, 15, 20].map((m) => (
            <button key={m} onClick={() => startTimer(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timerMinutes === m && !isRunning ? 'bg-primary text-primary-foreground' : 'bg-primary-foreground/10 text-primary-foreground/60 hover:bg-primary-foreground/20'}`}>{m} min</button>
          ))}
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={() => setIsRunning(!isRunning)} className="w-12 h-12 rounded-full gradient-chakravartin flex items-center justify-center">
            {isRunning ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground" />}
          </button>
          <button onClick={() => { setIsRunning(false); setSecondsLeft(timerMinutes * 60); }} className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-primary-foreground/60" />
          </button>
        </div>
      </div>

      {/* Breathing Exercise */}
      <div className="glass-card p-6 text-center">
        <p className="text-sm font-semibold text-primary mb-3">Breathing Exercise</p>
        <div className="flex gap-2 justify-center mb-4">
          {breathingPatterns.map((p, i) => (
            <button key={p.name} onClick={() => setSelectedPattern(i)} className={`px-3 py-1 rounded-full text-xs ${selectedPattern === i ? 'bg-primary text-primary-foreground' : 'bg-primary-foreground/10 text-primary-foreground/60'}`}>{p.name}</button>
          ))}
        </div>
        <div className="w-32 h-32 mx-auto rounded-full border-2 border-primary/40 flex items-center justify-center" style={{ transform: `scale(${breathScale})`, transition: 'transform 4s ease-in-out' }}>
          <span className="text-primary-foreground text-sm font-medium capitalize">{breathPhase}</span>
        </div>
      </div>

      {/* My Mantra */}
      <div className="glass-card p-6 text-center">
        <p className="text-sm font-semibold text-primary mb-3">My Mantra</p>
        <p className="text-3xl font-devanagari text-gold-bright font-bold">{mantra}</p>
        <button className="mt-3 text-xs text-primary-foreground/40 hover:text-primary-foreground/60">Edit Mantra</button>
      </div>

      {/* Guided Practices */}
      <div className="glass-card p-5">
        <p className="text-sm font-semibold text-primary mb-3">Guided Practices</p>
        <div className="space-y-2">
          {[
            { name: 'Morning Sadhana', duration: '10 min', emoji: '🌅' },
            { name: 'Gratitude Meditation', duration: '5 min', emoji: '🙏' },
            { name: 'Dharma Reflection', duration: '7 min', emoji: '🕉️' },
            { name: 'Evening Wind-down', duration: '10 min', emoji: '🌙' },
          ].map((p) => (
            <button key={p.name} className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-colors text-left">
              <span className="text-xl">{p.emoji}</span>
              <div className="flex-1"><p className="text-sm font-medium text-primary-foreground">{p.name}</p><p className="text-xs text-primary-foreground/40">{p.duration}</p></div>
              <Play className="w-4 h-4 text-primary" />
            </button>
          ))}
        </div>
      </div>

      <div className="text-center pb-20">
        <span className="text-6xl text-primary-foreground/5">ॐ</span>
      </div>
    </div>
  );
};

export default SacredSpace;
