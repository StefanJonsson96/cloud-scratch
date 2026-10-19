// Pure battle rules: turn order, damage, statuses, element combos and enemy AI.
// The Battle controller (battle.ts) drives these and hands the resulting
// events to the UI to animate.

import {
  ELEMENTS,
  MEMBERS,
  STATUSES,
  statsAt,
  type Element,
  type MemberId,
  type SkillDef,
  type StatusId,
} from './defs';
import { ENEMIES, enemySubject, type EnemyAction, type EnemyDef } from './enemies';
import { ACCESSORIES, ITEMS } from '../data/items';
import type { Grade } from '../learn/check';
import { classBonus, type ClassId } from './classes';

export interface Status {
  id: StatusId;
  turns: number;
}

export interface Intent {
  actionId: string;
  targets: string[];
  es: string;
  en: string;
  icon: string;
}

export interface Unit {
  uid: string;
  side: 'party' | 'enemy';
  id: string;
  name: string;
  /** Spanish subject used in intents: "El cangrejo B". */
  subject: string;
  sprite: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  mag: number;
  def: number;
  spd: number;
  statuses: Status[];
  ct: number;
  weak: Element[];
  resist: Element[];
  defending: boolean;
  /** uid of the ally this unit is protecting. */
  guarding?: string;
  intent?: Intent;
  /** Action to unleash next turn after a charge. */
  charged?: string;
  boss: boolean;
  statusResist: number;
  stolen: string[];
  accessory?: string;
  /** Hero class (party only). */
  cls?: ClassId;
  /** Basic attacks crit on a d20 roll of this or higher. */
  critFrom?: number;
  /** Segundo aliento already used this battle. */
  secondWind?: boolean;
  /** Already stolen from with Birlar. */
  robbed?: boolean;
}

export interface BattleState {
  units: Unit[];
  racha: number;
  rand: () => number;
  inventory: Record<string, number>;
  turn: number;
  canFlee: boolean;
  /** Talents the party has. */
  perks?: Set<string>;
  /** Coins stolen during the fight, paid out on victory. */
  bonusEuros?: number;
}

export type BattleEvent =
  | { t: 'damage'; uid: string; amount: number; crit?: boolean; eff?: 'weak' | 'resist'; combo?: string; element: Element }
  | { t: 'heal'; uid: string; amount: number; mp?: boolean }
  | { t: 'status'; uid: string; id: StatusId; on: boolean }
  | { t: 'miss'; uid: string }
  | { t: 'ko'; uid: string }
  | { t: 'revive'; uid: string; amount: number }
  | { t: 'text'; text: string; en?: string }
  | { t: 'summon'; uid: string }
  | { t: 'roll'; uid: string; value: number }
  | { t: 'steal'; uid: string; item: string }
  | { t: 'guard'; guard: string; ward: string }
  | { t: 'action'; uid: string; name: string; en?: string; element?: Element };

export const RACHA_MAX = 5;
const CT_BASE = 100;

// ------------------------------------------------------------------ units
export interface MemberState {
  id: MemberId;
  level: number;
  xp: number;
  hp: number;
  mp: number;
  accessory?: string;
  /** The hero's class. */
  cls?: ClassId;
}

export function memberStats(m: MemberState) {
  const s = statsAt(MEMBERS[m.id], m.level);
  for (const [k, v] of Object.entries(classBonus(m.cls, m.level))) s[k === 'hp' ? 'maxHp' : k === 'mp' ? 'maxMp' : (k as keyof typeof s)] += Math.round(v);
  const bonus = m.accessory ? ACCESSORIES[m.accessory]?.bonus : undefined;
  if (bonus) for (const [k, v] of Object.entries(bonus)) s[k as keyof typeof s] += v ?? 0;
  return s;
}

export function partyUnit(m: MemberState, heroName: string): Unit {
  const s = memberStats(m);
  const name = m.id === 'hero' ? heroName : MEMBERS[m.id].name;
  return {
    uid: m.id,
    side: 'party',
    id: m.id,
    name,
    subject: name,
    sprite: MEMBERS[m.id].sprite,
    level: m.level,
    hp: Math.min(m.hp, s.maxHp),
    maxHp: s.maxHp,
    mp: Math.min(m.mp, s.maxMp),
    maxMp: s.maxMp,
    atk: s.atk,
    mag: s.mag,
    def: s.def,
    spd: s.spd,
    statuses: [],
    ct: 0,
    weak: [],
    resist: [],
    defending: false,
    boss: false,
    statusResist: 1,
    stolen: [],
    accessory: m.accessory,
    cls: m.cls,
    critFrom: m.cls === 'picaro' ? 18 : 20,
  };
}

export function enemyUnit(def: EnemyDef, uid: string, suffix: string): Unit {
  return {
    uid,
    side: 'enemy',
    id: def.id,
    name: cap(def.name) + suffix,
    subject: enemySubject(def, suffix),
    sprite: def.sprite,
    level: 1,
    hp: def.hp,
    maxHp: def.hp,
    mp: 0,
    maxMp: 0,
    atk: def.atk,
    mag: def.atk,
    def: def.def,
    spd: def.spd,
    statuses: [],
    ct: 0,
    weak: def.weak,
    resist: def.resist,
    defending: false,
    boss: !!def.boss,
    statusResist: def.statusResist ?? 1,
    stolen: [],
  };
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const LETTERS = 'ABCDEFGH';

export function createBattle(
  party: Unit[],
  enemyIds: string[],
  rand: () => number,
  inventory: Record<string, number>,
  canFlee = true,
): BattleState {
  const counts: Record<string, number> = {};
  for (const id of enemyIds) counts[id] = (counts[id] ?? 0) + 1;
  const seen: Record<string, number> = {};
  const enemies = enemyIds.map((id, i) => {
    const def = ENEMIES[id];
    if (!def) throw new Error(`Unknown enemy ${id}`);
    const n = (seen[id] = (seen[id] ?? 0) + 1);
    return enemyUnit(def, `e${i}`, counts[id] > 1 ? ` ${LETTERS[n - 1]}` : '');
  });
  const state: BattleState = { units: [...party, ...enemies], racha: 0, rand, inventory, turn: 0, canFlee };
  for (const u of state.units) u.ct = (CT_BASE / effSpd(u)) * (0.4 + rand() * 0.6);
  for (const u of party) {
    const r = u.accessory ? ACCESSORIES[u.accessory]?.racha : 0;
    if (r) state.racha = Math.min(RACHA_MAX, state.racha + r);
  }
  for (const e of enemies) chooseIntent(state, e);
  return state;
}

// ------------------------------------------------------------- helpers
export const alive = (u: Unit) => u.hp > 0;
export const has = (u: Unit, id: StatusId) => u.statuses.some((s) => s.id === id);
export const unit = (s: BattleState, uid: string) => s.units.find((u) => u.uid === uid)!;
export const party = (s: BattleState) => s.units.filter((u) => u.side === 'party');
export const enemies = (s: BattleState) => s.units.filter((u) => u.side === 'enemy');
export const livingParty = (s: BattleState) => party(s).filter(alive);
export const livingEnemies = (s: BattleState) => enemies(s).filter(alive);

export function effSpd(u: Unit): number {
  let s = u.spd;
  if (has(u, 'rapido')) s *= 1.5;
  if (has(u, 'lento')) s *= 0.6;
  return Math.max(1, s);
}

function powerMult(u: Unit): number {
  let m = 1;
  if (has(u, 'fuerte')) m *= 1.3;
  if (has(u, 'debil')) m *= 0.7;
  return m;
}

export function removeStatus(u: Unit, id: StatusId, ev: BattleEvent[]) {
  if (!has(u, id)) return;
  u.statuses = u.statuses.filter((s) => s.id !== id);
  ev.push({ t: 'status', uid: u.uid, id, on: false });
}

const SKIP_TURN: StatusId[] = ['dormido', 'congelado', 'aturdido'];

/** Try to apply a status. Returns true if it stuck. */
export function applyStatus(s: BattleState, u: Unit, id: StatusId, turns: number, chance: number, ev: BattleEvent[]): boolean {
  if (!alive(u)) return false;
  let c = chance;
  if (SKIP_TURN.includes(id)) c *= u.statusResist;
  if (s.rand() >= c) return false;
  const existing = u.statuses.find((x) => x.id === id);
  if (existing) existing.turns = Math.max(existing.turns, turns);
  else u.statuses.push({ id, turns });
  ev.push({ t: 'status', uid: u.uid, id, on: true });
  // Anything that makes a unit lose its turn also breaks its concentration.
  if (SKIP_TURN.includes(id) && u.charged) cancelCharge(s, u, ev);
  return true;
}

export function cancelCharge(s: BattleState, u: Unit, ev: BattleEvent[]) {
  if (!u.charged) return;
  u.charged = undefined;
  removeStatus(u, 'cargando', ev);
  ev.push({ t: 'text', text: '¡Interrumpido!', en: 'Interrupted!' });
  if (u.side === 'enemy') chooseIntent(s, u);
}

// ---------------------------------------------------------- turn order
/** Advance time to the next unit's turn and return it. */
export function nextActor(s: BattleState): Unit {
  const living = s.units.filter(alive);
  let best = living[0];
  for (const u of living) if (u.ct < best.ct) best = u;
  const dt = best.ct;
  for (const u of living) u.ct -= dt;
  s.turn++;
  return best;
}

export function scheduleNext(u: Unit, weight = 1) {
  u.ct = (CT_BASE / effSpd(u)) * weight;
}

/** The next `n` turns, assuming everyone takes normal actions. */
export function preview(s: BattleState, n: number): Unit[] {
  const sim = s.units.filter(alive).map((u) => ({ u, ct: u.ct }));
  const out: Unit[] = [];
  while (out.length < n && sim.length) {
    let best = sim[0];
    for (const x of sim) if (x.ct < best.ct) best = x;
    const dt = best.ct;
    for (const x of sim) x.ct -= dt;
    out.push(best.u);
    best.ct = CT_BASE / effSpd(best.u);
  }
  return out;
}

// -------------------------------------------------------------- damage
export interface HitOpts {
  power: number;
  stat: 'atk' | 'mag';
  element: Element;
  /** Challenge / ultimate multiplier. */
  mult?: number;
  crit?: boolean;
  /** Single-target hits can be intercepted by a guarding ally. */
  single?: boolean;
}

export function elementMultiplier(target: Unit, el: Element): { m: number; eff?: 'weak' | 'resist' } {
  if (target.weak.includes(el)) return { m: 1.5, eff: 'weak' };
  if (target.resist.includes(el)) return { m: 0.5, eff: 'resist' };
  return { m: 1 };
}

export function hit(s: BattleState, attacker: Unit, target: Unit, o: HitOpts, ev: BattleEvent[]): number {
  if (!alive(target)) return 0;
  // Mateo's protection: single hits on a guarded ally go to the guard instead.
  const guard = s.units.find((g) => g.guarding === target.uid && alive(g) && !SKIP_TURN.some((x) => has(g, x)));
  let redirected = false;
  if (guard && o.single && attacker.side !== target.side) {
    ev.push({ t: 'guard', guard: guard.uid, ward: target.uid });
    target = guard;
    redirected = true;
  }

  const stat = (o.stat === 'atk' ? attacker.atk : attacker.mag) * powerMult(attacker);
  const defense = target.def * (o.stat === 'mag' ? 0.6 : 1);
  let dmg = stat * o.power * 2 * (24 / (24 + defense));
  dmg *= 0.9 + s.rand() * 0.2;
  dmg *= o.mult ?? 1;
  if (o.crit) dmg *= 1.75;

  const { m, eff } = elementMultiplier(target, o.element);
  dmg *= m;

  let combo: string | undefined;
  const master = !!s.perks?.has('combos') && attacker.side === 'party';
  if (o.element === 'rayo' && has(target, 'mojado')) {
    dmg *= master ? 2.5 : 2;
    combo = master ? '¡Electrocutado! ×2.5' : '¡Electrocutado! ×2';
    removeStatus(target, 'mojado', ev);
  } else if (o.element === 'fuego' && has(target, 'mojado')) {
    dmg *= 0.5;
    combo = 'Vapor… ×0.5';
    removeStatus(target, 'mojado', ev);
  } else if (o.element === 'fisico' && has(target, 'congelado')) {
    dmg *= master ? 2 : 1.5;
    combo = master ? '¡Hielo roto! ×2' : '¡Hielo roto! ×1.5';
    removeStatus(target, 'congelado', ev);
  } else if (o.element === 'agua' && target.id === 'pan_duro' && has(target, 'escudo')) {
    combo = '¡Pan mojado! Se ablanda.';
    removeStatus(target, 'escudo', ev);
  }
  if (o.element === 'fuego') removeStatus(target, 'congelado', ev);
  if (o.element === 'agua') removeStatus(target, 'quemado', ev);

  if (target.defending) dmg *= 0.5;
  if (has(target, 'escudo')) dmg *= 0.6;
  if (redirected) dmg *= 0.7;
  if (target.side === 'party' && s.perks?.has('piel_dura')) dmg *= 0.9;

  const amount = Math.max(1, Math.round(dmg));
  target.hp = Math.max(0, target.hp - amount);
  if (target.hp === 0 && target.side === 'party' && s.perks?.has('segundo_aliento') && !target.secondWind) {
    target.secondWind = true;
    target.hp = 1;
    ev.push({ t: 'text', text: `¡${target.name} aguanta con 1 PV!`, en: `${target.name} hangs on with 1 HP! (Second wind)` });
  }
  ev.push({ t: 'damage', uid: target.uid, amount, crit: o.crit, eff, combo, element: o.element });

  // Freezing happens after the hit so the ice isn't immediately shattered.
  if (o.element === 'hielo' && has(target, 'mojado') && alive(target)) {
    removeStatus(target, 'mojado', ev);
    if (applyStatus(s, target, 'congelado', 1, target.boss ? 0.6 : 1, ev)) {
      ev.push({ t: 'text', text: '¡Congelado!', en: 'Frozen solid!' });
    }
  }
  if (has(target, 'dormido') && alive(target)) removeStatus(target, 'dormido', ev);
  if (!alive(target)) knockOut(s, target, ev);
  return amount;
}

export function knockOut(s: BattleState, u: Unit, ev: BattleEvent[]) {
  u.hp = 0;
  u.statuses = [];
  u.charged = undefined;
  u.guarding = undefined;
  u.defending = false;
  ev.push({ t: 'ko', uid: u.uid });
  for (const g of s.units) if (g.guarding === u.uid) g.guarding = undefined;
}

export function heal(u: Unit, amount: number, ev: BattleEvent[]): number {
  if (!alive(u)) return 0;
  const a = Math.max(0, Math.min(u.maxHp - u.hp, Math.round(amount)));
  u.hp += a;
  ev.push({ t: 'heal', uid: u.uid, amount: a });
  return a;
}

export function restoreMp(u: Unit, amount: number, ev: BattleEvent[]): number {
  const a = Math.max(0, Math.min(u.maxMp - u.mp, Math.round(amount)));
  u.mp += a;
  if (a > 0) ev.push({ t: 'heal', uid: u.uid, amount: a, mp: true });
  return a;
}

export function revive(u: Unit, fraction: number, ev: BattleEvent[]) {
  if (alive(u)) return;
  u.hp = Math.max(1, Math.round(u.maxHp * fraction));
  scheduleNext(u);
  ev.push({ t: 'revive', uid: u.uid, amount: u.hp });
}

// --------------------------------------------------------- turn hooks
/** Called when a unit's turn begins. Returns true if it loses the turn. */
export function startTurn(u: Unit, ev: BattleEvent[]): boolean {
  u.defending = false;
  u.guarding = undefined;
  if (has(u, 'congelado')) {
    ev.push({ t: 'text', text: `${u.name} está congelado…`, en: `${u.name} is frozen…` });
    removeStatus(u, 'congelado', ev);
    return true;
  }
  if (has(u, 'aturdido')) {
    ev.push({ t: 'text', text: `${u.name} está aturdido…`, en: `${u.name} is stunned…` });
    removeStatus(u, 'aturdido', ev);
    return true;
  }
  if (has(u, 'dormido')) {
    ev.push({ t: 'text', text: `${u.name} está dormido… 💤`, en: `${u.name} is asleep…` });
    return true;
  }
  return false;
}

/** Called after a unit acts: damage over time and status countdowns. */
export function endTurn(s: BattleState, u: Unit, ev: BattleEvent[], weight = 1) {
  if (alive(u)) {
    const dot = (id: StatusId, frac: number, es: string, en: string) => {
      if (!has(u, id) || !alive(u)) return;
      const amount = Math.max(2, Math.round(u.maxHp * (u.boss ? frac * 0.4 : frac)));
      u.hp = Math.max(0, u.hp - amount);
      ev.push({ t: 'damage', uid: u.uid, amount, element: id === 'quemado' ? 'fuego' : 'sombra', combo: es });
      ev.push({ t: 'text', text: `${u.name}: ${es}`, en: `${u.name}: ${en}` });
      if (!alive(u)) knockOut(s, u, ev);
    };
    dot('quemado', 0.08, 'quemado', 'burned');
    dot('envenenado', 0.07, 'envenenado', 'poisoned');
  }
  for (const st of [...u.statuses]) {
    if (st.id === 'cargando') continue;
    st.turns--;
    if (st.turns <= 0) removeStatus(u, st.id, ev);
  }
  scheduleNext(u, weight);
}

// ------------------------------------------------------------ enemy AI
function partyTargetWeights(s: BattleState): [Unit, number][] {
  return livingParty(s).map((u) => [u, 1 + (1 - u.hp / u.maxHp) * 0.8]);
}

function pickWeighted<T>(s: BattleState, items: [T, number][]): T {
  const total = items.reduce((a, [, w]) => a + w, 0);
  let r = s.rand() * total;
  for (const [x, w] of items) {
    r -= w;
    if (r <= 0) return x;
  }
  return items[items.length - 1][0];
}

function usable(s: BattleState, e: Unit, a: EnemyAction): boolean {
  if (a.chargedOnly) return false;
  switch (a.when) {
    case 'hurt':
      return e.hp < e.maxHp * 0.6;
    case 'canSummon':
      return livingEnemies(s).length < 3;
    case 'partyHasItems':
      return Object.entries(s.inventory).some(([id, n]) => n > 0 && ITEMS[id] && ITEMS[id].kind !== 'key');
    case 'allyHurt':
      return livingEnemies(s).some((x) => x.hp < x.maxHp * 0.6);
    default:
      return true;
  }
}

export function intentText(e: Unit, a: EnemyAction, targets: Unit[]): { es: string; en: string } {
  const all = a.target === 'all';
  const tEs = all ? 'todos' : (targets[0]?.name ?? '');
  const tEn = all ? 'everyone' : (targets[0]?.name ?? '');
  const def = ENEMIES[e.id];
  const noun = def.en.replace(/^The /, '');
  const subjEn = `The ${def.boss ? noun : noun.toLowerCase()}${e.name.match(/ [A-H]$/)?.[0] ?? ''}`;
  const es = a.es.replace('{N}', e.subject).replace('{T}', tEs);
  const fixStart = (x: string) => x.replace(/^¡el /, '¡El ').replace(/^¡la /, '¡La ');
  return { es: fixStart(es), en: a.enText.replace('{N}', subjEn).replace('{T}', tEn) };
}

export function chooseIntent(s: BattleState, e: Unit) {
  const def = ENEMIES[e.id];
  let action: EnemyAction | undefined;
  if (e.charged) action = def.actions.find((a) => a.id === e.charged);
  if (!action) {
    const options = def.actions.filter((a) => usable(s, e, a));
    action = pickWeighted(s, (options.length ? options : def.actions.filter((a) => !a.chargedOnly)).map((a) => [a, a.weight]));
  }
  let targets: Unit[] = [];
  const taunter = livingParty(s).find((u) => has(u, 'provocando'));
  if (action.target === 'one' && taunter) targets = [taunter];
  else if (action.target === 'one') targets = livingParty(s).length ? [pickWeighted(s, partyTargetWeights(s))] : [];
  else if (action.target === 'all') targets = livingParty(s);
  else if (action.target === 'self') targets = [e];
  else targets = livingEnemies(s);
  const text = intentText(e, action, targets);
  e.intent = { actionId: action.id, targets: targets.map((t) => t.uid), es: text.es, en: text.en, icon: action.icon };
}

/** If an enemy's planned target has fallen, aim at someone else (same move). */
export function retarget(s: BattleState, e: Unit) {
  const it = e.intent;
  if (!it) return;
  const def = ENEMIES[e.id];
  const a = def.actions.find((x) => x.id === it.actionId);
  if (!a || a.target !== 'one') return;
  const taunter = livingParty(s).find((u) => has(u, 'provocando'));
  if (taunter && !it.targets.includes(taunter.uid) && (a.power ?? 0) > 0) {
    const text = intentText(e, a, [taunter]);
    e.intent = { ...it, targets: [taunter.uid], es: text.es, en: text.en };
    return;
  }
  if (it.targets.every((uid) => alive(unit(s, uid)))) return;
  const living = livingParty(s);
  if (!living.length) return;
  const t = pickWeighted(s, partyTargetWeights(s));
  const text = intentText(e, a, [t]);
  e.intent = { ...it, targets: [t.uid], es: text.es, en: text.en };
}

function nextLetterUnit(s: BattleState, defId: string): Unit {
  const def = ENEMIES[defId];
  const same = enemies(s).filter((u) => u.id === defId);
  for (const u of same) {
    if (!/ [A-H]$/.test(u.name)) {
      u.name += ' A';
      u.subject += ' A';
    }
  }
  const suffix = same.length ? ` ${LETTERS[same.length]}` : '';
  const u = enemyUnit(def, `e${s.units.length}`, suffix);
  scheduleNext(u, 0.6);
  return u;
}

export function executeEnemy(s: BattleState, e: Unit): BattleEvent[] {
  const ev: BattleEvent[] = [];
  const def = ENEMIES[e.id];
  const intent = e.intent;
  const a = def.actions.find((x) => x.id === intent?.actionId) ?? def.actions[0];
  ev.push({ t: 'action', uid: e.uid, name: a.name, en: a.en, element: a.element });

  if (e.charged === a.id) {
    e.charged = undefined;
    removeStatus(e, 'cargando', ev);
  }

  // Re-target if the planned target fell in the meantime.
  let targets = (intent?.targets ?? []).map((uid) => unit(s, uid)).filter((u) => u && alive(u));
  if (a.target === 'one' && !targets.length && livingParty(s).length) targets = [pickWeighted(s, partyTargetWeights(s))];
  if (a.target === 'all') targets = livingParty(s);
  if (a.target === 'allies') targets = livingEnemies(s);

  switch (a.kind) {
    case 'attack':
    case 'status':
    case 'explode':
      for (const t of targets) {
        if (!alive(t)) continue;
        if ((a.power ?? 0) > 0) {
          hit(s, e, t, { power: a.power ?? 1, stat: 'atk', element: a.element ?? 'fisico', single: a.target === 'one' }, ev);
        }
        if (a.status && alive(t)) applyStatus(s, t, a.status.id, a.status.turns, a.status.chance, ev);
      }
      if (a.kind === 'explode') knockOut(s, e, ev);
      break;
    case 'buff':
      for (const t of targets.length ? targets : [e]) if (a.status) applyStatus(s, t, a.status.id, a.status.turns, a.status.chance, ev);
      break;
    case 'heal':
      for (const t of targets.length ? targets : [e]) heal(t, t.maxHp * (a.heal ?? 0.1), ev);
      break;
    case 'charge':
      e.charged = a.next;
      if (!has(e, 'cargando')) {
        e.statuses.push({ id: 'cargando', turns: 2 });
        ev.push({ t: 'status', uid: e.uid, id: 'cargando', on: true });
      }
      break;
    case 'summon': {
      const u = nextLetterUnit(s, a.summon!);
      s.units.push(u);
      chooseIntent(s, u);
      ev.push({ t: 'summon', uid: u.uid });
      break;
    }
    case 'steal': {
      const items = Object.entries(s.inventory).filter(([id, n]) => n > 0 && ITEMS[id] && ITEMS[id].kind !== 'key');
      if (items.length) {
        const [id] = items[Math.floor(s.rand() * items.length)];
        s.inventory[id]--;
        e.stolen.push(id);
        ev.push({ t: 'steal', uid: e.uid, item: id });
        ev.push({
          t: 'text',
          text: `¡${e.subject} ha robado: ${ITEMS[id].name}!`,
          en: `${e.name} has stolen: ${ITEMS[id].en}! Defeat it to get it back.`,
        });
      } else {
        ev.push({ t: 'text', text: 'No hay nada que robar.', en: 'There is nothing to steal.' });
      }
      break;
    }
  }
  return ev;
}

// ---------------------------------------------------------- party moves
export function gradeFactor(grade: Grade | undefined): number {
  switch (grade) {
    case 'fast':
      return 1.2;
    case 'correct':
    case undefined:
      return 1;
    case 'close':
      return 0.85;
    case 'wrong':
      return 0.35;
  }
}

/** Basic attack with a visible d20: 1 misses, 20 crits. */
export function executeAttack(s: BattleState, u: Unit, target: Unit): BattleEvent[] {
  const ev: BattleEvent[] = [];
  const roll = 1 + Math.floor(s.rand() * 20);
  ev.push({ t: 'action', uid: u.uid, name: 'Ataque', en: 'Attack', element: 'fisico' });
  ev.push({ t: 'roll', uid: u.uid, value: roll });
  if (roll === 1) {
    ev.push({ t: 'miss', uid: target.uid });
    ev.push({ t: 'text', text: '¡Has fallado!', en: 'You missed!' });
    return ev;
  }
  hit(s, u, target, { power: 1, stat: 'atk', element: 'fisico', crit: roll >= (u.critFrom ?? 20) }, ev);
  return ev;
}

export function executeSkill(s: BattleState, u: Unit, skill: SkillDef, targetUid: string | undefined, mult: number, grade?: Grade): BattleEvent[] {
  const ev: BattleEvent[] = [];
  u.mp = Math.max(0, u.mp - skill.mp);
  ev.push({ t: 'action', uid: u.uid, name: skill.name, en: skill.en, element: skill.element });
  const gf = gradeFactor(grade);

  let targets: Unit[];
  switch (skill.target) {
    case 'allEnemies':
      targets = livingEnemies(s).filter((x) => x.side !== u.side);
      break;
    case 'allAllies':
      targets = livingParty(s);
      break;
    case 'self':
      targets = [u];
      break;
    default:
      targets = targetUid ? [unit(s, targetUid)] : [];
  }

  if (skill.special === 'guard') {
    const ward = targets[0];
    if (ward && alive(ward)) {
      u.guarding = ward.uid;
      ev.push({ t: 'text', text: `${u.name} protege a ${ward.name}.`, en: `${u.name} protects ${ward.name}.` });
      if (grade === 'fast' || grade === 'correct') applyStatus(s, u, 'escudo', 1, 1, ev);
    }
    return ev;
  }
  if (skill.special === 'taunt') {
    applyStatus(s, u, 'provocando', 2, 1, ev);
    if (skill.status) applyStatus(s, u, skill.status.id, skill.status.turns, 1, ev);
    ev.push({ t: 'text', text: `¡${u.name} provoca a los enemigos!`, en: `${u.name} draws the enemies' attacks!` });
    return ev;
  }
  if (skill.special === 'steal') {
    const t = targets[0];
    if (t && alive(t)) {
      hit(s, u, t, { power: skill.power ?? 1, stat: skill.stat, element: skill.element, mult }, ev);
      const def = ENEMIES[t.id];
      if (t.robbed) {
        ev.push({ t: 'text', text: 'Ya no tiene nada más.', en: 'It has nothing left to steal.' });
      } else if (grade === 'wrong') {
        ev.push({ t: 'text', text: '¡No has podido robar nada!', en: "You couldn't steal anything!" });
      } else {
        t.robbed = true;
        const drop = def?.drops?.[Math.floor(s.rand() * def.drops.length)];
        if (drop) {
          s.inventory[drop.item] = (s.inventory[drop.item] ?? 0) + 1;
          ev.push({ t: 'text', text: `¡Has robado: ${ITEMS[drop.item].name}!`, en: `You stole: ${ITEMS[drop.item].en}!` });
        } else {
          const coins = Math.max(3, Math.round((def?.euros ?? 5) * 0.6));
          s.bonusEuros = (s.bonusEuros ?? 0) + coins;
          ev.push({ t: 'text', text: `¡Has robado ${coins} euros!`, en: `You stole ${coins} euros!` });
        }
      }
    }
    return ev;
  }
  if (skill.special === 'revive') {
    const t = targets[0];
    if (t && !alive(t)) revive(t, (skill.heal ?? 0.4) * Math.min(1.5, mult), ev);
    return ev;
  }

  for (const t of targets) {
    if (!t) continue;
    if (skill.power && alive(t)) hit(s, u, t, { power: skill.power, stat: skill.stat, element: skill.element, mult }, ev);
    if (skill.heal && alive(t)) heal(t, (u.mag * skill.heal + (skill.healFlat ?? 0)) * mult, ev);
    if (skill.cleanse && alive(t)) for (const c of skill.cleanse) removeStatus(t, c, ev);
    if (skill.interrupt && alive(t) && t.charged) cancelCharge(s, t, ev);
    if (skill.status && alive(t)) {
      const stuck = applyStatus(s, t, skill.status.id, skill.status.turns, Math.min(1, skill.status.chance * gf), ev);
      if (!stuck && skill.status.chance >= 0.5 && !skill.power) ev.push({ t: 'miss', uid: t.uid });
    }
  }
  return ev;
}

export function executeUltimate(s: BattleState, u: Unit, targetUid: string | undefined, success: boolean): BattleEvent[] {
  const ev: BattleEvent[] = [];
  const mult = (success ? 1 : 0.6) * (s.perks?.has('racha_caliente') ? 1.3 : 1);
  s.racha = 0;
  switch (u.id as MemberId) {
    case 'hero':
      ev.push({ t: 'action', uid: u.uid, name: '¡Tormenta!', en: 'Storm!', element: 'rayo' });
      for (const t of livingEnemies(s)) {
        hit(s, u, t, { power: 2.2, stat: 'mag', element: 'rayo', mult }, ev);
        if (alive(t)) applyStatus(s, t, 'mojado', 3, 1, ev);
      }
      break;
    case 'mateo': {
      ev.push({ t: 'action', uid: u.uid, name: '¡Marejada!', en: 'Tidal Surge!', element: 'agua' });
      const t = targetUid ? unit(s, targetUid) : livingEnemies(s)[0];
      if (t && alive(t)) {
        hit(s, u, t, { power: 4.2, stat: 'atk', element: 'agua', mult }, ev);
        if (alive(t)) applyStatus(s, t, 'aturdido', 1, success ? 1 : 0.5, ev);
      }
      break;
    }
    case 'lola':
      ev.push({ t: 'action', uid: u.uid, name: '¡Fiesta!', en: 'Party time!', element: 'luz' });
      for (const t of party(s)) {
        if (!alive(t)) revive(t, success ? 1 : 0.5, ev);
        else heal(t, t.maxHp * (success ? 1 : 0.5), ev);
        for (const st of t.statuses.filter((x) => !STATUSES[x.id].good)) removeStatus(t, st.id, ev);
        applyStatus(s, t, 'fuerte', 3, 1, ev);
        applyStatus(s, t, 'rapido', 3, 1, ev);
      }
      break;
    case 'bruno':
      ev.push({ t: 'action', uid: u.uid, name: '¡Palabra Viva!', en: 'Living Word!', element: 'luz' });
      for (const t of livingEnemies(s)) hit(s, u, t, { power: 2.0, stat: 'mag', element: 'luz', mult }, ev);
      for (const t of livingParty(s)) applyStatus(s, t, 'escudo', 3, 1, ev);
      break;
  }
  return ev;
}

export function useItem(s: BattleState, u: Unit, itemId: string, target: Unit): BattleEvent[] {
  const ev: BattleEvent[] = [];
  const item = ITEMS[itemId];
  if (!item || (s.inventory[itemId] ?? 0) <= 0) return ev;
  s.inventory[itemId]--;
  const food = s.perks?.has('buen_provecho') ? 1.5 : 1;
  ev.push({ t: 'action', uid: u.uid, name: item.name, en: item.en });
  switch (item.kind) {
    case 'heal':
      heal(target, item.amount * food, ev);
      break;
    case 'healAll':
      for (const t of livingParty(s)) heal(t, item.amount * food, ev);
      break;
    case 'mp':
      restoreMp(target, item.amount, ev);
      break;
    case 'revive':
      revive(target, item.amount, ev);
      break;
    case 'cure':
      for (const st of target.statuses.filter((x) => !STATUSES[x.id].good)) removeStatus(target, st.id, ev);
      break;
    case 'haste':
      applyStatus(s, target, 'rapido', 3, 1, ev);
      restoreMp(target, item.amount, ev);
      break;
    case 'key':
      break;
  }
  return ev;
}

export function defend(u: Unit, s?: BattleState): BattleEvent[] {
  const ev: BattleEvent[] = [];
  u.defending = true;
  ev.push({ t: 'action', uid: u.uid, name: 'Defensa', en: 'Defend' });
  restoreMp(u, Math.max(3, u.maxMp * 0.1) * (s?.perks?.has('mente_clara') ? 2 : 1), ev);
  return ev;
}

export function fleeChance(s: BattleState): number {
  if (!s.canFlee || enemies(s).some((e) => e.boss)) return 0;
  const avg = (us: Unit[]) => us.reduce((a, u) => a + effSpd(u), 0) / Math.max(1, us.length);
  return Math.max(0.3, Math.min(0.9, 0.55 + (avg(livingParty(s)) - avg(livingEnemies(s))) * 0.03));
}

export function outcome(s: BattleState): 'win' | 'lose' | null {
  if (!livingEnemies(s).length) return 'win';
  if (!livingParty(s).length) return 'lose';
  return null;
}

export function rewards(s: BattleState): { xp: number; euros: number; drops: string[]; recovered: string[] } {
  let xp = 0;
  let euros = 0;
  const drops: string[] = [];
  const recovered: string[] = [];
  for (const e of enemies(s)) {
    const def = ENEMIES[e.id];
    xp += def.xp;
    euros += def.euros;
    for (const d of def.drops ?? []) if (s.rand() < d.chance) drops.push(d.item);
    recovered.push(...e.stolen);
  }
  return { xp, euros, drops, recovered };
}

export function elementLabel(el: Element) {
  return `${ELEMENTS[el].icon} ${ELEMENTS[el].es}`;
}
