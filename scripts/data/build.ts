// npm run data — builds src/data/generated/ from open Spanish data:
//   Wiktionary (meanings, gender, synonyms, regional and informal variants, usage notes)
//   Tatoeba (example sentences, sentence-building, grammar drills)
//   conjugate-esp (every verb form, Spain's vosotros included)
//   compromise (English verb forms for the prompts)
// Only the curriculum (src/data/curriculum.ts) — which words each chapter
// teaches — is written by hand. Run with `-- --update` to fetch the newest data.

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import nlp from 'compromise';
import conjugateEsp from '@jirimracek/conjugate-esp';
import { readPin, updatePin, dataDir, REPO } from './source';
import { readWiktionary, type WPos } from './wiktionary';
import { readForms, lemmaOf } from './forms';
import { readSentences, allLemmas, type Pair } from './tatoeba';
import { pickSense, cleanGloss, shortGloss, primarySenses, POS_MAP } from './select';
import { register, regionLabel, isSpain } from '../../src/data/regions';
import { CORRECTIONS } from './corrections';
import { LESSONS, VERB_LESSONS, type WordOptions } from '../../src/data/curriculum';
import { slug, tokenize, takesEl } from '../../src/data/text';
import type { DrillTopic, GenDictionary, GenDrill, GenMeta, GenSentence, GenVerb, GenWord, Six, TenseId, Variant } from '../../src/data/types';

const ROOT = join(import.meta.dirname, '../..');
const OUT = join(ROOT, 'src/data/generated');

const pin = process.argv.includes('--update') ? updatePin() : readPin();
const dir = dataDir(pin);
console.log(`Spanish data: ${REPO}@${pin.commit.slice(0, 7)} (${pin.date.slice(0, 10)})`);
const wk = readWiktionary(join(dir, 'es-en.data'));
const fx = readForms(join(dir, 'es_allforms.csv'));
const pairs = readSentences(join(dir, 'sentences.tsv'));
// Lemma → frequency rank (1 = most common), from OpenSubtitles via FrequencyWords (CC BY-SA),
// and form → how often it is each lemma ("sé": saber 946k, ser… — not "sé" the interjection).
const RANK = new Map<string, number>();
const FORM_FREQ = new Map<string, Map<string, number>>();
readFileSync(join(dir, 'frequency.csv'), 'utf8')
  .split('\n')
  .slice(1)
  .forEach((line, i) => {
    const [, lemma, pos, , usage] = line.split(',');
    if (lemma && !RANK.has(lemma)) RANK.set(lemma, i + 1);
    for (const item of (usage ?? '').split('|')) {
      const [n, form] = item.split(':');
      if (!form) continue;
      let m = FORM_FREQ.get(form);
      if (!m) FORM_FREQ.set(form, (m = new Map()));
      m.set(`${pos}|${lemma}`, (m.get(`${pos}|${lemma}`) ?? 0) + Number(n));
    }
  });
// The same from Tatoeba's tagged sentences, which read each word in context
// (FreeLing): better for forms the frequency list files under the wrong lemma
// ("tranquila" under "tranquilar").
const TAG_FREQ = new Map<string, Map<string, number>>();
for (const p of pairs) {
  for (const [form, pos, lemma] of p.tagged) {
    let m = TAG_FREQ.get(form);
    if (!m) TAG_FREQ.set(form, (m = new Map()));
    m.set(`${pos}|${lemma}`, (m.get(`${pos}|${lemma}`) ?? 0) + 1);
  }
}
/** How often `form` is `lemma` (as `pos`): tagged sentences first, then the frequency list. */
const formCount = (form: string, pos: string, lemma: string) => {
  const tags = TAG_FREQ.get(form);
  const total = tags ? [...tags.values()].reduce((a, b) => a + b, 0) : 0;
  if (total >= 5) return (tags!.get(`${pos}|${lemma}`) ?? 0) / total;
  const freq = FORM_FREQ.get(form);
  const sum = freq ? [...freq.values()].reduce((a, b) => a + b, 0) : 0;
  return sum ? (freq!.get(`${pos}|${lemma}`) ?? 0) / sum : 0;
};
const rank = (lemma: string) => RANK.get(lemma) ?? Infinity;
console.log(`  ${wk.size} Wiktionary entries · ${fx.lemmas.size} forms · ${pairs.length} sentence pairs · ${RANK.size} ranked lemmas`);

const strip = (s: string) => s.replace(/[¿?¡!…]/g, '').trim().toLowerCase();
const words = (s: string) => tokenize(s).map((t) => t.toLowerCase());

// ------------------------------------------------------------------ verbs
const { Conjugator } = conjugateEsp as unknown as { Conjugator: new () => { conjugateSync(v: string, region: string): unknown } };
const conjugator = new Conjugator();
const TENSE_SOURCE: Record<TenseId, [string, string]> = {
  presente: ['Indicativo', 'Presente'],
  perfecto: ['Indicativo', 'PreteritoPerfecto'],
  indefinido: ['Indicativo', 'PreteritoIndefinido'],
  imperfecto: ['Indicativo', 'PreteritoImperfecto'],
  futuro: ['Indicativo', 'FuturoImperfecto'],
  condicional: ['Indicativo', 'CondicionalSimple'],
  subjuntivo: ['Subjuntivo', 'Presente'],
  imperativo: ['Imperativo', 'Afirmativo'],
};
/** `rest`: forms of every tense the game doesn't teach ("pudieras", "habré visto"). */
type Table = { forms: Record<TenseId, Six>; participle: string; gerund: string; rest: string[] };
const paradigms = new Map<string, Table | null>();

/** Every form of a verb in Spain Spanish, or null if the library doesn't know it. */
function paradigm(inf: string): Table | null {
  if (paradigms.has(inf)) return paradigms.get(inf)!;
  let table: Table | null = null;
  try {
    const r = conjugator.conjugateSync(inf, 'castellano');
    const first = (Array.isArray(r) ? r[0] : r) as { conjugation?: Record<string, Record<string, string[] | string>> } | undefined;
    const c = first?.conjugation;
    if (c?.Indicativo) {
      const forms = {} as Record<TenseId, Six>;
      for (const [t, [mood, tense]] of Object.entries(TENSE_SOURCE) as [TenseId, [string, string]][]) {
        forms[t] = (c[mood][tense] as string[]).map((f) => (f === '-' ? '' : f.replace(/^no /, ''))) as Six;
      }
      const imp = c.Impersonal as Record<string, string>;
      const taught = new Set(Object.values(TENSE_SOURCE).map(([m, t]) => `${m}/${t}`));
      const rest: string[] = [];
      for (const [mood, tenses] of Object.entries(c)) {
        if (mood === 'Impersonal') continue;
        for (const [t, list] of Object.entries(tenses)) if (!taught.has(`${mood}/${t}`) && Array.isArray(list)) rest.push(...list.filter((f) => f !== '-').map((f) => f.replace(/^no /, '')));
      }
      table = { forms, participle: imp.Participio, gerund: imp.Gerundio, rest };
    }
  } catch {
    table = null;
  }
  paradigms.set(inf, table);
  return table;
}

const PERSONS = ['yo', 'tú', 'él / ella', 'nosotros', 'vosotros', 'ellos / ellas'];
const TENSE_LABEL: Record<TenseId, string> = {
  presente: 'presente', perfecto: 'pretérito perfecto', indefinido: 'indefinido', imperfecto: 'imperfecto',
  futuro: 'futuro', condicional: 'condicional', subjuntivo: 'subjuntivo', imperativo: 'imperativo',
};

/** What a verb form is: "yo · presente", "participle"… */
function verbNote(inf: string, form: string): string | undefined {
  const t = paradigm(inf);
  if (!t) return undefined;
  if (form === inf) return 'infinitive';
  if (form === t.participle) return 'participle';
  if (form === t.gerund) return 'gerund';
  // Up to two readings: "mira" is él · presente or tú · imperativo.
  const found: string[] = [];
  for (const tense of Object.keys(TENSE_SOURCE) as TenseId[]) {
    if (tense === 'perfecto') continue;
    const i = t.forms[tense].indexOf(form);
    if (i >= 0) found.push(`${PERSONS[i]} · ${TENSE_LABEL[tense]}`);
  }
  return found.length ? found.slice(0, 2).join(' or ') : undefined;
}

// A naive regular conjugation, to tell which forms are irregular.
const ENDINGS: Record<'presente' | 'indefinido' | 'imperfecto', Record<'ar' | 'er' | 'ir', string[]>> = {
  presente: { ar: ['o', 'as', 'a', 'amos', 'áis', 'an'], er: ['o', 'es', 'e', 'emos', 'éis', 'en'], ir: ['o', 'es', 'e', 'imos', 'ís', 'en'] },
  indefinido: { ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'], er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'], ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'] },
  imperfecto: { ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'], er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'], ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'] },
};
// Keep the hard sound before e/é: toqué, llegué, empecé, toque, llegue.
const spell = (stem: string, ending: string) =>
  /^[eé]/.test(ending) ? stem.replace(/c$/, 'qu').replace(/g$/, 'gu').replace(/z$/, 'c') + ending : stem + ending;
function regularTable(inf: string): Partial<Record<TenseId, string[]>> {
  const e = inf.slice(-2) as 'ar' | 'er' | 'ir';
  const stem = inf.slice(0, -2);
  if (!ENDINGS.presente[e]) return {};
  const pres = ENDINGS.presente[e].map((x) => stem + x);
  return {
    presente: pres,
    indefinido: ENDINGS.indefinido[e].map((x) => spell(stem, x)),
    imperfecto: ENDINGS.imperfecto[e].map((x) => stem + x),
    futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'].map((x) => inf + x),
    condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'].map((x) => inf + x),
    subjuntivo: (e === 'ar' ? ['e', 'es', 'e', 'emos', 'éis', 'en'] : ['a', 'as', 'a', 'amos', 'áis', 'an']).map((x) => spell(stem, x)),
    imperativo: ['', pres[2], '', '', inf.slice(0, -1) + 'd', ''],
  };
}

/** English verb forms for a gloss like "to play (a musical instrument)". */
function englishVerb(gloss: string, hint?: string): GenVerb['en'] {
  let plain = shortGloss(gloss, hint);
  while (/\([^()]*\)/.test(plain)) plain = plain.replace(/\s*\([^()]*\)/g, '');
  const first = plain
    .replace(/^to /, '')
    .split(/[;,]\s*/)[0]
    .replace(/ (?:something|someone|somebody|oneself)$/, '')
    .trim();
  const [head, ...rest] = first.split(' ');
  const tail = rest.length ? ' ' + rest.join(' ') : '';
  if (head === 'be') return { base: first, s3: `is${tail}`, past: `was${tail}`, pp: `been${tail}` };
  const c = (nlp(head).verbs().conjugate()[0] ?? nlp(`they ${head}`).verbs().conjugate()[0] ?? {}) as Record<string, string>;
  const past = c.PastTense ?? (head.endsWith('e') ? `${head}d` : `${head}ed`);
  const s3 = c.PresentTense ?? (/(s|sh|ch|x|o)$/.test(head) ? `${head}es` : `${head}s`);
  return { base: first, s3: s3 + tail, past: past + tail, pp: (c.Participle ?? past) + tail };
}

const verbs: GenVerb[] = [];
const verbGloss = new Map<string, string>();
for (const lesson of VERB_LESSONS) {
  for (const item of lesson.verbs) {
    const [inf, hint] = typeof item === 'string' ? [item, undefined] : item;
    const table = paradigm(inf);
    if (!table) throw new Error(`conjugate-esp doesn't know the verb "${inf}"`);
    const picked = pickSense(wk, inf, 'verb', hint);
    if (!picked) throw new Error(`Wiktionary has no entry for the verb "${inf}"`);
    const reg = regularTable(inf);
    const irregular: GenVerb['irregular'] = {};
    for (const t of Object.keys(TENSE_SOURCE) as TenseId[]) {
      if (t === 'perfecto') {
        const regPp = inf.slice(0, -2) + (inf.endsWith('ar') ? 'ado' : 'ido');
        if (table.participle !== regPp && !table.participle.endsWith('ído')) irregular.perfecto = true;
      } else if (reg[t] && table.forms[t].some((f, i) => f && f !== reg[t]![i])) {
        irregular[t] = true;
      }
    }
    verbs.push({ inf, en: englishVerb(picked.sense.gloss, hint), ch: lesson.chapter, forms: table.forms, irregular });
    verbGloss.set(inf, picked.sense.gloss);
  }
}
// Verbs that share an English meaning (saber / conocer = know) get Wiktionary's
// note that tells them apart: "(a person or a place)".
const byBase = new Map<string, GenVerb[]>();
for (const v of verbs) byBase.set(v.en.base, [...(byBase.get(v.en.base) ?? []), v]);
for (const group of byBase.values()) {
  if (group.length < 2) continue;
  for (const v of group) {
    const aside = /\(([^()]{3,30})\)/.exec(cleanGloss(verbGloss.get(v.inf)!))?.[1];
    if (aside) v.en.sense = aside;
  }
}
const VERB_SET = new Set(verbs.map((v) => v.inf));

// ------------------------------------------------------------------ words
/** Every lemma whose senses are all regional (not used in Spain): "computadora", "celular"… */
function regionalOnly(lemma: string): boolean {
  const senses = (wk.get(lemma) ?? []).flatMap((p) => p.senses);
  return senses.length > 0 && senses.every((s) => register(s.q) === 'regional');
}

/** Other answers for a sense: its synonyms, and other words Wiktionary glosses the same way. */
function variantsFor(lemma: string, pos: WPos, senseGloss: string, senseSyn: { word: string; q?: string }[], en: string): Variant[] {
  const out = new Map<string, Variant>();
  const add = (form: string, listedQ: string | undefined) => {
    const f = form.trim();
    if (!f || strip(f) === strip(lemma) || f.startsWith('Thesaurus:') || f.split(' ').length > 4 || out.has(f)) return;
    // Not English loans that are just the prompt ("like" for "I like").
    if (meaning(en).has(f.toLowerCase())) return;
    // Never words that are vulgar in some sense.
    if ((wk.get(f) ?? []).some((p) => p.senses.some((s) => /\b(vulgar|offensive|derogatory)\b/i.test(s.q ?? '')))) return;
    // A synonym list may not say "(Mexico)", but the word's own entry often does.
    const q = register(listedQ) === 'neutral' ? (ownQualifier(f) ?? listedQ) : listedQ;
    const r = register(q);
    // Real words only: plain synonyms must be in the frequency list (no "marketa",
    // "grao"); informal and regional ones need a Wiktionary entry.
    if (f.includes(' ') || r !== 'neutral' ? !wk.has(f) && !RANK.has(f) : !RANK.has(f)) return;
    if (r === 'reject') return;
    if (r === 'regional') out.set(f, { form: f, kind: 'regional', note: `«${f}» is used in ${regionLabel(q!)}. In Spain: «${lemma}».` });
    else if (r === 'informal') out.set(f, { form: f, kind: 'informal', note: `«${f}» is informal — fine with friends.` });
    else out.set(f, { form: f, kind: 'synonym', note: `«${f}» also means “${en}”.` });
  };
  // Wiktionary's synonyms — minus common words whose main meaning is something else ("correr" for "to walk").
  const meaning = (g: string) => new Set(g.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter((x) => x.length > 2 && x !== 'the'));
  const ours = meaning(en);
  /**
   * The qualifier on the candidate's own senses for this meaning (or all its
   * senses, if none match): vulgar anywhere wins, otherwise only when none is neutral.
   */
  function ownQualifier(word: string): string | undefined {
    const senses = (wk.get(word) ?? []).flatMap((p) => p.senses);
    const matching = senses.filter((s) => s.syn.some((x) => x.word === lemma) || [...meaning(cleanGloss(s.gloss))].some((x) => ours.has(x)));
    const same = matching.length ? matching : senses;
    if (!same.length) return undefined;
    const rejected = same.find((s) => register(s.q) === 'reject');
    if (rejected) return rejected.q;
    if (same.some((s) => register(s.q) === 'neutral')) return undefined;
    return (same.find((s) => register(s.q) === 'regional') ?? same[0]).q;
  }
  for (const s of senseSyn) {
    const own = wk.get(s.word);
    if (own && rank(s.word) <= 3000 && register(s.q) === 'neutral') {
      const main = primarySenses(own).filter(({ pos: p2 }) => p2.pos === pos.pos);
      const shares = main.some(({ sense }) => [...meaning(cleanGloss(sense.gloss))].some((x) => ours.has(x)));
      if (main.length && !shares) continue;
    }
    add(s.word, s.q);
  }
  // Reverse look-up: common words whose main meaning is exactly this one,
  // asides included ("key (to open doors)" isn't "clave", "key (code)").
  const target = firstAlternative(senseGloss);
  for (const cand of REVERSE.get(target) ?? []) {
    if (cand.lemma === lemma || !POS_MAP_FLAT(pos.pos).includes(cand.pos) || rank(cand.lemma) > 8000) continue;
    if (register(cand.q) !== 'neutral') continue;
    add(cand.lemma, cand.q);
  }
  return [...out.values()].slice(0, 12);
}
function POS_MAP_FLAT(p: string): string[] {
  return p === 'v' ? ['v'] : p === 'n' ? ['n'] : p === 'adj' ? ['adj'] : p === 'adv' ? ['adv'] : ['interj', 'phrase', 'adv', 'prep', 'conj', 'pron'];
}

function firstAlternative(gloss: string): string {
  return cleanGloss(gloss).split(/;\s*/)[0].split(/,\s*(?![^()]*\))/)[0].trim().toLowerCase();
}

// English gloss → Spanish lemmas whose main meaning is exactly that.
const REVERSE = new Map<string, { lemma: string; pos: string; q?: string }[]>();
for (const [lemma, poses] of wk) {
  for (const { pos: p, sense: s } of primarySenses(poses)) {
    const key = firstAlternative(s.gloss);
    if (!key || key.length > 40) continue;
    let list = REVERSE.get(key);
    if (!list) REVERSE.set(key, (list = []));
    if (list.length < 60) list.push({ lemma, pos: p.pos, q: s.q });
  }
}

/**
 * A noun whose gender is hard to guess (Mateo's el/la drills favour these): masculine
 * in -a, feminine not in -a (except -ción/-dad… which have their own rule), and
 * feminine nouns that take "el".
 */
function trickyGender(bare: string, gender: 'm' | 'f', article: 'el' | 'la'): boolean {
  if (gender === 'f' && article === 'el') return true;
  if (gender === 'm') return /a$/.test(bare);
  return !/a$/.test(bare) && !/(ción|sión|dad|tad|tud)$/.test(bare);
}

// Tatoeba helpers ------------------------------------------------------------
const CONTENT_POS = ['n', 'v', 'adj', 'adv'];
const latamWords = new Set<string>();
function spainSafe(p: Pair): boolean {
  const toks = words(p.es);
  if (toks.includes('ustedes')) return false;
  for (const l of allLemmas(p)) if (latamWords.has(l) || regionalOnly(l)) return false;
  return !toks.some((t) => latamWords.has(t));
}
const hasProper = (p: Pair) => p.lemmas.has('prop') || /\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/.test(p.es.replace(/^[¿¡]?\S+/, ''));
const good = (p: Pair) => p.esLevel >= 5 && p.en.length <= 80 && !hasProper(p) && !/[0-9"]/.test(p.es);

const STOP = new Set(['what', 'where', 'when', 'have', 'with', 'that', 'this', "it's", "i'm", 'like', 'could', 'having']);
const genWords: GenWord[] = [];
const ids = new Set<string>();
const missing: string[] = [];

for (const lesson of LESSONS) {
  for (const raw of lesson.words) {
    const [lemma, emoji, opt]: [string, string, WordOptions] = typeof raw === 'string' ? [raw, '', {}] : [raw[0], raw[1], raw[2] ?? {}];
    const id = opt.id ?? slug(lemma);
    if (ids.has(id)) throw new Error(`Two curriculum words share the id "${id}" — give one of them { id: '…' }`);
    ids.add(id);
    let key = opt.lookup ?? strip(lemma);
    if (!wk.has(key)) {
      const via = lemmaOf(fx, key, POS_MAP[lesson.pos]);
      if (via && wk.has(via)) key = via;
    }
    // With only an English override, its words point at the right sense ("foreign tourist" → guiri's second sense).
    const hints = opt.sense ?? (opt.en ?? '').toLowerCase().split(/[^a-z']+/).filter((x) => x.length > 3 && !STOP.has(x));
    const picked = wk.has(key) ? pickSense(wk, key, lesson.pos, hints) : undefined;
    if (!picked && !opt.en) missing.push(lemma);
    const en = opt.en ?? (picked ? shortGloss(picked.sense.gloss, opt.sense) : lemma);
    const w: GenWord = { id, es: lemma, bare: lemma, forms: [lemma], en, pos: lesson.pos, cat: lesson.category, ch: lesson.chapter };
    if (emoji) w.emoji = emoji;
    if (lesson.level) w.lvl = lesson.level;
    if (opt.trap) w.trap = opt.trap;
    if (lesson.pos === 'noun') {
      const g = (picked?.pos.g ?? 'm').startsWith('f') ? 'f' : 'm';
      const article = g === 'f' && takesEl(lemma) ? 'el' : g === 'f' ? 'la' : 'el';
      w.article = article;
      w.gender = opt.both ? 'both' : g;
      w.es = `${article} ${lemma}`;
      if (opt.both) {
        const fem = [...(fx.forms.get(key) ?? [])].find((f) => f !== key && !f.endsWith('s') && /a$/.test(f));
        if (fem) w.forms.push(fem);
      } else {
        w.tricky = trickyGender(lemma, g, article) || undefined;
      }
    } else if (/o$/.test(strip(lemma)) && (lesson.pos === 'adj' || lesson.pos === 'phrase')) {
      // Adjectives (and expressions like "encantado") agree: accept the feminine too.
      const fem = strip(lemma).replace(/o$/, 'a');
      if (fx.lemmas.get(fem)?.some(([, l]) => l === key || l === strip(lemma))) w.forms.push(lemma.replace(/o([^a-záéíóúñ]*)$/i, 'a$1'));
    }
    if (picked) {
      const vs = variantsFor(key === strip(lemma) ? lemma : key, picked.pos, picked.sense.gloss, picked.sense.syn, en);
      if (vs.length) w.variants = vs;
      // The Latin American word for the "En España se dice…" quiz: from Wiktionary's own synonym list.
      const regional = picked.sense.syn
        .filter((s) => register(s.q) === 'regional' && /latin america|mexico|central america|caribbean|colombia|venezuela|argentina|chile|peru|rioplatense|andes|cono sur/i.test(s.q ?? ''))
        .sort((a, b) => rank(a.word) - rank(b.word))[0];
      if (regional && (isSpain(picked.sense.q) || lesson.category === 'España' || /\bSpain\b/.test(picked.pos.usage ?? ''))) w.latam = regional.word;
      for (const v of vs) if (v.kind === 'regional') latamWords.add(v.form);
      if (picked.pos.usage && picked.pos.usage.length < 260) w.usage = picked.pos.usage;
    }
    genWords.push(w);
  }
}

// Examples from Tatoeba, chosen after we know which words are Latin American.
const goodPairs = pairs.filter((p) => good(p) && spainSafe(p));
const byLemma = new Map<string, Pair[]>();
for (const p of goodPairs) {
  for (const l of allLemmas(p)) {
    let list = byLemma.get(l);
    if (!list) byLemma.set(l, (list = []));
    list.push(p);
  }
}
const known = new Set([...genWords.map((w) => strip(w.bare)), ...VERB_SET]);
function simplicity(p: Pair): number {
  let unknown = 0;
  for (const [pos, set] of p.lemmas) if (CONTENT_POS.includes(pos)) for (const l of set) if (!known.has(l)) unknown++;
  return words(p.es).length + unknown * 3;
}
for (const w of genWords) {
  const lemma = strip(w.bare);
  const key = strip(w.bare).split(' ').length > 1 ? null : (lemmaOf(fx, lemma, POS_MAP[w.pos]) ?? lemma);
  // Interjections ("¡tío!") only count when used as one, not "mi tío" (my uncle).
  const interj = /^¡/.test(w.bare);
  const pool = (key ? (byLemma.get(key) ?? byLemma.get(lemma) ?? []) : goodPairs.filter((p) => p.es.toLowerCase().includes(lemma)))
    .filter((p) => {
      const n = words(p.es).length;
      return n >= 3 && n <= 10;
    })
    .filter((p) => w.forms.some((f) => words(p.es).join(' ').includes(strip(f))))
    .filter((p) => !interj || w.forms.some((f) => new RegExp(`¡${strip(f)}[!,]`, 'i').test(p.es)));
  const best = pool.sort((a, b) => simplicity(a) - simplicity(b) || a.id.localeCompare(b.id))[0];
  if (best) {
    w.ex = [best.es, best.en];
    w.exSrc = best.credit;
  }
}

// ------------------------------------------------------------------ sentences
const BASIC_VERBS = new Set(['ser', 'estar', 'tener', 'ir', 'haber', 'hacer', 'gustar', 'encantar', 'llamar']);
function chapterOf(p: Pair, wordsUpTo: (ch: number) => Set<string>): number | undefined {
  for (let ch = 1; ch <= 5; ch++) {
    const allowed = wordsUpTo(ch);
    let ok = true;
    for (const [pos, set] of p.lemmas) {
      if (!CONTENT_POS.includes(pos)) continue;
      for (const l of set) if (!allowed.has(l) && !BASIC_VERBS.has(l)) ok = false;
    }
    if (ok) return ch;
  }
  return undefined;
}
const upTo = new Map<number, Set<string>>();
const wordsUpTo = (ch: number) => {
  if (!upTo.has(ch)) {
    const s = new Set<string>();
    for (const w of genWords) if (w.ch <= ch && !w.lvl) s.add(lemmaOf(fx, strip(w.bare), POS_MAP[w.pos]) ?? strip(w.bare));
    for (const v of verbs) if (v.ch <= Math.max(ch, 2)) s.add(v.inf);
    upTo.set(ch, s);
  }
  return upTo.get(ch)!;
};
// Tenses a sentence may use from each chapter (A1/A2); others wait for B1.
// Forms of "haber" stand for the compound tense they build ("has visto").
const TENSE_CH: Partial<Record<TenseId, number>> = { presente: 1, perfecto: 4, indefinido: 5, imperfecto: 5 };
const FORM_TENSES = new Map<string, Set<TenseId>>();
for (const inf of new Set([...VERB_SET, ...BASIC_VERBS])) {
  const table = paradigm(inf);
  if (!table) continue;
  for (const [t, six] of Object.entries(table.forms) as [TenseId, Six][]) {
    for (const f of six) {
      if (!f) continue;
      const tense: TenseId | undefined = inf !== 'haber' || f === 'hay' ? t : t === 'presente' ? 'perfecto' : undefined;
      for (const tok of f.split(' ')) {
        if (inf !== 'haber' && t === 'perfecto' && tok !== f.split(' ').pop()) continue;
        let set = FORM_TENSES.get(tok);
        if (!set) FORM_TENSES.set(tok, (set = new Set()));
        set.add(tense ?? ('b1' as TenseId));
      }
    }
  }
  for (const f of table.rest) {
    const tok = f.split(' ').pop()!;
    if (FORM_TENSES.has(tok)) continue;
    FORM_TENSES.set(tok, new Set(['b1' as TenseId]));
  }
}
/** The first chapter whose tenses cover the sentence, or undefined if it needs B1. */
function tenseChapter(p: Pair): number | undefined {
  let ch = 1;
  for (const tok of words(p.es)) {
    const ts = FORM_TENSES.get(tok);
    if (!ts) continue;
    const best = Math.min(...[...ts].map((t) => TENSE_CH[t] ?? Infinity));
    if (best === Infinity) return undefined;
    ch = Math.max(ch, best);
  }
  return ch;
}
const sentences: GenSentence[] = [];
const perChapter = new Map<number, number>();
for (const p of [...goodPairs].sort((a, b) => words(a.es).length - words(b.es).length || a.id.localeCompare(b.id))) {
  const n = words(p.es).length;
  if (n < 3 || n > 7) continue;
  const lex = chapterOf(p, wordsUpTo);
  const gram = tenseChapter(p);
  const ch = lex && gram ? Math.max(lex, gram) : undefined;
  if (!ch || (perChapter.get(ch) ?? 0) >= 16) continue;
  perChapter.set(ch, (perChapter.get(ch) ?? 0) + 1);
  sentences.push({ es: p.es, en: p.en, ch, src: p.credit });
}

// Form → [verb, tense, slot] for the curriculum verbs (B1 sentences and drills).
const FORM_INFO = new Map<string, { inf: string; tense: TenseId; slot: number }[]>();
for (const v of verbs) {
  for (const t of Object.keys(v.forms) as TenseId[]) {
    v.forms[t].forEach((f, slot) => {
      if (!f || t === 'perfecto') return;
      let list = FORM_INFO.get(f);
      if (!list) FORM_INFO.set(f, (list = []));
      list.push({ inf: v.inf, tense: t, slot });
    });
  }
}
let b1 = 0;
for (const p of goodPairs) {
  if (b1 >= 24) break;
  const toks = words(p.es);
  if (toks.length < 4 || toks.length > 8) continue;
  const advanced = toks.some((t) => FORM_INFO.get(t)?.some((i) => ['futuro', 'condicional', 'subjuntivo'].includes(i.tense) && !FORM_INFO.get(t)!.some((j) => j.tense === 'presente')));
  if (!advanced || chapterOf(p, () => wordsUpTo(5)) === undefined) continue;
  sentences.push({ es: p.es, en: p.en, ch: 1, lvl: 'b1', src: p.credit });
  b1++;
}

// ------------------------------------------------------------------ drills
const drills: GenDrill[] = [];
const blank = (p: Pair, form: string): string | undefined => {
  const re = new RegExp(`(^|[^\\p{L}])(${form})(?=[^\\p{L}]|$)`, 'iu');
  const m = re.exec(p.es);
  if (!m) return undefined;
  const at = m.index + m[1].length;
  return p.es.slice(0, at) + '___' + p.es.slice(at + m[2].length);
};
const caseLike = (model: string, word: string) => (model[0] === model[0].toUpperCase() ? word[0].toUpperCase() + word.slice(1) : word);
const drillPairs = [...goodPairs].sort((a, b) => words(a.es).length - words(b.es).length || a.id.localeCompare(b.id));
const count: Record<DrillTopic, number> = { serEstar: 0, porPara: 0, gustar: 0, subjuntivo: 0 };
const LIMIT = 45;
function addDrill(topic: DrillTopic, ch: number, p: Pair, form: string, answer: string, wrong: string[], rule: string) {
  const es = blank(p, form);
  if (!es || count[topic] >= LIMIT) return;
  count[topic]++;
  // Later chapters for sentences in tenses not taught yet (subjunctive drills are B1-only anyway).
  if (topic !== 'subjuntivo') ch = Math.max(ch, tenseChapter(p) ?? 5);
  drills.push({ id: `${topic}-${p.id}`, topic, ch, es, en: p.en, answer, wrong, rule, src: p.credit });
}
const FIXED_POR = /(?<!\p{L})por (favor|qué|fin|eso|supuesto|cierto|ejemplo|lo menos|lo tanto|lo general|si acaso|primera vez)(?!\p{L})/iu;
// "por/para + person" is often fine both ways (por usted = on your behalf, para usted = for you).
const PERSONAL = new Set(['mí', 'ti', 'usted', 'ustedes', 'él', 'ella', 'ellos', 'ellas', 'nosotros', 'nosotras', 'vosotros', 'vosotras', 'mi', 'tu', 'su', 'mis', 'tus', 'sus', 'nuestro', 'nuestra', 'vuestro', 'vuestra', 'todos', 'alguien', 'nadie']);
for (const p of drillPairs) {
  const toks = words(p.es);
  if (toks.length < 4 || toks.length > 9 || chapterOf(p, () => wordsUpTo(5)) === undefined) continue;
  const original = (t: string) => p.es.match(new RegExp(`(?<![\\p{L}])${t}(?![\\p{L}])`, 'iu'))?.[0] ?? t;
  // ser / estar
  const se = toks.filter((t) => FORM_INFO.get(t)?.some((i) => i.inf === 'ser' || i.inf === 'estar'));
  if (se.length === 1) {
    const t = se[0];
    const i = FORM_INFO.get(t)!.find((x) => x.inf === 'ser' || x.inf === 'estar')!;
    const next = toks[toks.indexOf(t) + 1] ?? '';
    const other = verbs.find((v) => v.inf === (i.inf === 'ser' ? 'estar' : 'ser'))!.forms[i.tense][i.slot];
    if (other && other !== t && !/(ando|iendo|ado|ido)$/.test(next) && i.tense !== 'imperativo' && i.tense !== 'subjuntivo') {
      const o = original(t);
      addDrill('serEstar', 1, p, o, o, [caseLike(o, other)], i.inf === 'ser' ? 'serIdentity' : 'estarState');
    }
  }
  // por / para
  const pp = toks.filter((t, i) => (t === 'por' || t === 'para') && p.lemmas.get('prep')?.has(t) && !/^(se|me|te|nos|os|no|lo|la)$/.test(toks[i - 1] ?? ''));
  if (pp.length === 1 && !FIXED_POR.test(p.es) && !/\bpara que\b/i.test(p.es) && !PERSONAL.has(toks[toks.indexOf(pp[0]) + 1] ?? '')) {
    const o = original(pp[0]);
    addDrill('porPara', 3, p, o, o, [caseLike(o, pp[0] === 'por' ? 'para' : 'por')], pp[0]);
  }
  // gustar
  const gu = toks.filter((t) => t === 'gusta' || t === 'gustan');
  if (gu.length === 1 && /^(me|te|le|nos|os|les)$/.test(toks[toks.indexOf(gu[0]) - 1] ?? '')) {
    addDrill('gustar', 2, p, original(gu[0]), gu[0], [gu[0] === 'gusta' ? 'gustan' : 'gusta'], 'gustar');
  }
  // indicative or subjunctive (B1)
  for (const [idx, t] of toks.entries()) {
    const info = FORM_INFO.get(t);
    if (!info) continue;
    const prev = toks.slice(Math.max(0, idx - 3), idx).join(' ');
    const subj = info.find((x) => x.tense === 'subjuntivo');
    const pres = info.find((x) => x.tense === 'presente');
    if (subj && !pres && /\b(que|ojalá|cuando)$/.test(prev)) {
      // "esté" is both yo and él: offer the indicative of every person it could be.
      const v = verbs.find((x) => x.inf === subj.inf)!;
      const ind = [...new Set(info.filter((x) => x.tense === 'subjuntivo').map((x) => v.forms.presente[x.slot]))].filter((f) => f && f !== t);
      const rule = /\bno \S+ que$|dudo que|posible que/.test(prev) ? 'subjDoubt' : /ojalá|quiero que|quieres que|espero que|pido que/.test(prev) ? 'subjWish' : /cuando$/.test(prev) ? 'subjFuture' : /alegro de que|pena que/.test(prev) ? 'subjEmotion' : 'subjWish';
      if (ind.length) addDrill('subjuntivo', 1, p, original(t), original(t), ind.map((f) => caseLike(original(t), f)), rule);
      break;
    }
    if (pres && !subj && /\b(creo que|sé que|pienso que|verdad que|claro que)$/.test(prev) && !/\bno (creo|pienso)/.test(prev)) {
      const sub = verbs.find((v) => v.inf === pres.inf)!.forms.subjuntivo[pres.slot];
      if (sub && sub !== t) addDrill('subjuntivo', 1, p, original(t), original(t), [caseLike(original(t), sub)], 'indicFact');
      break;
    }
  }
}

// ------------------------------------------------------------------ dictionary
/** Every Spanish-looking string in the game's source, plus everything generated above. */
function gameText(): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) {
        if (f !== 'generated') walk(p);
      } else if (p.endsWith('.ts')) {
        const src = readFileSync(p, 'utf8');
        // Both genders of templated words: "buen{o|a}" → "bueno buena", "{cansado|cansada}".
        const agreeBoth = (s: string) => s.replace(/(\p{L}*)\{([^{}|]*)\|([^{}|]*)\}/gu, '$1$2 $1$3');
        for (const m of src.matchAll(/(['`"])((?:\\.|(?!\1).)*)\1/g)) out.push(agreeBoth(m[2].replace(/\$\{[^}]*\}/g, ' ')));
      }
    }
  };
  walk(join(ROOT, 'src'));
  for (const w of genWords) out.push(w.es, w.bare, ...w.forms, ...(w.ex ? [w.ex[0]] : []), ...(w.variants ?? []).map((v) => v.form));
  for (const s of sentences) out.push(s.es);
  for (const d of drills) out.push(d.es.replace('___', d.answer));
  for (const v of verbs) for (const t of Object.values(v.forms)) out.push(...t);
  return out;
}

const DICT_POS = ['art', 'prep', 'conj', 'pron', 'determiner', 'adv', 'v', 'adj', 'n', 'interj', 'num', 'phrase', 'contraction', 'particle', 'prop'];
const REFER = /^(?:inflection|apocopic form|alternative form|alternative spelling|plural|feminine|masculine|feminine singular|feminine plural|masculine plural|superlative|diminutive|augmentative)(?: of)? "([^"]+)"/i;
function glossOf(lemma: string, prefer: string[], depth = 0): string | undefined {
  if (CORRECTIONS[lemma]) return CORRECTIONS[lemma];
  const poses = wk.get(lemma);
  if (!poses) return undefined;
  const ordered = [...poses].sort((a, b) => {
    const ia = prefer.includes(a.pos) ? -1 : DICT_POS.indexOf(a.pos);
    const ib = prefer.includes(b.pos) ? -1 : DICT_POS.indexOf(b.pos);
    return ia - ib;
  });
  for (const p of ordered) {
    for (const s of p.senses) {
      // Skip rude, humorous or "sum of parts" senses ("Used other than figuratively…").
      if (register(s.q) === 'reject' || /humorous|ironic/i.test(s.q ?? '') || /^letter|\bsenses\b|^Used other than/i.test(s.gloss)) continue;
      const ref = REFER.exec(s.gloss);
      if (ref && depth < 2) {
        const g = glossOf(ref[1], [p.pos], depth + 1);
        if (g) return g;
      }
      const g = shortGloss(s.gloss).replace(/^(?:masculine|feminine)(?: singular| plural)? (?:definite|indefinite) article/i, 'the');
      if (g) return g;
    }
  }
  return undefined;
}

/** A command, infinitive or gerund with pronouns attached: "díselo" = di + se + lo (decir). */
function enclitic(tok: string): { lemma: string; note: string } | undefined {
  const m = /^(.+?)((?:me|te|se|nos|os|lo|la|los|las|le|les){1,2})$/.exec(tok);
  if (!m) return undefined;
  // The written accent only marks the stress once pronouns are added: "dí" → "di".
  const stem = m[1].normalize('NFD').replace(/\u0301/g, '').normalize('NFC');
  const pronouns = m[2].match(/me|te|se|nos|os|los|las|lo|la|les|le/g)!.join(' + ');
  for (const [p, lemma] of fx.lemmas.get(stem) ?? []) {
    const t = p === 'v' ? paradigm(lemma) : null;
    if (!t) continue;
    const i = t.forms.imperativo.indexOf(stem);
    const kind = stem === lemma ? 'infinitive' : stem === t.gerund ? 'gerund' : i >= 0 ? `${PERSONS[i]} · imperativo` : undefined;
    if (kind) return { lemma, note: `${kind} + ${pronouns}` };
  }
  return undefined;
}

const FUNCTION_POS = ['art', 'prep', 'pron', 'determiner', 'conj'];
/** A little word: its most frequent reading is an article, preposition, pronoun… */
const FUNCTION_WORD = (t: string) => {
  if (CORRECTIONS[t]) return true;
  const top = [...(FORM_FREQ.get(t) ?? [])].sort((a, b) => b[1] - a[1])[0];
  return top ? FUNCTION_POS.includes(top[0].split('|')[0]) : (fx.lemmas.get(t) ?? []).every(([p]) => FUNCTION_POS.includes(p));
};
const dictionary: GenDictionary = { words: {}, phrases: {} };
const wordByForm = new Map<string, GenWord>();
for (const w of genWords) for (const f of w.forms) wordByForm.set(strip(f), w);
const unknown = new Map<string, number>();
for (const text of gameText()) {
  const toks = words(text);
  // Multi-word expressions Wiktionary has (por favor, por fin, de nada…).
  for (let n = 5; n >= 2; n--) {
    for (let i = 0; i + n <= toks.length; i++) {
      const phrase = toks.slice(i, i + n).join(' ');
      if (dictionary.phrases[phrase]) continue;
      const cw = wordByForm.get(phrase);
      if (cw) dictionary.phrases[phrase] = [cw.es, cw.en, cw.id];
      // Not phrases of little words only ("de esta", "a la"): each word explains itself.
      else if (wk.has(phrase) && toks.slice(i, i + n).some((t) => !FUNCTION_WORD(t))) {
        const g = glossOf(phrase, []);
        if (g) dictionary.phrases[phrase] = [phrase, g];
      }
    }
  }
  for (const tok of toks) {
    if (dictionary.words[tok] || !/\p{L}/u.test(tok)) continue;
    const cw = wordByForm.get(tok);
    if (cw) {
      dictionary.words[tok] = [cw.es, cw.en, undefined, cw.id];
      continue;
    }
    const cands = CORRECTIONS[tok] ? [['', tok] as [string, string]] : (fx.lemmas.get(tok) ?? (wk.has(tok) ? [['', tok] as [string, string]] : []));
    if (!cands.length) {
      const enc = enclitic(tok);
      const g = enc && glossOf(enc.lemma, ['v']);
      if (enc && g) dictionary.words[tok] = [enc.lemma, g, enc.note, wordByForm.get(enc.lemma)?.id];
      else unknown.set(tok, (unknown.get(tok) ?? 0) + 1);
      continue;
    }
    // The most frequent reading of this form ("sé" → saber); without counts, a
    // word that is its own entry ("hechizo" = spell) beats being a form of
    // another (hechizar), then the little words before the big ones.
    const order = (c: [string, string]) => (c[1] === tok && wk.has(tok) ? -1 : DICT_POS.indexOf(c[0]));
    const sorted = [...cands].sort((a, b) => formCount(tok, b[0], b[1]) - formCount(tok, a[0], a[1]) || order(a) - order(b));
    // The best reading Wiktionary can explain ("aquella": not "aquél", which has no entry).
    // Failing that, the masculine or singular it comes from ("buena" → bueno).
    const best =
      (CORRECTIONS[tok] ? (['', tok] as [string, string]) : sorted.find(([p, l]) => glossOf(l, [p]))) ??
      [tok.replace(/a$/, 'o'), tok.replace(/as$/, 'os'), tok.replace(/as$/, 'o'), tok.replace(/s$/, ''), tok.replace(/es$/, '')]
        .filter((l) => l !== tok && glossOf(l, ['adj', 'n']))
        .map((l) => ['adj', l] as [string, string])[0];
    if (!best) {
      unknown.set(tok, (unknown.get(tok) ?? 0) + 1);
      continue;
    }
    const [pos, lemma] = best;
    const g = glossOf(lemma, pos ? [pos] : [])!;
    let note = pos === 'v' ? verbNote(lemma, tok) : (pos === 'n' || pos === 'adj') && tok !== lemma && tok.endsWith('s') ? 'plural' : undefined;
    // …but say when it's also a verb form: "como" = like, as · also comer (yo · presente).
    // Only when that reading is common too, or a verb the game teaches ("ven":
    // ver, and venir's command) — not "cima" as a form of "cimar".
    const asVerb = CORRECTIONS[tok] ? undefined : sorted.find((c) => c[0] === 'v' && c[1] !== lemma);
    const common = asVerb && (VERB_SET.has(asVerb[1]) || formCount(tok, 'v', asVerb[1]) >= 0.2 * formCount(tok, pos, lemma));
    const vn = asVerb && verbNote(asVerb[1], tok);
    if (common && vn && glossOf(asVerb[1], ['v'])) note = `${note ? `${note} · ` : ''}also ${asVerb[1]}: ${vn}`;
    const cv = wordByForm.get(lemma);
    dictionary.words[tok] = [cv ? cv.es : lemma, cv && pos !== 'v' ? cv.en : g, note, cv?.id];
  }
}

// ------------------------------------------------------------------ write
mkdirSync(OUT, { recursive: true });
const write = (name: string, data: unknown) => writeFileSync(join(OUT, name), JSON.stringify(data) + '\n');
write('words.json', genWords);
write('verbs.json', verbs);
write('sentences.json', sentences);
write('drills.json', drills);
write('dictionary.json', dictionary);
const meta: GenMeta = {
  source: { repo: REPO, commit: pin.commit, date: pin.date },
  licenses: {
    'Wiktionary (meanings, forms, synonyms, usage notes)': 'CC BY-SA 4.0 — https://en.wiktionary.org',
    'Tatoeba (sentences)': 'CC BY 2.0 FR — https://tatoeba.org',
    'conjugate-esp (conjugations)': 'MIT — https://github.com/jirimracek/conjugate-esp',
    'FrequencyWords (word frequencies, from OpenSubtitles)': 'CC BY-SA 4.0 — https://github.com/hermitdave/FrequencyWords',
  },
  counts: {
    words: genWords.length,
    verbs: verbs.length,
    sentences: sentences.length,
    drills: drills.length,
    dictionaryForms: Object.keys(dictionary.words).length,
    dictionaryPhrases: Object.keys(dictionary.phrases).length,
  },
};
write('meta.json', meta);

console.log('Wrote src/data/generated:', meta.counts);
console.log('  drills by topic:', count, ' sentences by chapter:', Object.fromEntries(perChapter), ' B1 sentences:', b1);
console.log('  words with variants:', genWords.filter((w) => w.variants?.length).length, ' with examples:', genWords.filter((w) => w.ex).length);
if (missing.length) console.log('  ⚠ not in Wiktionary (give them `en`):', missing.join(', '));
const top = [...unknown.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60).map(([w]) => w);
if (top.length) console.log('  words the dictionary skipped (names, invented words, English):', top.join(' '));
