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

export type Tense = 'presente' | 'perfecto' | 'indefinido' | 'imperfecto';

export const TENSES: Record<Tense, { es: string; en: string; ch: number; markers: string[]; markersEn: string[]; rule: string }> = {
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
    const forms = {
      presente: irr.presente ?? regular(inf, 'presente'),
      indefinido: irr.indefinido ?? regular(inf, 'indefinido'),
      imperfecto: irr.imperfecto ?? regular(inf, 'imperfecto'),
      perfecto: HABER.map((h) => `${h} ${participle(inf)}`) as Six,
    };
    const irregular: Partial<Record<Tense, true>> = {};
    for (const t of ['presente', 'indefinido', 'imperfecto'] as const) if (irr[t]) irregular[t] = true;
    if (IRREGULAR_PP[inf] && !IRREGULAR_PP[inf].endsWith('ído')) irregular.perfecto = true;
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

export function verbsUpToChapter(ch: number): Verb[] {
  return ALL.filter((v) => v.ch <= ch);
}

export function tensesUpToChapter(ch: number): Tense[] {
  return (Object.keys(TENSES) as Tense[]).filter((t) => TENSES[t].ch <= ch);
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
  }
}
