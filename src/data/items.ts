// Items are Spanish food, so shopping doubles as vocabulary practice.

export type ItemKind = 'heal' | 'healAll' | 'mp' | 'revive' | 'cure' | 'haste' | 'key';

export interface ItemDef {
  id: string;
  name: string;
  en: string;
  kind: ItemKind;
  amount: number;
  price: number;
  desc: string;
  icon: string;
}

export const ITEMS: Record<string, ItemDef> = {};
function item(i: ItemDef) {
  ITEMS[i.id] = i;
}

item({ id: 'churro', name: 'Churro', en: 'Churro', kind: 'heal', amount: 35, price: 8, icon: '🥖', desc: 'Restores 35 HP. Best with chocolate.' });
item({ id: 'bocadillo', name: 'Bocadillo', en: 'Baguette sandwich', kind: 'heal', amount: 80, price: 20, icon: '🥪', desc: 'Restores 80 HP.' });
item({ id: 'empanada', name: 'Empanada gallega', en: 'Galician pie', kind: 'heal', amount: 160, price: 45, icon: '🥟', desc: 'Restores 160 HP.' });
item({ id: 'paella', name: 'Paella', en: 'Paella', kind: 'healAll', amount: 70, price: 60, icon: '🥘', desc: 'Restores 70 HP to the whole party.' });
item({ id: 'horchata', name: 'Horchata', en: 'Tiger-nut milk', kind: 'mp', amount: 15, price: 25, icon: '🥛', desc: 'Restores 15 MP. A Valencian classic.' });
item({ id: 'te', name: 'Manzanilla', en: 'Chamomile tea', kind: 'cure', amount: 0, price: 12, icon: '🍵', desc: 'Cures poison, burns, sleep, slow, weakness and silence.' });
item({ id: 'cafe', name: 'Café solo', en: 'Espresso', kind: 'haste', amount: 5, price: 18, icon: '☕', desc: 'Makes an ally FAST and restores 5 MP.' });
item({ id: 'queso_manchego', name: 'Queso manchego', en: 'Manchego cheese', kind: 'heal', amount: 240, price: 70, icon: '🧀', desc: 'Restores 240 HP. Sheep’s milk cheese from La Mancha.' });
item({ id: 'pisto', name: 'Pisto manchego', en: 'Pisto (vegetable stew)', kind: 'healAll', amount: 130, price: 110, icon: '🍲', desc: 'Restores 130 HP to the whole party.' });
item({ id: 'pluma', name: 'Pluma dorada', en: 'Golden feather', kind: 'revive', amount: 0.5, price: 90, icon: '🪶', desc: 'Revives a fallen ally with half HP.' });

export interface AccessoryDef {
  id: string;
  name: string;
  en: string;
  desc: string;
  icon: string;
  bonus?: Partial<Record<'maxHp' | 'maxMp' | 'atk' | 'mag' | 'def' | 'spd', number>>;
  /** Missing accents count as fully correct. */
  accents?: boolean;
  /** Extra time (multiplier) for the fast bonus. */
  slowTimer?: number;
  /** Start every battle with this much Racha. */
  racha?: number;
}

export const ACCESSORIES: Record<string, AccessoryDef> = {};
function acc(a: AccessoryDef) {
  ACCESSORIES[a.id] = a;
}

acc({ id: 'tilde', name: 'Amuleto de la Tilde', en: 'Accent Amulet', icon: '´', accents: true, desc: 'Missing accents (á, é, ñ…) count as correct.' });
acc({ id: 'reloj', name: 'Reloj de arena', en: 'Hourglass', icon: '⏳', slowTimer: 1.6, racha: 1, desc: 'Start every battle with 1 Racha. With the speed bonus on: more time to answer.' });
acc({ id: 'concha', name: 'Concha de vieira', en: 'Scallop Shell', icon: '🐚', bonus: { def: 4, maxHp: 15 }, desc: 'The pilgrim’s shell. +4 DEF, +15 HP.' });
acc({ id: 'anillo', name: 'Anillo de fuerza', en: 'Ring of Strength', icon: '💍', bonus: { atk: 5 }, desc: '+5 ATK.' });
acc({ id: 'gafas', name: 'Gafas del sabio', en: "Sage's Glasses", icon: '👓', bonus: { mag: 5, maxMp: 8 }, desc: '+5 MAG, +8 MP.' });
acc({ id: 'pluma_ligera', name: 'Pluma ligera', en: 'Light Feather', icon: '🪶', bonus: { spd: 4 }, desc: '+4 SPD.' });
acc({ id: 'abanico', name: 'Abanico', en: 'Fan', icon: '🪭', bonus: { spd: 2, mag: 3 }, desc: 'A flamenco fan. +2 SPD, +3 MAG.' });
acc({ id: 'yelmo', name: 'Yelmo de Mambrino', en: "Mambrino's Helmet", icon: '🪖', bonus: { def: 6, maxHp: 25 }, desc: 'Don Quijote’s “golden helmet” (a barber’s basin). +6 DEF, +25 HP.' });
acc({ id: 'molinillo', name: 'Molinillo', en: 'Pinwheel', icon: '🌀', bonus: { spd: 3, mag: 3 }, desc: 'A toy windmill. +3 SPD, +3 MAG.' });
acc({ id: 'corazon', name: 'Corazón valiente', en: 'Brave Heart', icon: '❤️‍🔥', racha: 2, desc: 'Start every battle with 2 Racha.' });

export function itemLabel(id: string): string {
  const i = ITEMS[id];
  return i ? `${i.icon} ${i.name}` : id;
}
