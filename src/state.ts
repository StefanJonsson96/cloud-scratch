// The whole save game: party, inventory, story flags, position and the
// spaced-repetition memory of everything you've practised.

import { newSrs, type SrsState } from './learn/srs';
import type { MemberState } from './battle/rules';
import { memberStats } from './battle/rules';
import { xpToNext, skillsFor, type MemberId } from './battle/defs';

export type Dir = 'up' | 'down' | 'left' | 'right';

export interface Settings {
  /** "always": English under every Spanish line. "tap": press EN / T to reveal. */
  translations: 'always' | 'tap';
  /** Ask for typed answers sooner (active recall). */
  typingFocus: boolean;
  /** Read Spanish aloud (🔊 buttons, listening challenges). */
  voice: boolean;
  /** Read every dialogue line aloud as it appears. */
  autoVoice: boolean;
  /** Timer bar in challenges with a bonus for fast answers. Off = no time pressure. */
  speedBonus: boolean;
  textSpeed: 'normal' | 'fast' | 'instant';
  /** Random encounter frequency. */
  encounters: 'normal' | 'low';
  /** Story mode: enemies hit softer. */
  easy: boolean;
}

export interface GameState {
  version: 1;
  heroName: string;
  /** Grammatical gender the world uses for you: cansado / cansada. */
  gender?: 'm' | 'f';
  chapter: number;
  map: string;
  x: number;
  y: number;
  dir: Dir;
  party: MemberState[];
  inventory: Record<string, number>;
  accessories: string[];
  euros: number;
  flags: Record<string, number | boolean | string>;
  srs: SrsState;
  settings: Settings;
  stats: { battles: number; wins: number; answered: number; right: number; playMs: number; days: string[] };
  /** Words looked up by tapping them in dialogue. */
  looked: string[];
  /** Enemy ids defeated at least once. */
  bestiary: string[];
  savedAt: number;
}

export const DEFAULT_SETTINGS: Settings = {
  translations: 'tap',
  typingFocus: true,
  voice: true,
  autoVoice: true,
  speedBonus: false,
  textSpeed: 'normal',
  encounters: 'normal',
  easy: false,
};

export function newGame(heroName = 'Alex', settings: Partial<Settings> = {}): GameState {
  const hero: MemberState = { id: 'hero', level: 1, xp: 0, hp: 0, mp: 0 };
  fullHeal(hero);
  return {
    version: 1,
    heroName,
    chapter: 0,
    map: 'casa_abuela',
    x: 8,
    y: 3,
    dir: 'left',
    party: [hero],
    inventory: { churro: 3 },
    accessories: [],
    euros: 20,
    flags: {},
    srs: newSrs(),
    settings: { ...DEFAULT_SETTINGS, ...settings },
    stats: { battles: 0, wins: 0, answered: 0, right: 0, playMs: 0, days: [] },
    looked: [],
    bestiary: [],
    savedAt: 0,
  };
}

export function fullHeal(m: MemberState) {
  const s = memberStats(m);
  m.hp = s.maxHp;
  m.mp = s.maxMp;
}

export function addMember(g: GameState, id: MemberId) {
  if (g.party.some((m) => m.id === id)) return;
  const avg = Math.round(g.party.reduce((a, m) => a + m.level, 0) / g.party.length);
  const m: MemberState = { id, level: Math.max(1, avg), xp: 0, hp: 0, mp: 0 };
  fullHeal(m);
  g.party.push(m);
}

export interface LevelUp {
  id: MemberId;
  level: number;
  newSkills: string[];
}

/** Give XP to the whole party (fallen members too — nobody gets left behind). */
export function grantXp(g: GameState, xp: number): LevelUp[] {
  const ups: LevelUp[] = [];
  for (const m of g.party) {
    m.xp += xp;
    while (m.xp >= xpToNext(m.level) && m.level < 30) {
      m.xp -= xpToNext(m.level);
      const before = new Set(skillsFor(m.id, m.level).map((s) => s.id));
      const old = memberStats(m);
      m.level++;
      const now = memberStats(m);
      // Level-ups restore the HP/MP gained.
      m.hp += now.maxHp - old.maxHp;
      m.mp += now.maxMp - old.maxMp;
      const learned = skillsFor(m.id, m.level).filter((s) => !before.has(s.id)).map((s) => s.name);
      ups.push({ id: m.id, level: m.level, newSkills: learned });
    }
  }
  return ups;
}

export function addItem(g: GameState, id: string, n = 1) {
  g.inventory[id] = (g.inventory[id] ?? 0) + n;
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Consecutive days played, ending today or yesterday. */
export function dayStreak(days: string[], today = new Date()): number {
  const set = new Set(days);
  let streak = 0;
  const d = new Date(today);
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(todayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// --------------------------------------------------------------- saving
const KEY = 'palabrista-save-v1';

export function save(g: GameState): boolean {
  g.savedAt = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(g));
    return true;
  } catch {
    return false;
  }
}

export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export function deleteSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

export function exportSave(g: GameState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(g))));
}

export function importSave(code: string): GameState | null {
  try {
    return migrate(JSON.parse(decodeURIComponent(escape(atob(code.trim())))));
  } catch {
    return null;
  }
}

function migrate(g: GameState): GameState | null {
  if (!g || g.version !== 1 || !Array.isArray(g.party)) return null;
  g.settings = { ...DEFAULT_SETTINGS, ...g.settings };
  g.looked ??= [];
  g.bestiary ??= [];
  g.accessories ??= [];
  g.stats = Object.assign({ battles: 0, wins: 0, answered: 0, right: 0, playMs: 0, days: [] }, g.stats);
  return g;
}
