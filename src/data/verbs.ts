// Conjugation data for Lola's verb songs — Spain Spanish, so vosotros is in.
//
// Tenses unlock as the story goes on:
//   ch2 presente (regular) · ch3 presente (irregular) · ch4 pretérito perfecto
//   ch5 pretérito indefinido + imperfecto
// The perfecto is used the Spanish-from-Spain way: for things that happened
// "today / this week / this year" (Hoy he comido…), not just "have done".

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

type Six = [string, string, string, string, string, string];

export interface Verb {
  inf: string;
  en: { base: string; s3: string; past: string; pp: string };
  /** Chapter in which Lola starts singing it (present tense). */
  ch: number;
  irregular: Partial<Record<Tense, true>>;
  forms: Record<Tense, Six>;
}

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

export const HABER: Six = ['he', 'has', 'ha', 'hemos', 'habéis', 'han'];

// ------------------------------------------------------------ B1 tenses
const FUT_ENDINGS: Six = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const COND_ENDINGS: Six = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];
const FUT_STEM: Record<string, string> = {
  tener: 'tendr', poner: 'pondr', salir: 'saldr', venir: 'vendr', hacer: 'har', decir: 'dir', poder: 'podr', saber: 'sabr', querer: 'querr', haber: 'habr',
};

function futureStem(inf: string): string {
  return FUT_STEM[inf] ?? inf;
}

const SUBJ_IRR: Record<string, Six> = {
  ser: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
  estar: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
  ir: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
  saber: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
  dar: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
  haber: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
  // Stem-changers keep the infinitive stem in nosotros / vosotros (-ir verbs change too).
  dormir: ['duerma', 'duermas', 'duerma', 'durmamos', 'durmáis', 'duerman'],
  pedir: ['pida', 'pidas', 'pida', 'pidamos', 'pidáis', 'pidan'],
  pensar: ['piense', 'pienses', 'piense', 'pensemos', 'penséis', 'piensen'],
  volver: ['vuelva', 'vuelvas', 'vuelva', 'volvamos', 'volváis', 'vuelvan'],
  poder: ['pueda', 'puedas', 'pueda', 'podamos', 'podáis', 'puedan'],
  querer: ['quiera', 'quieras', 'quiera', 'queramos', 'queráis', 'quieran'],
  recordar: ['recuerde', 'recuerdes', 'recuerde', 'recordemos', 'recordéis', 'recuerden'],
  empezar: ['empiece', 'empieces', 'empiece', 'empecemos', 'empecéis', 'empiecen'],
  jugar: ['juegue', 'juegues', 'juegue', 'juguemos', 'juguéis', 'jueguen'],
};

/** Present subjunctive from the yo form: hablo → hable, tengo → tenga. */
function subjunctive(inf: string, yo: string): Six {
  if (SUBJ_IRR[inf]) return SUBJ_IRR[inf];
  let stem = yo.endsWith('o') ? yo.slice(0, -1) : inf.slice(0, -2);
  const ar = inf.endsWith('ar');
  // Spelling: keep the hard sound before e (toque, llegue, empiece).
  if (ar) stem = stem.replace(/c$/, 'qu').replace(/g$/, 'gu').replace(/z$/, 'c');
  const e = ar ? ['e', 'es', 'e', 'emos', 'éis', 'en'] : ['a', 'as', 'a', 'amos', 'áis', 'an'];
  return e.map((x) => stem + x) as Six;
}

const IMP_TU: Record<string, string> = { tener: 'ten', hacer: 'haz', decir: 'di', poner: 'pon', salir: 'sal', venir: 'ven', ir: 've', ser: 'sé' };
/** Verbs that don't really have commands. */
const NO_IMPERATIVE = new Set(['poder', 'saber', 'querer', 'haber']);

export function regular(inf: string, tense: 'presente' | 'indefinido' | 'imperfecto'): Six {
  const ending = inf.slice(-2) as 'ar' | 'er' | 'ir';
  const e = ENDINGS[tense][ending];
  if (!e) throw new Error(`Not an infinitive: ${inf}`);
  const stem = inf.slice(0, -2);
  return e.map((x) => stem + x) as Six;
}

const IRREGULAR_PP: Record<string, string> = {
  hacer: 'hecho', decir: 'dicho', ver: 'visto', escribir: 'escrito', volver: 'vuelto', poner: 'puesto',
  abrir: 'abierto', romper: 'roto', morir: 'muerto', leer: 'leído', creer: 'creído', oír: 'oído', traer: 'traído',
};

export function participle(inf: string): string {
  if (IRREGULAR_PP[inf]) return IRREGULAR_PP[inf];
  return inf.slice(0, -2) + (inf.endsWith('ar') ? 'ado' : 'ido');
}

const IRR: Record<string, Partial<Record<'presente' | 'indefinido' | 'imperfecto', Six>>> = {
  ser: {
    presente: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
    indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    imperfecto: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
  },
  estar: {
    presente: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
    indefinido: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'],
  },
  tener: {
    presente: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
    indefinido: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
  },
  ir: {
    presente: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
    indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    imperfecto: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
  },
  hacer: {
    presente: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
    indefinido: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
  },
  poder: {
    presente: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
    indefinido: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
  },
  querer: {
    presente: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
    indefinido: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron'],
  },
  dormir: {
    presente: ['duermo', 'duermes', 'duerme', 'dormimos', 'dormís', 'duermen'],
    indefinido: ['dormí', 'dormiste', 'durmió', 'dormimos', 'dormisteis', 'durmieron'],
  },
  ver: {
    presente: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
    indefinido: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
    imperfecto: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
  },
  saber: {
    presente: ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
    indefinido: ['supe', 'supiste', 'supo', 'supimos', 'supisteis', 'supieron'],
  },
  decir: {
    presente: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
    indefinido: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
  },
  venir: {
    presente: ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
    indefinido: ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron'],
  },
  volver: { presente: ['vuelvo', 'vuelves', 'vuelve', 'volvemos', 'volvéis', 'vuelven'] },
  pensar: { presente: ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan'] },
  dar: {
    presente: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
    indefinido: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
  },
  salir: { presente: ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'] },
  jugar: {
    presente: ['juego', 'juegas', 'juega', 'jugamos', 'jugáis', 'juegan'],
    indefinido: ['jugué', 'jugaste', 'jugó', 'jugamos', 'jugasteis', 'jugaron'],
  },
  poner: {
    presente: ['pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen'],
    indefinido: ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron'],
  },
  recordar: { presente: ['recuerdo', 'recuerdas', 'recuerda', 'recordamos', 'recordáis', 'recuerdan'] },
  conocer: { presente: ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'] },
  empezar: {
    presente: ['empiezo', 'empiezas', 'empieza', 'empezamos', 'empezáis', 'empiezan'],
    indefinido: ['empecé', 'empezaste', 'empezó', 'empezamos', 'empezasteis', 'empezaron'],
  },
  pedir: {
    presente: ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden'],
    indefinido: ['pedí', 'pediste', 'pidió', 'pedimos', 'pedisteis', 'pidieron'],
  },
  leer: { indefinido: ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'] },
  creer: { indefinido: ['creí', 'creíste', 'creyó', 'creímos', 'creísteis', 'creyeron'] },
  tocar: { indefinido: ['toqué', 'tocaste', 'tocó', 'tocamos', 'tocasteis', 'tocaron'] },
  llegar: { indefinido: ['llegué', 'llegaste', 'llegó', 'llegamos', 'llegasteis', 'llegaron'] },
};

// [infinitive, english base, 3rd person, past, past participle]
type VRow = [string, string, string, string, string];

const ALL: Verb[] = [];
function verbs(ch: number, rows: VRow[]) {
  for (const [inf, base, s3, past, pp] of rows) {
    const irr = IRR[inf] ?? {};
    const presente = irr.presente ?? regular(inf, 'presente');
    const fut = futureStem(inf);
    const forms: Record<Tense, Six> = {
      presente,
      indefinido: irr.indefinido ?? regular(inf, 'indefinido'),
      imperfecto: irr.imperfecto ?? regular(inf, 'imperfecto'),
      perfecto: HABER.map((h) => `${h} ${participle(inf)}`) as Six,
      futuro: FUT_ENDINGS.map((e) => fut + e) as Six,
      condicional: COND_ENDINGS.map((e) => fut + e) as Six,
      subjuntivo: subjunctive(inf, presente[0]),
      imperativo: NO_IMPERATIVE.has(inf) ? ['', '', '', '', '', ''] : ['', IMP_TU[inf] ?? presente[2], '', '', inf.slice(0, -1) + 'd', ''],
    };
    const irregular: Partial<Record<Tense, true>> = {};
    for (const t of ['presente', 'indefinido', 'imperfecto'] as const) if (irr[t]) irregular[t] = true;
    if (IRREGULAR_PP[inf] && !IRREGULAR_PP[inf].endsWith('ído')) irregular.perfecto = true;
    if (FUT_STEM[inf]) irregular.futuro = irregular.condicional = true;
    if (SUBJ_IRR[inf] || !presente[0].endsWith('o') || presente[0].slice(0, -1) !== inf.slice(0, -2)) irregular.subjuntivo = true;
    if (IMP_TU[inf]) irregular.imperativo = true;
    ALL.push({ inf, en: { base, s3, past, pp }, ch, forms, irregular });
  }
}

// Chapter 2 — regular verbs (Lola joins).
verbs(2, [
  ['hablar', 'speak', 'speaks', 'spoke', 'spoken'],
  ['cantar', 'sing', 'sings', 'sang', 'sung'],
  ['bailar', 'dance', 'dances', 'danced', 'danced'],
  ['comprar', 'buy', 'buys', 'bought', 'bought'],
  ['cocinar', 'cook', 'cooks', 'cooked', 'cooked'],
  ['tocar', 'play (music)', 'plays (music)', 'played (music)', 'played (music)'],
  ['escuchar', 'listen', 'listens', 'listened', 'listened'],
  ['trabajar', 'work', 'works', 'worked', 'worked'],
  ['comer', 'eat', 'eats', 'ate', 'eaten'],
  ['beber', 'drink', 'drinks', 'drank', 'drunk'],
  ['vender', 'sell', 'sells', 'sold', 'sold'],
  ['vivir', 'live', 'lives', 'lived', 'lived'],
  ['escribir', 'write', 'writes', 'wrote', 'written'],
  ['abrir', 'open', 'opens', 'opened', 'opened'],
]);
// Chapter 3 — the big irregulars and stem-changers.
verbs(3, [
  ['ser', 'be', 'is', 'was', 'been'],
  ['estar', 'be', 'is', 'was', 'been'],
  ['tener', 'have', 'has', 'had', 'had'],
  ['ir', 'go', 'goes', 'went', 'gone'],
  ['hacer', 'do', 'does', 'did', 'done'],
  ['poder', 'can', 'can', 'could', 'been able to'],
  ['querer', 'want', 'wants', 'wanted', 'wanted'],
  ['dormir', 'sleep', 'sleeps', 'slept', 'slept'],
  ['ver', 'see', 'sees', 'saw', 'seen'],
  ['saber', 'know', 'knows', 'knew', 'known'],
  ['jugar', 'play (games)', 'plays (games)', 'played (games)', 'played (games)'],
  ['pensar', 'think', 'thinks', 'thought', 'thought'],
]);
// Chapter 4 — more irregulars, now also in the perfecto.
verbs(4, [
  ['decir', 'say', 'says', 'said', 'said'],
  ['venir', 'come', 'comes', 'came', 'come'],
  ['volver', 'return', 'returns', 'returned', 'returned'],
  ['poner', 'put', 'puts', 'put', 'put'],
  ['dar', 'give', 'gives', 'gave', 'given'],
  ['salir', 'leave', 'leaves', 'left', 'left'],
  ['conocer', 'know (a person)', 'knows (a person)', 'met', 'known'],
  ['empezar', 'start', 'starts', 'started', 'started'],
]);
// Chapter 5 — the verbs of the finale.
verbs(5, [
  ['recordar', 'remember', 'remembers', 'remembered', 'remembered'],
  ['pedir', 'ask for', 'asks for', 'asked for', 'asked for'],
  ['leer', 'read', 'reads', 'read', 'read'],
  ['creer', 'believe', 'believes', 'believed', 'believed'],
  ['llegar', 'arrive', 'arrives', 'arrived', 'arrived'],
  ['ayudar', 'help', 'helps', 'helped', 'helped'],
  ['luchar', 'fight', 'fights', 'fought', 'fought'],
  ['perdonar', 'forgive', 'forgives', 'forgave', 'forgiven'],
  ['olvidar', 'forget', 'forgets', 'forgot', 'forgotten'],
]);

export const VERBS: readonly Verb[] = ALL;
export const VERB_BY_INF: ReadonlyMap<string, Verb> = new Map(ALL.map((v) => [v.inf, v]));

export function verbsUpToChapter(ch: number, level: Level = 'a2'): Verb[] {
  // Advanced players get every verb from the start.
  return ALL.filter((v) => level === 'b1' || v.ch <= ch);
}

/** Chapter each tense unlocks in, per Spanish level. */
const UNLOCK: Record<Level, Partial<Record<Tense, number>>> = {
  a1: { presente: 2, perfecto: 4, indefinido: 5 },
  a2: { presente: 2, perfecto: 4, indefinido: 5, imperfecto: 5 },
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

const EN_PRONOUN: Record<Person, string> = {
  yo: 'I', tú: 'you', él: 'he', ella: 'she', nosotros: 'we', vosotros: 'you all', ellos: 'they', ellas: 'they',
};

/** "we sing", "she has eaten", "you all went", "I used to play" */
export function englishFor(v: Verb, p: Person, tense: Tense = 'presente'): string {
  const pr = EN_PRONOUN[p];
  const third = p === 'él' || p === 'ella';
  const be = v.en.base === 'be';
  switch (tense) {
    case 'presente':
      if (be) return `${pr} ${p === 'yo' ? 'am' : third ? 'is' : 'are'}`;
      return `${pr} ${third ? v.en.s3 : v.en.base}`;
    case 'perfecto':
      return `${pr} ${third ? 'has' : 'have'} ${v.en.pp}`;
    case 'indefinido':
      if (be) return `${pr} ${p === 'yo' || third ? 'was' : 'were'}`;
      return `${pr} ${v.en.past}`;
    case 'imperfecto':
      if (v.en.base === 'can') return `${pr} used to be able to`;
      return `${pr} used to ${v.en.base}`;
    case 'futuro':
      if (v.en.base === 'can') return `${pr} will be able to`;
      return `${pr} will ${v.en.base}`;
    case 'condicional':
      if (v.en.base === 'can') return `${pr} could`;
      return `${pr} would ${v.en.base}`;
    case 'subjuntivo':
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
