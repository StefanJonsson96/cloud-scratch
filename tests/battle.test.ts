import { describe, expect, it } from 'vitest';
import {
  applyStatus,
  chooseIntent,
  createBattle,
  executeAttack,
  executeEnemy,
  executeSkill,
  executeUltimate,
  endTurn,
  hit,
  nextActor,
  outcome,
  partyUnit,
  preview,
  startTurn,
  unit,
  type BattleEvent,
} from '../src/battle/rules';
import { SKILL_BY_ID, xpToNext, statsAt, MEMBERS } from '../src/battle/defs';
import { ENEMIES } from '../src/battle/enemies';

function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function setup(enemies = ['cangrejo'], seed = 1) {
  const party = [
    partyUnit({ id: 'hero', level: 3, xp: 0, hp: 999, mp: 999 }, 'Alex'),
    partyUnit({ id: 'mateo', level: 3, xp: 0, hp: 999, mp: 999 }, 'Alex'),
  ];
  return createBattle(party, enemies, rng(seed), { churro: 2 });
}

describe('battle rules', () => {
  it('creates units with letters for duplicates and intents', () => {
    const s = setup(['cangrejo', 'cangrejo', 'gaviota']);
    const names = s.units.filter((u) => u.side === 'enemy').map((u) => u.name);
    expect(names).toEqual(['Cangrejo A', 'Cangrejo B', 'Gaviota']);
    for (const e of s.units.filter((u) => u.side === 'enemy')) {
      expect(e.intent?.es).toMatch(/^¡?(El|La) /);
      expect(e.intent?.en.length).toBeGreaterThan(5);
    }
  });

  it('wet + lightning deals double damage and consumes wet', () => {
    const a = setup(['cangrejo_rey'], 5);
    const b = setup(['cangrejo_rey'], 5);
    const heroA = unit(a, 'hero');
    const heroB = unit(b, 'hero');
    const bossB = unit(b, 'e0');
    bossB.statuses.push({ id: 'mojado', turns: 3 });
    const evA: BattleEvent[] = [];
    const evB: BattleEvent[] = [];
    const dA = hit(a, heroA, unit(a, 'e0'), { power: 1.35, stat: 'mag', element: 'rayo' }, evA);
    const dB = hit(b, heroB, bossB, { power: 1.35, stat: 'mag', element: 'rayo' }, evB);
    expect(dB).toBeGreaterThanOrEqual(dA * 2 - 1);
    expect(bossB.statuses.some((x) => x.id === 'mojado')).toBe(false);
    expect(evB.some((e) => e.t === 'damage' && e.combo?.includes('×2'))).toBe(true);
  });

  it('ice freezes a wet target, which then skips its turn', () => {
    const s = setup(['cangrejo']);
    const crab = unit(s, 'e0');
    crab.hp = 999;
    crab.maxHp = 999;
    crab.statuses.push({ id: 'mojado', turns: 3 });
    const ev: BattleEvent[] = [];
    hit(s, unit(s, 'hero'), crab, { power: 0.1, stat: 'mag', element: 'hielo' }, ev);
    expect(crab.statuses.map((x) => x.id)).toContain('congelado');
    expect(startTurn(crab, [])).toBe(true);
    expect(crab.statuses.map((x) => x.id)).not.toContain('congelado');
  });

  it('weaknesses multiply damage', () => {
    const s = setup(['cangrejo'], 9);
    const s2 = setup(['cangrejo'], 9);
    const fire = hit(s, unit(s, 'hero'), unit(s, 'e0'), { power: 1, stat: 'mag', element: 'fuego' }, []);
    const bolt = hit(s2, unit(s2, 'hero'), unit(s2, 'e0'), { power: 1, stat: 'mag', element: 'rayo' }, []);
    expect(bolt / fire).toBeGreaterThan(1.3);
  });

  it('Mateo protects an ally from single-target attacks', () => {
    const s = setup(['cangrejo']);
    const mateo = unit(s, 'mateo');
    const hero = unit(s, 'hero');
    executeSkill(s, mateo, SKILL_BY_ID.get('proteger')!, 'hero', 1, 'correct');
    const crab = unit(s, 'e0');
    crab.intent = { actionId: 'pellizco', targets: ['hero'], es: '', en: '', icon: '' };
    const heroHp = hero.hp;
    const mateoHp = mateo.hp;
    const ev = executeEnemy(s, crab);
    expect(ev.some((e) => e.t === 'guard')).toBe(true);
    expect(hero.hp).toBe(heroHp);
    expect(mateo.hp).toBeLessThan(mateoHp);
  });

  it('charging telegraphs the big attack, and sleep interrupts it', () => {
    const s = setup(['cangrejo_rey'], 3);
    const boss = unit(s, 'e0');
    boss.intent = { actionId: 'preparar', targets: [boss.uid], es: '', en: '', icon: '' };
    executeEnemy(s, boss);
    expect(boss.charged).toBe('aplastar');
    // After its turn, the next intent is the charged attack.
    endTurn(s, boss, []);
    chooseIntent(s, boss);
    expect(boss.intent?.actionId).toBe('aplastar');
    expect(boss.intent?.es).toMatch(/^¡El Cangrejo Rey va a aplastar a (Alex|Mateo)!$/);
    boss.statusResist = 1;
    applyStatus(s, boss, 'dormido', 2, 1, []);
    expect(boss.charged).toBeUndefined();
    expect(boss.intent?.actionId).not.toBe('aplastar');
  });

  it('timeline gives faster units more turns', () => {
    const s = setup(['gaviota']);
    const order = preview(s, 20).map((u) => u.uid);
    const gull = order.filter((x) => x === 'e0').length;
    const mateo = order.filter((x) => x === 'mateo').length;
    expect(gull).toBeGreaterThan(mateo);
    const predicted = preview(s, 1)[0].uid;
    expect(nextActor(s).uid).toBe(predicted);
  });

  it('attacks roll a d20', () => {
    const s = setup(['cangrejo']);
    const ev = executeAttack(s, unit(s, 'mateo'), unit(s, 'e0'));
    const roll = ev.find((e) => e.t === 'roll');
    expect(roll && roll.t === 'roll' && roll.value >= 1 && roll.value <= 20).toBe(true);
  });

  it('ultimates can win the fight and Lola revives', () => {
    const s = setup(['niebla', 'niebla']);
    executeUltimate(s, unit(s, 'hero'), undefined, true);
    expect(outcome(s)).toBe('win');
    const s2 = createBattle(
      [
        partyUnit({ id: 'lola', level: 5, xp: 0, hp: 999, mp: 999 }, 'Alex'),
        partyUnit({ id: 'hero', level: 5, xp: 0, hp: 0, mp: 10 }, 'Alex'),
      ],
      ['cangrejo'],
      rng(2),
      {},
    );
    executeUltimate(s2, unit(s2, 'lola'), undefined, true);
    expect(unit(s2, 'hero').hp).toBe(unit(s2, 'hero').maxHp);
  });

  it('seagulls steal items and you get them back', () => {
    const s = setup(['gaviota']);
    const gull = unit(s, 'e0');
    gull.intent = { actionId: 'robar', targets: [], es: '', en: '', icon: '' };
    executeEnemy(s, gull);
    expect(s.inventory.churro).toBe(1);
    expect(gull.stolen).toEqual(['churro']);
  });

  it('every enemy can act without crashing', () => {
    for (const id of Object.keys(ENEMIES)) {
      const s = setup([id], 11);
      for (let i = 0; i < 30 && !outcome(s); i++) {
        const u = nextActor(s);
        const ev: BattleEvent[] = [];
        if (startTurn(u, ev)) {
          endTurn(s, u, ev);
          continue;
        }
        if (u.side === 'enemy') {
          executeEnemy(s, u);
          endTurn(s, u, ev);
          if (u.hp > 0) chooseIntent(s, u);
        } else {
          const target = s.units.find((x) => x.side === 'enemy' && x.hp > 0)!;
          executeAttack(s, u, target);
          endTurn(s, u, ev);
        }
        for (const x of s.units) expect(Number.isFinite(x.hp)).toBe(true);
      }
    }
  });
});

describe('progression', () => {
  it('xp curve grows and stats grow with level', () => {
    expect(xpToNext(2)).toBeGreaterThan(xpToNext(1));
    expect(statsAt(MEMBERS.mateo, 10).maxHp).toBeGreaterThan(statsAt(MEMBERS.mateo, 1).maxHp);
  });
});
