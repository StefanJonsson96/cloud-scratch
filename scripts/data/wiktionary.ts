// Reads the Spanish→English Wiktionary export from doozan/spanish_data
// (es-en.data, CC BY-SA, https://en.wiktionary.org).
//
// Format: entries separated by "_____", then the lemma, then one or more
// "pos:" blocks with indented fields (g, usage, gloss → q, syn).

import { readFileSync } from 'node:fs';

export interface WSyn {
  word: string;
  /** Qualifier in brackets, e.g. "colloquial" or "Mexico, Central America". */
  q?: string;
}

export interface WSense {
  gloss: string;
  q?: string;
  syn: WSyn[];
}

export interface WPos {
  pos: string;
  g?: string;
  usage?: string;
  senses: WSense[];
}

export type Wiktionary = Map<string, WPos[]>;

/** "automóvil; (Mexico, Colombia) carro; jugo (Latin America)" → words with qualifiers. */
export function parseSyn(raw: string): WSyn[] {
  return raw
    .split(/;(?![^()]*\))/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const pre = /^\(([^)]*)\)\s*(.+)$/.exec(part);
      if (pre) return { word: pre[2].trim(), q: pre[1] };
      const post = /^(.+?)\s*\(([^)]*)\)$/.exec(part);
      if (post) return { word: post[1].trim(), q: post[2] };
      return { word: part };
    });
}

export function readWiktionary(file: string): Wiktionary {
  const out: Wiktionary = new Map();
  const text = readFileSync(file, 'utf8');
  for (const chunk of text.split('_____\n')) {
    const lines = chunk.split('\n');
    const lemma = lines[0]?.trim();
    if (!lemma) continue;
    const poses: WPos[] = out.get(lemma) ?? [];
    let pos: WPos | undefined;
    let sense: WSense | undefined;
    // "_gloss" lines are sub-senses of the gloss above them. Some parents are
    // only headings ("Figurative senses"); pickSense skips those.
    let parent: WSense | undefined;
    for (const line of lines.slice(1)) {
      const m = /^( *)([a-z_]+): ?(.*)$/.exec(line);
      if (!m) continue;
      const [, indent, key, value] = m;
      if (indent.length === 0 && key === 'pos') {
        pos = { pos: value, senses: [] };
        poses.push(pos);
        sense = undefined;
      } else if (!pos) {
        continue;
      } else if (indent.length === 2) {
        if (key === 'g') pos.g = value;
        else if (key === 'usage') pos.usage = value;
        else if (key === 'gloss') {
          sense = parent = { gloss: value, syn: [] };
          pos.senses.push(sense);
        }
      } else if (indent.length === 4 && key === '_gloss' && parent) {
        sense = { gloss: value, syn: [] };
        pos.senses.push(sense);
      } else if ((indent.length === 4 || indent.length === 6) && sense) {
        if (key === 'q') sense.q = value;
        else if (key === 'syn') sense.syn.push(...parseSyn(value));
      }
    }
    if (poses.length) out.set(lemma, poses);
  }
  return out;
}
