import { describe, expect, it } from 'vitest';
import { checkTyped, levenshtein, normalize, stripAccents } from '../src/learn/check';
import { newSrs, pick, record } from '../src/learn/srs';
import {
  blankExample,
  checkOrder,
  makeChallenge,
  wordKey,
  type ChallengeContext,
  type ChallengeStyle,
} from '../src/learn/challenges';
import { WORDS, getWord, SPAIN_VS_LATAM, FALSE_FRIENDS } from '../src/data/vocab';
import { VERBS, VERB_BY_INF, conjugate, englishFor, regular, participle } from '../src/data/verbs';
import { GRAMMAR } from '../src/data/grammar';
import { SENTENCES, tokenize } from '../src/data/sentences';

function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('answer checking', () => {
  it('normalizes punctuation and case', () => {
    expect(normalize('  ¿Cómo  Estás? ')).toBe('cómo estás');
    expect(stripAccents('mañana')).toBe('manana');
  });

  it('grades exact, accent and typo answers', () => {
    expect(checkTyped('agua', ['agua']).grade).toBe('correct');
    expect(checkTyped('Agua!', ['agua']).grade).toBe('correct');
    expect(checkTyped('arbol', ['árbol']).grade).toBe('close');
    expect(checkTyped('arbol', ['árbol'], { accentsOptional: true }).grade).toBe('correct');
    expect(checkTyped('maripsa', ['mariposa']).grade).toBe('close');
    expect(checkTyped('gato', ['perro']).grade).toBe('wrong');
    expect(checkTyped('', ['perro']).grade).toBe('wrong');
    // Short words don't get typo tolerance.
    expect(checkTyped('sal', ['sol']).grade).toBe('wrong');
  });

  it('accepts articles and flags the wrong one', () => {
    expect(checkTyped('el mar', ['mar'], { article: 'el' }).grade).toBe('correct');
    const r = checkTyped('la mar', ['mar'], { article: 'el' });
    expect(r.grade).toBe('close');
    expect(r.note).toContain('el mar');
  });

  it('keeps articles that are part of the answer', () => {
    expect(checkTyped('la cuenta por favor', ['la cuenta, por favor']).grade).toBe('correct');
    expect(checkTyped('me pone', ['¿me pone…?']).grade).toBe('correct');
  });

  it('computes edit distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('', 'abc')).toBe(3);
  });
});

describe('vocabulary data', () => {
  it('has unique ids', () => {
    const ids = WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('parses nouns, genders and variants', () => {
    expect(getWord('mar')).toMatchObject({ pos: 'noun', gender: 'm', article: 'el', bare: 'mar' });
    expect(getWord('agua')).toMatchObject({ gender: 'f', article: 'el' });
    expect(getWord('playa')).toMatchObject({ gender: 'f', article: 'la' });
    expect(getWord('amigo')).toMatchObject({ gender: 'both', forms: ['amigo', 'amiga'] });
    expect(getWord('pequeno').forms).toEqual(['pequeño', 'pequeña']);
    expect(getWord('la-cuenta-por-favor').pos).toBe('phrase');
  });

  it('has enough words per chapter', () => {
    for (let ch = 0; ch <= 5; ch++) {
      expect(WORDS.filter((w) => w.ch === ch).length).toBeGreaterThanOrEqual(15);
    }
  });

  it('has no duplicate english meanings that would make choices ambiguous', () => {
    const seen = new Map<string, string>();
    for (const w of WORDS) {
      const prev = seen.get(w.en);
      expect(prev, `${w.es} and ${prev} both mean "${w.en}"`).toBeUndefined();
      seen.set(w.en, w.es);
    }
  });

  it('example sentences contain their word where a blank is possible', () => {
    const blanks = WORDS.filter((w) => blankExample(w));
    expect(blanks.length).toBeGreaterThan(WORDS.length * 0.6);
    const frio = getWord('frio');
    const b = blankExample(frio)!;
    expect(b.whole).toBe(true);
    expect(frio.forms.map((f) => f.toLowerCase())).toContain(b.form.toLowerCase());
    expect(b.text.split('_____').length).toBe(2);
    expect(frio.ex![0]).toBe(b.text.replace('_____', b.form));
  });
});

describe('verbs', () => {
  const v = (inf: string) => VERB_BY_INF.get(inf)!;

  it('conjugates regular verbs including vosotros', () => {
    expect(regular('hablar', 'presente')).toEqual(['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan']);
    expect(regular('comer', 'presente')).toEqual(['como', 'comes', 'come', 'comemos', 'coméis', 'comen']);
    expect(regular('vivir', 'presente')).toEqual(['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven']);
    expect(regular('cantar', 'indefinido')).toEqual(['canté', 'cantaste', 'cantó', 'cantamos', 'cantasteis', 'cantaron']);
    expect(regular('comer', 'imperfecto')).toEqual(['comía', 'comías', 'comía', 'comíamos', 'comíais', 'comían']);
  });

  it('builds the pretérito perfecto with haber + participle', () => {
    expect(conjugate(v('comer'), 'vosotros', 'perfecto')).toBe('habéis comido');
    expect(conjugate(v('hacer'), 'yo', 'perfecto')).toBe('he hecho');
    expect(participle('escribir')).toBe('escrito');
    expect(participle('hablar')).toBe('hablado');
  });

  it('uses irregular tables', () => {
    expect(conjugate(v('tener'), 'yo')).toBe('tengo');
    expect(conjugate(v('tener'), 'ella')).toBe('tiene');
    expect(conjugate(v('ser'), 'vosotros')).toBe('sois');
    expect(conjugate(v('ir'), 'ellos', 'indefinido')).toBe('fueron');
    expect(conjugate(v('dormir'), 'él', 'indefinido')).toBe('durmió');
    expect(conjugate(v('ser'), 'nosotros', 'imperfecto')).toBe('éramos');
    expect(conjugate(v('jugar'), 'yo', 'indefinido')).toBe('jugué');
  });

  it('translates every tense', () => {
    expect(englishFor(v('tener'), 'ella')).toBe('she has');
    expect(englishFor(v('ser'), 'yo')).toBe('I am');
    expect(englishFor(v('ser'), 'nosotros')).toBe('we are');
    expect(englishFor(v('comer'), 'vosotros', 'perfecto')).toBe('you all have eaten');
    expect(englishFor(v('ir'), 'yo', 'indefinido')).toBe('I went');
    expect(englishFor(v('jugar'), 'nosotros', 'imperfecto')).toBe('we used to play');
    expect(englishFor(v('poder'), 'ella', 'presente')).toBe('she is able to');
    expect(englishFor(v('poder'), 'yo', 'indefinido')).toBe('I was able to');
    // Verbs that share an English meaning say which one they are.
    expect(v('tocar').en.sense).toBe('a musical instrument');
    expect(v('conocer').en.sense).toBe('a person or a place');
  });

  it('has unique infinitives', () => {
    const infs = VERBS.map((x) => x.inf);
    expect(new Set(infs).size).toBe(infs.length);
  });
});

describe('grammar drills', () => {
  it('every item has exactly one blank and distinct options', () => {
    for (const g of GRAMMAR) {
      expect(g.es.split('___').length, g.es).toBe(2);
      expect(g.wrong).not.toContain(g.answer);
      expect(g.en.length).toBeGreaterThan(3);
    }
  });

  it('generates gustar with the right number', () => {
    const items = GRAMMAR.filter((g) => g.topic === 'gustar');
    expect(items.length).toBeGreaterThan(10);
    for (const g of items) {
      expect(['gusta', 'gustan'], g.es).toContain(g.answer);
      expect(g.wrong).toEqual([g.answer === 'gusta' ? 'gustan' : 'gusta']);
      expect(g.es).toMatch(/\b(me|te|le|nos|os|les) ___/i);
    }
  });
});

describe('sentences', () => {
  it('tokenizes and checks order', () => {
    expect(tokenize('Hola, me llamo Rosa.')).toEqual(['hola', 'me', 'llamo', 'Rosa']);
    expect(checkOrder(['no', 'estás', 'solo'], [tokenize('No estás solo.')])).toBe(true);
    expect(checkOrder(['estás', 'no', 'solo'], [tokenize('No estás solo.')])).toBe(false);
  });

  it('every chapter has sentences', () => {
    for (let ch = 1; ch <= 5; ch++) expect(SENTENCES.filter((s) => s.ch === ch).length).toBeGreaterThanOrEqual(8);
  });
});

describe('spaced repetition', () => {
  it('fast-tracks words known on first sight and demotes mistakes', () => {
    const srs = newSrs();
    expect(record(srs, 'w:mar', 'correct').box).toBe(2);
    expect(record(srs, 'w:mar', 'correct').box).toBe(3);
    expect(record(srs, 'w:mar', 'wrong').box).toBe(1);
    expect(record(srs, 'w:sol', 'wrong').box).toBe(0);
    expect(record(srs, 'w:sol', 'correct').box).toBe(1);
  });

  it('respects the per-format box cap', () => {
    const srs = newSrs();
    record(srs, 'w:mar', 'correct', 0, 2);
    expect(record(srs, 'w:mar', 'correct', 0, 2).box).toBe(2);
  });

  it('brings back weak cards sooner than strong ones', () => {
    const srs = newSrs();
    const now = 1_000_000;
    record(srs, 'w:weak', 'wrong', now);
    for (let i = 0; i < 6; i++) record(srs, 'w:strong', 'correct', now);
    for (let i = 0; i < 4; i++) record(srs, `w:filler${i}`, 'correct', now);
    const choice = pick(srs, ['w:weak', 'w:strong'], { rand: () => 0.5, now, allowNew: false });
    expect(choice).toBe('w:weak');
  });

  it('limits how many new words are in rotation', () => {
    const srs = newSrs();
    for (let i = 0; i < 7; i++) record(srs, `w:n${i}`, 'wrong');
    const choice = pick(srs, ['w:brandnew', 'w:n0'], { rand: () => 0.5 });
    expect(choice).toBe('w:n0');
  });
});

describe('challenge generation', () => {
  const styles: ChallengeStyle[] = ['vocab', 'quick', 'verb', 'sentence'];

  function ctx(seed: number, chapter: number): ChallengeContext {
    return { srs: newSrs(), chapter, rand: rng(seed), recent: [], preferTyping: false, listening: true };
  }

  it('produces well-formed challenges for every style and chapter', () => {
    for (let ch = 0; ch <= 5; ch++) {
      const c = ctx(ch + 1, ch);
      for (let i = 0; i < 60; i++) {
        const style = styles[i % styles.length];
        const ch2 = makeChallenge(style, c);
        c.recent.push(ch2.key);
        if (ch2.kind === 'choice') {
          expect(ch2.options!.length).toBeGreaterThanOrEqual(2);
          expect(new Set(ch2.options).size, JSON.stringify(ch2.options)).toBe(ch2.options!.length);
          expect(ch2.answer).toBeGreaterThanOrEqual(0);
          expect(ch2.answer).toBeLessThan(ch2.options!.length);
        } else if (ch2.kind === 'type') {
          expect(ch2.accepted!.length).toBeGreaterThan(0);
        } else {
          expect(ch2.tiles!.length).toBeGreaterThan(ch2.solutions![0].length);
          for (const t of ch2.solutions![0]) expect(ch2.tiles).toContain(t);
        }
        // Simulate answering so boxes climb and later formats get exercised.
        if (ch2.srs) record(c.srs, ch2.key, i % 5 === 0 ? 'wrong' : 'correct');
      }
    }
  });

  it('starts new words with recognition and escalates to typing', () => {
    const c = ctx(7, 1);
    const first = makeChallenge('vocab', c);
    expect(first.kind).toBe('choice');
    expect(first.isNew).toBe(true);
    // Master one word and make sure it eventually becomes a typing challenge.
    const key = wordKey(getWord('mar'));
    c.srs.cards[key] = { box: 4, seen: 5, right: 5, wrong: 0, lastTurn: -100, lastTime: 0 };
    for (let i = 0; i < 6; i++) record(c.srs, `w:x${i}`, 'correct');
    let typed = false;
    for (let i = 0; i < 30 && !typed; i++) {
      c.srs.cards[key].lastTurn = -100;
      const ch = makeChallenge('vocab', { ...c, rand: rng(i + 3) });
      if (ch.key === key) typed = ch.kind === 'type';
    }
    expect(typed).toBe(true);
  });
});

describe('advanced (B1) verb forms', () => {
  const f = (inf: string, p: Parameters<typeof conjugate>[1], t: Parameters<typeof conjugate>[2]) => conjugate(VERB_BY_INF.get(inf)!, p, t);

  it('builds the future and conditional, with irregular stems', () => {
    expect(f('hablar', 'yo', 'futuro')).toBe('hablaré');
    expect(f('tener', 'nosotros', 'futuro')).toBe('tendremos');
    expect(f('hacer', 'vosotros', 'futuro')).toBe('haréis');
    expect(f('decir', 'ellos', 'futuro')).toBe('dirán');
    expect(f('poder', 'tú', 'condicional')).toBe('podrías');
    expect(f('vivir', 'nosotros', 'condicional')).toBe('viviríamos');
  });

  it('builds the present subjunctive from the yo form', () => {
    expect(f('hablar', 'yo', 'subjuntivo')).toBe('hable');
    expect(f('comer', 'vosotros', 'subjuntivo')).toBe('comáis');
    expect(f('tener', 'tú', 'subjuntivo')).toBe('tengas');
    expect(f('hacer', 'ellos', 'subjuntivo')).toBe('hagan');
    expect(f('conocer', 'yo', 'subjuntivo')).toBe('conozca');
    expect(f('ser', 'él', 'subjuntivo')).toBe('sea');
    expect(f('ir', 'nosotros', 'subjuntivo')).toBe('vayamos');
    expect(f('estar', 'vosotros', 'subjuntivo')).toBe('estéis');
    expect(f('dormir', 'nosotros', 'subjuntivo')).toBe('durmamos');
    expect(f('pensar', 'nosotros', 'subjuntivo')).toBe('pensemos');
    expect(f('tocar', 'yo', 'subjuntivo')).toBe('toque');
    expect(f('llegar', 'tú', 'subjuntivo')).toBe('llegues');
  });

  it('builds tú and vosotros commands', () => {
    expect(f('hablar', 'tú', 'imperativo')).toBe('habla');
    expect(f('hablar', 'vosotros', 'imperativo')).toBe('hablad');
    expect(f('tener', 'tú', 'imperativo')).toBe('ten');
    expect(f('hacer', 'tú', 'imperativo')).toBe('haz');
    expect(f('ir', 'tú', 'imperativo')).toBe('ve');
    expect(f('ir', 'vosotros', 'imperativo')).toBe('id');
    expect(f('ser', 'tú', 'imperativo')).toBe('sé');
    expect(f('dormir', 'tú', 'imperativo')).toBe('duerme');
  });

  it('every verb has every B1 form it can have', () => {
    for (const v of VERBS) {
      for (const t of ['futuro', 'condicional', 'subjuntivo'] as const) expect(v.forms[t].every(Boolean), `${v.inf} ${t}`).toBe(true);
    }
  });
});

describe('Spanish levels', () => {
  const styles: ChallengeStyle[] = ['vocab', 'quick', 'verb', 'sentence'];
  const run = (level: 'a1' | 'a2' | 'b1') => {
    const out: ReturnType<typeof makeChallenge>[] = [];
    for (let ch = 0; ch <= 5; ch++) {
      const c: ChallengeContext = { srs: newSrs(), chapter: ch, rand: rng(ch * 31 + 7), recent: [], preferTyping: false, listening: true, level };
      for (let i = 0; i < 160; i++) {
        const x = makeChallenge(styles[i % styles.length], c);
        c.recent.push(x.key);
        if (x.kind === 'choice') {
          expect(new Set(x.options).size, `${x.key} ${JSON.stringify(x.options)}`).toBe(x.options!.length);
          expect(x.answer).toBeGreaterThanOrEqual(0);
          for (const o of x.options!) expect(o, x.key).toBeTruthy();
        } else if (x.kind === 'type') {
          expect(x.accepted!.every(Boolean), x.key).toBe(true);
        }
        if (x.srs) record(c.srs, x.key, i % 6 === 0 ? 'wrong' : 'correct');
        out.push(x);
      }
    }
    return out;
  };
  const b1Tense = /^v:(futuro|condicional|subjuntivo|imperativo):/;

  it('B1 practises the advanced tenses, false friends and Spain words', () => {
    const keys = run('b1').map((x) => x.key);
    expect(keys.some((k) => b1Tense.test(k))).toBe(true);
    expect(keys.some((k) => k.startsWith('es:'))).toBe(true);
    expect(keys.some((k) => k.startsWith('gr:subjuntivo-'))).toBe(true);
  });

  it('A1 and A2 never use B1 material', () => {
    const b1Words = new Set(WORDS.filter((w) => w.lvl).map((w) => `w:${w.id}`));
    for (const level of ['a1', 'a2'] as const) {
      for (const x of run(level)) {
        expect(b1Tense.test(x.key), x.key).toBe(false);
        expect(b1Words.has(x.key), x.key).toBe(false);
        expect(x.key.startsWith('gr:sj') || x.key.startsWith('es:'), x.key).toBe(false);
      }
    }
  });

  it('A1 types less than B1', () => {
    const typed = (level: 'a1' | 'b1') => run(level).filter((x) => x.kind === 'type').length;
    expect(typed('a1')).toBeLessThan(typed('b1'));
  });

  it('commands are only asked for tú and vosotros', () => {
    for (const x of run('b1').filter((c) => c.key.startsWith('v:imperativo:'))) expect(x.prompt).toMatch(/— (tú|vosotros)$/);
  });

  it('every Spain/LatAm pair and false friend points at a real word', () => {
    for (const id of Object.keys(SPAIN_VS_LATAM)) expect(WORDS.some((w) => w.id === id), id).toBe(true);
    for (const id of Object.keys(FALSE_FRIENDS)) expect(WORDS.some((w) => w.id === id), id).toBe(true);
  });
});
