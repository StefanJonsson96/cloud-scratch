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
  retarget,
  memberStats,
  startTurn,
  unit,
  type BattleEvent,
} from '../src/battle/rules';
import { SKILL_BY_ID, xpToNext, statsAt, MEMBERS, skillsFor } from '../src/battle/defs';
import { talentChoices, talentsEarned } from '../src/battle/classes';
import { agree } from '../src/story/agree';
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

describe('classes and talents', () => {
  const hero = (cls: 'hechicero' | 'guardian' | 'picaro', level = 5) => ({ id: 'hero' as const, level, xp: 0, hp: 999, mp: 999, cls });

  it('classes change how the hero grows', () => {
    const mage = memberStats(hero('hechicero', 10));
    const tank = memberStats(hero('guardian', 10));
    const rogue = memberStats(hero('picaro', 10));
    expect(mage.mag).toBeGreaterThan(tank.mag);
    expect(tank.maxHp).toBeGreaterThan(mage.maxHp);
    expect(tank.def).toBeGreaterThan(rogue.def);
    expect(rogue.spd).toBeGreaterThan(mage.spd);
  });

  it('each class gets its own signature skill', () => {
    const ids = (cls: 'hechicero' | 'guardian' | 'picaro') => skillsFor('hero', 10, cls).map((s) => s.id);
    expect(ids('hechicero')).toContain('meteoro');
    expect(ids('hechicero')).not.toContain('muralla');
    expect(ids('guardian')).toContain('muralla');
    expect(ids('picaro')).toContain('birlar');
    expect(skillsFor('hero', 10).map((s) => s.id)).not.toContain('birlar');
  });

  it('Muralla draws single-target attacks to the guardian', () => {
    const party = [partyUnit(hero('guardian'), 'Alex'), partyUnit({ id: 'mateo', level: 5, xp: 0, hp: 999, mp: 999 }, 'Alex')];
    const s = createBattle(party, ['lobo', 'lobo'], rng(3), {});
    executeSkill(s, party[0], SKILL_BY_ID.get('muralla')!, undefined, 1, 'correct');
    for (const e of s.units.filter((u) => u.side === 'enemy')) {
      retarget(s, e);
      chooseIntent(s, e);
      const a = ENEMIES[e.id].actions.find((x) => x.id === e.intent!.actionId)!;
      if (a.target === 'one') expect(e.intent!.targets).toEqual(['hero']);
    }
  });

  it('Birlar steals once per enemy', () => {
    const party = [partyUnit(hero('picaro'), 'Alex')];
    const inv: Record<string, number> = {};
    const s = createBattle(party, ['queso'], rng(5), inv);
    const target = s.units.find((u) => u.side === 'enemy')!;
    target.hp = target.maxHp = 9999;
    executeSkill(s, party[0], SKILL_BY_ID.get('birlar')!, target.uid, 1, 'correct');
    const got = Object.values(inv).reduce((a, b) => a + b, 0) + (s.bonusEuros ?? 0);
    expect(got).toBeGreaterThan(0);
    const before = JSON.stringify([inv, s.bonusEuros]);
    executeSkill(s, party[0], SKILL_BY_ID.get('birlar')!, target.uid, 1, 'correct');
    expect(JSON.stringify([inv, s.bonusEuros])).toBe(before);
  });

  it('Segundo aliento saves a friend once per battle', () => {
    const s = setup(['golem']);
    s.perks = new Set(['segundo_aliento']);
    const golem = s.units.find((u) => u.side === 'enemy')!;
    const h = unit(s, 'hero');
    h.hp = 5;
    hit(s, golem, h, { power: 10, stat: 'atk', element: 'fisico' }, []);
    expect(h.hp).toBe(1);
    hit(s, golem, h, { power: 10, stat: 'atk', element: 'fisico' }, []);
    expect(h.hp).toBe(0);
  });

  it('talent choices are three you do not have yet', () => {
    const c = talentChoices(['poliglota', 'ahorro'], rng(2));
    expect(c).toHaveLength(3);
    expect(c).not.toContain('poliglota');
    expect(new Set(c).size).toBe(3);
    expect(talentsEarned(2)).toBe(0);
    expect(talentsEarned(9)).toBe(3);
  });
});

describe('gender agreement', () => {
  it('picks the form that agrees with the hero', () => {
    expect(agree('¿Estás {cansado|cansada}?', 'm')).toBe('¿Estás cansado?');
    expect(agree('¿Estás {cansado|cansada}?', 'f')).toBe('¿Estás cansada?');
    expect(agree('Eres {un buen alumno|una buena alumna}.', 'f')).toBe('Eres una buena alumna.');
    expect(agree('Hola, {name}', 'f')).toBe('Hola, {name}');
  });
});
