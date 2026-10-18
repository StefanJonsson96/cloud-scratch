// Hero classes (chosen at character creation) and talents (picked every few
// levels). Classes change how the hero grows and plays; talents are perks for
// the whole party.

export type ClassId = 'hechicero' | 'guardian' | 'picaro';

type Stats = { hp: number; mp: number; atk: number; mag: number; def: number; spd: number };

export interface ClassDef {
  id: ClassId;
  /** Masculine and feminine forms: the class name agrees with you. */
  name: { m: string; f: string };
  en: string;
  icon: string;
  pitch: string;
  /** Flat bonus at level 1 and extra growth per level, on top of the hero's own. */
  base: Partial<Stats>;
  growth: Partial<Stats>;
  skill: string;
  passive: { name: string; en: string; desc: string };
}

export const CLASSES: Record<ClassId, ClassDef> = {
  hechicero: {
    id: 'hechicero',
    name: { m: 'Hechicero', f: 'Hechicera' },
    en: 'Sorcerer',
    icon: '🔥',
    pitch: 'Big spells, fragile body. Every right answer hits harder.',
    base: { mag: 2, mp: 4, hp: -4 },
    growth: { mag: 0.6, mp: 1, hp: -1 },
    skill: 'meteoro',
    passive: { name: 'Elocuencia', en: 'Eloquence', desc: 'Your spells deal 15% more damage when your answer is right.' },
  },
  guardian: {
    id: 'guardian',
    name: { m: 'Guardián', f: 'Guardiana' },
    en: 'Guardian',
    icon: '🛡️',
    pitch: 'Tough and patient. Mistakes hurt less, and you protect your friends.',
    base: { hp: 12, def: 2, atk: 1, mag: -1 },
    growth: { hp: 3, def: 0.7, atk: 0.6, mag: -0.4 },
    skill: 'muralla',
    passive: { name: 'Paciencia', en: 'Patience', desc: 'A wrong answer never lowers your Racha, and your spells keep 80% of their power.' },
  },
  picaro: {
    id: 'picaro',
    name: { m: 'Pícaro', f: 'Pícara' },
    en: 'Rogue',
    icon: '🗡️',
    pitch: 'Quick and lucky. Right answers let you act again sooner.',
    base: { spd: 3, atk: 2 },
    growth: { spd: 0.5, atk: 0.6 },
    skill: 'birlar',
    passive: { name: 'Picardía', en: 'Cunning', desc: 'After a right answer your next turn comes sooner, and attacks crit on a roll of 18–20.' },
  },
};

export function classBonus(cls: ClassId | undefined, level: number): Partial<Stats> {
  if (!cls) return {};
  const c = CLASSES[cls];
  const out: Partial<Stats> = {};
  for (const k of ['hp', 'mp', 'atk', 'mag', 'def', 'spd'] as const) {
    const v = (c.base[k] ?? 0) + (c.growth[k] ?? 0) * (level - 1);
    if (v) out[k] = v;
  }
  return out;
}

export function className(cls: ClassId, gender: 'm' | 'f' = 'm'): string {
  return CLASSES[cls].name[gender];
}

// ------------------------------------------------------------------ talents
export type TalentId =
  | 'poliglota'
  | 'buen_provecho'
  | 'piel_dura'
  | 'mente_clara'
  | 'memoria'
  | 'racha_caliente'
  | 'segundo_aliento'
  | 'combos'
  | 'ahorro'
  | 'sabiduria'
  | 'regateo'
  | 'iniciativa';

export interface TalentDef {
  id: TalentId;
  name: string;
  en: string;
  icon: string;
  desc: string;
}

export const TALENTS: Record<TalentId, TalentDef> = {
  poliglota: { id: 'poliglota', name: 'Políglota', en: 'Polyglot', icon: '🗣️', desc: 'Start every battle with +1 Racha.' },
  buen_provecho: { id: 'buen_provecho', name: 'Buen provecho', en: 'Enjoy your meal', icon: '🥘', desc: 'Food heals 50% more.' },
  piel_dura: { id: 'piel_dura', name: 'Piel dura', en: 'Thick skin', icon: '🪨', desc: 'The party takes 10% less damage.' },
  mente_clara: { id: 'mente_clara', name: 'Mente clara', en: 'Clear mind', icon: '🧘', desc: 'Defending restores twice as much MP.' },
  memoria: { id: 'memoria', name: 'Buena memoria', en: 'Good memory', icon: '💡', desc: 'Using a 💡 hint no longer lowers your answer to “almost”.' },
  racha_caliente: { id: 'racha_caliente', name: 'Racha caliente', en: 'Hot streak', icon: '🔥', desc: 'Palabras Finales are 30% stronger.' },
  segundo_aliento: { id: 'segundo_aliento', name: 'Segundo aliento', en: 'Second wind', icon: '💖', desc: 'Once per battle, each friend survives a knockout blow with 1 HP.' },
  combos: { id: 'combos', name: 'Maestro de combos', en: 'Combo master', icon: '⚡', desc: 'Element combos hit harder: lightning on wet ×2.5, shattering ice ×2.' },
  ahorro: { id: 'ahorro', name: 'Ahorro', en: 'Thrift', icon: '💶', desc: 'Win 30% more euros in battle.' },
  sabiduria: { id: 'sabiduria', name: 'Sabiduría', en: 'Wisdom', icon: '📚', desc: 'The party earns 20% more experience.' },
  regateo: { id: 'regateo', name: 'Regateo', en: 'Haggling', icon: '🤝', desc: 'Shops sell to you 20% cheaper.' },
  iniciativa: { id: 'iniciativa', name: 'Iniciativa', en: 'Initiative', icon: '🏃', desc: 'Your party acts first at the start of every battle.' },
};

/** A talent every three hero levels. */
export const TALENT_EVERY = 3;

export function talentsEarned(heroLevel: number): number {
  return Math.floor(heroLevel / TALENT_EVERY);
}

/** Three talents to choose from (ones you don't have yet). */
export function talentChoices(have: string[], rand: () => number = Math.random, n = 3): TalentId[] {
  const pool = (Object.keys(TALENTS) as TalentId[]).filter((t) => !have.includes(t));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
