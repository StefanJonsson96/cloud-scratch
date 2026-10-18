// Tap-any-word translation. Every Spanish line in the game is run through
// `annotate`, which finds vocabulary, expressions, conjugated verbs and common
// little words so the player can tap them for a meaning.

import { WORDS } from '../data/vocab';
import { VERBS, TABLE_PERSONS, TENSES, type Tense } from '../data/verbs';
import { GLOSSARY } from '../data/glossary';

export interface Entry {
  /** Dictionary form: "el mar", "tener". */
  lemma: string;
  en: string;
  /** Grammar note, e.g. "yo · presente". */
  note?: string;
  /** Vocabulary id if this is a Grimorio word. */
  wordId?: string;
}

const MAP = new Map<string, Entry>();
const PHRASES = new Map<string, Entry>();
let MAX_PHRASE = 1;

function key(s: string) {
  return s.toLowerCase().normalize('NFC');
}

function put(form: string, e: Entry, override = false) {
  const k = key(form);
  if (!k) return;
  if (k.includes(' ')) {
    if (!PHRASES.has(k) || override) PHRASES.set(k, e);
    MAX_PHRASE = Math.max(MAX_PHRASE, k.split(' ').length);
  } else if (!MAP.has(k) || override) {
    MAP.set(k, e);
  }
}

function plural(w: string): string {
  if (/[aeiouáéó]$/.test(w)) return w + 's';
  if (w.endsWith('z')) return w.slice(0, -1) + 'ces';
  if (w.endsWith('ón')) return w.slice(0, -2) + 'ones';
  if (w.endsWith('és')) return w.slice(0, -2) + 'eses';
  return w + 'es';
}

// Little words first, so vocabulary entries can override them.
const COMMON: [string, string][] = [
  ['el', 'the (m)'], ['la', 'the (f) / it, her'], ['los', 'the (m pl) / them'], ['las', 'the (f pl) / them'],
  ['un', 'a (m)'], ['una', 'a (f)'], ['unos', 'some (m)'], ['unas', 'some (f)'], ['lo', 'it / him / the (neuter)'],
  ['de', 'of / from'], ['del', 'of the (de + el)'], ['al', 'to the (a + el)'], ['a', 'to / at'], ['en', 'in / on / at'],
  ['con', 'with'], ['sin', 'without'], ['por', 'for / through / because of'], ['para', 'for / in order to'],
  ['y', 'and'], ['o', 'or'], ['pero', 'but'], ['que', 'that / which / than'], ['qué', 'what / how'],
  ['quién', 'who'], ['quien', 'who'], ['cómo', 'how'], ['como', 'like / as'], ['dónde', 'where'], ['donde', 'where'],
  ['cuándo', 'when'], ['cuando', 'when'], ['cuánto', 'how much'], ['cuál', 'which'], ['porque', 'because'], ['por qué', 'why'],
  ['si', 'if'], ['no', 'no / not'], ['muy', 'very'], ['mucho', 'a lot / much'], ['mucha', 'a lot / much'], ['muchos', 'many'],
  ['muchas', 'many'], ['poco', 'a little'], ['poca', 'a little'], ['más', 'more'], ['menos', 'less'], ['tan', 'so'],
  ['tanto', 'so much'], ['todo', 'everything / all'], ['toda', 'all'], ['todos', 'everyone / all'], ['todas', 'all'],
  ['nada', 'nothing'], ['algo', 'something'], ['alguien', 'someone'], ['nadie', 'nobody'], ['ya', 'already / now'],
  ['todavía', 'still / yet'], ['aún', 'still'], ['otra', 'another'], ['otro', 'another'], ['otros', 'others'],
  ['vez', 'time (occasion)'], ['veces', 'times'], ['este', 'this'], ['esta', 'this'], ['esto', 'this'], ['estos', 'these'],
  ['estas', 'these'], ['ese', 'that'], ['esa', 'that'], ['eso', 'that'], ['esos', 'those'], ['aquel', 'that (over there)'],
  ['aquella', 'that (over there)'], ['ahí', 'there'], ['allí', 'over there'], ['allá', 'over there'], ['cerca', 'near'],
  ['lejos', 'far'], ['dentro', 'inside'], ['fuera', 'outside'], ['arriba', 'up / upstairs'], ['abajo', 'down / downstairs'],
  ['después', 'after / later'], ['antes', 'before'], ['luego', 'later / then'], ['entonces', 'then / so'], ['pronto', 'soon'],
  ['tarde', 'late / afternoon'], ['temprano', 'early'], ['así', 'like this / so'], ['bueno', 'good / well…'],
  ['yo', 'I'], ['tú', 'you'], ['él', 'he'], ['ella', 'she'], ['usted', 'you (formal)'], ['nosotros', 'we'],
  ['nosotras', 'we (f)'], ['vosotros', 'you all (Spain)'], ['vosotras', 'you all (f, Spain)'], ['ellos', 'they'],
  ['ellas', 'they (f)'], ['ustedes', 'you all (formal)'], ['me', 'me / myself'], ['te', 'you / yourself'],
  ['se', 'himself / herself / itself'], ['nos', 'us / ourselves'], ['os', 'you all / yourselves (Spain)'], ['le', 'to him / to her'],
  ['les', 'to them'], ['mí', 'me (after a preposition)'], ['ti', 'you (after a preposition)'], ['conmigo', 'with me'],
  ['contigo', 'with you'], ['mi', 'my'], ['mis', 'my'], ['tu', 'your'], ['tus', 'your'], ['su', 'his / her / their'],
  ['sus', 'his / her / their'], ['nuestro', 'our'], ['nuestra', 'our'], ['nuestros', 'our'], ['nuestras', 'our'],
  ['vuestro', 'your (you all)'], ['vuestra', 'your (you all)'], ['vuestros', 'your (you all)'], ['vuestras', 'your (you all)'],
  ['hay', 'there is / there are'], ['había', 'there was / there were'], ['señor', 'sir / Mr.'], ['señora', "ma'am / Mrs."],
  ['niño', 'child / boy'], ['niña', 'girl'], ['niños', 'children'], ['hombre', 'man / (exclamation) come on!'],
  ['mujer', 'woman'], ['cosa', 'thing'], ['cosas', 'things'], ['lugar', 'place'], ['parte', 'part'], ['mejor', 'better / best'],
  ['peor', 'worse'], ['mismo', 'same'], ['misma', 'same'], ['solo', 'only / alone'], ['sólo', 'only'], ['casi', 'almost'],
  ['siempre', 'always'], ['claro', 'of course / clear'], ['quizás', 'maybe'], ['tal', 'such'], ['vez', 'time'],
  ['gran', 'great'], ['primero', 'first'], ['primera', 'first'], ['último', 'last'], ['última', 'last'], ['nuevo', 'new'],
  ['oye', 'hey / listen'], ['mira', 'look'], ['uy', 'oops'], ['ay', 'oh / ouch'], ['eh', 'hey'], ['oh', 'oh'], ['ah', 'ah'],
  ['bah', 'bah'], ['mmm', 'mmm'], ['jaja', 'haha'], ['jajaja', 'hahaha'], ['vamos', "let's go / we go"], ['venga', 'come on!'],
  ['tranquilo', 'calm down / relax'], ['tranquila', 'calm down / relax'], ['cuidado', 'careful'], ['socorro', 'help!'],
  ['ayuda', 'help'], ['gente', 'people'], ['fin', 'end'], ['por fin', 'finally'], ['a veces', 'sometimes'], ['de verdad', 'really'],
  ['de acuerdo', 'agreed / okay'], ['verdad', 'truth / right?'], ['a ver', "let's see"], ['tío', 'uncle / mate (colloquial)'],
  ['tía', 'aunt / mate (colloquial)'], ['guay', 'cool (Spain)'], ['vale', 'okay (Spain)'], ['ojalá', 'I hope / if only'],
  ['enorme', 'huge'], ['raro', 'strange'], ['rara', 'strange'], ['listo', 'clever / ready'], ['lista', 'clever / ready'],
  ['importante', 'important'], ['difícil', 'difficult'], ['fácil', 'easy'], ['loco', 'crazy'], ['loca', 'crazy'],
  ['abierto', 'open'], ['abierta', 'open'], ['cerrado', 'closed'], ['cerrada', 'closed'], ['apagado', 'off (light)'],
  ['apagada', 'off (light)'], ['gris', 'grey'], ['plaza', 'town square'], ['año', 'year'], ['años', 'years'],
  ['semana', 'week'], ['mañana', 'tomorrow / morning'], ['hora', 'hour / time'], ['horas', 'hours'], ['momento', 'moment'],
  ['poder', 'power / to be able to'], ['hechizo', 'spell'], ['monstruo', 'monster'], ['monstruos', 'monsters'],
  ['enemigo', 'enemy'], ['enemigos', 'enemies'], ['batalla', 'battle'], ['norte', 'north'], ['sur', 'south'],
  ['izquierda', 'left'], ['derecha', 'right'], ['recto', 'straight ahead'], ['allí', 'there'], ['nunca', 'never'],
  ['nunca más', 'never again'], ['otra vez', 'again'], ['de nuevo', 'again'], ['mucho gusto', 'pleased to meet you'],
  ['hasta pronto', 'see you soon'], ['bienvenido', 'welcome'], ['bienvenida', 'welcome'], ['bienvenidos', 'welcome (pl)'],
  ['oiga', 'excuse me (formal)'], ['perdona', 'sorry / excuse me'], ['disculpa', 'excuse me'], ['menos mal', 'thank goodness'],
  ['qué pasa', "what's up / what's happening"], ['sí', 'yes'], ['también', 'also / too'], ['tampoco', 'neither'],
  ['joven', 'young / young person'], ['mayor', 'older / elderly'], ['viejo', 'old'], ['sabia', 'wise'], ['sabio', 'wise'],
];
for (const [es, en] of COMMON) put(es, { lemma: es, en });
for (const [es, en] of GLOSSARY) put(es, { lemma: es, en });

// Vocabulary (overrides common words), including plurals.
for (const w of WORDS) {
  const e: Entry = { lemma: w.es.split('|').join(' / '), en: w.en, wordId: w.id };
  for (const f of w.forms) {
    const clean = f.replace(/[¿?¡!…,]/g, '').trim();
    put(clean, e, true);
    if (!clean.includes(' ') && (w.pos === 'noun' || w.pos === 'adj')) put(plural(clean), { ...e, note: 'plural' });
  }
}

// Every conjugated verb form.
const TENSE_ORDER: Tense[] = ['presente', 'perfecto', 'indefinido', 'imperfecto'];
const HABER_EN = ['I have', 'you have', 'he/she has', 'we have', 'you all have', 'they have'];
for (const v of VERBS) {
  const en = v.en.base === 'can' ? 'to be able to' : `to ${v.en.base}`;
  put(v.inf, { lemma: v.inf, en, note: 'infinitive' }, true);
  for (const t of TENSE_ORDER) {
    v.forms[t].forEach((form, i) => {
      const note = `${TABLE_PERSONS[i]} · ${TENSES[t].es.toLowerCase()}`;
      if (t === 'perfecto') {
        const [, pp] = form.split(' ');
        put(pp, { lemma: v.inf, en, note: 'participle (with haber: “has done”)' });
        put(form, { lemma: v.inf, en: `${HABER_EN[i]} ${v.en.pp}`, note });
      } else {
        put(form, { lemma: v.inf, en, note });
      }
    });
  }
}
['he', 'has', 'ha', 'hemos', 'habéis', 'han'].forEach((f, i) =>
  put(f, { lemma: 'haber', en: HABER_EN[i], note: 'helper verb for the perfecto' }),
);

export function lookup(word: string): Entry | undefined {
  return MAP.get(key(word));
}

export interface Segment {
  text: string;
  entry?: Entry;
}

const TOKEN = /([\p{L}\p{M}]+(?:['’][\p{L}]+)?)|([^\p{L}\p{M}]+)/gu;

/** Split Spanish text into tappable segments. */
export function annotate(text: string): Segment[] {
  const raw: { text: string; word: boolean }[] = [];
  for (const m of text.matchAll(TOKEN)) raw.push({ text: m[0], word: !!m[1] });
  const out: Segment[] = [];
  for (let i = 0; i < raw.length; i++) {
    const tok = raw[i];
    if (!tok.word) {
      out.push({ text: tok.text });
      continue;
    }
    // Try the longest multi-word expression starting here (words separated by spaces/commas).
    let matched = false;
    for (let n = Math.min(MAX_PHRASE, 8); n >= 2 && !matched; n--) {
      const words: string[] = [];
      let j = i;
      for (; j < raw.length && words.length < n; j++) {
        if (raw[j].word) words.push(raw[j].text);
        else if (!/^[\s,]+$/.test(raw[j].text)) break;
      }
      if (words.length !== n) continue;
      const e = PHRASES.get(key(words.join(' ')));
      if (e) {
        out.push({ text: raw.slice(i, j).map((r) => r.text).join(''), entry: e });
        i = j - 1;
        matched = true;
      }
    }
    if (!matched) out.push({ text: tok.text, entry: lookup(tok.text) });
  }
  return out;
}

/** Words in `text` the dictionary can't explain (used by tests to keep coverage complete). */
export function unknownWords(text: string, names: string[] = []): string[] {
  const skip = new Set(names.map(key));
  return annotate(text)
    .filter((s) => /\p{L}/u.test(s.text) && !s.entry && !skip.has(key(s.text)))
    .map((s) => s.text);
}

export function addDictionaryWords(rows: [string, string][]) {
  for (const [es, en] of rows) put(es, { lemma: es, en });
}
