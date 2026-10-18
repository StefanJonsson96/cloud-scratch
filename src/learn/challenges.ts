// Builds the language challenges that power every special ability.
//
// The focus is on what app-based courses tend to leave thin, in Spain Spanish:
//  - the Palabrista (you): vocabulary & Spain expressions — produce, don't just recognise
//  - Mateo: quick decisions — el/la (tricky genders), ser/estar, por/para
//  - Lola: verbs — full conjugation incl. vosotros, presente → perfecto → indefinido/imperfecto, gustar
//  - Palabra Final (ultimate): build a whole sentence from word tiles
//
// Every challenge carries its translation, a hint you can ask for, and a short
// rule explaining the answer — so nothing in the game is ever a mystery word.

import { WORDS, withArticle, genderRule, TRICKY_GENDER, FALSE_FRIENDS, SPAIN_VS_LATAM, type Word } from '../data/vocab';
import {
  slot,
  conjugationHint,
  hasTense,
  subjunctiveEnglish,
  verbsUpToChapter,
  tensesUpToChapter,
  conjugate,
  englishFor,
  TENSES,
  TABLE_PERSONS,
  PERSONS,
  type Level,
  type Person,
  type Tense,
  type Verb,
} from '../data/verbs';
import { sentencesUpToChapter, tokenize, type Sentence } from '../data/sentences';
import { grammarUpToChapter, RULES, TOPIC_CH, type GrammarItem, type GrammarTopic } from '../data/grammar';
import { boxOf, isNew, pick, type SrsState } from './srs';

export type ChallengeStyle = 'vocab' | 'quick' | 'verb' | 'sentence';
export type ChallengeKind = 'choice' | 'type' | 'order';

export interface Challenge {
  key: string;
  kind: ChallengeKind;
  /** Small caption above the prompt: "Translate", "Listen", "¿El o la?" */
  label: string;
  prompt: string;
  promptLang: 'es' | 'en';
  /** Always-visible second line, usually the English translation. */
  sub?: string;
  /** Revealed by the hint button. Using it caps the result at "close". */
  hint?: string;
  /** Spanish text read aloud (automatically, for listening challenges). */
  speak?: string;
  listening?: boolean;
  emojiOptions?: boolean;
  options?: string[];
  answer?: number;
  accepted?: string[];
  article?: 'el' | 'la';
  tiles?: string[];
  solutions?: string[][];
  /** Shown after answering. */
  reveal: { es: string; en: string };
  example?: [string, string];
  /** Rule of thumb shown after answering. */
  note?: string;
  /** Conjugation table shown after answering a verb challenge. */
  table?: { title: string; rows: [string, string][]; highlight: number };
  /** Power multiplier when answered correctly. */
  difficulty: number;
  /** Cap on the SRS box this format can raise an item to. */
  maxBox: number;
  isNew: boolean;
  /** Answer faster than this (ms) for a "fast" bonus. */
  fastMs: number;
  /** Whether the result should be recorded in the SRS. */
  srs: boolean;
}

export interface ChallengeContext {
  srs: SrsState;
  chapter: number;
  rand: () => number;
  /** Recently asked keys, newest last. */
  recent: string[];
  preferTyping: boolean;
  listening: boolean;
  /** Spanish level: A1 beginner, A2 intermediate (default), B1 advanced. */
  level?: Level;
}

export const wordKey = (w: Word) => `w:${w.id}`;
export const genderKey = (w: Word) => `g:${w.id}`;
export const verbKey = (v: Verb, t: Tense) => `v:${t}:${v.inf}`;
export const grammarKey = (g: GrammarItem) => `gr:${g.id}`;

function shuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weighted<T>(items: [T, number][], rand: () => number): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

/** The words in play at this point of the story and this Spanish level. */
export function wordsFor(ch: number, level: Level = 'a2'): Word[] {
  if (level === 'b1') return WORDS.filter((w) => w.ch <= ch + 1);
  if (level === 'a1') return WORDS.filter((w) => w.ch <= ch && !w.lvl && w.cat !== 'refranes' && !(w.cat === 'expresiones' && w.ch >= 3));
  return WORDS.filter((w) => w.ch <= ch && !w.lvl);
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Pick `n` distractor words that can't be confused with `w`. */
export function distractors(
  w: Word,
  n: number,
  rand: () => number,
  chapter: number,
  filter?: (d: Word, chosen: Word[]) => boolean,
): Word[] {
  const parts = (x: Word) => x.en.split(' / ');
  const bad = (d: Word) =>
    d.id === w.id || d.en === w.en || d.bare === w.bare || parts(d).some((p) => parts(w).includes(p));
  const ch = Math.max(chapter, 1);
  // Advanced words only show up as wrong answers for advanced words.
  const usable = WORDS.filter((d) => !d.lvl || w.lvl);
  const pools = [
    usable.filter((d) => d.ch <= ch && d.pos === w.pos && d.cat === w.cat),
    usable.filter((d) => d.ch <= ch && d.pos === w.pos),
    usable.filter((d) => d.pos === w.pos),
    usable.slice(),
  ];
  const out: Word[] = [];
  for (const pool of pools) {
    for (const d of shuffle(pool, rand)) {
      if (out.length >= n) return out;
      if (bad(d) || (filter && !filter(d, out)) || out.some((o) => o.id === d.id || o.en === d.en || o.bare === d.bare)) continue;
      out.push(d);
    }
  }
  return out;
}

function choice(correct: string, wrong: string[], rand: () => number): { options: string[]; answer: number } {
  const options = shuffle(Array.from(new Set([correct, ...wrong])), rand);
  return { options, answer: options.indexOf(correct) };
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findWord(sentence: string, form: string): number {
  const re = new RegExp(`(^|[^\\p{L}])(${escapeRe(form)})(?=[^\\p{L}]|$)`, 'iu');
  const m = re.exec(sentence);
  return m ? m.index + m[1].length : -1;
}

/** Find a word (or the key word of an expression) in its example sentence and blank it out. */
export function blankExample(w: Word): { text: string; form: string; whole: boolean } | undefined {
  if (!w.ex) return undefined;
  const sentence = w.ex[0];
  const cut = (start: number, len: number) => sentence.slice(0, start) + '_____' + sentence.slice(start + len);
  for (const form of [...w.forms].sort((a, b) => b.length - a.length)) {
    const clean = form.replace(/[¿?¡!…]/g, '').trim();
    const at = findWord(sentence, clean);
    if (at >= 0) return { text: cut(at, clean.length), form: sentence.slice(at, at + clean.length), whole: true };
  }
  // Expressions are often conjugated in the example ("ser pan comido" → "es pan comido"):
  // blank their longest word that does appear.
  const tokens = w.bare
    .replace(/[¿?¡!…,]/g, '')
    .split(' ')
    .filter((t) => t.length >= 3)
    .sort((a, b) => b.length - a.length);
  if (tokens.length < 2) return undefined;
  for (const t of tokens) {
    const at = findWord(sentence, t);
    if (at >= 0) return { text: cut(at, t.length), form: sentence.slice(at, at + t.length), whole: false };
  }
  return undefined;
}

function firstLetters(answer: string): string {
  return answer
    .split(' ')
    .map((word) => word[0] + ' _'.repeat(Math.max(0, word.length - 1)))
    .join('   ');
}

function pickFrom<T>(ctx: ChallengeContext, pool: T[], keyFn: (x: T) => string, focusFn: (x: T) => boolean, allowNew = true): T {
  const keys = pool.map(keyFn);
  const focus = new Set(pool.filter(focusFn).map(keyFn));
  const key = pick(ctx.srs, keys, { focus, avoid: new Set(ctx.recent.slice(-4)), rand: ctx.rand, allowNew });
  const i = key === undefined ? 0 : keys.indexOf(key);
  return pool[i < 0 ? 0 : i];
}

// ------------------------------------------------------------- Palabrista
export function vocabChallenge(ctx: ChallengeContext): Challenge {
  const level = ctx.level ?? 'a2';
  const w = pickFrom(ctx, wordsFor(ctx.chapter, level), wordKey, (x) => x.ch === ctx.chapter);
  const key = wordKey(w);
  const fresh = isNew(ctx.srs, key);
  const box = boxOf(ctx.srs, key);
  const display = withArticle(w);
  const base = {
    key,
    reveal: { es: display, en: w.en },
    example: w.ex,
    isNew: fresh,
    srs: true,
    speak: w.es.split('|')[0],
    note: w.pos === 'noun' && w.gender !== 'both' && TRICKY_GENDER.has(w.id) ? genderRule(w) : undefined,
  };
  const r = ctx.rand();
  const typingFrom = level === 'a1' ? 4 : level === 'b1' ? 1 : ctx.preferTyping ? 2 : 3;

  const long = w.bare.split(' ').length > 3;
  if (!fresh && box >= typingFrom) {
    const blank = blankExample(w);
    if (blank && w.ex && (r < 0.35 || long)) {
      return {
        ...base,
        kind: 'type',
        label: 'Fill the gap',
        prompt: blank.text,
        promptLang: 'es',
        sub: w.ex[1],
        hint: firstLetters(blank.form),
        accepted: blank.whole ? [blank.form, ...w.forms] : [blank.form],
        difficulty: 1.4,
        maxBox: 5,
        fastMs: 9000,
      };
    }
    if (!long) return {
      ...base,
      kind: 'type',
      label: 'Write it in Spanish',
      prompt: w.en,
      promptLang: 'en',
      sub: posHint(w),
      hint: (w.pos === 'noun' && w.article ? `${w.article} … ` : '') + firstLetters(w.forms[0].replace(/[¿?¡!…]/g, '')),
      accepted: w.forms,
      article: w.gender === 'm' || w.gender === 'f' ? w.article : undefined,
      difficulty: 1.3,
      maxBox: 5,
      fastMs: 7000,
    };
  }

  if (!fresh && box >= 2) {
    const blank = blankExample(w);
    if (blank && w.ex && r < 0.4) {
      const ds = distractors(w, 3, ctx.rand, ctx.chapter, (d) => !d.bare.includes(' ') || !blank.whole);
      const wrong = blank.whole ? ds.map((d) => d.bare) : shuffle(singleWords(ctx.chapter, blank.form), ctx.rand).slice(0, 3);
      return {
        ...base,
        kind: 'choice',
        label: 'Fill the gap',
        prompt: blank.text,
        promptLang: 'es',
        sub: w.ex[1],
        hint: `${display} = ${w.en}`,
        ...choice(blank.form, wrong, ctx.rand),
        difficulty: 1.15,
        maxBox: 4,
        fastMs: 6000,
      };
    }
    const ds = distractors(w, 3, ctx.rand, ctx.chapter);
    return {
      ...base,
      kind: 'choice',
      label: 'How do you say…',
      prompt: w.en,
      promptLang: 'en',
      hint: w.ex ? `${w.ex[0]}  —  ${w.ex[1]}` : `Starts with “${w.bare[0]}”`,
      ...choice(display, ds.map(withArticle), ctx.rand),
      difficulty: 1.1,
      maxBox: 3,
      fastMs: 4500,
    };
  }

  const ds = distractors(w, 3, ctx.rand, ctx.chapter);
  const c = choice(w.en, ds.map((d) => d.en), ctx.rand);
  if (!fresh && ctx.listening && r < 0.4) {
    return {
      ...base,
      kind: 'choice',
      label: 'Listen — what does it mean?',
      prompt: '🔊',
      promptLang: 'es',
      listening: true,
      hint: display,
      ...c,
      difficulty: 1.15,
      maxBox: 3,
      fastMs: 5000,
    };
  }
  return {
    ...base,
    kind: 'choice',
    label: fresh ? 'New word! What does it mean?' : 'What does it mean?',
    prompt: display,
    promptLang: 'es',
    hint: w.ex ? `${w.ex[0]}  —  ${w.ex[1]}` : `${display} = ${w.en}`,
    ...c,
    difficulty: 1.0,
    maxBox: 2,
    fastMs: 4000,
  };
}

function singleWords(chapter: number, not: string): string[] {
  return WORDS.filter((d) => d.ch <= Math.max(1, chapter) && !d.lvl && !d.bare.includes(' ') && d.bare !== not.toLowerCase()).map(
    (d) => d.bare,
  );
}

function posHint(w: Word): string | undefined {
  switch (w.pos) {
    case 'noun':
      return 'noun — the article is optional';
    case 'verb':
      return 'verb — infinitive';
    case 'adj':
      return 'adjective';
    case 'num':
      return 'number — in words';
    case 'phrase':
      return 'expression';
    default:
      return undefined;
  }
}

// ------------------------------------------------------------------ Mateo
type QuickKind = 'gender' | GrammarTopic | 'truefalse' | 'picture' | 'falsos' | 'espana';

export function quickChallenge(ctx: ChallengeContext, force?: QuickKind): Challenge {
  const level = ctx.level ?? 'a2';
  const pool = wordsFor(ctx.chapter, level);
  const seen = pool.filter((w) => !isNew(ctx.srs, wordKey(w)));
  const nouns = pool.filter((w) => w.pos === 'noun' && (w.gender === 'm' || w.gender === 'f'));
  const b1 = level === 'b1';
  const a1 = level === 'a1';
  const options: [QuickKind, number][] = [
    ['gender', b1 ? 2 : 3],
    ['serEstar', ctx.chapter >= TOPIC_CH.serEstar + (a1 ? 1 : 0) ? (b1 ? 2 : 3) : 0],
    ['porPara', b1 || ctx.chapter >= TOPIC_CH.porPara + (a1 ? 1 : 0) ? (b1 ? 2 : a1 ? 1 : 3) : 0],
    ['subjuntivo', b1 ? 2 : 0],
    ['falsos', b1 ? 2 : 0],
    ['espana', b1 ? 2 : 0],
    ['truefalse', seen.length >= 6 ? 1 : 0],
    ['picture', a1 ? 2 : 1],
  ];
  const kind = force ?? weighted(options.filter(([, wt]) => wt > 0), ctx.rand);

  if (kind === 'falsos') {
    const list = WORDS.filter((w) => FALSE_FRIENDS[w.id]);
    const w = pickFrom(ctx, list, wordKey, () => true);
    const [trap, trapEs] = FALSE_FRIENDS[w.id];
    const ds = distractors(w, 2, ctx.rand, ctx.chapter).map((d) => d.en);
    return {
      key: wordKey(w),
      kind: 'choice',
      label: '¡Falso amigo! What does it mean?',
      prompt: withArticle(w),
      promptLang: 'es',
      hint: w.ex ? `${w.ex[0]}  —  ${w.ex[1]}` : undefined,
      ...choice(w.en, [trap, ...ds], ctx.rand),
      reveal: { es: withArticle(w), en: w.en },
      example: w.ex,
      note: `False friend! ${withArticle(w)} = ${w.en}. “${trap}” in Spanish is “${trapEs}”.`,
      difficulty: 1.15,
      maxBox: 4,
      isNew: isNew(ctx.srs, wordKey(w)),
      fastMs: 4000,
      srs: true,
      speak: w.es.split('|')[0],
    };
  }

  if (kind === 'espana') {
    const list = WORDS.filter((w) => SPAIN_VS_LATAM[w.id] && (b1 || !w.lvl));
    const w = pickFrom(ctx, list, (x) => `es:${x.id}`, () => true);
    const latam = SPAIN_VS_LATAM[w.id];
    const ds = distractors(w, 2, ctx.rand, ctx.chapter).map(withArticle);
    return {
      key: `es:${w.id}`,
      kind: 'choice',
      label: 'En España se dice…',
      prompt: w.en,
      promptLang: 'en',
      sub: 'Which word would you hear in Spain?',
      hint: `Not “${latam}” — that's Latin America.`,
      ...choice(withArticle(w), [latam, ...ds], ctx.rand),
      reveal: { es: withArticle(w), en: w.en },
      example: w.ex,
      note: `In Spain: ${withArticle(w)}. In much of Latin America: ${latam}. Both are Spanish — this game teaches Spain's.`,
      difficulty: 1.1,
      maxBox: 4,
      isNew: isNew(ctx.srs, `es:${w.id}`),
      fastMs: 4000,
      srs: true,
      speak: w.es.split('|')[0],
    };
  }

  if (kind === 'gender') {
    // Favour the nouns whose gender is genuinely hard to guess.
    const tricky = nouns.filter((w) => TRICKY_GENDER.has(w.id));
    const list = tricky.length >= 4 && ctx.rand() < 0.7 ? tricky : nouns;
    const w = pickFrom(ctx, list, genderKey, (x) => x.ch === ctx.chapter);
    const art = w.article!;
    return {
      key: genderKey(w),
      kind: 'choice',
      label: '¿El o la?',
      prompt: `___ ${w.bare}`,
      promptLang: 'es',
      sub: w.en,
      hint: genderRule(w).split(':')[0],
      options: ['el', 'la'],
      answer: art === 'el' ? 0 : 1,
      reveal: { es: `${art} ${w.bare}`, en: `the ${w.en}` },
      example: w.ex,
      note: genderRule(w),
      difficulty: 1.0,
      maxBox: 5,
      isNew: isNew(ctx.srs, genderKey(w)),
      fastMs: 2500,
      srs: true,
      speak: `${art} ${w.bare}`,
    };
  }

  if (kind === 'serEstar' || kind === 'porPara' || kind === 'gustar' || kind === 'subjuntivo') {
    return grammarChallenge(ctx, kind);
  }

  if (kind === 'truefalse' && seen.length >= 6) {
    const w = pickFrom(ctx, seen, wordKey, (x) => x.ch === ctx.chapter, false);
    const truth = ctx.rand() < 0.5;
    const shown = truth ? w.en : (distractors(w, 1, ctx.rand, ctx.chapter)[0]?.en ?? w.en);
    return {
      key: wordKey(w),
      kind: 'choice',
      label: '¿Sí o no?',
      prompt: `${withArticle(w)}  =  “${shown}”?`,
      promptLang: 'es',
      options: ['Sí ✓', 'No ✗'],
      answer: shown === w.en ? 0 : 1,
      hint: w.ex ? `${w.ex[0]}  —  ${w.ex[1]}` : undefined,
      reveal: { es: withArticle(w), en: w.en },
      example: w.ex,
      difficulty: 0.95,
      maxBox: 2,
      isNew: false,
      fastMs: 2500,
      srs: true,
      speak: w.es.split('|')[0],
    };
  }

  const emojiPool = pool.filter((w) => w.emoji);
  const w = pickFrom(ctx, emojiPool, wordKey, (x) => x.ch === ctx.chapter);
  const ds = distractors(w, 3, ctx.rand, ctx.chapter, (d, chosen) => !!d.emoji && d.emoji !== w.emoji && chosen.every((o) => o.emoji !== d.emoji));
  const fresh = isNew(ctx.srs, wordKey(w));
  return {
    key: wordKey(w),
    kind: 'choice',
    label: fresh ? 'New word! Pick the picture' : 'Pick the picture',
    prompt: withArticle(w),
    promptLang: 'es',
    emojiOptions: true,
    hint: `${withArticle(w)} = ${w.en}`,
    ...choice(w.emoji!, ds.map((d) => d.emoji!), ctx.rand),
    reveal: { es: withArticle(w), en: w.en },
    example: w.ex,
    difficulty: 1.0,
    maxBox: 2,
    isNew: fresh,
    fastMs: 3000,
    srs: true,
    speak: w.es.split('|')[0],
  };
}

export function grammarChallenge(ctx: ChallengeContext, topic: GrammarTopic): Challenge {
  const pool = grammarUpToChapter(Math.max(ctx.chapter, TOPIC_CH[topic]), topic);
  const g = pickFrom(ctx, pool, grammarKey, (x) => x.ch === ctx.chapter);
  const rule = RULES[g.rule];
  const full = g.es.replace('___', g.answer);
  const labels: Record<GrammarTopic, string> = { serEstar: '¿Ser o estar?', porPara: '¿Por o para?', gustar: 'Gustar', subjuntivo: '¿Indicativo o subjuntivo?' };
  return {
    key: grammarKey(g),
    kind: 'choice',
    label: labels[topic],
    prompt: g.es,
    promptLang: 'es',
    sub: g.en,
    hint: rule.title,
    ...choice(g.answer, g.wrong, ctx.rand),
    reveal: { es: full, en: g.en },
    note: `${rule.title}. ${rule.text}`,
    difficulty: 1.1,
    maxBox: 5,
    isNew: isNew(ctx.srs, grammarKey(g)),
    fastMs: topic === 'gustar' ? 5000 : 3500,
    srs: true,
    speak: full,
  };
}

// ------------------------------------------------------------------- Lola
const PERSON_WEIGHT: Record<Person, number> = {
  yo: 1, tú: 1, él: 0.6, ella: 0.6, nosotros: 1, vosotros: 1.6, ellos: 0.6, ellas: 0.6,
};

export function verbChallenge(ctx: ChallengeContext): Challenge {
  const ch = Math.max(ctx.chapter, 2);
  const level = ctx.level ?? 'a2';
  if (ctx.rand() < 0.2) return grammarChallenge(ctx, level === 'b1' && ctx.rand() < 0.5 ? 'subjuntivo' : 'gustar');

  const tenses = tensesUpToChapter(ch, level);
  // Lean on what's new: this chapter's tense, or the advanced tenses at B1.
  const newest = level === 'b1' ? tenses.filter((t) => TENSES[t].level === 'b1') : tenses.filter((t) => TENSES[t].ch === ch);
  const tense: Tense =
    newest.length && ctx.rand() < 0.55
      ? newest[Math.floor(ctx.rand() * newest.length)]
      : tenses[Math.floor(ctx.rand() * tenses.length)];
  const t = TENSES[tense];
  const pool = verbsUpToChapter(ch, level).filter((x) => hasTense(x, tense));
  const v = pickFrom(ctx, pool, (x) => verbKey(x, tense), (x) => x.ch === ch);
  const key = verbKey(v, tense);
  const persons = t.persons ?? PERSONS;
  const person = weighted(persons.map((p) => [p, PERSON_WEIGHT[p]] as [Person, number]), ctx.rand);
  const form = conjugate(v, person, tense);
  const mi = Math.floor(ctx.rand() * t.markers.length);
  const marker = t.markers[mi];
  const markerEn = t.markersEn[mi];
  const prompt =
    tense === 'imperativo' ? `¡___ (${v.inf})! — ${person}` : cap(`${marker ? marker + ' ' : ''}${person} ___ (${v.inf})`);
  const en =
    tense === 'subjuntivo'
      ? subjunctiveEnglish(mi, v, person)
      : cap(`${markerEn ? markerEn + ' ' : ''}${englishFor(v, person, tense)}`);
  const box = boxOf(ctx.srs, key);
  const fresh = isNew(ctx.srs, key);
  const s = slot(person);
  const irregular = !!v.irregular[tense];
  const rows = v.forms[tense].map((f, i) => [TABLE_PERSONS[i], f] as [string, string]).filter(([, f]) => f);
  const base = {
    key,
    label: `${t.es}${irregular ? ' · irregular!' : ''}`,
    prompt,
    promptLang: 'es' as const,
    sub: en,
    hint: conjugationHint(v, person, tense),
    reveal: { es: tense === 'imperativo' ? `¡${cap(form)}!` : `${person} ${form}`, en: `${en}  ·  ${v.inf} = to ${v.en.base}` },
    note:
      tense === 'presente' && person !== 'vosotros'
        ? undefined
        : tense === 'presente'
          ? 'Vosotros = “you all” (informal), used all over Spain.'
          : t.rule,
    table: { title: `${v.inf} — ${t.es.toLowerCase()}`, rows, highlight: rows.findIndex(([p]) => p === TABLE_PERSONS[s]) },
    isNew: fresh,
    srs: true,
    speak: tense === 'imperativo' ? form : `${person} ${form}`,
  };
  const typingFrom = level === 'a1' ? 3 : level === 'b1' ? 0 : ctx.preferTyping ? 1 : 2;
  if (!fresh && box >= typingFrom) {
    return { ...base, kind: 'type', accepted: [form], difficulty: 1.3, maxBox: 5, fastMs: tense === 'perfecto' ? 9000 : 7000 };
  }
  const sameTense = Array.from(new Set(v.forms[tense].filter((f) => f && f !== form)));
  let wrong = shuffle(sameTense, ctx.rand).slice(0, 3);
  // The classic traps: perfecto vs indefinido (Spain), indicative vs subjunctive, command vs statement.
  const rival: Tense | undefined =
    tense === 'perfecto' ? 'indefinido' : tense === 'indefinido' ? 'perfecto' : tense === 'subjuntivo' ? 'presente' : tense === 'condicional' ? 'futuro' : undefined;
  if (rival && (tenses.includes(rival) || tense === 'subjuntivo')) wrong[0] = conjugate(v, person, rival);
  if (tense === 'imperativo') {
    const traps = [v.inf, conjugate(v, person, 'subjuntivo'), conjugate(v, person, 'presente'), ...sameTense];
    wrong = Array.from(new Set(traps.filter((f) => f && f !== form))).slice(0, 3);
  }
  return { ...base, kind: 'choice', ...choice(form, wrong, ctx.rand), difficulty: 1.0, maxBox: 3, fastMs: 4500 };
}

// -------------------------------------------------------------- Ultimates
export function sentenceChallenge(ctx: ChallengeContext): Challenge {
  const pool = sentencesUpToChapter(ctx.chapter, ctx.level ?? 'a2');
  const current = pool.filter((s) => s.ch === Math.max(1, ctx.chapter));
  const fresh = (current.length && ctx.rand() < 0.6 ? current : pool).filter((s) => !ctx.recent.includes(`s:${s.es}`));
  const list = fresh.length ? fresh : pool;
  const s: Sentence = list[Math.floor(ctx.rand() * list.length)];
  const tokens = tokenize(s.es);
  const extra = WORDS.filter((w) => w.ch <= Math.max(1, ctx.chapter) && !w.lvl && !w.bare.includes(' '))
    .map((w) => tokenize(w.bare)[0])
    .filter((t) => t && !tokens.includes(t));
  const distract = shuffle(Array.from(new Set(extra)), ctx.rand).slice(0, 2);
  return {
    key: `s:${s.es}`,
    kind: 'order',
    label: 'Build the sentence',
    prompt: s.en,
    promptLang: 'en',
    hint: `Starts with “${tokens[0]}”`,
    tiles: shuffle([...tokens, ...distract], ctx.rand),
    solutions: [tokens, ...(s.alt ?? []).map(tokenize)],
    reveal: { es: s.es, en: s.en },
    difficulty: 1.0,
    maxBox: 0,
    isNew: false,
    fastMs: 15000,
    srs: false,
    speak: s.es,
  };
}

export function makeChallenge(style: ChallengeStyle, ctx: ChallengeContext): Challenge {
  switch (style) {
    case 'vocab':
      return vocabChallenge(ctx);
    case 'quick':
      return quickChallenge(ctx);
    case 'verb':
      return verbChallenge(ctx);
    case 'sentence':
      return sentenceChallenge(ctx);
  }
}

/** Check a tile ordering against the accepted solutions. */
export function checkOrder(answer: string[], solutions: string[][]): boolean {
  const a = answer.map((t) => t.toLowerCase());
  return solutions.some((s) => s.length === a.length && s.every((t, i) => t.toLowerCase() === a[i]));
}
