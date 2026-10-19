import { describe, expect, it } from 'vitest';
import { checkTyped } from '../src/learn/check';
import { liveVariant } from '../src/learn/live';
import { distractors } from '../src/learn/challenges';
import { WORDS, getWord } from '../src/data/vocab';
import { VERBS } from '../src/data/verbs';
import { SENTENCES } from '../src/data/sentences';
import { GRAMMAR } from '../src/data/grammar';
import { lookup } from '../src/learn/dictionary';
import meta from '../src/data/generated/meta.json';

const opts = (id: string) => ({ variants: getWord(id).variants });

describe('more than one right answer', () => {
  it('accepts informal words and synonyms, with a note', () => {
    const porfa = checkTyped('porfa', getWord('por-favor').forms, opts('por-favor'));
    expect(porfa.grade).toBe('correct');
    expect(porfa.note).toMatch(/informal/);
    expect(checkTyped('andar', getWord('caminar').forms, opts('caminar')).grade).toBe('correct');
    expect(checkTyped('automóvil', getWord('coche').forms, opts('coche')).grade).toBe('correct');
    // Same accent rules as the main answer.
    expect(checkTyped('automovil', getWord('coche').forms, opts('coche')).grade).toBe('close');
    expect(checkTyped('automovil', getWord('coche').forms, { ...opts('coche'), accentsOptional: true }).grade).toBe('correct');
  });

  it('marks Latin American words as almost, saying what Spain uses', () => {
    const r = checkTyped('carro', getWord('coche').forms, opts('coche'));
    expect(r.grade).toBe('close');
    expect(r.note).toMatch(/In Spain: «coche»/);
    expect(checkTyped('jugo', getWord('zumo').forms, opts('zumo')).grade).toBe('close');
    expect(checkTyped('celular', getWord('movil').forms, opts('movil')).grade).toBe('close');
  });

  it('still prefers the taught word, and still rejects wrong ones', () => {
    expect(checkTyped('coche', getWord('coche').forms, opts('coche')).grade).toBe('correct');
    expect(checkTyped('perro', getWord('coche').forms, opts('coche')).grade).toBe('wrong');
  });

  it('never offers another right answer as a wrong option', () => {
    const vale = getWord('vale');
    const forms = new Set((vale.variants ?? []).map((v) => v.form));
    for (let seed = 1; seed < 40; seed++) {
      let s = seed;
      const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
      for (const d of distractors(vale, 3, rand, 5)) expect(forms.has(d.bare), d.bare).toBe(false);
    }
  });
});

describe('live check against Wiktionary', () => {
  const page = (defs: [string, string][]) => ({
    ok: true,
    json: async () => ({ es: [{ partOfSpeech: 'Noun', definitions: defs.map(([q, g]) => ({ definition: q ? `(<span>${q}</span>) ${g}` : `<a href="#">${g}</a>` })) }] }),
  });

  it('accepts a word Wiktionary says means the same thing', async () => {
    const fetcher = async () => page([['', 'car, automobile']]);
    const v = await liveVariant('Turismo', 'car, automobile', 'coche', fetcher);
    expect(v).toMatchObject({ form: 'turismo', kind: 'synonym' });
  });

  it('treats regional meanings as almost', async () => {
    const fetcher = async () => page([['Mexico', 'bus']]);
    const v = await liveVariant('camioncito', 'bus, coach', 'autobús', fetcher);
    expect(v?.kind).toBe('regional');
    expect(v?.note).toMatch(/In Spain: «autobús»/);
  });

  it('gives no verdict for other meanings, rude words or no connection', async () => {
    expect(await liveVariant('mesa', 'car', 'coche', async () => page([['', 'table']]))).toBeUndefined();
    expect(await liveVariant('xyz', 'car', 'coche', async () => page([['vulgar', 'car']]))).toBeUndefined();
    const offline = async () => {
      throw new TypeError('Failed to fetch');
    };
    expect(await liveVariant('offline', 'car', 'coche', offline)).toBeUndefined();
  });
});

describe('generated data', () => {
  it('records where it came from', () => {
    expect(meta.source.repo).toBe('doozan/spanish_data');
    expect(meta.source.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(Object.keys(meta.licenses).join(' ')).toMatch(/Wiktionary.*Tatoeba/);
  });

  it('gives every word a meaning and forms', () => {
    for (const w of WORDS) {
      expect(w.en.length, w.id).toBeGreaterThan(1);
      expect(w.forms.length, w.id).toBeGreaterThan(0);
      expect(w.en, w.id).not.toMatch(/senses|Used other than|inflection of/i);
    }
  });

  it('conjugates every verb in every taught tense, Spain style', () => {
    for (const v of VERBS) for (const f of v.forms.presente) expect(f, v.inf).toBeTruthy();
    expect(VERBS.find((v) => v.inf === 'hablar')!.forms.presente[4]).toBe('habláis');
  });

  it('credits every Tatoeba sentence and keeps them Spain-friendly', () => {
    for (const s of [...SENTENCES, ...GRAMMAR]) {
      expect(s.src, s.es).toMatch(/tatoeba\.org/);
      expect(s.es, s.es).not.toMatch(/\bustedes\b/i);
    }
  });

  it('explains verb forms with pronouns attached and ambiguous little words', () => {
    expect(lookup('díselo')).toMatchObject({ lemma: 'decir' });
    expect(lookup('sé')).toMatchObject({ lemma: 'saber' });
    expect(lookup('buena')).toMatchObject({ lemma: 'bueno' });
    expect(lookup('vosotros')?.en).toMatch(/Spain/);
  });
});
