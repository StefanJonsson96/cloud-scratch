// Sentences for word-order challenges (the "Palabra Final" ultimates) and
// fill-in-the-blank prompts: short Tatoeba sentences that only use words and
// tenses taught by each chapter, picked by `npm run data`.

import type { GenSentence } from './types';
import { tokenize } from './text';
import sentences from './generated/sentences.json';

export interface Sentence extends GenSentence {
  /** Other accepted orders, written like `es`. */
  alt?: string[];
}

const S = sentences as Sentence[];

export const SENTENCES: readonly Sentence[] = S;

export function sentencesUpToChapter(ch: number, level: 'a1' | 'a2' | 'b1' = 'a2'): Sentence[] {
  const pool = S.filter((s) => s.ch <= Math.max(1, ch) && (level === 'b1' || !s.lvl));
  if (level !== 'a1') return pool;
  // Beginners build short sentences.
  const short = pool.filter((s) => tokenize(s.es).length <= 6);
  return short.length >= 3 ? short : pool;
}

export { tokenize };
