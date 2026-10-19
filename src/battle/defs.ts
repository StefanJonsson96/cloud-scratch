// Static battle data: elements, statuses, party members and their abilities.

import type { ClassId } from './classes';
import type { ChallengeStyle } from '../learn/challenges';

export type Element = 'fisico' | 'fuego' | 'agua' | 'hielo' | 'rayo' | 'viento' | 'luz' | 'sombra' | 'tierra';

export const ELEMENTS: Record<Element, { es: string; en: string; icon: string }> = {
  fisico: { es: 'físico', en: 'physical', icon: '⚔️' },
  fuego: { es: 'fuego', en: 'fire', icon: '🔥' },
  agua: { es: 'agua', en: 'water', icon: '💧' },
  hielo: { es: 'hielo', en: 'ice', icon: '❄️' },
  rayo: { es: 'rayo', en: 'lightning', icon: '⚡' },
  viento: { es: 'viento', en: 'wind', icon: '🌪️' },
  luz: { es: 'luz', en: 'light', icon: '✨' },
  sombra: { es: 'sombra', en: 'shadow', icon: '🌑' },
  tierra: { es: 'tierra', en: 'earth', icon: '🪨' },
};

export type StatusId =
  | 'mojado'
  | 'quemado'
  | 'congelado'
  | 'envenenado'
  | 'dormido'
  | 'aturdido'
  | 'lento'
  | 'rapido'
  | 'fuerte'
  | 'debil'
  | 'escudo'
  | 'cargando'
  | 'mudo'
  | 'provocando';

export interface StatusDef {
  es: string;
  en: string;
  icon: string;
  good: boolean;
  desc: string;
}

export const STATUSES: Record<StatusId, StatusDef> = {
  mojado: { es: 'Mojado', en: 'Wet', icon: '💧', good: false, desc: 'Lightning deals double damage. Ice freezes solid.' },
  quemado: { es: 'Quemado', en: 'Burned', icon: '🔥', good: false, desc: 'Loses HP every turn. Water puts it out.' },
  congelado: { es: 'Congelado', en: 'Frozen', icon: '🧊', good: false, desc: 'Skips a turn. Physical hits shatter the ice for extra damage.' },
  envenenado: { es: 'Envenenado', en: 'Poisoned', icon: '☠️', good: false, desc: 'Loses HP every turn.' },
  dormido: { es: 'Dormido', en: 'Asleep', icon: '💤', good: false, desc: 'Skips turns until hit.' },
  aturdido: { es: 'Aturdido', en: 'Stunned', icon: '💫', good: false, desc: 'Skips the next turn.' },
  lento: { es: 'Lento', en: 'Slow', icon: '🐌', good: false, desc: 'Acts less often.' },
  rapido: { es: 'Rápido', en: 'Fast', icon: '💨', good: true, desc: 'Acts more often.' },
  fuerte: { es: 'Fuerte', en: 'Strong', icon: '💪', good: true, desc: 'Deals 30% more damage.' },
  debil: { es: 'Débil', en: 'Weak', icon: '🥀', good: false, desc: 'Deals 30% less damage.' },
  escudo: { es: 'Escudo', en: 'Shielded', icon: '🛡️', good: true, desc: 'Takes 40% less damage.' },
  cargando: { es: 'Cargando', en: 'Charging', icon: '⚠️', good: true, desc: 'Preparing a powerful attack!' },
  mudo: { es: 'Mudo', en: 'Silenced', icon: '🤐', good: false, desc: 'Cannot use special abilities.' },
  provocando: { es: 'Provocando', en: 'Taunting', icon: '🎯', good: true, desc: 'Enemies aim their single attacks at this fighter.' },
};

export type MemberId = 'hero' | 'mateo' | 'lola' | 'bruno';

export type TargetKind = 'enemy' | 'allEnemies' | 'ally' | 'otherAlly' | 'allAllies' | 'deadAlly' | 'self';

export interface SkillDef {
  id: string;
  name: string;
  en: string;
  user: MemberId;
  mp: number;
  target: TargetKind;
  element: Element;
  /** Damage multiplier (uses `stat`). */
  power?: number;
  stat: 'atk' | 'mag';
  /** Heal multiplier on magic, plus `healFlat`. */
  heal?: number;
  healFlat?: number;
  status?: { id: StatusId; turns: number; chance: number };
  /** Removes these statuses from the target. */
  cleanse?: StatusId[];
  /** Cancels a charging attack and resets the target's intent. */
  interrupt?: boolean;
  special?: 'guard' | 'revive' | 'taunt' | 'steal';
  level: number;
  desc: string;
  /** Only for a hero of this class. */
  cls?: ClassId;
}

export const SKILLS: SkillDef[] = [
  // --- The Palabrista: words of power
  {
    id: 'fuego', name: 'Fuego', en: 'Fire', user: 'hero', mp: 4, target: 'enemy', element: 'fuego', stat: 'mag',
    power: 1.25, status: { id: 'quemado', turns: 3, chance: 0.35 }, cleanse: ['congelado'], level: 1,
    desc: 'Fire damage. May burn. Weak against wet foes.',
  },
  {
    id: 'agua', name: 'Agua', en: 'Water', user: 'hero', mp: 3, target: 'enemy', element: 'agua', stat: 'mag',
    power: 0.85, status: { id: 'mojado', turns: 3, chance: 1 }, cleanse: ['quemado'], level: 1,
    desc: 'Light water damage and makes the target WET. Combo it!',
  },
  {
    id: 'luz', name: 'Luz', en: 'Light', user: 'hero', mp: 4, target: 'ally', element: 'luz', stat: 'mag',
    heal: 1.5, healFlat: 10, level: 1, desc: 'Heals one ally.',
  },
  {
    id: 'rayo', name: 'Rayo', en: 'Lightning', user: 'hero', mp: 6, target: 'enemy', element: 'rayo', stat: 'mag',
    power: 1.35, level: 3, desc: 'Lightning damage. Double damage on WET foes!',
  },
  {
    id: 'hielo', name: 'Hielo', en: 'Ice', user: 'hero', mp: 5, target: 'enemy', element: 'hielo', stat: 'mag',
    power: 1.15, status: { id: 'lento', turns: 3, chance: 0.5 }, level: 5,
    desc: 'Ice damage. May slow. FREEZES wet foes (they lose a turn).',
  },
  {
    id: 'escudo', name: 'Escudo', en: 'Shield', user: 'hero', mp: 5, target: 'ally', element: 'luz', stat: 'mag',
    status: { id: 'escudo', turns: 3, chance: 1 }, level: 7, desc: 'Shields an ally: 40% less damage for 3 turns.',
  },
  {
    id: 'viento', name: 'Viento', en: 'Wind', user: 'hero', mp: 8, target: 'allEnemies', element: 'viento', stat: 'mag',
    power: 0.85, interrupt: true, level: 9, desc: 'Hits all foes and blows away charging attacks.',
  },
  {
    id: 'tierra', name: 'Tierra', en: 'Earth', user: 'hero', mp: 9, target: 'enemy', element: 'tierra', stat: 'mag',
    power: 1.7, status: { id: 'aturdido', turns: 1, chance: 0.3 }, level: 11, desc: 'The ground rises: heavy earth damage that may stun.',
  },
  {
    id: 'aurora', name: 'Aurora', en: 'Dawn', user: 'hero', mp: 12, target: 'allAllies', element: 'luz', stat: 'mag',
    heal: 0.9, healFlat: 15, cleanse: ['envenenado', 'quemado', 'congelado', 'lento', 'debil', 'mudo', 'aturdido'], level: 13,
    desc: 'Heals the whole party and clears every bad status.',
  },
  {
    id: 'estrella', name: 'Estrella', en: 'Star', user: 'hero', mp: 15, target: 'allEnemies', element: 'luz', stat: 'mag',
    power: 1.35, level: 16, desc: 'Falling stars: heavy light damage on every foe.',
  },
  // Class skills
  {
    id: 'meteoro', name: 'Meteoro', en: 'Meteor', user: 'hero', cls: 'hechicero', mp: 9, target: 'allEnemies', element: 'fuego',
    stat: 'mag', power: 1.0, status: { id: 'quemado', turns: 3, chance: 0.3 }, level: 3, desc: 'Fire rains on every foe. May burn.',
  },
  {
    id: 'muralla', name: 'Muralla', en: 'Bulwark', user: 'hero', cls: 'guardian', mp: 4, target: 'self', element: 'fisico',
    stat: 'atk', special: 'taunt', status: { id: 'escudo', turns: 2, chance: 1 }, level: 1,
    desc: 'For 2 turns, every single-target attack comes at you — and you are shielded.',
  },
  {
    id: 'birlar', name: 'Birlar', en: 'Swipe', user: 'hero', cls: 'picaro', mp: 3, target: 'enemy', element: 'fisico', stat: 'atk',
    power: 1.1, special: 'steal', level: 1, desc: 'A quick strike that steals an item or some coins.',
  },
  // --- Mateo: strength and loyalty
  {
    id: 'golpe', name: 'Golpe Fuerte', en: 'Heavy Strike', user: 'mateo', mp: 3, target: 'enemy', element: 'fisico',
    stat: 'atk', power: 1.6, level: 1, desc: 'A mighty swing of the oar.',
  },
  {
    id: 'proteger', name: 'Proteger', en: 'Protect', user: 'mateo', mp: 2, target: 'otherAlly', element: 'fisico',
    stat: 'atk', special: 'guard', level: 1,
    desc: 'Mateo takes single-target hits aimed at an ally until his next turn.',
  },
  {
    id: 'remolino', name: 'Remolino', en: 'Whirlwind', user: 'mateo', mp: 5, target: 'allEnemies', element: 'fisico',
    stat: 'atk', power: 1.0, level: 4, desc: 'Spins the oar to hit every foe.',
  },
  {
    id: 'grito', name: 'Grito', en: 'War Cry', user: 'mateo', mp: 4, target: 'allAllies', element: 'fisico', stat: 'atk',
    status: { id: 'fuerte', turns: 3, chance: 1 }, level: 6, desc: 'The whole party becomes STRONG.',
  },
  {
    id: 'ancla', name: 'Ancla', en: 'Anchor', user: 'mateo', mp: 6, target: 'enemy', element: 'fisico', stat: 'atk',
    power: 2.0, status: { id: 'aturdido', turns: 1, chance: 0.45 }, interrupt: true, level: 9,
    desc: 'A crushing blow that can stun and interrupts charging foes.',
  },
  {
    id: 'oleaje', name: 'Oleaje', en: 'Swell', user: 'mateo', mp: 9, target: 'allEnemies', element: 'agua', stat: 'atk',
    power: 1.15, status: { id: 'mojado', turns: 3, chance: 1 }, level: 12, desc: 'A wave over every foe — they are all WET. Lightning, anyone?',
  },
  {
    id: 'rompeolas', name: 'Rompeolas', en: 'Breakwater', user: 'mateo', mp: 9, target: 'allAllies', element: 'fisico', stat: 'atk',
    status: { id: 'escudo', turns: 3, chance: 1 }, level: 15, desc: 'Mateo stands like a sea wall: the whole party is SHIELDED.',
  },
  // --- Lola: songs
  {
    id: 'cancion', name: 'Canción', en: 'Song', user: 'lola', mp: 5, target: 'allAllies', element: 'luz', stat: 'mag',
    heal: 0.85, healFlat: 8, level: 1, desc: 'Heals the whole party.',
  },
  {
    id: 'ritmo', name: 'Ritmo', en: 'Rhythm', user: 'lola', mp: 3, target: 'ally', element: 'luz', stat: 'mag',
    status: { id: 'rapido', turns: 3, chance: 1 }, level: 1, desc: 'An ally becomes FAST.',
  },
  {
    id: 'nana', name: 'Nana', en: 'Lullaby', user: 'lola', mp: 4, target: 'enemy', element: 'luz', stat: 'mag',
    status: { id: 'dormido', turns: 3, chance: 0.8 }, interrupt: true, level: 1,
    desc: 'Sings a foe to SLEEP, cancelling its plan. Bosses resist.',
  },
  {
    id: 'despertar', name: 'Despertar', en: 'Awaken', user: 'lola', mp: 8, target: 'deadAlly', element: 'luz', stat: 'mag',
    special: 'revive', heal: 0.5, level: 5, desc: 'Revives a fallen ally.',
  },
  {
    id: 'desafinar', name: 'Desafinar', en: 'Off-Key', user: 'lola', mp: 4, target: 'allEnemies', element: 'sombra',
    stat: 'mag', status: { id: 'debil', turns: 3, chance: 0.75 }, level: 7, desc: 'A terrible note that WEAKENS all foes.',
  },
  {
    id: 'bulerias', name: 'Bulerías', en: 'Bulerías', user: 'lola', mp: 9, target: 'allAllies', element: 'luz', stat: 'mag',
    status: { id: 'rapido', turns: 3, chance: 1 }, level: 11, desc: 'A fast flamenco rhythm: the whole party becomes FAST.',
  },
  {
    id: 'saeta', name: 'Saeta', en: 'Saeta', user: 'lola', mp: 8, target: 'enemy', element: 'luz', stat: 'mag',
    power: 1.9, interrupt: true, level: 14, desc: 'A piercing song like an arrow: heavy light damage that cancels a charge.',
  },
  {
    id: 'duende', name: 'Duende', en: 'Duende', user: 'lola', mp: 14, target: 'allAllies', element: 'luz', stat: 'mag',
    heal: 1.1, healFlat: 12, status: { id: 'fuerte', turns: 3, chance: 1 }, level: 17,
    desc: 'Pure flamenco soul: heals everyone and makes them STRONG.',
  },
  // --- Bruno: the memory of forty years of silence
  {
    id: 'recuerdo', name: 'Recuerdo', en: 'Memory', user: 'bruno', mp: 4, target: 'ally', element: 'luz', stat: 'mag',
    heal: 1.2, healFlat: 8, cleanse: ['envenenado', 'quemado', 'congelado', 'lento', 'debil', 'mudo'], level: 1,
    desc: 'A good memory: heals an ally and clears their bad statuses.',
  },
  {
    id: 'eco', name: 'Eco', en: 'Echo', user: 'bruno', mp: 4, target: 'enemy', element: 'sombra', stat: 'mag',
    power: 1.25, status: { id: 'debil', turns: 3, chance: 0.4 }, level: 1, desc: 'Shadow damage that may WEAKEN.',
  },
  {
    id: 'silencio', name: 'Silencio', en: 'Silence', user: 'bruno', mp: 5, target: 'enemy', element: 'sombra', stat: 'mag',
    status: { id: 'mudo', turns: 2, chance: 0.85 }, interrupt: true, level: 1,
    desc: 'The old silence, used for good: the foe cannot use specials, and its plan is cancelled.',
  },
  {
    id: 'velo', name: 'Velo de sombra', en: 'Shadow Veil', user: 'bruno', mp: 9, target: 'allAllies', element: 'sombra', stat: 'mag',
    status: { id: 'escudo', turns: 2, chance: 1 }, level: 12, desc: 'Shadows wrap the party: everyone is SHIELDED for 2 turns.',
  },
  {
    id: 'voz', name: 'Voz', en: 'Voice', user: 'bruno', mp: 12, target: 'allEnemies', element: 'luz', stat: 'mag',
    power: 1.2, status: { id: 'aturdido', turns: 1, chance: 0.25 }, level: 15,
    desc: 'The voice he found again: light damage on every foe, may stun.',
  },
];

export const SKILL_BY_ID: ReadonlyMap<string, SkillDef> = new Map(SKILLS.map((s) => [s.id, s]));

export interface UltimateDef {
  id: string;
  name: string;
  en: string;
  user: MemberId;
  target: TargetKind;
  desc: string;
}

export const ULTIMATES: Record<MemberId, UltimateDef> = {
  hero: { id: 'tormenta', name: '¡Tormenta!', en: 'Storm', user: 'hero', target: 'allEnemies', desc: 'Massive lightning on all foes, and soaks them.' },
  mateo: { id: 'marejada', name: '¡Marejada!', en: 'Tidal Surge', user: 'mateo', target: 'enemy', desc: 'An enormous blow that stuns.' },
  lola: { id: 'fiesta', name: '¡Fiesta!', en: 'Party Time', user: 'lola', target: 'allAllies', desc: 'Full heal, revive, and the party becomes STRONG and FAST.' },
  bruno: { id: 'palabra_viva', name: '¡Palabra Viva!', en: 'Living Word', user: 'bruno', target: 'allEnemies', desc: 'Every word he kept silent for forty years at once: heavy light damage on all foes, and the party is SHIELDED.' },
};

export interface MemberDef {
  id: MemberId;
  name: string;
  role: string;
  roleEn: string;
  style: ChallengeStyle;
  styleEn: string;
  base: { hp: number; mp: number; atk: number; mag: number; def: number; spd: number };
  growth: { hp: number; mp: number; atk: number; mag: number; def: number; spd: number };
  sprite: string;
}

export const MEMBERS: Record<MemberId, MemberDef> = {
  hero: {
    id: 'hero', name: 'Alex', role: 'Palabrista', roleEn: 'Word-mage', style: 'vocab', styleEn: 'Vocabulary',
    base: { hp: 42, mp: 22, atk: 7, mag: 12, def: 5, spd: 11 },
    growth: { hp: 7, mp: 3, atk: 1.2, mag: 2.1, def: 1.1, spd: 0.6 },
    sprite: 'hero',
  },
  mateo: {
    id: 'mateo', name: 'Mateo', role: 'Pescador', roleEn: 'Fisherman', style: 'quick', styleEn: 'Quick-fire',
    base: { hp: 62, mp: 12, atk: 12, mag: 4, def: 8, spd: 8 },
    growth: { hp: 10, mp: 1.5, atk: 2.3, mag: 0.6, def: 1.6, spd: 0.5 },
    sprite: 'mateo',
  },
  lola: {
    id: 'lola', name: 'Lola', role: 'Música', roleEn: 'Musician', style: 'verb', styleEn: 'Verbs',
    base: { hp: 46, mp: 26, atk: 7, mag: 11, def: 5, spd: 13 },
    growth: { hp: 7, mp: 3.5, atk: 1.1, mag: 1.9, def: 1.0, spd: 0.7 },
    sprite: 'lola',
  },
  bruno: {
    id: 'bruno', name: 'Bruno', role: 'Memoria', roleEn: 'Keeper of memories', style: 'listen', styleEn: 'Listening',
    base: { hp: 56, mp: 24, atk: 8, mag: 12, def: 8, spd: 7 },
    growth: { hp: 8.5, mp: 3, atk: 1.3, mag: 1.9, def: 1.5, spd: 0.5 },
    sprite: 'bruno',
  },
};

export function statsAt(def: MemberDef, level: number) {
  const l = level - 1;
  return {
    maxHp: Math.round(def.base.hp + def.growth.hp * l),
    maxMp: Math.round(def.base.mp + def.growth.mp * l),
    atk: Math.round(def.base.atk + def.growth.atk * l),
    mag: Math.round(def.base.mag + def.growth.mag * l),
    def: Math.round(def.base.def + def.growth.def * l),
    spd: Math.round(def.base.spd + def.growth.spd * l),
  };
}

export function xpToNext(level: number): number {
  return Math.round(16 * Math.pow(level, 1.55));
}

export function skillsFor(member: MemberId, level: number, cls?: ClassId): SkillDef[] {
  return SKILLS.filter((s) => s.user === member && s.level <= level && (!s.cls || s.cls === cls));
}
