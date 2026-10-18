// A small Leitner-style spaced-repetition scheduler.
//
// Every learnable item (a word, a word's gender, a verb's conjugation) has a
// card with a box from 0 (new / shaky) to 5 (mastered). Spacing is measured in
// challenges answered ("turns") so it works inside a single play session, plus
// a wall-clock gap for high boxes so mastered words come back on later days.

import type { Grade } from './check';

export interface Card {
  box: number;
  seen: number;
  right: number;
  wrong: number;
  lastTurn: number;
  lastTime: number;
}

export interface SrsState {
  turn: number;
  cards: Record<string, Card>;
}

export const MAX_BOX = 5;
const TURN_GAP = [2, 4, 8, 16, 30, 60];
const MIN = 60_000;
const DAY = 24 * 60 * MIN;
const TIME_GAP = [0, 0, 0, 10 * MIN, 1 * DAY, 3 * DAY];

/** How many new-ish items (box ≤ 1) may be in rotation before new ones wait. */
const MAX_LEARNING = 7;

export function newSrs(): SrsState {
  return { turn: 0, cards: {} };
}

export interface PickOptions {
  /** Items that get a priority boost (e.g. the current chapter's words). */
  focus?: ReadonlySet<string>;
  /** Items to avoid right now (e.g. the last ones asked). */
  avoid?: ReadonlySet<string>;
  now?: number;
  rand?: () => number;
  /** Allow introducing brand-new items (default true). */
  allowNew?: boolean;
}

export function isNew(srs: SrsState, key: string): boolean {
  return !srs.cards[key];
}

/** Choose the item that most needs practice from `pool`. */
export function pick(srs: SrsState, pool: readonly string[], opts: PickOptions = {}): string | undefined {
  if (!pool.length) return undefined;
  const now = opts.now ?? Date.now();
  const rand = opts.rand ?? Math.random;
  const learning = Object.values(srs.cards).filter((c) => c.box <= 1).length;
  const allowNew = (opts.allowNew ?? true) && learning < MAX_LEARNING;

  let best: string | undefined;
  let bestScore = -Infinity;
  for (const key of pool) {
    if (opts.avoid?.has(key)) continue;
    const c = srs.cards[key];
    let score: number;
    if (!c) {
      if (!allowNew) continue;
      score = 0.9 + rand() * 0.3;
    } else {
      const overdue = (srs.turn - c.lastTurn) / TURN_GAP[c.box];
      const timeOk = now - c.lastTime >= TIME_GAP[c.box];
      score = overdue * (timeOk ? 1 : 0.25) * (1 + (MAX_BOX - c.box) * 0.15) + rand() * 0.2;
      if (c.box >= MAX_BOX) score *= 0.5;
    }
    if (opts.focus?.has(key)) score *= 1.3;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  if (best === undefined) {
    // Everything was avoided or new items are capped: take the least recently seen card.
    const seen = pool.filter((k) => srs.cards[k]);
    if (!seen.length) return pool[Math.floor(rand() * pool.length)];
    best = seen.reduce((a, b) => (srs.cards[a].lastTurn <= srs.cards[b].lastTurn ? a : b));
  }
  return best;
}

/** Record an answer. `maxBox` caps growth for very easy challenge types. */
export function record(srs: SrsState, key: string, grade: Grade, now = Date.now(), maxBox = MAX_BOX): Card {
  srs.turn++;
  const existing = srs.cards[key];
  const c: Card = existing ?? { box: 0, seen: 0, right: 0, wrong: 0, lastTurn: srs.turn, lastTime: now };
  c.seen++;
  if (grade === 'fast' || grade === 'correct') {
    c.right++;
    // Knowing a word the very first time you see it means you already knew it.
    if (!existing) c.box = Math.min(2, maxBox);
    else if (c.box < maxBox) c.box = Math.min(maxBox, c.box + 1);
  } else if (grade === 'wrong') {
    c.wrong++;
    c.box = Math.max(0, c.box - 2);
  }
  c.lastTurn = srs.turn;
  c.lastTime = now;
  srs.cards[key] = c;
  return c;
}

export function boxOf(srs: SrsState, key: string): number {
  return srs.cards[key]?.box ?? 0;
}

export function masteredCount(srs: SrsState, prefix: string): number {
  return Object.entries(srs.cards).filter(([k, c]) => k.startsWith(prefix) && c.box >= MAX_BOX).length;
}
