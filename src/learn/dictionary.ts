// Tap-any-word translation. Every Spanish line in the game is run through
// `annotate`, which finds vocabulary, expressions, conjugated verbs and little
// words so the player can tap them for a meaning.

import type { GenDictionary } from '../data/types';
import dictionary from '../data/generated/dictionary.json';
import { GAME_WORDS } from '../data/gameWords';

export interface Entry {
  /** Dictionary form: "el mar", "tener". */
  lemma: string;
  en: string;
  /** Grammar note, e.g. "yo · presente". */
  note?: string;
  /** Vocabulary id if this is a Grimorio word. */
  wordId?: string;
}

const MAP = new Map<string, Entry>();
const PHRASES = new Map<string, Entry>();
let MAX_PHRASE = 1;

function key(s: string) {
  return s.toLowerCase().normalize('NFC');
}

function put(form: string, e: Entry, override = false) {
  const k = key(form);
  if (!k) return;
  if (k.includes(' ')) {
    if (!PHRASES.has(k) || override) PHRASES.set(k, e);
    MAX_PHRASE = Math.max(MAX_PHRASE, k.split(' ').length);
  } else if (!MAP.has(k) || override) {
    MAP.set(k, e);
  }
}

// Every word and expression in the game's text, looked up in Wiktionary by
// `npm run data` (curriculum words use their lesson's meaning).
const DICT = dictionary as unknown as GenDictionary;
for (const [form, [lemma, en, note, wordId]] of Object.entries(DICT.words)) put(form, { lemma, en, note: note ?? undefined, wordId: wordId ?? undefined });
for (const [phrase, [lemma, en, wordId]] of Object.entries(DICT.phrases)) put(phrase, { lemma, en, wordId: wordId ?? undefined });
for (const [es, en] of GAME_WORDS) put(es, { lemma: es, en });

export function lookup(word: string): Entry | undefined {
  return MAP.get(key(word));
}

export interface Segment {
  text: string;
  entry?: Entry;
}

const TOKEN = /([\p{L}\p{M}]+(?:['’][\p{L}]+)?)|([^\p{L}\p{M}]+)/gu;

/** Split Spanish text into tappable segments. */
export function annotate(text: string): Segment[] {
  const raw: { text: string; word: boolean }[] = [];
  for (const m of text.matchAll(TOKEN)) raw.push({ text: m[0], word: !!m[1] });
  const out: Segment[] = [];
  for (let i = 0; i < raw.length; i++) {
    const tok = raw[i];
    if (!tok.word) {
      out.push({ text: tok.text });
      continue;
    }
    // Try the longest multi-word expression starting here (words separated by spaces/commas).
    let matched = false;
    for (let n = Math.min(MAX_PHRASE, 8); n >= 2 && !matched; n--) {
      const words: string[] = [];
      let j = i;
      for (; j < raw.length && words.length < n; j++) {
        if (raw[j].word) words.push(raw[j].text);
        else if (!/^[\s,]+$/.test(raw[j].text)) break;
      }
      if (words.length !== n) continue;
      const e = PHRASES.get(key(words.join(' ')));
      if (e) {
        out.push({ text: raw.slice(i, j).map((r) => r.text).join(''), entry: e });
        i = j - 1;
        matched = true;
      }
    }
    if (!matched) out.push({ text: tok.text, entry: lookup(tok.text) });
  }
  return out;
}

/** Words in `text` the dictionary can't explain (used by tests to keep coverage complete). */
export function unknownWords(text: string, names: string[] = []): string[] {
  const skip = new Set(names.map(key));
  return annotate(text)
    .filter((s) => /\p{L}/u.test(s.text) && !s.entry && !skip.has(key(s.text)))
    .map((s) => s.text);
}

export function addDictionaryWords(rows: [string, string][]) {
  for (const [es, en] of rows) put(es, { lemma: es, en });
}
