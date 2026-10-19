// Tiny chiptune synth: sound effects and looping music, all generated with
// WebAudio oscillators — no audio files needed.

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode;
let musicGain: GainNode;
let sfxGain: GainNode;
let voiceGain: GainNode;

// ------------------------------------------------------------------ volume
/** Volume settings belong to the device, not the save game. */
export interface AudioPrefs {
  muted: boolean;
  /** 0–1 */
  music: number;
  sfx: number;
  voice: number;
}

const PREFS_KEY = 'palabrista-audio';
const DEFAULT_PREFS: AudioPrefs = { muted: false, music: 0.6, sfx: 0.8, voice: 1 };
let prefs: AudioPrefs = loadPrefs();
const listeners = new Set<(p: AudioPrefs) => void>();

function loadPrefs(): AudioPrefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function audioPrefs(): AudioPrefs {
  return prefs;
}

export function setAudioPrefs(p: Partial<AudioPrefs>) {
  const wasSilent = musicSilent();
  prefs = { ...prefs, ...p };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable: the change still applies for this session */
  }
  applyGains();
  if (wasSilent && !musicSilent() && wanted) playMusic(wanted, true);
  if (!wasSilent && musicSilent()) stopMusic();
  for (const l of listeners) l(prefs);
}

/** Get told when the volume changes (to update mute icons). */
export function onAudioPrefs(fn: (p: AudioPrefs) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const musicSilent = () => prefs.muted || prefs.music <= 0;

function applyGains() {
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(prefs.muted ? 0 : 0.5, t, 0.02);
  musicGain.gain.setTargetAtTime(0.5 * prefs.music * (voiceSrc ? DUCK : 1), t, 0.02);
  sfxGain.gain.setTargetAtTime(0.7 * prefs.sfx, t, 0.02);
  voiceGain.gain.setTargetAtTime(prefs.muted ? 0 : prefs.voice, t, 0.02);
}

function ac(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.connect(master);
  sfxGain = ctx.createGain();
  sfxGain.connect(master);
  // Voices skip the master bus: speech should be as loud as the system voice was.
  voiceGain = ctx.createGain();
  voiceGain.connect(ctx.destination);
  voiceGain.gain.value = prefs.muted ? 0 : prefs.voice;
  master.gain.value = prefs.muted ? 0 : 0.5;
  musicGain.gain.value = 0.5 * prefs.music;
  sfxGain.gain.value = 0.7 * prefs.sfx;
  return ctx;
}

// ------------------------------------------------------------------ voices
/** Music drops to this while someone speaks. */
const DUCK = 0.35;
let voiceSrc: AudioBufferSourceNode | null = null;

/** Decode compressed audio (the recorded dialogue). */
export async function decodeAudio(data: ArrayBuffer): Promise<AudioBuffer | null> {
  const c = ac();
  if (!c) return null;
  try {
    // Older Safari only has the callback form.
    return await new Promise<AudioBuffer>((resolve, reject) => {
      const p = c.decodeAudioData(data, resolve, reject);
      if (p && typeof p.then === 'function') p.then(resolve, reject);
    });
  } catch {
    return null;
  }
}

/** Play a recorded line; `rate` changes speed and pitch together (0.9 = deeper, 1.15 = a child). */
export function playVoiceBuffer(buffer: AudioBuffer, rate = 1, onEnded?: () => void) {
  const c = ac();
  if (!c) return;
  stopVoiceBuffer();
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  src.connect(voiceGain);
  src.onended = () => {
    if (voiceSrc !== src) return;
    voiceSrc = null;
    applyGains();
    onEnded?.();
  };
  voiceSrc = src;
  applyGains();
  src.start();
}

export function stopVoiceBuffer() {
  const src = voiceSrc;
  if (!src) return;
  voiceSrc = null;
  try {
    src.stop();
  } catch {
    /* already stopped */
  }
  applyGains();
}

/** Browsers only allow audio after a user gesture: call this from one. */
export function unlockAudio() {
  const c = ac();
  if (c && c.state === 'suspended') void c.resume();
}

const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function freq(note: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(note);
  if (!m) return 0;
  let n = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  n += (Number(m[3]) + 1) * 12;
  return 440 * Math.pow(2, (n - 69) / 12);
}

function tone(f: number, t: number, dur: number, wave: Wave, vol: number, dest: AudioNode, slide?: number) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = wave;
  o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

let noiseBuf: AudioBuffer | null = null;
function noise(t: number, dur: number, vol: number, dest: AudioNode, hp = 1000) {
  const c = ctx!;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = hp;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter).connect(g).connect(dest);
  src.start(t);
  src.stop(t + dur + 0.02);
}

export type Sfx =
  | 'blip'
  | 'select'
  | 'cancel'
  | 'hit'
  | 'crit'
  | 'magic'
  | 'heal'
  | 'correct'
  | 'wrong'
  | 'close'
  | 'levelup'
  | 'encounter'
  | 'door'
  | 'chest'
  | 'save'
  | 'miss'
  | 'ko'
  | 'dice'
  | 'ultimate';

export function sfx(name: Sfx) {
  if (prefs.muted || prefs.sfx <= 0) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + 0.01;
  const d = sfxGain;
  switch (name) {
    case 'blip':
      tone(880, t, 0.05, 'square', 0.12, d);
      break;
    case 'select':
      tone(660, t, 0.06, 'square', 0.15, d);
      tone(990, t + 0.05, 0.08, 'square', 0.15, d);
      break;
    case 'cancel':
      tone(440, t, 0.06, 'square', 0.12, d);
      tone(330, t + 0.05, 0.08, 'square', 0.12, d);
      break;
    case 'hit':
      noise(t, 0.12, 0.5, d, 600);
      tone(180, t, 0.12, 'square', 0.25, d, 60);
      break;
    case 'crit':
      noise(t, 0.2, 0.6, d, 300);
      tone(300, t, 0.25, 'sawtooth', 0.3, d, 50);
      tone(1200, t + 0.02, 0.1, 'square', 0.15, d);
      break;
    case 'magic':
      for (let i = 0; i < 5; i++) tone(500 + i * 180, t + i * 0.035, 0.12, 'triangle', 0.18, d);
      break;
    case 'heal':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.07, 0.25, 'triangle', 0.2, d));
      break;
    case 'correct':
      tone(784, t, 0.1, 'square', 0.16, d);
      tone(1175, t + 0.09, 0.22, 'square', 0.16, d);
      break;
    case 'close':
      tone(660, t, 0.1, 'square', 0.14, d);
      tone(784, t + 0.09, 0.18, 'square', 0.14, d);
      break;
    case 'wrong':
      tone(200, t, 0.18, 'sawtooth', 0.18, d);
      tone(150, t + 0.15, 0.28, 'sawtooth', 0.18, d);
      break;
    case 'levelup':
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.08, 0.3, 'square', 0.14, d));
      break;
    case 'encounter':
      for (let i = 0; i < 8; i++) tone(300 + (i % 2) * 400 + i * 60, t + i * 0.04, 0.06, 'square', 0.14, d);
      break;
    case 'door':
      noise(t, 0.15, 0.25, d, 2000);
      tone(220, t, 0.1, 'triangle', 0.2, d);
      break;
    case 'chest':
      [392, 523, 659, 784].forEach((f, i) => tone(f, t + i * 0.09, 0.2, 'square', 0.15, d));
      break;
    case 'save':
      tone(523, t, 0.1, 'triangle', 0.2, d);
      tone(784, t + 0.1, 0.25, 'triangle', 0.2, d);
      break;
    case 'miss':
      tone(600, t, 0.15, 'triangle', 0.15, d, 300);
      break;
    case 'ko':
      tone(400, t, 0.4, 'square', 0.18, d, 80);
      break;
    case 'dice':
      for (let i = 0; i < 4; i++) noise(t + i * 0.05, 0.03, 0.3, d, 3000);
      break;
    case 'ultimate':
      noise(t, 0.6, 0.4, d, 200);
      [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.05, 0.4, 'sawtooth', 0.12, d));
      break;
  }
}

// ---------------------------------------------------------------- music
interface Track {
  bpm: number;
  /** Steps per beat (2 = eighth notes). */
  div: number;
  lead: string;
  bass: string;
  perc?: string;
  leadWave?: Wave;
  loop?: boolean;
}

// Notation: one token per step. "A4" plays a note, "-" holds it, "." is silence.
// Percussion: "k" kick, "s" snare, "h" hat, "c" handclap (palmas!).
const TRACKS: Record<string, Track> = {
  // Puerto Alegre: a gentle seaside waltz.
  town: {
    bpm: 112,
    div: 2,
    lead: 'E5 - - D5 C5 . A4 - - C5 F5 . D5 - - B4 G4 . C5 - - - - . E5 - - G5 E5 . F5 - - A5 F5 . D5 - E5 D5 B4 . C5 - - - - .',
    bass: 'C3 . G3 . E3 . F2 . C3 . A2 . G2 . D3 . B2 . C3 . G2 . C3 . C3 . G3 . E3 . F2 . C3 . A2 . G2 . D3 . B2 . C3 . G2 . C3 .',
    perc: 'k . h . h . k . h . h . k . h . h . k . h . h . k . h . h . k . h . h . k . h . h . k . h . c .',
    leadWave: 'triangle',
  },
  // Roads and forests.
  field: {
    bpm: 132,
    div: 2,
    lead: 'F#4 . A4 . D5 - C#5 B4 B4 . G4 . B4 D5 - . C#5 . A4 . E5 - D5 C#5 D5 - - . A4 . D5 . F#5 - E5 D5 E5 - A4 . G5 - F#5 E5 D5 - B4 . A4 - B4 C#5 E5 - D5 C#5 D5 - - - . . . .',
    bass: 'D3 . A2 . D3 . A2 . G2 . D3 . G2 . D3 . A2 . E3 . A2 . E3 . D3 . A2 . D3 . F#3 . D3 . A2 . D3 . A2 . G2 . D3 . G2 . D3 . A2 . E3 . A2 . E3 . D3 . A2 . D3 . . .',
    perc: 'k . h . s . h . k . h . s . h h k . h . s . h . k . h . s . h . k . h . s . h . k . h . s . h h k . h . s . h . k . h . s s s s',
  },
  // La Mancha: a seguidilla manchega in 3/4, with castanets.
  mancha: {
    bpm: 150,
    div: 2,
    lead: 'A4 - D5 - F#5 - E5 D5 C#5 - A4 - B4 - G5 - F#5 E5 F#5 - - - . . A5 - G5 F#5 E5 D5 C#5 - E5 - A4 - B4 C#5 D5 - E5 C#5 D5 - - - . . F#5 - A5 - F#5 D5 E5 - G5 - E5 C#5 D5 - F#5 - D5 B4 C#5 - - - A4 . B4 - D5 - B4 G4 A4 - C#5 - A4 E4 G4 F#4 E4 - C#4 - D4 - - - . .',
    bass: 'D3 . A2 . A2 . A2 . E3 . E3 . G2 . D3 . D3 . D3 . A2 . D3 . D3 . A2 . A2 . A2 . E3 . C#3 . G2 . A2 . A2 . D3 . A2 . D2 . D3 . A2 . A2 . A2 . E3 . E3 . B2 . F#3 . F#3 . A2 . E3 . A2 . G2 . D3 . D3 . A2 . E3 . E3 . A2 . E3 . C#3 . D3 . A2 . D2 .',
    perc: 'k . c h c h k . c h c h k . c h c h k . c h c c k . c h c h k . c h c h k . c h c h k . c c c c k . c h c h k . c h c h k . c h c h k . c h c c k . c h c h k . c h c h k . c h c h k . c c c c',
  },
  // Caves, cellars and towers.
  dungeon: {
    bpm: 92,
    div: 2,
    lead: '. . E5 . . . C5 . . . B4 . . . G#4 . . . A4 . . . E4 . . . F4 . E4 - - - . . C5 . . . A4 . . . D5 . . . B4 . . . E5 - D5 C5 B4 - G#4 - A4 - - - - - - -',
    bass: 'A2 - - - E2 - - - F2 - - - E2 - - - A2 - - - E2 - - - D2 - - - E2 - - - A2 - - - E2 - - - F2 - - - E2 - - - D2 - - - E2 - - - A2 - - - - - - -',
    perc: 'k . . . . . h . k . . . . . h . k . . . . . h . k . . . s . . . k . . . . . h . k . . . . . h . k . . . . . h . k . . . s . s .',
    leadWave: 'triangle',
  },
  // Battle: the Andalusian cadence (Am – G – F – E) with flamenco palmas.
  battle: {
    bpm: 152,
    div: 2,
    lead: 'E5 . A4 . C5 E5 D5 C5 B4 . G4 . B4 D5 C5 B4 A4 . F4 . A4 C5 B4 A4 G#4 . E4 . G#4 B4 A4 G#4 A5 - G5 F5 E5 - D5 C5 D5 - C5 B4 G4 - A4 B4 C5 - B4 A4 F4 - G4 A4 B4 - A4 G#4 E4 - - .',
    bass: 'A2 . A2 E3 A2 . A2 E3 G2 . G2 D3 G2 . G2 D3 F2 . F2 C3 F2 . F2 C3 E2 . E2 B2 E2 . G#2 B2 A2 . A2 E3 A2 . A2 E3 G2 . G2 D3 G2 . G2 D3 F2 . F2 C3 F2 . F2 C3 E2 . E2 B2 E2 . E2 .',
    perc: 'k . c . s c . c k . c . s c . c k . c . s c . c k k c . s c s c k . c . s c . c k . c . s c . c k . c . s c . c k k c . s s s s',
  },
  boss: {
    bpm: 168,
    div: 2,
    lead: 'D5 Eb5 D5 C5 D5 - A4 . Bb4 C5 Bb4 A4 Bb4 - G4 . A4 Bb4 A4 G4 F4 - E4 . F#4 - G4 - A4 - - . D6 - C6 Bb5 A5 - G5 F#5 G5 - F5 Eb5 D5 - C5 Bb4 C5 - Bb4 A4 G4 - F#4 E4 F#4 - - - A4 - - .',
    bass: 'D2 D3 D2 D3 D2 D3 D2 D3 C2 C3 C2 C3 C2 C3 C2 C3 Bb1 Bb2 Bb1 Bb2 Bb1 Bb2 Bb1 Bb2 A1 A2 A1 A2 A1 A2 A1 A2 D2 D3 D2 D3 D2 D3 D2 D3 C2 C3 C2 C3 C2 C3 C2 C3 Bb1 Bb2 Bb1 Bb2 Bb1 Bb2 Bb1 Bb2 A1 A2 A1 A2 A1 A2 A1 A2',
    perc: 'k h s h k h s h k h s h k k s h k h s h k h s h k h s h k s s s k h s h k h s h k h s h k k s h k h s h k h s h k h s c k c s c',
    leadWave: 'sawtooth',
  },
  victory: {
    bpm: 140,
    div: 2,
    lead: 'C5 C5 C5 - G4 - A4 - C5 - A4 C5 E5 - - - G5 - - - . . . .',
    bass: 'C3 . C3 . G2 . F2 . F2 . F2 . C3 - - - C3 - - - . . . .',
    loop: false,
  },
};

let wanted: string | null = null;
let playing: string | null = null;
let timer: number | null = null;

export function stopMusic() {
  if (timer !== null) clearInterval(timer);
  timer = null;
  playing = null;
}

export function currentMusic() {
  return wanted;
}

export function playMusic(name: string, force = false) {
  wanted = name;
  if (musicSilent()) return;
  if (playing === name && !force) return;
  const c = ac();
  if (!c) return;
  stopMusic();
  const tr = TRACKS[name];
  if (!tr) return;
  playing = name;
  const parse = (s?: string) => (s ? s.split(/\s+/).filter(Boolean) : []);
  const lead = parse(tr.lead);
  const bass = parse(tr.bass);
  const perc = parse(tr.perc);
  const len = Math.max(lead.length, bass.length, perc.length);
  const step = 60 / tr.bpm / tr.div;
  let i = 0;
  let next = c.currentTime + 0.1;
  const holdLen = (arr: string[], at: number) => {
    let n = 1;
    while (arr[(at + n) % arr.length] === '-' && n < 16) n++;
    return n;
  };
  const tick = () => {
    if (!ctx || playing !== name) return;
    while (next < ctx.currentTime + 0.25) {
      const k = i % len;
      if (tr.loop === false && i >= len) {
        stopMusic();
        return;
      }
      const l = lead[k % lead.length];
      if (l && l !== '-' && l !== '.') tone(freq(l), next, step * holdLen(lead, k % lead.length) * 0.95, tr.leadWave ?? 'square', 0.16, musicGain);
      const b = bass[k % bass.length];
      if (b && b !== '-' && b !== '.') tone(freq(b), next, step * holdLen(bass, k % bass.length) * 0.9, 'triangle', 0.3, musicGain);
      const p = perc[k % perc.length];
      if (p === 'k') tone(120, next, 0.12, 'sine', 0.5, musicGain, 40);
      else if (p === 's') noise(next, 0.1, 0.25, musicGain, 1500);
      else if (p === 'h') noise(next, 0.03, 0.08, musicGain, 7000);
      else if (p === 'c') {
        noise(next, 0.04, 0.22, musicGain, 2500);
        noise(next + 0.012, 0.04, 0.18, musicGain, 2500);
      }
      next += step;
      i++;
    }
  };
  tick();
  timer = window.setInterval(tick, 60);
}
