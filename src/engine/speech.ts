// Spanish speech. Story dialogue plays its recording (voiceover.ts). Anything
// else — practice words, battle announcements — uses the browser's built-in
// voices, preferring voices from Spain (es-ES) so you hear "zumo" with a
// Castilian "z".
//
// Each character has a voice: a gender, and a pitch and speed of their own.
// When the system has several Spanish voices of the right gender, characters
// are spread across them so they don't all sound alike. When it has no voice of
// the right gender, pitch is shifted towards it.

import { audioPrefs } from './audio';
import { hasRecording, playRecorded, stopRecorded } from './voiceover';

export interface VoiceSpec {
  gender: 'f' | 'm';
  /** 1 = the voice's natural pitch. */
  pitch?: number;
  /** 1 = normal speed. */
  rate?: number;
  /** Stable id so the same character always gets the same system voice. */
  id?: string;
}

/** The voice used when nobody in particular is speaking (narration, challenges). */
export const NARRATOR: VoiceSpec = { gender: 'f', id: 'narrator' };

// Spanish voice names seen on Windows, macOS/iOS, Android, Chrome and Edge.
const FEMALE = /helena|laura|elvira|m[oó]nica|paulina|marisol|luc[ií]a|conchita|pen[eé]lope|paloma|elena|sabina|abril|ximena|triana|irene|estrella|vera|dalia|camila|elsa|isabel|salom[eé]|andrea|carmen|marta|nuria|in[eé]s|sara|ana\b|mar[ií]a|grandma|flo\b|sandy|shelley|google espa|female|mujer/i;
const MALE = /pablo|jorge|[aá]lvaro|diego|juan|carlos|enrique|ra[uú]l|arnau|dar[ií]o|gerardo|tom[aá]s|alonso|sa[uú]l|teo\b|gonzalo|lorenzo|rodrigo|manuel|miguel|antonio|federico|eddy|reed|rocko|grandpa|male|hombre/i;

let pools: { f: SpeechSynthesisVoice[]; m: SpeechSynthesisVoice[]; any: SpeechSynthesisVoice[] } = { f: [], m: [], any: [] };
let enabled = true;
let ready = false;
const listeners = new Set<() => void>();

// ------------------------------------------------------------ player's choice
/** Voices the player picked for female and male characters (saved on this device). */
export interface VoiceChoice {
  f?: string;
  m?: string;
  /** false: read dialogue with the browser's voice instead of the recordings. */
  recorded?: boolean;
}
const CHOICE_KEY = 'palabrista-voices';
let choice: VoiceChoice = loadChoice();

function loadChoice(): VoiceChoice {
  try {
    return JSON.parse(localStorage.getItem(CHOICE_KEY) ?? '{}') as VoiceChoice;
  } catch {
    return {};
  }
}

export function voiceChoice(): VoiceChoice {
  return choice;
}

export function setVoiceChoice(c: VoiceChoice) {
  choice = { ...choice, ...c };
  try {
    localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));
  } catch {
    /* storage unavailable */
  }
}

/** Get told when the system's voice list changes (it loads asynchronously). */
export function onVoicesChanged(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function genderOf(v: SpeechSynthesisVoice): 'f' | 'm' | null {
  // Check male first: "female" contains "male".
  if (/\bfemale\b|mujer/i.test(v.name)) return 'f';
  if (MALE.test(v.name)) return 'm';
  if (FEMALE.test(v.name)) return 'f';
  return null;
}

/**
 * A best guess for voices whose name doesn't say ("Spanish (Spain)", "es-es-x-eea-local"):
 * Android's are usually female; eSpeak's (Linux) default voice is male.
 */
function likelyGender(v: SpeechSynthesisVoice): 'f' | 'm' {
  return genderOf(v) ?? (/android/i.test(navigator.userAgent) ? 'f' : 'm');
}

function rank(v: SpeechSynthesisVoice): number {
  const lang = v.lang.toLowerCase().replace('_', '-');
  let r = 0;
  if (lang === 'es-es') r += 100;
  if (/natural|neural|premium|enhanced|online/i.test(v.name)) r += 20;
  if (/google/i.test(v.name)) r += 10;
  if (/grandma|grandpa|eddy|flo\b|reed|rocko|sandy|shelley/i.test(v.name)) r -= 30; // novelty voices
  if (v.localService) r += 2;
  return r;
}

function pickVoices() {
  if (!('speechSynthesis' in window)) return;
  const es = speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('es'))
    .sort((a, b) => rank(b) - rank(a));
  // Prefer voices from Spain: only fall back to other Spanish voices when Spain has none of that gender.
  const best = (list: SpeechSynthesisVoice[]) => {
    const spain = list.filter((v) => /es[-_]es/i.test(v.lang));
    return spain.length ? spain : list;
  };
  pools = {
    f: best(es.filter((v) => genderOf(v) === 'f')),
    m: best(es.filter((v) => genderOf(v) === 'm')),
    any: best(es),
  };
  ready = true;
  for (const l of listeners) l();
}

/** Every Spanish voice on this device, best first, with the gender we think it has. */
export function spanishVoices(): { voice: SpeechSynthesisVoice; gender: 'f' | 'm' | null }[] {
  if (!('speechSynthesis' in window)) return [];
  if (!ready) pickVoices();
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('es'))
    .sort((a, b) => rank(b) - rank(a))
    .map((voice) => ({ voice, gender: genderOf(voice) }));
}

/** Which genders have no Spanish voice of their own (pitch is shifted instead). */
export function missingVoiceGenders(): ('f' | 'm')[] {
  if (!speechAvailable()) return [];
  return (['f', 'm'] as const).filter((g) => !pools[g].length && !byName(choice[g]));
}

function byName(name?: string): SpeechSynthesisVoice | undefined {
  if (!name || !('speechSynthesis' in window)) return undefined;
  return speechSynthesis.getVoices().find((v) => v.name === name);
}

export function initSpeech() {
  if (!('speechSynthesis' in window)) return;
  pickVoices();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoices);
}

export function speechAvailable(): boolean {
  if (!ready) pickVoices();
  return pools.any.length > 0;
}

export function voiceName(): string {
  if (!speechAvailable()) return 'none';
  const list = [...new Set([...pools.f.slice(0, 2), ...pools.m.slice(0, 2)].map((v) => v.name))];
  return list.length ? list.join(', ') : `${pools.any[0].name} (${pools.any[0].lang})`;
}

export function setSpeechEnabled(on: boolean) {
  enabled = on;
  if (!on) stopSpeaking();
}

export function stopSpeaking() {
  stopRecorded();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

/** Whether listening challenges can be played: recordings are on, or the browser has a Spanish voice. */
export function listeningAvailable(): boolean {
  return choice.recorded !== false || speechAvailable();
}

/** Whether a line can be heard: it has a recording, or the browser has a Spanish voice. */
export function canSpeak(text: string, spec: VoiceSpec = NARRATOR): boolean {
  return (choice.recorded !== false && hasRecording(text, spec)) || speechAvailable();
}

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Which system voice and pitch to use for a character. */
export function resolveVoice(spec: VoiceSpec): { voice: SpeechSynthesisVoice | null; pitch: number } {
  let pitch = spec.pitch ?? 1;
  // The player's own pick wins.
  const chosen = byName(choice[spec.gender]);
  if (chosen) {
    if (likelyGender(chosen) !== spec.gender) pitch *= spec.gender === 'f' ? 1.45 : 0.72;
    return { voice: chosen, pitch };
  }
  const own = pools[spec.gender];
  if (own.length) {
    // Spread characters over the good voices, but keep the best one for the narrator.
    const top = own.slice(0, Math.min(own.length, 4));
    const voice = spec.id && spec.id !== 'narrator' ? top[hash(spec.id) % top.length] : top[0];
    return { voice, pitch };
  }
  const voice = pools.any[0] ?? null;
  // No voice of the right gender: shift the pitch towards it.
  if (voice && likelyGender(voice) !== spec.gender) pitch *= spec.gender === 'f' ? 1.45 : 0.72;
  return { voice, pitch };
}

/** Read Spanish aloud: the recording if there is one, otherwise the browser's voice. Stops whatever was being said before. */
export function speak(text: string, spec: VoiceSpec | number = NARRATOR) {
  const prefs = audioPrefs();
  if (!enabled || prefs.muted || prefs.voice <= 0) return;
  const v = typeof spec === 'number' ? { ...NARRATOR, rate: spec } : spec;
  stopSpeaking();
  if (choice.recorded !== false && playRecorded(text, v)) return;
  if (!speechAvailable()) return;
  const clean = text
    .replace(/[_]{2,}/g, '…')
    .replace(/\[|\]/g, '')
    .replace(/[«»“”]/g, '');
  if (!/[a-záéíóúñü0-9]/i.test(clean)) return; // "……" — nothing to say
  try {
    const { voice, pitch } = resolveVoice(v);
    const u = new SpeechSynthesisUtterance(clean);
    u.voice = voice;
    u.lang = voice?.lang ?? 'es-ES';
    u.rate = (v.rate ?? 1) * 0.95;
    u.pitch = Math.max(0.1, Math.min(2, pitch));
    u.volume = prefs.voice;
    speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
