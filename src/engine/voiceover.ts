// Recorded story dialogue (made by `npm run voices`): every scripted line has
// a real female or male Spanish-from-Spain voice, so characters sound right on
// any device. Each character's recording is played at their own speed, which
// also sets how high or low they sound. Lines without a recording (anything
// built at runtime) fall back to the browser's voice in speech.ts.

import index from '../data/generated/voices/index.json';
import { recordedVoice, voiceKey } from '../story/voices';
import { decodeAudio, playVoiceBuffer, stopVoiceBuffer } from './audio';

/** The voices the recordings were made with (shown under Ajustes → Créditos). */
export const VOICE_CREDITS: [string, string][] = [
  ['Female and male voice “sharvard” — Piper, trained on the Sharvard corpus (Aubanel, García Lecumberri & Cooke, University of Edinburgh)', 'CC BY 3.0'],
  ['Male voice “davefx” — Piper, trained on the davefx dataset (Nabu Casa voice-datasets)', 'CC0'],
  ['Recorded with sherpa-onnx (k2-fsa)', 'Apache 2.0'],
];

type Pack = Record<string, string>;
const INDEX = index as unknown as Record<string, [pack: string, hash: string]>;
const PACKS = import.meta.glob<Pack>('../data/generated/voices/pack-*.json', { import: 'default' });

const packs = new Map<string, Promise<Pack | undefined>>();
const buffers = new Map<string, Promise<AudioBuffer | null>>();
let heroName: () => string = () => '';
let ticket = 0;

/** Lines mention the hero by name; the recordings leave it out, so look them up without it. */
export function setHeroNameSource(fn: () => string) {
  heroName = fn;
}

function keyFor(text: string, spec: { id?: string; gender: 'f' | 'm' }) {
  const { base, play } = recordedVoice(spec);
  return { key: voiceKey(base, text, heroName() || undefined), play };
}

export function hasRecording(text: string, spec: { id?: string; gender: 'f' | 'm' }): boolean {
  return keyFor(text, spec).key in INDEX;
}

function loadPack(name: string): Promise<Pack | undefined> {
  let p = packs.get(name);
  if (!p) {
    const load = PACKS[`../data/generated/voices/pack-${name}.json`];
    p = load ? load().catch(() => undefined) : Promise.resolve(undefined);
    packs.set(name, p);
  }
  return p;
}

function bytes(b64: string): ArrayBuffer {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out.buffer;
}

function buffer(key: string): Promise<AudioBuffer | null> {
  let b = buffers.get(key);
  if (!b) {
    b = loadPack(INDEX[key][0]).then((pack) => (pack?.[key] ? decodeAudio(bytes(pack[key])) : null));
    buffers.set(key, b);
    // Keep the most recent lines decoded, not the whole story.
    if (buffers.size > 40) buffers.delete(buffers.keys().next().value!);
  }
  return b;
}

/**
 * Play the recording of a line, if there is one. Returns false straight away
 * when there isn't, so the caller can use the browser's voice instead.
 */
export function playRecorded(text: string, spec: { id?: string; gender: 'f' | 'm' }): boolean {
  const { key, play } = keyFor(text, spec);
  if (!(key in INDEX)) return false;
  const mine = ++ticket;
  void buffer(key).then((buf) => {
    // A newer line (or a stop) came first: stay quiet.
    if (!buf || mine !== ticket) return;
    playVoiceBuffer(buf, play);
    (window as unknown as { __lastVoice?: unknown }).__lastVoice = { key, rate: play, duration: buf.duration };
  });
  return true;
}

export function stopRecorded() {
  ticket++;
  stopVoiceBuffer();
}

/** Decode a story file's voices ahead of time (e.g. when a chapter starts). */
export function preloadVoices(pack: string) {
  void loadPack(pack);
}
