import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { useAudioStore } from '@/store/audioStore';
import { SOUND_LIBRARY, playSound, stopAll, type SoundId } from '@/lib/sacredAudioEngine';
import SacredMusicPlayer, { EqBars } from './SacredMusicPlayer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const QUICK_SOUNDS: SoundId[] = ['om-drone', 'tibetan-bowl', 'forest-rain', 'river-flow', 'singing-bowl'];

export default function FloatingMusicButton() {
  const { playing, playerExpanded, setPlayerExpanded, setPlaying, addPlaying } = useAudioStore();
  const isActive = playing.length > 0;
  const [quickOpen, setQuickOpen] = useState(false);

  // Page visibility — pause/resume
  useEffect(() => {
    const handler = () => {
      // We just let audio continue — browser handles suspension
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const handleQuickPlay = (id: SoundId) => {
    stopAll();
    playSound(id);
    setPlaying([id]);
    setQuickOpen(false);
  };

  if (playerExpanded) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <SacredMusicPlayer onClose={() => setPlayerExpanded(false)} />
      </div>
    );
  }

  return (
    <Popover open={quickOpen} onOpenChange={setQuickOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                if (isActive) {
                  e.preventDefault();
                  stopAll();
                  setPlaying([]);
                } else {
                  setQuickOpen(true);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setPlayerExpanded(true);
              }}
              className={`fixed bottom-20 right-4 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-primary animate-pulse shadow-primary/30'
                  : 'bg-primary hover:scale-110'
              }`}
            >
              {isActive ? <EqBars className="!h-4" /> : <Music className="w-5 h-5 text-primary-foreground" />}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">
          {isActive
            ? SOUND_LIBRARY.filter(s => playing.includes(s.id)).map(s => s.name).join(' + ')
            : 'Sacred Sounds'}
        </TooltipContent>
      </Tooltip>

      <PopoverContent side="top" align="end" className="w-48 p-2">
        <p className="text-xs font-semibold text-foreground mb-2">Quick Play</p>
        {QUICK_SOUNDS.map(id => {
          const s = SOUND_LIBRARY.find(x => x.id === id)!;
          return (
            <button key={id} onClick={() => handleQuickPlay(id)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left text-sm">
              <span>{s.emoji}</span>
              <span className="text-foreground">{s.name}</span>
            </button>
          );
        })}
        <button onClick={() => { setQuickOpen(false); setPlayerExpanded(true); }}
          className="w-full text-xs text-primary hover:underline mt-2 text-center">
          🎵 Full Library →
        </button>
      </PopoverContent>
    </Popover>
  );
}
