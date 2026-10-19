// Choosing which Wiktionary meaning a curriculum word teaches, and cleaning
// glosses up into short English prompts.

import type { WPos, WSense, Wiktionary } from './wiktionary';

export type CurriculumPos = 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'num';

/** Wiktionary parts of speech that can stand for each curriculum one. */
export const POS_MAP: Record<CurriculumPos, string[]> = {
  noun: ['n'],
  verb: ['v'],
  adj: ['adj', 'num', 'v'],
  adv: ['adv'],
  num: ['num', 'adj', 'n'],
  phrase: ['phrase', 'interj', 'proverb', 'adv', 'v', 'n', 'adj', 'prep', 'pron', 'conj', 'num'],
};

/** Senses we never teach unless asked to: they'd make confusing prompts. */
const SKIP = /\b(archaic|obsolete|dated|rare|vulgar|derogatory|offensive|pejorative|euphemistic|slang|historical|Philippines|Equatorial Guinea|Latin America|Mexico|Argentina|Colombia|Venezuela|Chile|Peru|Cuba|Caribbean|Central America|Andes|Rioplatense)\b/i;

/** "clipping of "motocicleta"; motorcycle" → "motorcycle"; "contraction of "por favor" (“please”)" → "please". */
export function cleanGloss(gloss: string): string {
  let g = gloss.trim();
  const quoted = /^(?:clipping|ellipsis|abbreviation|contraction|short form|diminutive|alternative form|alternative spelling) of "[^"]*"\s*(?:\(“([^”]*)”\))?;?\s*(.*)$/i.exec(g);
  if (quoted) g = (quoted[2] || quoted[1] || g).trim();
  // Drop leading labels like "(meteorology)" and usage hints like "[+de (something)]".
  g = g.replace(/^\([^)]*\)\s*/, '').replace(/\s*\[[^\]]*\]/g, '');
  // "female equivalent of "tío": aunt" → "aunt"; "a male teacher" → "teacher".
  g = g.replace(/^(?:fe)?male equivalent of [^:]*:\s*/i, '').replace(/^(?:an?|the) (?=\S+(?: \S+){0,2}$)/i, '').replace(/^(?:fe)?male (?=\w)/, '');
  g = g.replace(/(^|, )\((?:US|UK|Britain|British)\) /g, '$1');
  return g.trim();
}

/** Remove explanatory bracketed asides, even nested ones: "dog (# The species Canis…)". */
function dropAsides(s: string): string {
  let out = '';
  let depth = 0;
  let aside = '';
  for (const ch of s) {
    if (ch === '(') {
      depth++;
      aside += ch;
    } else if (ch === ')' && depth > 0) {
      depth--;
      aside += ch;
      if (depth === 0) {
        // Keep short disambiguators like "(fruit)" or "(colour)".
        if (aside.length <= 14 && !/[#\d]/.test(aside)) out += aside;
        aside = '';
      }
    } else if (depth > 0) aside += ch;
    else out += ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * A short prompt: the first one or two comma/semicolon alternatives, without
 * long explanations. With a hint, the alternative containing it goes first.
 */
export function shortGloss(gloss: string, hint?: string): string {
  const g = dropAsides(cleanGloss(gloss));
  const parts = g.split(/;\s*/)[0].split(/,\s*(?![^()]*\))/);
  const at = hint ? parts.findIndex((p) => p.toLowerCase().includes(hint.toLowerCase())) : -1;
  if (at > 0) {
    const [hit] = parts.splice(at, 1);
    parts.unshift(/^to /.test(parts[0]) && !/^to /.test(hit) ? `to ${hit}` : hit);
  }
  let out = parts[0];
  if (parts[1] && out.length + parts[1].length < 28) out += `, ${parts[1]}`;
  return out.trim();
}

/** The first ordinary sense of each part of speech (what a word mainly means). */
export function primarySenses(poses: WPos[]): Picked[] {
  const out: Picked[] = [];
  for (const pos of poses) {
    const sense = pos.senses.find((s) => !SKIP.test(s.q ?? '') && !/\bsenses\b/i.test(s.gloss) && !!cleanGloss(s.gloss));
    if (sense) out.push({ pos, sense });
  }
  return out;
}

export interface Picked {
  pos: WPos;
  sense: WSense;
}

/**
 * The sense a curriculum word teaches: the first ordinary sense of the right
 * part of speech, or the first whose gloss contains a hint (tried in order).
 */
export function pickSense(wk: Wiktionary, lemma: string, pos: CurriculumPos, hint?: string | string[]): Picked | undefined {
  const entries = wk.get(lemma);
  if (!entries) return undefined;
  const wanted = POS_MAP[pos];
  const ordered = [...entries.filter((p) => wanted.includes(p.pos)), ...entries.filter((p) => !wanted.includes(p.pos))];
  const all = ordered.flatMap((p) => p.senses.map((sense) => ({ pos: p, sense })));
  for (const h of typeof hint === 'string' ? [hint] : (hint ?? [])) {
    const hit = all.find(({ sense }) => cleanGloss(sense.gloss).toLowerCase().includes(h.toLowerCase()));
    if (hit) return hit;
  }
  const usable = ({ sense }: Picked) => !SKIP.test(sense.q ?? '') && !/\bsenses\b/i.test(sense.gloss) && !!cleanGloss(sense.gloss);
  return all.find(usable) ?? all[0];
}
