// English/Spanish sentence pairs from Tatoeba (CC BY 2.0 FR), as packaged in
// sentences.tsv by doozan/spanish_data, with lemma tags from FreeLing.
// Columns: english, spanish, credit, english proficiency, spanish proficiency, tags
// Tags look like ":v,tengas|tener :n,noche :art,una|uno" — pos, then form|lemma.

import { readFileSync } from 'node:fs';

export interface Pair {
  en: string;
  es: string;
  credit: string;
  /** Tatoeba sentence id of the Spanish sentence. */
  id: string;
  /** Self-reported Spanish proficiency of the author (5 = native). */
  esLevel: number;
  /** Lemmas by part of speech. */
  lemmas: Map<string, Set<string>>;
  /** form → lemma for the tagged words. */
  formLemma: Map<string, string>;
  /** Every tagged word: [form, pos, lemma]. */
  tagged: [string, string, string][];
}

export function readSentences(file: string): Pair[] {
  const out: Pair[] = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const [en, es, credit, , esLevel, tags] = line.split('\t');
    if (!es || !en || !tags) continue;
    const lemmas = new Map<string, Set<string>>();
    const formLemma = new Map<string, string>();
    const tagged: [string, string, string][] = [];
    for (const group of tags.trim().split(/\s+/)) {
      const m = /^:([a-z-]+),(.*)$/.exec(group);
      if (!m || m[1] === 'phrase') continue;
      // Words inside an idiom are tagged ":phrase-v,cunda|cundir"; a participle
      // is judged by its verb (":part-verb,abierta|abrir").
      const pos = m[1].replace(/^phrase-/, '').replace(/^part-verb$/, 'v');
      for (const item of m[2].split(',')) {
        const [form, lemma = form] = item.split('|');
        let set = lemmas.get(pos);
        if (!set) lemmas.set(pos, (set = new Set()));
        set.add(lemma);
        formLemma.set(form.toLowerCase(), lemma);
        tagged.push([form.toLowerCase(), pos, lemma]);
      }
    }
    const id = /#(\d+) \([^)]*\)\s*$/.exec(credit)?.[1] ?? '';
    out.push({ en, es, credit, id, esLevel: Number(esLevel) || 0, lemmas, formLemma, tagged });
  }
  return out;
}

export function allLemmas(p: Pair): Set<string> {
  const s = new Set<string>();
  for (const set of p.lemmas.values()) for (const l of set) s.add(l);
  return s;
}
