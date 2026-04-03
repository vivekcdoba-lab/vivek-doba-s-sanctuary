import { useState, useEffect, useCallback, useRef } from 'react';
import { Pause, Play, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import BackToHome from '@/components/BackToHome';
import { Slider } from '@/components/ui/slider';
import {
  SOUND_LIBRARY, MOOD_PRESETS, playSound, stopSound, stopAll, playPreset, playCompletionBell,
  playClick, playBreathTone, setVolume, type SoundId,
} from '@/lib/sacredAudioEngine';
import { useAudioStore } from '@/store/audioStore';
import { supabase } from '@/integrations/supabase/client';
import { EqBars } from '@/components/SacredMusicPlayer';

const breathingPatterns = [
  { name: '4-4 Calm', inhale: 4, hold: 0, exhale: 4 },
  { name: '4-7-8 Relaxing', inhale: 4, hold: 7, exhale: 8 },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4 },
];

const TIMER_SOUNDS: (SoundId | 'silent')[] = ['silent', 'om-drone', 'tibetan-bowl', 'forest-rain', 'river-flow', 'binaural-alpha', 'deep-space', 'krishna-flute'];
const TIMER_SOUND_LABELS: Record<string, string> = {
  silent: '🔕', 'om-drone': '🕉️', 'tibetan-bowl': '🔔', 'forest-rain': '🌧️',
  'river-flow': '🌊', 'binaural-alpha': '🧠', 'deep-space': '🌌', 'krishna-flute': '🪈',
};

const BELL_INTERVALS = [0, 5, 10, 15];

const BREATH_BG_SOUNDS: (SoundId | 'silent')[] = ['silent', 'om-drone', 'forest-rain', 'river-flow'];

const MANTRA_SOUNDS: (SoundId | 'silent')[] = ['silent', 'om-drone', 'singing-bowl', 'krishna-flute'];

const SacredSpace = () => {
  // ─── Meditation Timer ───
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerSound, setTimerSound] = useState<SoundId | 'silent'>(() =>
    (localStorage.getItem('vdts-timer-sound') as SoundId | 'silent') || 'silent'
  );
  const [bellInterval, setBellInterval] = useState(0);
  const [timerComplete, setTimerComplete] = useState(false);
  const bellRef = useRef<ReturnType<typeof setInterval>>();

  // ─── Breathing ───
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold-empty'>('inhale');
  const [breathScale, setBreathScale] = useState(1);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [breathTotal, setBreathTotal] = useState(10);
  const [breathBgSound, setBreathBgSound] = useState<SoundId | 'silent'>('silent');
  const breathPhaseRef = useRef<ReturnType<typeof setTimeout>>();

  // ─── Mantra / Japa ───
  const [mantra, setMantra] = useState("ॐ नमः शिवाय");
  const [editingMantra, setEditingMantra] = useState(false);
  const [mantraSound, setMantraSound] = useState<SoundId | 'silent'>('silent');
  const [japaCount, setJapaCount] = useState(0);
  const [malaCount, setMalaCount] = useState(0);
  const [japaComplete, setJapaComplete] = useState(false);

  const { playing, setPlaying, addPlaying, removePlaying } = useAudioStore();

  // ═══ Meditation Timer Logic ═══
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setTimerComplete(true);
          // Stop timer sound, play completion bell
          if (timerSound !== 'silent') {
            stopSound(timerSound);
            removePlaying(timerSound);
          }
          playCompletionBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timerSound, removePlaying]);

  // Bell interval
  useEffect(() => {
    if (bellRef.current) clearInterval(bellRef.current);
    if (isRunning && bellInterval > 0) {
      bellRef.current = setInterval(() => {
        playCompletionBell();
      }, bellInterval * 60 * 1000);
    }
    return () => { if (bellRef.current) clearInterval(bellRef.current); };
  }, [isRunning, bellInterval]);

  const startTimer = (mins: number) => {
    setTimerMinutes(mins);
    setSecondsLeft(mins * 60);
    setTimerComplete(false);
    setIsRunning(true);
    if (timerSound !== 'silent') {
      playSound(timerSound);
      addPlaying(timerSound);
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerSound !== 'silent') { stopSound(timerSound); removePlaying(timerSound); }
    } else if (secondsLeft > 0) {
      setIsRunning(true);
      setTimerComplete(false);
      if (timerSound !== 'silent') { playSound(timerSound); addPlaying(timerSound); }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(timerMinutes * 60);
    setTimerComplete(false);
    if (timerSound !== 'silent') { stopSound(timerSound); removePlaying(timerSound); }
  };

  useEffect(() => {
    localStorage.setItem('vdts-timer-sound', timerSound);
  }, [timerSound]);

  // ═══ Breathing Logic ═══
  const runBreathCycle = useCallback(() => {
    if (!breathRunning) return;
    const pat = breathingPatterns[selectedPattern];
    const totalPhases = pat.hold > 0 ? ['inhale', 'hold', 'exhale'] : ['inhale', 'exhale'];

    let idx = 0;
    const nextPhase = () => {
      if (!breathRunning) return;
      const phase = totalPhases[idx] as 'inhale' | 'hold' | 'exhale';
      setBreathPhase(phase);
      const dur = phase === 'inhale' ? pat.inhale : phase === 'hold' ? pat.hold : pat.exhale;
      setBreathScale(phase === 'inhale' ? 1.4 : phase === 'exhale' ? 1 : 1.2);

      if (phase !== 'hold' || dur > 0) {
        playBreathTone(phase === 'hold' ? 'hold' : phase, dur);
      }
      if (phase === 'inhale') {
        playClick(); // soft tick on new breath
        setBreathCount(c => c + 1);
      }

      idx++;
      if (idx < totalPhases.length) {
        breathPhaseRef.current = setTimeout(nextPhase, dur * 1000);
      } else {
        breathPhaseRef.current = setTimeout(() => runBreathCycle(), dur * 1000);
      }
    };
    nextPhase();
  }, [breathRunning, selectedPattern]);

  useEffect(() => {
    if (breathRunning) {
      setBreathCount(0);
      if (breathBgSound !== 'silent') { playSound(breathBgSound, 0.3); addPlaying(breathBgSound); }
      runBreathCycle();
    } else {
      if (breathPhaseRef.current) clearTimeout(breathPhaseRef.current);
      if (breathBgSound !== 'silent') { stopSound(breathBgSound); removePlaying(breathBgSound); }
    }
    return () => { if (breathPhaseRef.current) clearTimeout(breathPhaseRef.current); };
  }, [breathRunning]);

  // ═══ Japa Counter ═══
  const handleJapaTap = () => {
    if (japaComplete) return;
    playClick();
    const next = japaCount + 1;
    setJapaCount(next);
    if (next >= 108) {
      const newMala = malaCount + 1;
      setMalaCount(newMala);
      setJapaComplete(true);
      playCompletionBell();
      saveJapa(newMala, next);
    }
  };

  const resetJapa = () => {
    setJapaCount(0);
    setJapaComplete(false);
  };

  const saveJapa = async (malas: number, total: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (!profile) return;
      const today = new Date().toISOString().split('T')[0];
      await (supabase.from('japa_log') as any).upsert({
        seeker_id: profile.id,
        log_date: today,
        mantra_text: mantra,
        mala_count: malas,
        total_count: total,
      }, { onConflict: 'seeker_id,log_date' });
    } catch {}
  };

  // Mantra sound toggle
  useEffect(() => {
    return () => {
      if (mantraSound !== 'silent') { stopSound(mantraSound); removePlaying(mantraSound); }
    };
  }, []);

  const toggleMantraSound = (id: SoundId | 'silent') => {
    if (mantraSound !== 'silent') { stopSound(mantraSound); removePlaying(mantraSound); }
    setMantraSound(id);
    if (id !== 'silent') { playSound(id, 0.3); addPlaying(id); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const japaProgress = (japaCount / 108) * 100;

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto" style={{ background: 'linear-gradient(180deg, hsl(252 60% 11%), hsl(260 50% 8%))' }}>
      <BackToHome light />
      {/* Header */}
      <div className="text-center pt-4">
        <Sparkles className="w-8 h-8 text-gold mx-auto mb-2" />
        <h1 className="text-xl font-bold text-primary-foreground">Sacred Space</h1>
        <p className="text-sm text-primary-foreground/50">Your sanctuary of peace</p>
      </div>

      {/* ═══ MEDITATION TIMER ═══ */}
      <div className="glass-card p-6 text-center">
        <p className="text-sm font-semibold text-primary mb-3">Meditation Timer</p>

        {/* Sound selector */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-3">
          {TIMER_SOUNDS.map(id => (
            <button key={id} onClick={() => setTimerSound(id)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${timerSound === id ? 'bg-primary shadow-md shadow-primary/30 scale-110' : 'bg-primary-foreground/10 hover:bg-primary-foreground/20'}`}>
              {TIMER_SOUND_LABELS[id]}
            </button>
          ))}
        </div>

        {/* Bell interval */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-[10px] text-primary-foreground/50">Bell every:</span>
          {BELL_INTERVALS.map(m => (
            <button key={m} onClick={() => setBellInterval(m)}
              className={`px-2 py-0.5 rounded text-[10px] ${bellInterval === m ? 'bg-primary text-primary-foreground' : 'bg-primary-foreground/10 text-primary-foreground/50'}`}>
              {m === 0 ? 'Off' : `${m}m`}
            </button>
          ))}
        </div>

        {/* Timer ring */}
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

        {timerComplete && (
          <p className="text-sm text-gold-bright mb-3 animate-pulse">🙏 Jai Shriram — Teri Sadhana Poori Hui</p>
        )}

        <div className="flex justify-center gap-2 mb-4">
          {[5, 10, 15, 20].map((m) => (
            <button key={m} onClick={() => startTimer(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timerMinutes === m && !isRunning ? 'bg-primary text-primary-foreground' : 'bg-primary-foreground/10 text-primary-foreground/60 hover:bg-primary-foreground/20'}`}>
              {m} min
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={toggleTimer} className="w-12 h-12 rounded-full gradient-chakravartin flex items-center justify-center">
            {isRunning ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground" />}
          </button>
          <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-primary-foreground/60" />
          </button>
        </div>
      </div>

      {/* ═══ BREATHING EXERCISE ═══ */}
      <div className="glass-card p-6 text-center">
        <p className="text-sm font-semibold text-primary mb-3">Breathing Exercise</p>
        <div className="flex gap-2 justify-center mb-3">
          {breathingPatterns.map((p, i) => (
            <button key={p.name} onClick={() => setSelectedPattern(i)}
              className={`px-3 py-1 rounded-full text-xs ${selectedPattern === i ? 'bg-primary text-primary-foreground' : 'bg-primary-foreground/10 text-primary-foreground/60'}`}>
              {p.name}
            </button>
          ))}
        </div>

        {/* BG sound toggle */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          {BREATH_BG_SOUNDS.map(id => (
            <button key={id} onClick={() => setBreathBgSound(id)}
              className={`px-2 py-1 rounded-lg text-xs ${breathBgSound === id ? 'bg-primary/30 text-primary' : 'text-primary-foreground/40 hover:text-primary-foreground/60'}`}>
              {TIMER_SOUND_LABELS[id] || '🔕'}
            </button>
          ))}
        </div>

        <div className="w-32 h-32 mx-auto rounded-full border-2 border-primary/40 flex items-center justify-center mb-3"
          style={{ transform: `scale(${breathScale})`, transition: `transform ${breathingPatterns[selectedPattern].inhale}s ease-in-out` }}>
          <span className="text-primary-foreground text-sm font-medium capitalize">{breathPhase.replace('-', ' ')}</span>
        </div>

        {breathRunning && (
          <p className="text-xs text-primary-foreground/50 mb-2">Breath {breathCount} of {breathTotal}</p>
        )}

        <button onClick={() => setBreathRunning(!breathRunning)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${breathRunning ? 'bg-destructive/80 text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
          {breathRunning ? 'Stop' : 'Start Breathing'}
        </button>
      </div>

      {/* ═══ MY MANTRA + JAPA COUNTER ═══ */}
      <div className="glass-card p-6 text-center">
        <p className="text-sm font-semibold text-primary mb-3">My Mantra</p>
        {editingMantra ? (
          <div className="flex gap-2 justify-center mb-3">
            <input value={mantra} onChange={e => setMantra(e.target.value)}
              className="bg-primary-foreground/10 text-primary-foreground text-center rounded-lg px-3 py-1 text-lg w-56" />
            <button onClick={() => setEditingMantra(false)} className="text-xs text-primary">Done</button>
          </div>
        ) : (
          <p className="text-3xl font-devanagari text-gold-bright font-bold mb-1">{mantra}</p>
        )}
        <button onClick={() => setEditingMantra(!editingMantra)} className="text-xs text-primary-foreground/40 hover:text-primary-foreground/60 mb-3 block mx-auto">
          {editingMantra ? '' : 'Edit Mantra'}
        </button>

        {/* Mantra sound */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span className="text-[10px] text-primary-foreground/40">Chant with:</span>
          {MANTRA_SOUNDS.map(id => (
            <button key={id} onClick={() => toggleMantraSound(id)}
              className={`px-2 py-1 rounded-lg text-xs ${mantraSound === id ? 'bg-primary/30 text-primary' : 'text-primary-foreground/40'}`}>
              {TIMER_SOUND_LABELS[id] || '🔕'}
            </button>
          ))}
        </div>

        {/* Japa Counter */}
        <div className="relative w-36 h-36 mx-auto mb-3">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(36 87% 48%)" strokeWidth="5"
              strokeDasharray="283" strokeDashoffset={283 - (283 * japaProgress / 100)}
              strokeLinecap="round" transform="rotate(-90 50 50)" className="transition-all duration-300" />
          </svg>
          <button onClick={handleJapaTap}
            className="absolute inset-3 rounded-full bg-primary-foreground/5 hover:bg-primary-foreground/10 flex flex-col items-center justify-center active:scale-95 transition-transform">
            <span className="text-2xl font-bold text-primary-foreground">{japaCount}</span>
            <span className="text-[10px] text-primary-foreground/50">/ 108</span>
          </button>
        </div>

        {japaComplete && (
          <div className="mb-3">
            <p className="text-sm text-gold-bright animate-pulse">🔱 Ek Mala Poori! Jai Shriram!</p>
            <div className="flex gap-2 justify-center mt-2">
              <button onClick={resetJapa} className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-lg">Next Mala</button>
              <button onClick={() => { resetJapa(); setMalaCount(0); }} className="text-xs bg-primary-foreground/10 text-primary-foreground/60 px-3 py-1 rounded-lg">Stop</button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-primary-foreground/30">Malas today: {malaCount} • Tap center to count</p>
      </div>

      {/* ═══ SACRED SOUND LIBRARY ═══ */}
      <div className="glass-card p-5">
        <p className="text-sm font-semibold text-primary mb-1">🎵 Sacred Sound Library</p>
        <p className="text-[10px] text-primary-foreground/40 mb-4">Nada Brahma — The Universe is Sound</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {SOUND_LIBRARY.map(s => {
            const active = playing.includes(s.id);
            return (
              <button key={s.id} onClick={() => {
                if (active) { stopSound(s.id); removePlaying(s.id); }
                else { playSound(s.id); addPlaying(s.id); }
              }}
                className={`relative rounded-xl p-3 text-center transition-all border-2 ${active ? 'border-primary bg-primary/10 shadow-md shadow-primary/20' : 'border-primary-foreground/10 bg-primary-foreground/5 hover:bg-primary-foreground/10'}`}>
                {active && <EqBars className="absolute top-1 right-1" />}
                <span className="text-2xl block">{s.emoji}</span>
                <p className="text-xs font-medium text-primary-foreground mt-1">{s.name}</p>
                <p className="text-[10px] text-primary-foreground/40">{s.frequency}</p>
                <p className="text-[10px] text-primary-foreground/40">{s.duration}</p>
              </button>
            );
          })}
        </div>

        {/* Mood Mixer */}
        <p className="text-xs font-semibold text-primary-foreground mb-2">🎭 Mood Mixer</p>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(MOOD_PRESETS).map(([key, p]) => (
            <button key={key} onClick={() => {
              playPreset(key);
              setPlaying(p.sounds.map(s => s.id));
            }}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-foreground/10 text-primary-foreground/60 hover:bg-primary/20 hover:text-primary transition-colors">
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
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
