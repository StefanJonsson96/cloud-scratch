import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { POSTCARDS, POSTCARD_REGIONS, markPostcardsSeen, newPostcards, unlockedPostcards } from '../src/data/postcards';
import { JOURNAL, journalEntries } from '../src/data/journal';
import { ROSCO_CLUES } from '../src/data/rosco';
import { WORD_BY_ID, getWord } from '../src/data/vocab';
import { ALPHABET, MIN_LETTERS, buildRosco, fits, knownWords, nextLetter, roscoReward, type LetterState } from '../src/learn/rosco';
import { checkTyped, normalize, stripAccents } from '../src/learn/check';
import { newSrs, record } from '../src/learn/srs';
import { agree } from '../src/story/agree';
import { MAPS } from '../src/world/maps';
import { STOP_BY_ID } from '../src/world/stops';
import { ENEMIES } from '../src/battle/enemies';
import { TOWER_FLOORS } from '../src/data/tower';

function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const storyDir = path.join(__dirname, '../src/story');
const storySrc = fs
  .readdirSync(storyDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => fs.readFileSync(path.join(storyDir, f), 'utf8'))
  .join('\n');
/** Flags the story sets today. */
const STORY_FLAGS = new Set([...storySrc.matchAll(/\.flag\('([^']+)'/g)].map((m) => m[1]));
/** Regions that have maps today (chapters still being written add more). */
const BUILT = new Set(Object.values(MAPS).map((m) => m.region ?? 'puerto'));

const flagsOf = (...keys: string[]) => Object.fromEntries(keys.map((k) => [k, true])) as Record<string, number | boolean | string>;

describe('postales', () => {
  it('have unique ids, both languages and a short note', () => {
    expect(new Set(POSTCARDS.map((p) => p.id)).size).toBe(POSTCARDS.length);
    for (const p of POSTCARDS) {
      for (const t of [p.es, p.en, p.place, p.icon, p.flag, ...p.note]) expect(t.trim(), p.id).not.toBe('');
      const sentences = p.note[0].split(/[.!?…]+(?:\s|$)/).filter((s) => s.trim()).length;
      expect(sentences, p.id).toBeGreaterThanOrEqual(2);
      expect(sentences, p.id).toBeLessThanOrEqual(4);
    }
  });

  it('belong to train regions, and every region with maps has some', () => {
    for (const p of POSTCARDS) expect(STOP_BY_ID[p.region], p.id).toBeDefined();
    for (const r of BUILT) expect(POSTCARDS.some((p) => p.region === r), r).toBe(true);
    for (const r of Object.keys(POSTCARD_REGIONS)) expect(STOP_BY_ID[r], r).toBeDefined();
  });

  it('in regions that exist, unlock with flags the story really sets', () => {
    for (const p of POSTCARDS.filter((x) => BUILT.has(x.region))) expect(STORY_FLAGS.has(p.flag), `${p.id}: ${p.flag}`).toBe(true);
  });

  it('unlock by flag, and are announced once', () => {
    const flags = flagsOf();
    expect(unlockedPostcards(flags)).toEqual([]);
    flags.faro_lit = true;
    expect(newPostcards(flags).map((p) => p.id)).toEqual(['asturias']);
    markPostcardsSeen(flags, newPostcards(flags));
    expect(newPostcards(flags)).toEqual([]);
    flags.gran_falla = true;
    flags.paella_ok = true;
    expect(newPostcards(flags).map((p) => p.id)).toEqual(['fallas', 'paella']);
    expect(unlockedPostcards(flags)).toHaveLength(3);
  });
});

describe('diario', () => {
  // The story flags in the order a player sets them.
  const ORDER = [
    'intro_done', 'has_bread', 'fog', 'abuela_silenced', 'mateo_joined', 'gate_cueva', 'boss_rey', 'faro_lit', 'ramon_gift',
    'ch2', 'sansabor_seen', 'lola_joined', 'gate_bodega', 'gloton', 'sabor',
    'ch3', 'flor_roja', 'flor_azul', 'flor_amarilla', 'loba', 'color',
    'ch4', 'tomas_story', 'monje_mano', 'monje_oreja', 'monje_corazon', 'golem', 'voz',
    'ch5', 'gate_torre1', 'gate_torre2', 'final', 'fin',
    'act2', 'ch6', 'alonso_met', 'gate_cerro', 'gigante', 'mancha_word', 'mancha_done', 'mancha_reward',
    'ch7', 'gran_falla', 'valencia_done', 'ch8', 'rocio_ok', 'granada_open', 'leon', 'sevilla_done',
    'ch9', 'compana', 'santiago_done', 'ch10', 'dama', 'salamanca_done', 'fin2',
  ];

  it('has unique entries in chapter order, one or two per chapter', () => {
    expect(new Set(JOURNAL.map((e) => e.id)).size).toBe(JOURNAL.length);
    for (let i = 1; i < JOURNAL.length; i++) expect(JOURNAL[i].ch, JOURNAL[i].id).toBeGreaterThanOrEqual(JOURNAL[i - 1].ch);
    for (let ch = 0; ch <= 10; ch++) {
      const n = JOURNAL.filter((e) => e.ch === ch).length;
      expect(n, `chapter ${ch}`).toBeGreaterThanOrEqual(1);
      expect(n, `chapter ${ch}`).toBeLessThanOrEqual(3);
    }
  });

  it('only uses flags the story really sets', () => {
    for (const e of JOURNAL) expect(ORDER.includes(e.flag), e.flag).toBe(true);
    for (const e of JOURNAL) expect(STORY_FLAGS.has(e.flag), e.flag).toBe(true);
  });

  it('grows in story order as the flags are set', () => {
    let shown = 0;
    for (let i = 0; i <= ORDER.length; i++) {
      const entries = journalEntries(flagsOf(...ORDER.slice(0, i)));
      // Always the start of the diary, never a page from later on.
      expect(entries).toEqual(JOURNAL.slice(0, entries.length));
      expect(entries.length).toBeGreaterThanOrEqual(shown);
      shown = entries.length;
    }
    expect(shown).toBe(JOURNAL.length);
  });

  it('agrees with the hero', () => {
    const e = JOURNAL.find((x) => x.es.includes('{'))!;
    expect(agree(e.es, 'm')).toContain('asustado');
    expect(agree(e.es, 'f')).toContain('asustada');
  });
});

describe('el rosco', () => {
  const pool = knownWords(3, newSrs());

  it('only asks words the player has met', () => {
    expect(pool.every((w) => w.ch <= 3 && !w.lvl)).toBe(true);
    const srs = newSrs();
    record(srs, 'w:molino', 'correct');
    const met = knownWords(1, srs).map((w) => w.id);
    expect(met).toContain('molino');
    expect(met).not.toContain('trigo');
    for (let seed = 1; seed <= 20; seed++) {
      for (const q of buildRosco(pool, rng(seed))) expect(pool, q.word.id).toContain(q.word);
    }
  });

  it('asks one different word per letter, in alphabetical order', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const qs = buildRosco(pool, rng(seed));
      expect(qs.length).toBeGreaterThanOrEqual(MIN_LETTERS);
      const at = qs.map((q) => ALPHABET.indexOf(q.letter));
      expect(at.every((x, i) => x >= 0 && (i === 0 || x > at[i - 1]))).toBe(true);
      expect(new Set(qs.map((q) => q.word.id)).size).toBe(qs.length);
      for (const q of qs) {
        expect(fits(q.word.bare, q.letter, q.mode), `${q.letter} ${q.word.bare}`).toBe(true);
        expect(checkTyped(q.word.bare, q.accepted, { article: q.article, variants: q.variants }).grade, q.word.id).toBe('correct');
      }
    }
  });

  it('asks for a word that contains the letter when none starts with it', () => {
    const qs = buildRosco(knownWords(6, newSrs()), rng(3));
    const n = qs.find((q) => q.letter === 'Ñ')!;
    expect(n.mode).toBe('contains');
    expect(n.word.bare).toContain('ñ');
    expect(qs.find((q) => q.letter === 'A')!.mode).toBe('starts');
    expect(qs.some((q) => q.letter === 'K' || q.letter === 'W')).toBe(false);
  });

  it('treats Á as A but Ñ as its own letter', () => {
    expect(fits('árbol', 'A', 'starts')).toBe(true);
    expect(fits('niño', 'N', 'starts')).toBe(true);
    expect(fits('niño', 'Ñ', 'contains')).toBe(true);
    expect(fits('nube', 'Ñ', 'contains')).toBe(false);
  });

  it('clues with the English meaning when there is no Spanish definition', () => {
    const radio = getWord('radio');
    expect(ROSCO_CLUES.radio).toBeUndefined();
    const [q] = buildRosco([radio], rng(1));
    expect(q).toMatchObject({ letter: 'R', mode: 'starts', clueLang: 'en' });
    expect(q.clue).toContain(radio.en);
    expect(q.hint).toBe('r _ _ _ _');
    const [m] = buildRosco([getWord('molino')], rng(1));
    expect(m).toMatchObject({ clueLang: 'es', clue: ROSCO_CLUES.molino });
    expect(m.hint).toContain(getWord('molino').en);
  });

  it('accepts synonyms only when they fit the letter', () => {
    const [b] = buildRosco([getWord('bocadillo')], rng(1));
    expect(checkTyped('bocata', b.accepted, { variants: b.variants }).grade).toBe('correct');
    const [c] = buildRosco([getWord('caminar')], rng(1));
    expect(checkTyped('andar', c.accepted, { variants: c.variants }).grade).toBe('wrong');
    // Two words for one meaning ("fish") both answer it.
    const qs = Array.from({ length: 200 }, (_, i) => buildRosco(pool, rng(i + 1)).find((q) => q.word.id === 'pez')).filter(Boolean);
    expect(qs.length).toBeGreaterThan(0);
    expect(qs[0]!.accepted).toContain('pescado');
  });

  it('every clue is for a real word and never gives away its answer', () => {
    for (const [id, clue] of Object.entries(ROSCO_CLUES)) {
      const w = WORD_BY_ID.get(id);
      expect(w, id).toBeDefined();
      const text = ` ${stripAccents(normalize(clue))} `;
      for (const f of w!.forms) expect(text.includes(` ${stripAccents(normalize(f))} `), `${id}: ${clue}`).toBe(false);
    }
  });

  it('goes round the ring to the letters still to play', () => {
    const s: LetterState[] = ['right', 'passed', 'pending', 'wrong'];
    expect(nextLetter(s, 1)).toBe(2);
    expect(nextLetter(s, 2)).toBe(1);
    expect(nextLetter(['passed', 'right'], 0)).toBe(0);
    expect(nextLetter(['right', 'wrong'], 0)).toBe(-1);
  });

  it('pays a few euros per letter and a jackpot for a full ring', () => {
    expect(roscoReward(0, 20)).toBe(0);
    expect(roscoReward(10, 20)).toBe(30);
    expect(roscoReward(20, 20)).toBe(110);
  });
});

describe('la torre de los ecos', () => {
  it('has ten floors of real enemies, ending with a boss', () => {
    expect(TOWER_FLOORS).toHaveLength(10);
    for (const f of TOWER_FLOORS) for (const id of f) expect(ENEMIES[id], id).toBeDefined();
    expect(TOWER_FLOORS[TOWER_FLOORS.length - 1].some((id) => ENEMIES[id].boss)).toBe(true);
  });
});
