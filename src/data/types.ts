// The shape of the generated data in src/data/generated (written by
// `npm run data`, read by the game).

export type POS = 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'num';
export type Gender = 'm' | 'f' | 'both';
export type Six = [string, string, string, string, string, string];
export type TenseId = 'presente' | 'perfecto' | 'indefinido' | 'imperfecto' | 'futuro' | 'condicional' | 'subjuntivo' | 'imperativo';
export type DrillTopic = 'serEstar' | 'porPara' | 'gustar' | 'subjuntivo';

/** Another answer for a word, and how to grade it. */
export interface Variant {
  form: string;
  /** synonym and informal count as right; regional is "almost" with a note. */
  kind: 'synonym' | 'informal' | 'regional';
  note: string;
}

export interface GenWord {
  id: string;
  /** Display form, with article for nouns: "el mar". */
  es: string;
  bare: string;
  /** Accepted typed answers (both genders where they exist). */
  forms: string[];
  en: string;
  pos: POS;
  gender?: Gender;
  article?: 'el' | 'la';
  cat: string;
  ch: number;
  emoji?: string;
  /** An example sentence from Tatoeba: [spanish, english]. */
  ex?: [string, string];
  /** Credit for the example sentence. */
  exSrc?: string;
  lvl?: 'b1';
  /** A noun whose gender doesn't follow the -o / -a rule of thumb. */
  tricky?: boolean;
  /** The Latin American word for the same thing, if Spain uses a different one. */
  latam?: string;
  /** False friends: [the English look-alike, how to really say it]. */
  trap?: [string, string];
  variants?: Variant[];
  /** Wiktionary's usage note, when there is one. */
  usage?: string;
}

export interface GenVerb {
  inf: string;
  /** English forms; `sense` tells apart verbs that share them: tocar = to play (a musical instrument). */
  en: { base: string; s3: string; past: string; pp: string; sense?: string };
  ch: number;
  forms: Record<TenseId, Six>;
  irregular: Partial<Record<TenseId, true>>;
}

export interface GenSentence {
  es: string;
  en: string;
  ch: number;
  lvl?: 'b1';
  src: string;
}

export interface GenDrill {
  id: string;
  topic: DrillTopic;
  ch: number;
  /** Sentence with "___" where the answer goes. */
  es: string;
  en: string;
  answer: string;
  wrong: string[];
  rule: string;
  src: string;
}

/** Tap-to-translate: form → [lemma, english, note?, curriculum word id?] (JSON writes a missing note as null). */
export interface GenDictionary {
  words: Record<string, [string, string, (string | null)?, (string | null)?]>;
  phrases: Record<string, [string, string, (string | null)?]>;
}

export interface GenMeta {
  source: { repo: string; commit: string; date: string };
  licenses: Record<string, string>;
  counts: Record<string, number>;
}
