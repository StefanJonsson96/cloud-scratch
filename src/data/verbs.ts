// Verbs Lola sings, conjugated Spain-style (with vosotros). The forms come from
// the conjugate-esp library and the English from Wiktionary, both via
// `npm run data`; this file holds the teaching side: tenses, their time
// markers and rules, and the hints shown when you ask for help.
//
// The perfecto is used the Spanish-from-Spain way: for things that happened
// "today / this week / this year" (Hoy he comido…), not just "have done".

import VERBS_JSON from './generated/verbs.json';
import type { GenVerb, Six } from './types';

export type Person = 'yo' | 'tú' | 'él' | 'ella' | 'nosotros' | 'vosotros' | 'ellos' | 'ellas';
export const PERSONS: Person[] = ['yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas'];
/** One representative pronoun per conjugation slot, for tables. */
export const TABLE_PERSONS = ['yo', 'tú', 'él / ella', 'nosotros', 'vosotros', 'ellos / ellas'];

export type Tense = 'presente' | 'perfecto' | 'indefinido' | 'imperfecto' | 'futuro' | 'condicional' | 'subjuntivo' | 'imperativo';
export type Level = 'a1' | 'a2' | 'b1';

export interface TenseDef {
  es: string;
  en: string;
  /** Chapter it unlocks in, at the intermediate (A2) level. */
  ch: number;
  /** Only practised at this Spanish level. */
  level?: Level;
  markers: string[];
  markersEn: string[];
  rule: string;
  /** Persons it is asked for (commands only exist for tú / vosotros here). */
  persons?: Person[];
}

export const TENSES: Record<Tense, TenseDef> = {
  presente: {
    es: 'Presente',
    en: 'Present',
    ch: 2,
    markers: ['', 'Normalmente', 'Todos los días', 'Ahora'],
    markersEn: ['', 'Usually', 'Every day', 'Now'],
    rule: '-ar: o, as, a, amos, áis, an · -er: o, es, e, emos, éis, en · -ir: o, es, e, imos, ís, en',
  },
  perfecto: {
    es: 'Pretérito perfecto',
    en: 'Present perfect',
    ch: 4,
    markers: ['Hoy', 'Esta mañana', 'Esta semana', 'Este año'],
    markersEn: ['Today', 'This morning', 'This week', 'This year'],
    rule: 'haber (he, has, ha, hemos, habéis, han) + participle (-ado / -ido). In Spain it is THE past tense for today, this week, this year: «Hoy he comido paella».',
  },
  indefinido: {
    es: 'Pretérito indefinido',
    en: 'Simple past',
    ch: 5,
    markers: ['Ayer', 'Anoche', 'El año pasado', 'La semana pasada'],
    markersEn: ['Yesterday', 'Last night', 'Last year', 'Last week'],
    rule: 'Finished past with a finished time (ayer, anoche, el año pasado). -ar: é, aste, ó, amos, asteis, aron · -er/-ir: í, iste, ió, imos, isteis, ieron',
  },
  imperfecto: {
    es: 'Pretérito imperfecto',
    en: 'Imperfect ("used to")',
    ch: 5,
    markers: ['Antes', 'Cuando éramos pequeños,', 'Cada verano', 'En aquella época'],
    markersEn: ['Before,', 'When we were little,', 'Every summer (back then),', 'Back then,'],
    rule: 'Habits and descriptions in the past ("used to"). -ar: aba, abas, aba, ábamos, abais, aban · -er/-ir: ía, ías, ía, íamos, íais, ían',
  },
  futuro: {
    es: 'Futuro',
    en: 'Future',
    ch: 2,
    level: 'b1',
    markers: ['Mañana', 'El año que viene', 'Algún día', 'Dentro de dos días'],
    markersEn: ['Tomorrow', 'Next year', 'Some day', 'In two days'],
    rule: 'Infinitive + é, ás, á, emos, éis, án (same for -ar, -er, -ir). Irregular stems: tendr-, pondr-, saldr-, vendr-, har-, dir-, podr-, sabr-, querr-.',
  },
  condicional: {
    es: 'Condicional',
    en: 'Conditional ("would")',
    ch: 2,
    level: 'b1',
    markers: ['Con más tiempo,', 'En tu lugar,', 'Con mucho dinero,', 'Yo que tú…'],
    markersEn: ['With more time,', 'In your place,', 'With lots of money,', 'If I were you…'],
    rule: 'Infinitive + ía, ías, ía, íamos, íais, ían. Same irregular stems as the future: tendría, haría, podría, diría. Also for polite requests: ¿Podrías ayudarme?',
  },
  subjuntivo: {
    es: 'Presente de subjuntivo',
    en: 'Present subjunctive',
    ch: 3,
    level: 'b1',
    markers: ['Ojalá', 'Es importante que', 'Es posible que', 'Mamá quiere que'],
    markersEn: ['Hopefully', "It's important that", 'Maybe', 'Mum wants'],
    rule: 'Take the yo form, drop the -o and swap the vowel: -ar → e (hable), -er/-ir → a (coma, viva). Used after wishes, doubts, emotions and «ojalá». Irregular: sea, esté, vaya, sepa, dé, haya.',
  },
  imperativo: {
    es: 'Imperativo',
    en: 'Commands',
    ch: 2,
    level: 'b1',
    markers: [''],
    markersEn: [''],
    rule: 'Tú: like the él/ella present (¡Habla! ¡Come!) — irregular: ten, haz, di, pon, sal, ven, ve, sé. Vosotros (Spain!): infinitive with -r → -d (¡Hablad! ¡Comed! ¡Id!).',
    persons: ['tú', 'vosotros'],
  },
};

export function slot(p: Person): number {
  switch (p) {
    case 'yo':
      return 0;
    case 'tú':
      return 1;
    case 'él':
    case 'ella':
      return 2;
    case 'nosotros':
      return 3;
    case 'vosotros':
      return 4;
    case 'ellos':
    case 'ellas':
      return 5;
  }
}

export type Verb = GenVerb;

const ENDINGS: Record<'presente' | 'indefinido' | 'imperfecto', Record<'ar' | 'er' | 'ir', Six>> = {
  presente: {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  indefinido: {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
  imperfecto: {
    ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  },
};



/** The regular forms of a tense (to explain endings in hints). */
export function regular(inf: string, tense: 'presente' | 'indefinido' | 'imperfecto'): Six {
  const ending = inf.slice(-2) as 'ar' | 'er' | 'ir';
  const e = ENDINGS[tense][ending];
  if (!e) throw new Error(`Not an infinitive: ${inf}`);
  const stem = inf.slice(0, -2);
  return e.map((x) => stem + x) as Six;
}

const FUT_ENDINGS: Six = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const COND_ENDINGS: Six = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];

/** The stem the future and conditional are built on: "tendr-" for tener, the infinitive otherwise. */
function futureStem(inf: string): string {
  const yo = VERB_BY_INF.get(inf)?.forms.futuro[0];
  return yo ? yo.slice(0, -1) : inf;
}

export const VERBS: readonly Verb[] = VERBS_JSON as Verb[];
export const VERB_BY_INF: ReadonlyMap<string, Verb> = new Map(VERBS.map((v) => [v.inf, v]));

/** The past participle: "hablado", "hecho". */
export function participle(inf: string): string {
  const v = VERB_BY_INF.get(inf);
  return v ? v.forms.perfecto[0].split(' ')[1] : inf.slice(0, -2) + (inf.endsWith('ar') ? 'ado' : 'ido');
}

export function verbsUpToChapter(ch: number, level: Level = 'a2'): Verb[] {
  // Advanced players get every verb from the start.
  return VERBS.filter((v) => level === 'b1' || v.ch <= ch);
}

/** Chapter each tense unlocks in, per Spanish level. */
const UNLOCK: Record<Level, Partial<Record<Tense, number>>> = {
  a1: { presente: 2, perfecto: 4, indefinido: 5, imperfecto: 7, futuro: 9 },
  // Act II brings the rest: the future in Valencia, commands and the
  // conditional in Andalucía, the subjunctive in Galicia.
  a2: { presente: 2, perfecto: 4, indefinido: 5, imperfecto: 5, futuro: 7, condicional: 8, imperativo: 8, subjuntivo: 9 },
  b1: { presente: 2, perfecto: 2, indefinido: 2, imperfecto: 2, futuro: 2, condicional: 3, subjuntivo: 3, imperativo: 2 },
};

export function tensesUpToChapter(ch: number, level: Level = 'a2'): Tense[] {
  const u = UNLOCK[level];
  return (Object.keys(TENSES) as Tense[]).filter((t) => u[t] !== undefined && u[t]! <= ch);
}

/** Can this verb be asked in this tense? (Not every verb has commands.) */
export function hasTense(v: Verb, t: Tense): boolean {
  return v.forms[t].some(Boolean);
}

export function conjugate(v: Verb, p: Person, tense: Tense = 'presente'): string {
  return v.forms[tense][slot(p)];
}

export const HABER: Six = ['he', 'has', 'ha', 'hemos', 'habéis', 'han'];

const EN_PRONOUN: Record<Person, string> = {
  yo: 'I', tú: 'you', él: 'he', ella: 'she', nosotros: 'we', vosotros: 'you all', ellos: 'they', ellas: 'they',
};

/** "we sing", "she has eaten", "you all went", "I used to play" */
export function englishFor(v: Verb, p: Person, tense: Tense = 'presente'): string {
  const pr = EN_PRONOUN[p];
  const third = p === 'él' || p === 'ella';
  // "be" and phrases like "be able to" conjugate their "be".
  const be = v.en.base === 'be' || v.en.base.startsWith('be ');
  const rest = be ? v.en.base.slice(2) : '';
  const am = `${p === 'yo' ? 'am' : third ? 'is' : 'are'}${rest}`;
  switch (tense) {
    case 'presente':
      if (be) return `${pr} ${am}`;
      return `${pr} ${third ? v.en.s3 : v.en.base}`;
    case 'perfecto':
      return `${pr} ${third ? 'has' : 'have'} ${v.en.pp}`;
    case 'indefinido':
      if (be) return `${pr} ${p === 'yo' || third ? 'was' : 'were'}${rest}`;
      return `${pr} ${v.en.past}`;
    case 'imperfecto':
      return `${pr} used to ${v.en.base}`;
    case 'futuro':
      return `${pr} will ${v.en.base}`;
    case 'condicional':
      return `${pr} would ${v.en.base}`;
    case 'subjuntivo':
      if (be) return `${pr} ${am}`;
      return `${pr} ${third ? v.en.s3 : v.en.base}`;
    case 'imperativo':
      return `${cap(v.en.base)}! (${p === 'vosotros' ? 'to a group: vosotros' : 'to one friend: tú'})`;
  }
}

const OBJ: Record<Person, string> = { yo: 'me', tú: 'you', él: 'him', ella: 'her', nosotros: 'us', vosotros: 'you all', ellos: 'them', ellas: 'them' };

/** English for a subjunctive prompt, which depends on its trigger. */
export function subjunctiveEnglish(markerIndex: number, v: Verb, p: Person): string {
  const pr = EN_PRONOUN[p];
  const third = p === 'él' || p === 'ella';
  const be = v.en.base === 'be';
  const pres = be ? (p === 'yo' ? 'am' : third ? 'is' : 'are') : third ? v.en.s3 : v.en.base;
  const base = v.en.base === 'can' ? 'be able to' : v.en.base;
  switch (markerIndex) {
    case 0:
      return `Hopefully ${pr} ${pres}`;
    case 1:
      return `It's important that ${pr} ${pres}`;
    case 2:
      return `${cap(pr)} might ${base}`;
    default:
      return `Mum wants ${OBJ[p]} to ${base}`;
  }
}

const cap = (x: string) => (x ? x[0].toUpperCase() + x.slice(1) : x);

/** A nudge towards the right form, shown by the 💡 hint button. */
export function conjugationHint(v: Verb, p: Person, tense: Tense): string {
  const s = slot(p);
  const form = conjugate(v, p, tense);
  const irregular = !!v.irregular[tense];
  const ending = v.inf.slice(-2) as 'ar' | 'er' | 'ir';
  switch (tense) {
    case 'perfecto':
      return `haber → “${HABER[s]}” + participle${irregular ? ' (irregular!)' : ` (-${ending === 'ar' ? 'ado' : 'ido'})`}`;
    case 'futuro':
    case 'condicional': {
      const end = (tense === 'futuro' ? FUT_ENDINGS : COND_ENDINGS)[s];
      return irregular ? `Irregular stem “${futureStem(v.inf)}-” + -${end}` : `Whole infinitive + -${end}: ${v.inf}…`;
    }
    case 'subjuntivo':
      return irregular
        ? `Irregular! It starts with “${form.slice(0, Math.min(3, form.length - 1))}…”`
        : `yo form “${v.forms.presente[0]}” → drop -o, add -${ending === 'ar' ? 'e' : 'a'}${['', 's', '', 'mos', 'is', 'n'][s] ? '…' : ''}`;
    case 'imperativo':
      if (p === 'vosotros') return `Vosotros command: ${v.inf} → drop the -r, add -d`;
      return irregular ? `Short irregular command — it starts with “${form[0]}”` : `Same as “él ${v.forms.presente[2]}”`;
    default: {
      if (irregular) return `Irregular! It starts with “${form.slice(0, Math.min(3, form.length - 1))}…”`;
      const reg = regular('x' + ending, tense);
      return `Regular -${ending} verb: ${TABLE_PERSONS[s]} → -${reg[s].slice(1)}`;
    }
  }
}
