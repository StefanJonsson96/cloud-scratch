// Every inflected Spanish form and its lemma(s), from es_allforms.csv in
// doozan/spanish_data (derived from Wiktionary, CC BY-SA).
// Line format: form,pos,lemma[,lemma…]

import { readFileSync } from 'node:fs';

export interface FormIndex {
  /** form → [pos, lemma][] */
  lemmas: Map<string, [string, string][]>;
  /** lemma → forms */
  forms: Map<string, Set<string>>;
}

export function readForms(file: string): FormIndex {
  const lemmas = new Map<string, [string, string][]>();
  const forms = new Map<string, Set<string>>();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const cells = line.split(',');
    if (cells.length < 3) continue;
    const [form, pos, ...lems] = cells;
    for (const lemma of lems) {
      if (!lemma) continue;
      let l = lemmas.get(form);
      if (!l) lemmas.set(form, (l = []));
      l.push([pos, lemma]);
      let f = forms.get(lemma);
      if (!f) forms.set(lemma, (f = new Set()));
      f.add(form);
    }
  }
  return { lemmas, forms };
}

/** The lemma a form belongs to, preferring the given parts of speech. */
export function lemmaOf(idx: FormIndex, form: string, prefer: string[] = []): string | undefined {
  const hits = idx.lemmas.get(form);
  if (!hits) return undefined;
  return (hits.find(([p]) => prefer.includes(p)) ?? hits[0])[1];
}
