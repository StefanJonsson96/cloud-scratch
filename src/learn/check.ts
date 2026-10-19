// Typed-answer checking: forgiving enough to be fun, strict enough to teach.

import type { Variant } from '../data/types';

export type Grade = 'fast' | 'correct' | 'close' | 'wrong';

export interface CheckResult {
  grade: Exclude<Grade, 'fast'>;
  /** Short explanation shown to the player ("close" answers and variants). */
  note?: string;
  /** The accepted answer the input was matched against. */
  matched?: string;
}

/** Lowercase, trim, drop punctuation, collapse whitespace. Keeps accents. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[¿?¡!.,;:"'«»()—–\-…“”‘’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove accents and tildes: "mañana" → "manana". */
export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

const ARTICLES = new Set(['el', 'la', 'los', 'las', 'un', 'una']);

export interface CheckOptions {
  /** For nouns: the correct article ("el"/"la"), so a wrong one can be flagged. */
  article?: 'el' | 'la';
  /** Treat a missing accent as fully correct (accessibility setting / amulet). */
  accentsOptional?: boolean;
  /**
   * Other right answers: synonyms and informal words count as correct,
   * regional ones (Latin America, Canarias…) as "almost", each with a note.
   */
  variants?: readonly Variant[];
}

/**
 * Compare a typed answer against a list of accepted answers and their variants.
 * Returns correct, close (accent / small typo / wrong article / regional word) or wrong.
 */
export function checkTyped(input: string, accepted: string[], opts: CheckOptions = {}): CheckResult {
  let ans = normalize(input);
  if (!ans) return { grade: 'wrong' };

  let articleNote: string | undefined;
  const parts = ans.split(' ');
  if (parts.length > 1 && ARTICLES.has(parts[0])) {
    const typedArticle = parts[0];
    const rest = parts.slice(1).join(' ');
    // Only strip the article if the accepted answers don't themselves start with one.
    const acceptedHasArticle = accepted.some((a) => ARTICLES.has(normalize(a).split(' ')[0]) && normalize(a).includes(' '));
    if (!acceptedHasArticle) {
      if (opts.article && (typedArticle === 'el' || typedArticle === 'la') && typedArticle !== opts.article) {
        articleNote = `Careful: it's “${opts.article} ${rest}”.`;
      }
      ans = rest;
    }
  }

  const norms = accepted.map(normalize);

  // 1. Exact.
  const exact = norms.findIndex((a) => a === ans);
  if (exact >= 0) {
    if (articleNote) return { grade: 'close', note: articleNote, matched: accepted[exact] };
    return { grade: 'correct', matched: accepted[exact] };
  }

  // 2. Same letters, missing/wrong accents.
  const bare = stripAccents(ans);
  const accentIdx = norms.findIndex((a) => stripAccents(a) === bare);
  if (accentIdx >= 0) {
    const target = accepted[accentIdx];
    if (opts.accentsOptional && !articleNote) return { grade: 'correct', matched: target };
    return { grade: 'close', note: articleNote ?? `Watch the accent: “${normalize(target)}”.`, matched: target };
  }

  // 3. Another word for the same thing ("porfa" for "por favor"). Its own
  // article may differ (la nevera / el frigorífico), so no article note.
  const variant = matchVariant(ans, opts.variants ?? []);
  if (variant) {
    const accentSlip = normalize(variant.form) !== ans && !opts.accentsOptional;
    const note = accentSlip ? `${variant.note} Watch the accent: “${normalize(variant.form)}”.` : variant.note;
    return { grade: variant.kind === 'regional' || accentSlip ? 'close' : 'correct', note, matched: variant.form };
  }

  // 4. One small typo (two for long answers).
  let best = Infinity;
  let bestIdx = -1;
  norms.forEach((a, i) => {
    const d = levenshtein(bare, stripAccents(a));
    if (d < best) {
      best = d;
      bestIdx = i;
    }
  });
  if (bestIdx >= 0) {
    const len = stripAccents(norms[bestIdx]).length;
    const allowed = len >= 9 ? 2 : len >= 4 ? 1 : 0;
    if (best <= allowed) {
      const target = accepted[bestIdx];
      return { grade: 'close', note: `Almost! It's spelled “${normalize(target)}”.`, matched: target };
    }
  }

  return { grade: 'wrong' };
}

/** A variant matching the typed answer, ignoring accents. */
export function matchVariant(ans: string, variants: readonly Variant[]): Variant | undefined {
  const bare = stripAccents(normalize(ans));
  return variants.find((v) => stripAccents(normalize(v.form)) === bare);
}
