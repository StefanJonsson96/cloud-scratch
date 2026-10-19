// Vocabulary: the curriculum's words, filled in from Wiktionary and Tatoeba by
// `npm run data` (see scripts/data). Nothing here is typed in by hand except
// the rules of thumb that explain noun genders.

import WORDS_JSON from './generated/words.json';
import type { GenWord, Gender, POS, Variant } from './types';

export type { Gender, POS, Variant };
export { slug } from './text';

export type Word = GenWord;

export const WORDS: readonly Word[] = WORDS_JSON as Word[];
export const WORD_BY_ID: ReadonlyMap<string, Word> = new Map(WORDS.map((w) => [w.id, w]));

export function wordsUpToChapter(ch: number): Word[] {
  return WORDS.filter((w) => w.ch <= ch);
}

export function getWord(id: string): Word {
  const w = WORD_BY_ID.get(id);
  if (!w) throw new Error(`Unknown word: ${id}`);
  return w;
}

/** "el mar", "la playa", "pequeño" for display with article. */
export function withArticle(w: Word): string {
  return w.es;
}

/** Nouns whose gender trips learners up; Mateo's el/la drills favour these. */
export const TRICKY_GENDER: ReadonlySet<string> = new Set(WORDS.filter((w) => w.tricky).map((w) => w.id));

/** Spain word → the Latin American one (for "En España se dice…"). */
export const SPAIN_VS_LATAM: Readonly<Record<string, string>> = Object.fromEntries(WORDS.filter((w) => w.latam).map((w) => [w.id, w.latam!]));

/** False friend → [English look-alike, how to say that look-alike]. */
export const FALSE_FRIENDS: Readonly<Record<string, [string, string]>> = Object.fromEntries(WORDS.filter((w) => w.trap).map((w) => [w.id, w.trap!]));

/** A short rule of thumb explaining a noun's gender, shown after el/la drills. */
export function genderRule(w: Word): string {
  const b = stripMarks(w.bare);
  if (w.gender === 'f' && w.article === 'el') {
    return `Feminine — but it starts with a stressed “a”, so the singular takes EL: el ${w.bare}, las ${w.bare}s. Adjectives stay feminine: el agua fría.`;
  }
  if (['foto', 'moto', 'radio'].includes(b)) return `Feminine: “${w.bare}” is short for a feminine word (la fotografía, la motocicleta, la radiodifusión).`;
  if (b === 'mano') return 'An exception: “mano” ends in -o but is feminine — la mano.';
  if (b === 'dia' || b === 'mapa' || b === 'planeta' || b === 'sofa') return `An exception: ends in -a but is masculine — el ${w.bare}.`;
  if (b.endsWith('ma') && w.gender === 'm') return `Many words ending in -ma come from Greek and are masculine: el problema, el idioma, el tema.`;
  if (/(cion|sion|dad|tad|tud)$/.test(b)) return 'Words ending in -ción, -sión, -dad, -tad and -tud are always feminine: la canción, la ciudad, la verdad.';
  if (b === 'flor') return 'Most -or words are masculine (el amor, el color), but la flor is feminine.';
  if (b.endsWith('or') && w.gender === 'm') return 'Words ending in -or are usually masculine: el amor, el color (exception: la flor).';
  if (b.endsWith('o') && w.gender === 'm') return 'Words ending in -o are usually masculine.';
  if (b.endsWith('a') && w.gender === 'f') return 'Words ending in -a are usually feminine.';
  if (b === 'gente') return '“La gente” is feminine and singular: la gente es amable (not “son”).';
  return `No reliable rule for -${b.slice(-1)} / consonant endings: memorise it with its article — ${w.article} ${w.bare}.`;
}

function stripMarks(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
