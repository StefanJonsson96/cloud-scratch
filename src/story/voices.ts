// Every character's voice. Story dialogue is pre-recorded (`npm run voices`)
// with neural Spanish-from-Spain voices, so women always sound like women
// whatever the device; `base` is the recorded voice and `play` the speed it is
// played at (which also raises or lowers the pitch: 0.9 = older and deeper,
// 1.15 = a child). `pitch` and `rate` are for the browser's voice, used for
// anything that isn't recorded (practice words, battle announcements).
//
// Pure data: imported by the game and by scripts/voices.

export type BaseVoice = 'f' | 'm' | 'm2';

export interface CastVoice {
  id: string;
  gender: 'f' | 'm';
  pitch?: number;
  rate?: number;
  base: BaseVoice;
  play: number;
}

/** The recorded voices: [model, speaker id]. Credited in src/data/generated/voices/README.md. */
export const BASE_VOICES: Record<BaseVoice, { model: string; speaker: number; label: string }> = {
  f: { model: 'vits-piper-es_ES-sharvard-medium', speaker: 1, label: 'Sharvard (female)' },
  m: { model: 'vits-piper-es_ES-davefx-medium', speaker: 0, label: 'Davefx (male)' },
  m2: { model: 'vits-piper-es_ES-sharvard-medium', speaker: 0, label: 'Sharvard (male)' },
};

const c = (id: string, gender: 'f' | 'm', base: BaseVoice, play: number, pitch = 1, rate = 1): CastVoice => ({ id, gender, base, play, pitch, rate });

export const CAST_VOICES: Record<string, CastVoice> = {
  abuela: c('abuela', 'f', 'f', 0.92, 0.85, 0.86),
  mateo: c('mateo', 'm', 'm2', 1.06, 1.1, 1.05),
  lola: c('lola', 'f', 'f', 1.05, 1.1, 1.05),
  ramon: c('ramon', 'm', 'm', 0.92, 0.8, 0.9),
  carmen: c('carmen', 'f', 'f', 0.97, 0.95, 0.95),
  pepe: c('pepe', 'm', 'm2', 0.98, 0.95),
  lucia: c('lucia', 'f', 'f', 1.03, 1.05),
  // Children: the female voice, played faster and higher.
  nino: c('nino', 'm', 'f', 1.14, 1.5, 1.08),
  nina: c('nina', 'f', 'f', 1.16, 1.4, 1.08),
  guardia: c('guardia', 'm', 'm', 0.95, 0.85, 0.95),
  peregrina: c('peregrina', 'f', 'f', 1.0),
  monje: c('monje', 'm', 'm', 0.9, 0.8, 0.85),
  callado: c('callado', 'm', 'm', 0.82, 0.6, 0.8),
  bruno: c('bruno', 'm', 'm', 0.9, 0.75, 0.9),
  voz: c('voz', 'f', 'f', 0.9, 0.9, 0.88),
  posadera: c('posadera', 'f', 'f', 0.96, 0.95),
  frutera: c('frutera', 'f', 'f', 1.06, 1.05, 1.05),
  // The market men shout cheerfully: the steadier male voice keeps them sounding like men.
  quesero: c('quesero', 'm', 'm2', 0.93, 0.9),
  pescadera: c('pescadera', 'f', 'f', 1.0),
  tendera: c('tendera', 'f', 'f', 0.95, 0.9, 0.95),
  panadero: c('panadero', 'm', 'm2', 0.9, 0.9),
  camarero: c('camarero', 'm', 'm2', 1.05, 1.05, 1.08),
  gloton: c('gloton', 'm', 'm', 0.8, 0.5, 0.8),
  paco: c('paco', 'm', 'm2', 1.0, 0.95),
  lenador: c('lenador', 'm', 'm', 0.9, 0.75, 0.9),
  alpinista: c('alpinista', 'm', 'm2', 1.02),
  // Act II
  revisor: c('revisor', 'm', 'm', 1.0, 0.95),
  viajera: c('viajera', 'f', 'f', 1.04, 1.05),
  // Don Alonso shouts a lot: the steadier male voice keeps him sounding like an old man.
  alonso: c('alonso', 'm', 'm2', 0.88, 0.8, 0.9),
  sancha: c('sancha', 'f', 'f', 1.02, 1.05),
  quesera: c('quesera', 'f', 'f', 0.97, 0.95),
  pastora: c('pastora', 'f', 'f', 1.06, 1.1),
  molinero: c('molinero', 'm', 'm2', 0.94, 0.9),
  pablito: c('pablito', 'm', 'f', 1.15, 1.5, 1.08),
  posadero: c('posadero', 'm', 'm2', 0.92, 0.9),
  pastor: c('pastor', 'm', 'm', 0.9, 0.8, 0.9),
};

/** Narration and system messages. */
export const NARRATOR_VOICE: CastVoice = c('narrator', 'f', 'f', 1.0);

/** The hero sounds like the gender the player chose. */
export const heroVoice = (gender: 'f' | 'm'): CastVoice => c('hero', gender, gender === 'f' ? 'f' : 'm2', 1.0);

/**
 * Who reads a practice sentence (listening challenges, Palabra Final): half of
 * them a woman, half a man, always the same one for the same sentence.
 */
export function sentenceVoice(es: string): { gender: 'f' | 'm'; id: string } {
  let h = 0;
  for (const ch of es) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h) % 2 ? { gender: 'm', id: 'sentence-m' } : { gender: 'f', id: 'sentence-f' };
}

/** The recorded voice for anyone: their own, or the plain voice of their gender. */
export function recordedVoice(spec: { id?: string; gender: 'f' | 'm' }): { base: BaseVoice; play: number } {
  const known = spec.id ? (spec.id === 'narrator' ? NARRATOR_VOICE : CAST_VOICES[spec.id]) : undefined;
  if (known) return { base: known.base, play: known.play };
  if (spec.id === 'hero') return { base: spec.gender === 'f' ? 'f' : 'm2', play: 1 };
  // Practice sentences: the steadier male voice (davefx gets high-pitched when excited).
  if (spec.id === 'sentence-m') return { base: 'm2', play: 1 };
  return { base: spec.gender === 'f' ? 'f' : 'm', play: 1 };
}

/**
 * The lookup key for a recorded line: its voice plus its words, ignoring
 * punctuation and case, and leaving out the hero's name (recordings can't know it).
 */
export function voiceKey(base: BaseVoice, text: string, heroName?: string): string {
  let t = text.normalize('NFC');
  if (heroName) t = t.split(heroName).join(' ');
  const words = t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  return `${base}:${words}`;
}
