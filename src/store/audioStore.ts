import { create } from 'zustand';
import type { SoundId } from '@/lib/sacredAudioEngine';

interface AudioState {
  playing: SoundId[];
  masterVolume: number;
  activePreset: string | null;
  playerExpanded: boolean;
  setPlaying: (ids: SoundId[]) => void;
  addPlaying: (id: SoundId) => void;
  removePlaying: (id: SoundId) => void;
  setMasterVolume: (v: number) => void;
  setActivePreset: (p: string | null) => void;
  setPlayerExpanded: (v: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  playing: [],
  masterVolume: 0.7,
  activePreset: null,
  playerExpanded: false,
  setPlaying: (ids) => set({ playing: ids }),
  addPlaying: (id) => set((s) => ({ playing: [...s.playing.filter(i => i !== id), id] })),
  removePlaying: (id) => set((s) => ({ playing: s.playing.filter(i => i !== id) })),
  setMasterVolume: (v) => set({ masterVolume: v }),
  setActivePreset: (p) => set({ activePreset: p }),
  setPlayerExpanded: (v) => set({ playerExpanded: v }),
}));
