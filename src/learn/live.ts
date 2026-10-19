// The live half of answer checking: when a typed answer isn't one we know, ask
// Wiktionary before calling it wrong. Our bundled data comes from Wiktionary
// too, so this only catches what the build left out (rarer synonyms, slang
// added since the last `npm run data`). Offline, blocked or slow → no verdict,
// and the answer is graded as before.

import { register, regionLabel } from '../data/regions';
import type { Variant } from '../data/types';
import { normalize } from './check';

const API = 'https://en.wiktionary.org/api/rest_v1/page/definition/';
const TIMEOUT_MS = 3000;

export interface LiveSense {
  pos: string;
  gloss: string;
  /** Leading label: "(Latin America, colloquial)". */
  q?: string;
}

type Fetch = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

const cache = new Map<string, Promise<LiveSense[] | undefined>>();

function text(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Spanish senses of a word on English Wiktionary, or undefined if we couldn't ask. */
export function liveSenses(word: string, fetcher: Fetch = globalThis.fetch?.bind(globalThis) as Fetch): Promise<LiveSense[] | undefined> {
  const key = word.trim().toLowerCase();
  if (!key || !fetcher) return Promise.resolve(undefined);
  let hit = cache.get(key);
  if (!hit) {
    hit = (async () => {
      try {
        const signal = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(TIMEOUT_MS) : undefined;
        const res = await fetcher(API + encodeURIComponent(key.replace(/ /g, '_')), { signal });
        if (!res.ok) return [];
        const data = (await res.json()) as Record<string, { partOfSpeech: string; definitions: { definition: string }[] }[]>;
        return (data.es ?? []).flatMap((p) =>
          p.definitions.map((d) => {
            const t = text(d.definition);
            const m = /^\(([^)]*)\)\s*(.*)$/.exec(t);
            return m ? { pos: p.partOfSpeech, gloss: m[2], q: m[1] } : { pos: p.partOfSpeech, gloss: t };
          }),
        );
      } catch {
        cache.delete(key);
        return undefined;
      }
    })();
    cache.set(key, hit);
  }
  return hit;
}

const STOP = new Set(['the', 'and', 'for', 'with', 'something', 'someone', 'one', 'oneself', 'that', 'this', 'from', 'used']);
const meaningWords = (en: string) =>
  new Set(
    en
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z' ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
const FORM_OF = /^(?:plural|feminine|masculine|feminine plural|masculine plural|inflection|alternative form|alternative spelling) of (\S+)/i;

/**
 * Does Wiktionary say `typed` means `meaning`? Returns a variant to grade it by
 * (synonym → correct, regional → almost), or undefined if it doesn't or we
 * couldn't ask.
 */
export async function liveVariant(typed: string, meaning: string, spain: string, fetcher?: Fetch): Promise<Variant | undefined> {
  const form = normalize(typed);
  const want = meaningWords(meaning);
  if (!form || !want.size) return undefined;
  let senses = await liveSenses(form, fetcher);
  // "coches" → "plural of coche": check the lemma's senses.
  const ref = senses?.map((s) => FORM_OF.exec(s.gloss)?.[1]).find(Boolean);
  if (ref) senses = [...(senses ?? []), ...((await liveSenses(ref.replace(/[^\p{L} ]/gu, ''), fetcher)) ?? [])];
  for (const s of senses ?? []) {
    const reg = register(s.q);
    if (reg === 'reject' || ![...meaningWords(s.gloss)].some((w) => want.has(w))) continue;
    if (reg === 'regional') return { form, kind: 'regional', note: `Wiktionary: «${form}» is used in ${regionLabel(s.q!)}. In Spain: «${spain}».` };
    if (reg === 'informal') return { form, kind: 'informal', note: `Wiktionary: «${form}» is informal for “${s.gloss}” — fine with friends.` };
    return { form, kind: 'synonym', note: `Wiktionary: «${form}» also means “${s.gloss}”.` };
  }
  return undefined;
}
