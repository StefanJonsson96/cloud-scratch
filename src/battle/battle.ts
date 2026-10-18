// Runs one battle: turn order, player commands, Spanish challenges, enemy
// moves, rewards. All the drawing is done by BattleView.

import {
  alive,
  chooseIntent,
  createBattle,
  defend,
  endTurn,
  enemies,
  executeAttack,
  executeEnemy,
  executeSkill,
  executeUltimate,
  fleeChance,
  nextActor,
  outcome,
  partyUnit,
  retarget,
  rewards,
  startTurn,
  useItem,
  RACHA_MAX,
  type BattleEvent,
  type BattleState,
  type Unit,
} from './rules';
import { MEMBERS, ULTIMATES, type MemberId, type StatusId } from './defs';
import { ENEMIES } from './enemies';
import { BattleView, type Command, type Practiced } from './battleView';
import { makeChallenge, type Challenge } from '../learn/challenges';
import { record } from '../learn/srs';
import type { Grade } from '../learn/check';
import { ACCESSORIES } from '../data/items';
import { grantXp, todayKey, type GameState } from '../state';
import { speechAvailable } from '../engine/speech';
import { playMusic, currentMusic, sfx } from '../engine/audio';
import { runChallenge } from '../ui/challengeView';

export interface BattleTip {
  at: 'start' | 'challenge' | 'enemy' | 'racha';
  text: string;
}

export interface BattleSetup {
  enemies: string[];
  bg?: string;
  music?: string;
  canFlee?: boolean;
  intro?: { es: string; en: string };
  /** Override enemy HP (tutorial dummy). */
  hp?: Record<string, number>;
  tips?: BattleTip[];
  /** Losing doesn't end the game (scripted fights). */
  noGameOver?: boolean;
  /** Statuses applied when the fight starts (ambushes, calmed bosses…). */
  start?: { enemies?: [StatusId, number][]; party?: [StatusId, number][] };
}

export interface BattleContext {
  g: GameState;
  host: HTMLElement;
  recent: string[];
  rand: () => number;
}

export type BattleOutcome = 'win' | 'lose' | 'flee';

const NUM = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco'];

export function introText(ids: string[]): { es: string; en: string } {
  if (ids.length === 1) {
    const d = ENEMIES[ids[0]];
    const art = d.art === 'la' ? 'una' : 'un';
    return { es: `¡Ha aparecido ${d.boss ? d.art + ' ' : art + ' '}${d.name}!`, en: `${d.boss ? d.en : 'A ' + d.en.toLowerCase()} has appeared!` };
  }
  return { es: `¡Han aparecido ${NUM[ids.length] ?? ids.length} enemigos!`, en: `${ids.length} enemies have appeared!` };
}

export function powerFor(grade: Grade, ch: Challenge): number {
  switch (grade) {
    case 'fast':
      return ch.difficulty * 1.25;
    case 'correct':
      return ch.difficulty;
    case 'close':
      return Math.max(0.8, ch.difficulty * 0.85);
    case 'wrong':
      return ch.isNew ? 0.75 : 0.5;
  }
}

export async function runBattle(ctx: BattleContext, setup: BattleSetup): Promise<BattleOutcome> {
  const g = ctx.g;
  const before = JSON.stringify({ party: g.party, inventory: g.inventory });
  const prevMusic = currentMusic();
  playMusic(setup.music ?? 'battle');
  sfx('encounter');
  try {
    for (;;) {
      const { result, view } = await fight(ctx, setup);
      if (result !== 'lose') return result;
      const choice = await view.defeat(!!setup.noGameOver);
      view.destroy();
      if (choice === 'retry') {
        const snap = JSON.parse(before);
        g.party = snap.party;
        g.inventory = snap.inventory;
        continue;
      }
      return 'lose';
    }
  } finally {
    if (prevMusic) playMusic(prevMusic);
  }
}

async function fight(ctx: BattleContext, setup: BattleSetup): Promise<{ result: BattleOutcome; view: BattleView }> {
  const g = ctx.g;
  const party = g.party.map((m) => partyUnit(m, g.heroName));
  const s = createBattle(party, setup.enemies, ctx.rand, g.inventory, setup.canFlee ?? true);
  for (const e of enemies(s)) {
    if (setup.hp?.[e.id]) e.hp = e.maxHp = setup.hp[e.id];
    if (g.settings.easy) e.atk = Math.round(e.atk * 0.7);
    for (const [id, turns] of setup.start?.enemies ?? []) e.statuses.push({ id, turns });
  }
  for (const u of s.units.filter((x) => x.side === 'party' && x.hp > 0)) {
    for (const [id, turns] of setup.start?.party ?? []) u.statuses.push({ id, turns });
  }
  const view = new BattleView(ctx.host, s, g, setup.bg ?? 'campo');
  const practiced: Practiced[] = [];
  const tips = [...(setup.tips ?? [])];
  const tip = async (at: BattleTip['at']) => {
    for (const t of tips.filter((x) => x.at === at)) {
      tips.splice(tips.indexOf(t), 1);
      await view.tip(t.text);
    }
  };

  await view.intro(setup.intro ?? introText(setup.enemies));
  await tip('start');

  let result: BattleOutcome | null = null;
  while (!result) {
    const o = outcome(s);
    if (o) {
      result = o;
      break;
    }
    const actor = nextActor(s);
    view.setActive(actor);
    const ev: BattleEvent[] = [];
    if (startTurn(actor, ev)) {
      await view.play(ev);
      const ev2: BattleEvent[] = [];
      endTurn(s, actor, ev2);
      await view.play(ev2);
      if (actor.side === 'enemy' && alive(actor) && !actor.intent) chooseIntent(s, actor);
      continue;
    }
    if (actor.side === 'enemy') {
      await tip('enemy');
      await view.enemyTurn(actor);
      await view.play(executeEnemy(s, actor));
      const ev2: BattleEvent[] = [];
      endTurn(s, actor, ev2);
      await view.play(ev2);
      if (alive(actor)) chooseIntent(s, actor);
      for (const e of enemies(s)) if (alive(e)) retarget(s, e);
      view.refresh();
      continue;
    }

    // Party member's turn.
    if (s.racha >= RACHA_MAX) await tip('racha');
    let weight = 1;
    for (;;) {
      const cmd = await view.chooseCommand(actor);
      const done = await perform(ctx, s, view, actor, cmd, practiced, tip);
      if (done === 'back') continue;
      if (done === 'fled') {
        result = 'flee';
      }
      if (cmd.kind === 'defend') weight = 0.8;
      break;
    }
    if (result) break;
    const ev2: BattleEvent[] = [];
    endTurn(s, actor, ev2, weight);
    await view.play(ev2);
    for (const e of enemies(s)) if (alive(e)) retarget(s, e);
    view.refresh();
  }

  // Write HP/MP back to the save.
  for (const u of s.units.filter((x) => x.side === 'party')) {
    const m = g.party.find((p) => p.id === u.id);
    if (!m) continue;
    m.hp = result === 'win' ? Math.max(1, u.hp) : u.hp;
    m.mp = u.mp;
  }
  g.stats.battles++;
  if (!g.stats.days.includes(todayKey())) g.stats.days.push(todayKey());

  if (result === 'win') {
    g.stats.wins++;
    const r = rewards(s);
    g.euros += r.euros;
    for (const it of [...r.drops, ...r.recovered]) g.inventory[it] = (g.inventory[it] ?? 0) + 1;
    for (const e of enemies(s)) if (!g.bestiary.includes(e.id)) g.bestiary.push(e.id);
    const ups = grantXp(g, r.xp);
    if (ups.length) sfx('levelup');
    await view.victory({ ...r, ups, practiced });
    view.destroy();
  } else if (result === 'flee') {
    await view.message({ es: '¡Habéis escapado!', en: 'You (all) got away!' });
    view.destroy();
  }
  return { result, view };
}

type TipFn = (at: BattleTip['at']) => Promise<void>;

async function perform(
  ctx: BattleContext,
  s: BattleState,
  view: BattleView,
  actor: Unit,
  cmd: Command,
  practiced: Practiced[],
  tip: TipFn,
): Promise<'done' | 'back' | 'fled'> {
  const g = ctx.g;
  switch (cmd.kind) {
    case 'attack':
      await view.play(executeAttack(s, actor, s.units.find((u) => u.uid === cmd.target)!));
      return 'done';
    case 'defend':
      await view.play(defend(actor));
      return 'done';
    case 'item':
      await view.play(useItem(s, actor, cmd.item, s.units.find((u) => u.uid === cmd.target)!));
      return 'done';
    case 'flee': {
      if (ctx.rand() < fleeChance(s)) return 'fled';
      await view.message({ es: '¡No habéis podido escapar!', en: "You (all) couldn't get away!" });
      return 'done';
    }
    case 'skill': {
      await tip('challenge');
      const style = MEMBERS[actor.id as MemberId].style;
      const ch = nextChallenge(ctx, style);
      const r = await challenge(ctx, view, actor, ch, `${actor.name} · ${cmd.skill.name}`);
      const grade = r.grade;
      track(ctx, s, view, ch, grade, practiced);
      const mult = powerFor(grade, ch);
      await view.play(executeSkill(s, actor, cmd.skill, cmd.target, mult, grade));
      return 'done';
    }
    case 'ultimate': {
      const ch = nextChallenge(ctx, 'sentence');
      const u = ULTIMATES[actor.id as MemberId];
      sfx('ultimate');
      const r = await challenge(ctx, view, actor, ch, `${actor.name} · ${u.name}`, 'Build the sentence to unleash it!');
      const success = r.grade !== 'wrong';
      practiced.push({ es: ch.reveal.es, en: ch.reveal.en, grade: r.grade });
      g.stats.answered++;
      if (success) g.stats.right++;
      await view.play(executeUltimate(s, actor, cmd.target, success));
      view.refresh();
      return 'done';
    }
  }
}

function nextChallenge(ctx: BattleContext, style: Parameters<typeof makeChallenge>[0]): Challenge {
  const g = ctx.g;
  const ch = makeChallenge(style, {
    srs: g.srs,
    chapter: g.chapter,
    rand: ctx.rand,
    recent: ctx.recent,
    preferTyping: g.settings.typingFocus,
    listening: g.settings.voice && speechAvailable(),
  });
  ctx.recent.push(ch.key);
  if (ctx.recent.length > 12) ctx.recent.shift();
  return ch;
}

async function challenge(ctx: BattleContext, view: BattleView, actor: Unit, ch: Challenge, title: string, stakes?: string) {
  const g = ctx.g;
  const acc = actor.accessory ? ACCESSORIES[actor.accessory] : undefined;
  const anyTilde = g.party.some((m) => m.accessory && ACCESSORIES[m.accessory]?.accents);
  return runChallenge(view.layer, ch, {
    title,
    stakes: stakes ?? `×${ch.difficulty.toFixed(2).replace(/\.?0+$/, '')} power if right · ⚡ answer fast for ×1.25`,
    accentsOptional: anyTilde,
    slowTimer: acc?.slowTimer ?? 1,
    voice: g.settings.voice,
  });
}

function track(ctx: BattleContext, s: BattleState, view: BattleView, ch: Challenge, grade: Grade, practiced: Practiced[]) {
  const g = ctx.g;
  if (ch.srs) record(g.srs, ch.key, grade, Date.now(), ch.maxBox);
  g.stats.answered++;
  if (grade === 'fast' || grade === 'correct') {
    g.stats.right++;
    s.racha = Math.min(RACHA_MAX, s.racha + 1);
  } else if (grade === 'wrong') {
    s.racha = Math.max(0, s.racha - 2);
  }
  practiced.push({ es: ch.reveal.es, en: ch.reveal.en, grade });
  view.refresh();
}
