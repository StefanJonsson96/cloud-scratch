// El Rosco, after the Spanish TV quiz Pasapalabra: a ring of letters with one
// word for each, clued by a short definition. Only words the player has
// already met come up, and answers are graded like every other typed answer.

import { WORDS, type Word } from '../data/vocab';
import type { Variant } from '../data/types';
import type { Level } from '../data/verbs';
import { ROSCO_CLUES } from '../data/rosco';
import type { Grade } from './check';
import type { SrsState } from './srs';

/** The Spanish alphabet, Ñ included. Letters no known word has (usually K and W) are left out. */
export const ALPHABET = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];

/** With fewer letters than this the ring isn't worth playing yet. */
export const MIN_LETTERS = 12;

/** With the speed bonus on, the whole ring gets a generous clock. */
export const SECONDS_PER_LETTER = 15;

export type RoscoMode = 'starts' | 'contains';

export interface RoscoQuestion {
  letter: string;
  /** "Empieza por M", or "Contiene la Ñ" for letters that hardly start a word. */
  mode: RoscoMode;
  word: Word;
  clue: string;
  /** A Spanish definition, or the word's English meaning when there is none. */
  clueLang: 'es' | 'en';
  /** The English for a Spanish clue; the first letter and length for an English one. */
  hint: string;
  accepted: string[];
  variants: Variant[];
  article?: 'el' | 'la';
}

/** A letter is still to play (pending, or skipped with «pasapalabra»), or done. */
export type LetterState = 'pending' | 'passed' | 'right' | 'wrong';

/** Upper case without accents, except that Ñ stays Ñ. */
function letters(s: string): string {
  return s.normalize('NFD').replace(/[́̈]/g, '').normalize('NFC').toUpperCase();
}

export function fits(form: string, letter: string, mode: RoscoMode): boolean {
  const l = letters(form);
  return mode === 'starts' ? l.startsWith(letter) : l.includes(letter);
}

/** Words the player has met: their chapters so far at their level, plus anything already practised. */
export function knownWords(chapter: number, srs: SrsState, level: Level = 'a2'): Word[] {
  return WORDS.filter((w) => /^\p{L}+$/u.test(w.bare) && (!!srs.cards[`w:${w.id}`] || (w.ch <= chapter && (!w.lvl || level === 'b1'))));
}

/** "fish (food)" → ["fish"]: two words sharing a meaning both answer an English clue. */
function senses(en: string): string[] {
  return en
    .replace(/\([^)]*\)/g, '')
    .split(/[,/]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

const withEmoji = (w: Word) => (w.emoji ? `${w.emoji} ${w.en}` : w.en);

function question(w: Word, letter: string, mode: RoscoMode, pool: readonly Word[]): RoscoQuestion {
  const clue = ROSCO_CLUES[w.id];
  const mine = senses(w.en);
  const alike = pool.filter((d) => d.id !== w.id && senses(d.en).some((s) => mine.includes(s)));
  const accepted = Array.from(new Set([...w.forms, ...alike.flatMap((d) => d.forms)])).filter((f) => fits(f, letter, mode));
  return {
    letter,
    mode,
    word: w,
    clue: clue ?? withEmoji(w),
    clueLang: clue ? 'es' : 'en',
    hint: clue ? withEmoji(w) : `${w.bare[0]}${' _'.repeat(w.bare.length - 1)}`,
    accepted,
    // A synonym only counts if it also fits the letter.
    variants: (w.variants ?? []).filter((v) => fits(v.form, letter, mode)),
    article: w.gender === 'm' || w.gender === 'f' ? w.article : undefined,
  };
}

/**
 * One question per letter, in alphabetical order, each a different word from
 * `pool`. A letter no word starts with asks for a word that contains it (from
 * the words left over); a letter no word has at all is left out.
 */
export function buildRosco(pool: readonly Word[], rand: () => number = Math.random): RoscoQuestion[] {
  const used = new Set<string>();
  const picked = new Map<string, RoscoQuestion>();
  for (const mode of ['starts', 'contains'] as const) {
    for (const letter of ALPHABET) {
      if (picked.has(letter)) continue;
      const fitting = pool.filter((w) => !used.has(w.id) && fits(w.bare, letter, mode));
      if (!fitting.length) continue;
      // A Spanish definition makes the better clue.
      const defined = fitting.filter((w) => ROSCO_CLUES[w.id]);
      const list = defined.length ? defined : fitting;
      const w = list[Math.floor(rand() * list.length)];
      used.add(w.id);
      picked.set(letter, question(w, letter, mode, pool));
    }
  }
  return ALPHABET.filter((l) => picked.has(l)).map((l) => picked.get(l)!);
}

/** The next letter still to play after `from`, going round the ring (maybe `from` itself); -1 when all are done. */
export function nextLetter(states: readonly LetterState[], from: number): number {
  for (let k = 1; k <= states.length; k++) {
    const i = (from + k) % states.length;
    if (states[i] === 'pending' || states[i] === 'passed') return i;
  }
  return -1;
}

/** A right answer, or a nearly right one (a missing accent, a small typo), lights the letter green. */
export function letterState(grade: Grade): LetterState {
  return grade === 'wrong' ? 'wrong' : 'right';
}

/** Euros for a ring: a few for every right letter, and the jackpot (el bote) for getting them all. */
export function roscoReward(right: number, total: number): number {
  return right * 3 + (total > 0 && right === total ? 50 : 0);
}
