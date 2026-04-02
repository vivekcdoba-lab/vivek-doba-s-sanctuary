/**
 * Sacred Audio Engine — Web Audio API procedural sound generator
 * All 8 sounds generated programmatically, zero external files needed.
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundId =
  | 'om-drone'
  | 'tibetan-bowl'
  | 'forest-rain'
  | 'river-flow'
  | 'binaural-alpha'
  | 'deep-space'
  | 'singing-bowl'
  | 'krishna-flute';

export interface SoundMeta {
  id: SoundId;
  name: string;
  emoji: string;
  category: 'sacred' | 'nature' | 'binaural' | 'music';
  frequency: string;
  duration: string;
}

export const SOUND_LIBRARY: SoundMeta[] = [
  { id: 'om-drone', name: 'OM Drone', emoji: '🕉️', category: 'sacred', frequency: '136.1 Hz', duration: '∞ Loop' },
  { id: 'tibetan-bowl', name: 'Tibetan Bowl', emoji: '🔔', category: 'sacred', frequency: '432 Hz', duration: '12s loop' },
  { id: 'forest-rain', name: 'Forest Rain', emoji: '🌧️', category: 'nature', frequency: 'Nature', duration: '∞ Loop' },
  { id: 'river-flow', name: 'River Flow', emoji: '🌊', category: 'nature', frequency: 'Nature', duration: '∞ Loop' },
  { id: 'binaural-alpha', name: 'Binaural Alpha', emoji: '🧠', category: 'binaural', frequency: 'Alpha 10 Hz', duration: '∞ Loop' },
  { id: 'deep-space', name: 'Deep Space', emoji: '🌌', category: 'sacred', frequency: '40 Hz', duration: '∞ Loop' },
  { id: 'singing-bowl', name: 'Singing Bowl', emoji: '🎵', category: 'music', frequency: '528 Hz', duration: '8s loop' },
  { id: 'krishna-flute', name: 'Krishna Flute', emoji: '🪈', category: 'music', frequency: 'Pentatonic', duration: '∞ Loop' },
];

interface ActiveSound {
  nodes: AudioNode[];
  gainNode: GainNode;
  stop: () => void;
}

const activeSounds = new Map<string, ActiveSound>();

function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink', seconds = 4): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = sr * seconds;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  if (type === 'white') {
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  } else {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }
  return buf;
}

/* ─── Sound Generators ─── */

function playOmDrone(ctx: AudioContext, master: GainNode): ActiveSound {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3);
  gain.connect(master);

  const nodes: OscillatorNode[] = [];
  [136.1, 272.2, 408.3].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = i === 0 ? 0.5 : i === 1 ? 0.25 : 0.12;
    osc.connect(g).connect(gain);
    osc.start();
    nodes.push(osc);
  });

  // Tremolo LFO
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start();
  nodes.push(lfo);

  return {
    nodes, gainNode: gain,
    stop: () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
      setTimeout(() => nodes.forEach(n => { try { n.stop(); } catch {} }), 3200);
    }
  };
}

function playTibetanBowl(ctx: AudioContext, master: GainNode): ActiveSound {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const nodes: OscillatorNode[] = [];
  let interval: ReturnType<typeof setInterval>;

  const strike = () => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 432;
    const vibLfo = ctx.createOscillator();
    vibLfo.type = 'sine';
    vibLfo.frequency.value = 0.5;
    const vibGain = ctx.createGain();
    vibGain.gain.value = 2;
    vibLfo.connect(vibGain).connect(osc.frequency);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.4, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
    osc.connect(env).connect(gain);
    vibLfo.start();
    osc.start();
    setTimeout(() => { try { osc.stop(); vibLfo.stop(); } catch {} }, 9000);
  };

  gain.gain.setValueAtTime(0.8, ctx.currentTime);
  strike();
  interval = setInterval(strike, 12000);

  return {
    nodes, gainNode: gain,
    stop: () => { clearInterval(interval); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); }
  };
}

function playForestRain(ctx: AudioContext, master: GainNode): ActiveSound {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 3);
  gain.connect(master);

  const whiteBuf = createNoiseBuffer(ctx, 'white');
  const pinkBuf = createNoiseBuffer(ctx, 'pink');

  const src1 = ctx.createBufferSource();
  src1.buffer = whiteBuf;
  src1.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 800;
  src1.connect(lp).connect(gain);
  src1.start();

  const src2 = ctx.createBufferSource();
  src2.buffer = pinkBuf;
  src2.loop = true;
  const g2 = ctx.createGain();
  g2.gain.value = 0.3;
  src2.connect(g2).connect(gain);
  src2.start();

  // Random amplitude modulation
  const modLfo = ctx.createOscillator();
  modLfo.type = 'sine';
  modLfo.frequency.value = 0.15;
  const modGain = ctx.createGain();
  modGain.gain.value = 0.06;
  modLfo.connect(modGain).connect(gain.gain);
  modLfo.start();

  return {
    nodes: [], gainNode: gain,
    stop: () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
      setTimeout(() => { try { src1.stop(); src2.stop(); modLfo.stop(); } catch {} }, 3200);
    }
  };
}

function playRiverFlow(ctx: AudioContext, master: GainNode): ActiveSound {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3);
  gain.connect(master);

  const pinkBuf = createNoiseBuffer(ctx, 'pink');
  const src = ctx.createBufferSource();
  src.buffer = pinkBuf;
  src.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 450;
  bp.Q.value = 0.5;

  // Slow filter modulation
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.05;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 150;
  lfo.connect(lfoGain).connect(bp.frequency);
  lfo.start();

  src.connect(bp).connect(gain);
  src.start();

  return {
    nodes: [], gainNode: gain,
    stop: () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
      setTimeout(() => { try { src.stop(); lfo.stop(); } catch {} }, 3200);
    }
  };
}

function playBinauralAlpha(ctx: AudioContext, master: GainNode): ActiveSound {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3);
  gain.connect(master);

  const merger = ctx.createChannelMerger(2);

  const oscL = ctx.createOscillator();
  oscL.type = 'sine';
  oscL.frequency.value = 200;
  const gL = ctx.createGain();
  gL.gain.value = 0.5;
  oscL.connect(gL).connect(merger, 0, 0);

  const oscR = ctx.createOscillator();
  oscR.type = 'sine';
  oscR.frequency.value = 210;
  const gR = ctx.createGain();
  gR.gain.value = 0.5;
  oscR.connect(gR).connect(merger, 0, 1);

  merger.connect(gain);
  oscL.start();
  oscR.start();

  return {
    nodes: [oscL, oscR], gainNode: gain,
    stop: () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
      setTimeout(() => { try { oscL.stop(); oscR.stop(); } catch {} }, 3200);
    }
  };
}

function playDeepSpace(ctx: AudioContext, master: GainNode): ActiveSound {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3);
  gain.connect(master);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 40;
  const subLfo = ctx.createOscillator();
  subLfo.type = 'sine';
  subLfo.frequency.value = 0.03;
  const subLfoG = ctx.createGain();
  subLfoG.gain.value = 5;
  subLfo.connect(subLfoG).connect(sub.frequency);

  const shimmer = ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = 2000;
  const shimG = ctx.createGain();
  shimG.gain.value = 0.03;
  shimmer.connect(shimG).connect(gain);

  sub.connect(gain);
  sub.start();
  subLfo.start();
  shimmer.start();

  return {
    nodes: [sub, subLfo, shimmer], gainNode: gain,
    stop: () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
      setTimeout(() => { try { sub.stop(); subLfo.stop(); shimmer.stop(); } catch {} }, 3200);
    }
  };
}

function playSingingBowl(ctx: AudioContext, master: GainNode): ActiveSound {
  const gain = ctx.createGain();
  gain.gain.value = 0.7;
  gain.connect(master);
  let interval: ReturnType<typeof setInterval>;

  const strike = () => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 528;

    // Harmonics
    const h2 = ctx.createOscillator();
    h2.type = 'sine';
    h2.frequency.value = 1056;
    const h2g = ctx.createGain();
    h2g.gain.value = 0.15;

    // Simple reverb via delay feedback
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.08;
    const fb = ctx.createGain();
    fb.gain.value = 0.4;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.35, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);

    osc.connect(env);
    h2.connect(h2g).connect(env);
    env.connect(gain);
    env.connect(delay);
    delay.connect(fb).connect(delay);
    delay.connect(gain);

    osc.start();
    h2.start();
    setTimeout(() => { try { osc.stop(); h2.stop(); } catch {} }, 7000);
  };

  strike();
  interval = setInterval(strike, 8000);

  return {
    nodes: [], gainNode: gain,
    stop: () => { clearInterval(interval); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); }
  };
}

function playKrishnaFlute(ctx: AudioContext, master: GainNode): ActiveSound {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3);
  gain.connect(master);

  // Pentatonic: C4, D4, F4, G4, A4
  const notes = [261.63, 293.66, 349.23, 392.00, 440.00];
  let running = true;
  let timeout: ReturnType<typeof setTimeout>;

  const playNote = () => {
    if (!running) return;
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const tri = ctx.createOscillator();
    tri.type = 'triangle';
    tri.frequency.value = freq;
    const mg = ctx.createGain();
    mg.gain.value = 0.3;
    tri.connect(mg);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
    env.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);

    osc.connect(env);
    mg.connect(env);
    env.connect(gain);
    osc.start();
    tri.start();
    setTimeout(() => { try { osc.stop(); tri.stop(); } catch {} }, 1500);

    const next = 1500 + Math.random() * 1000;
    timeout = setTimeout(playNote, next);
  };

  playNote();

  return {
    nodes: [], gainNode: gain,
    stop: () => {
      running = false;
      clearTimeout(timeout);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
    }
  };
}

/* ─── Public API ─── */

const generators: Record<SoundId, (ctx: AudioContext, master: GainNode) => ActiveSound> = {
  'om-drone': playOmDrone,
  'tibetan-bowl': playTibetanBowl,
  'forest-rain': playForestRain,
  'river-flow': playRiverFlow,
  'binaural-alpha': playBinauralAlpha,
  'deep-space': playDeepSpace,
  'singing-bowl': playSingingBowl,
  'krishna-flute': playKrishnaFlute,
};

export function playSound(id: SoundId, volume = 1): void {
  stopSound(id);
  const ctx = getAudioContext();
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  const sound = generators[id](ctx, master);
  activeSounds.set(id, { ...sound, gainNode: master });
}

export function stopSound(id: string): void {
  const s = activeSounds.get(id);
  if (s) {
    s.stop();
    activeSounds.delete(id);
  }
}

export function stopAll(): void {
  activeSounds.forEach((s) => s.stop());
  activeSounds.clear();
}

export function setVolume(id: string, vol: number): void {
  const s = activeSounds.get(id);
  if (s) s.gainNode.gain.setValueAtTime(vol, getAudioContext().currentTime);
}

export function isPlaying(id: string): boolean {
  return activeSounds.has(id);
}

export function getActiveSounds(): string[] {
  return Array.from(activeSounds.keys());
}

/** Single tibetan bowl strike for timer completion */
export function playCompletionBell(): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 528;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.5, ctx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  setTimeout(() => { try { osc.stop(); } catch {} }, 5500);
}

/** Soft click for japa counter */
export function playClick(): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 440;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.2, ctx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  setTimeout(() => { try { osc.stop(); } catch {} }, 80);
}

/** Breathing guide tone */
export function playBreathTone(phase: 'inhale' | 'hold' | 'exhale', durationSec: number): OscillatorNode | null {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  const env = ctx.createGain();
  env.gain.value = 0.12;

  if (phase === 'inhale') {
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + durationSec);
  } else if (phase === 'exhale') {
    osc.frequency.setValueAtTime(330, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + durationSec);
  } else {
    osc.frequency.value = 275;
  }

  osc.connect(env).connect(ctx.destination);
  osc.start();
  setTimeout(() => { try { osc.stop(); } catch {} }, durationSec * 1000 + 50);
  return osc;
}

/** Mood presets */
export const MOOD_PRESETS: Record<string, { sounds: { id: SoundId; vol: number }[]; emoji: string; label: string }> = {
  sleep: { emoji: '😴', label: 'Sleep', sounds: [{ id: 'deep-space', vol: 0.5 }, { id: 'forest-rain', vol: 0.4 }] },
  meditate: { emoji: '🧘', label: 'Meditate', sounds: [{ id: 'om-drone', vol: 0.6 }, { id: 'tibetan-bowl', vol: 0.4 }] },
  focus: { emoji: '🔥', label: 'Focus', sounds: [{ id: 'binaural-alpha', vol: 0.7 }, { id: 'river-flow', vol: 0.3 }] },
  heal: { emoji: '❤️', label: 'Heal', sounds: [{ id: 'singing-bowl', vol: 0.6 }, { id: 'forest-rain', vol: 0.4 }] },
  pray: { emoji: '🙏', label: 'Pray', sounds: [{ id: 'om-drone', vol: 0.5 }, { id: 'krishna-flute', vol: 0.5 }] },
};

export function playPreset(presetId: string): void {
  stopAll();
  const preset = MOOD_PRESETS[presetId];
  if (!preset) return;
  preset.sounds.forEach(s => playSound(s.id, s.vol));
}
