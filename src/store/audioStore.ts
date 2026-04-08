import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SoundId } from '@/lib/sacredAudioEngine';

interface AudioState {
  playing: SoundId[];
  masterVolume: number;
  activePreset: string | null;
  playerExpanded: boolean;
  sleepTimer: number | null; // minutes remaining, null = off
  sleepTimerEnd: number | null; // timestamp when timer ends
  lastPreset: string | null; // persisted last-used preset
  setPlaying: (ids: SoundId[]) => void;
  addPlaying: (id: SoundId) => void;
  removePlaying: (id: SoundId) => void;
  setMasterVolume: (v: number) => void;
  setActivePreset: (p: string | null) => void;
  setPlayerExpanded: (v: boolean) => void;
  setSleepTimer: (minutes: number | null) => void;
  setSleepTimerEnd: (ts: number | null) => void;
  setLastPreset: (p: string | null) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      playing: [],
      masterVolume: 0.7,
      activePreset: null,
      playerExpanded: false,
      sleepTimer: null,
      sleepTimerEnd: null,
      lastPreset: null,
      setPlaying: (ids) => set({ playing: ids }),
      addPlaying: (id) => set((s) => ({ playing: [...s.playing.filter(i => i !== id), id] })),
      removePlaying: (id) => set((s) => ({ playing: s.playing.filter(i => i !== id) })),
      setMasterVolume: (v) => set({ masterVolume: v }),
      setActivePreset: (p) => set({ activePreset: p, lastPreset: p || undefined }),
      setPlayerExpanded: (v) => set({ playerExpanded: v }),
      setSleepTimer: (minutes) => set({ sleepTimer: minutes }),
      setSleepTimerEnd: (ts) => set({ sleepTimerEnd: ts }),
      setLastPreset: (p) => set({ lastPreset: p }),
    }),
    {
      name: 'vdts-audio-prefs',
      partialize: (state) => ({
        masterVolume: state.masterVolume,
        lastPreset: state.lastPreset,
      }),
    }
  )
);
