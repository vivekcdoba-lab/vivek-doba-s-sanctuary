import { useState, useEffect } from 'react';
import { X, Volume2, Play, Pause, SkipForward, Shuffle, Timer } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  SOUND_LIBRARY, MOOD_PRESETS, playSound, stopSound, stopAll, playPreset,
  setVolume, type SoundId, type SoundMeta,
} from '@/lib/sacredAudioEngine';
import { useAudioStore } from '@/store/audioStore';

const categories = [
  { key: 'sacred', label: '🕉️ Sacred' },
  { key: 'nature', label: '🌿 Nature' },
  { key: 'binaural', label: '🧠 Binaural' },
  { key: 'music', label: '🎵 Music' },
];

const TIMER_OPTIONS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '∞', minutes: null as number | null },
];

export default function SacredMusicPlayer({ onClose }: { onClose: () => void }) {
  const { playing, masterVolume, activePreset, sleepTimerEnd, lastPreset,
    setMasterVolume, addPlaying, removePlaying, setPlaying, setActivePreset,
    setSleepTimer, setSleepTimerEnd } = useAudioStore();
  const [tab, setTab] = useState('sacred');
  const [mixMode, setMixMode] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState('');

  // Sleep timer countdown
  useEffect(() => {
    if (!sleepTimerEnd) { setTimerDisplay(''); return; }
    const interval = setInterval(() => {
      const remaining = sleepTimerEnd - Date.now();
      if (remaining <= 0) {
        stopAll();
        setPlaying([]);
        setActivePreset(null);
        setSleepTimer(null);
        setSleepTimerEnd(null);
        setTimerDisplay('');
      } else {
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setTimerDisplay(`${m}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd, setPlaying, setActivePreset, setSleepTimer, setSleepTimerEnd]);

  const toggle = (id: SoundId) => {
    if (playing.includes(id)) {
      stopSound(id);
      removePlaying(id);
      setActivePreset(null);
    } else {
      if (!mixMode) { stopAll(); setPlaying([]); }
      playSound(id, masterVolume);
      addPlaying(id);
      setActivePreset(null);
    }
  };

  const handlePreset = (key: string) => {
    playPreset(key);
    const preset = MOOD_PRESETS[key];
    setPlaying(preset.sounds.map(s => s.id));
    setActivePreset(key);
  };

  const handleVolume = (v: number[]) => {
    const vol = v[0] / 100;
    setMasterVolume(vol);
    playing.forEach(id => setVolume(id, vol));
  };

  const startTimer = (minutes: number | null) => {
    if (minutes === null) {
      setSleepTimer(null);
      setSleepTimerEnd(null);
    } else {
      setSleepTimer(minutes);
      setSleepTimerEnd(Date.now() + minutes * 60000);
    }
    setShowTimer(false);
  };

  const filtered = SOUND_LIBRARY.filter(s => s.category === tab);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl w-80 max-h-[520px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {playing.length > 0 && <EqBars />}
          <span className="text-sm font-semibold text-foreground">
            {playing.length > 0
              ? SOUND_LIBRARY.filter(s => playing.includes(s.id)).map(s => s.name).join(' + ')
              : 'Sacred Sounds'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {timerDisplay && <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">⏱ {timerDisplay}</span>}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-2 border-b border-border">
        {categories.map(c => (
          <button key={c.key} onClick={() => setTab(c.key)}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${tab === c.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Sound grid */}
      <div className="grid grid-cols-2 gap-2 p-2">
        {filtered.map(s => {
          const active = playing.includes(s.id);
          return (
            <button key={s.id} onClick={() => toggle(s.id)}
              className={`relative rounded-xl p-3 text-center transition-all border-2 ${active ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-card hover:bg-muted'}`}>
              {active && <EqBars className="absolute top-1 right-1" />}
              <span className="text-2xl block">{s.emoji}</span>
              <p className="text-xs font-medium text-foreground mt-1">{s.name}</p>
              <p className="text-[10px] text-muted-foreground">{s.frequency}</p>
              <p className="text-[10px] text-muted-foreground">{s.duration}</p>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider value={[masterVolume * 100]} onValueChange={handleVolume} max={100} step={1} className="flex-1" />
          <span className="text-xs text-muted-foreground w-8">{Math.round(masterVolume * 100)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => setMixMode(!mixMode)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${mixMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <Shuffle className="w-3 h-3" /> Mix
            </button>
            <button onClick={() => setShowTimer(!showTimer)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${sleepTimerEnd ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <Timer className="w-3 h-3" /> Timer
            </button>
          </div>
          <button onClick={() => { stopAll(); setPlaying([]); setActivePreset(null); setSleepTimer(null); setSleepTimerEnd(null); }}
            className="text-xs text-destructive hover:underline">Stop All</button>
        </div>
        {showTimer && (
          <div className="flex gap-1 bg-muted/30 rounded-lg p-2">
            {TIMER_OPTIONS.map(opt => (
              <button key={opt.label} onClick={() => startTimer(opt.minutes)}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                  (opt.minutes === null && !sleepTimerEnd) || false
                    ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mood Presets */}
      <div className="p-3 border-t border-border">
        <p className="text-xs font-semibold text-foreground mb-2">🎭 Mood Mixer</p>
        <div className="flex gap-1 flex-wrap">
          {Object.entries(MOOD_PRESETS).map(([key, p]) => (
            <button key={key} onClick={() => handlePreset(key)}
              className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${activePreset === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
        {lastPreset && !activePreset && (
          <button onClick={() => handlePreset(lastPreset)} className="mt-2 text-[10px] text-primary hover:underline">
            ↩ Resume: {MOOD_PRESETS[lastPreset]?.emoji} {MOOD_PRESETS[lastPreset]?.label}
          </button>
        )}
      </div>

      {playing.some(id => id === 'binaural-alpha') && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-muted-foreground bg-muted rounded-lg p-2">🎧 Use headphones for best binaural effect</p>
        </div>
      )}
    </div>
  );
}

export function EqBars({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-end gap-[2px] h-3 ${className}`}>
      {[1, 2, 3].map(i => (
        <div key={i} className="w-[3px] bg-primary rounded-full animate-pulse"
          style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }} />
      ))}
    </div>
  );
}
