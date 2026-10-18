// Enemies of the Silence. Every enemy announces its next move in Spanish
// ("El cangrejo va a pellizcar a Mateo.") — read it and you can react:
// protect the target, defend, put it to sleep, or kill it first.
//
// Intent templates: {N} = "El cangrejo", {T} = target name ("todos" for all).

import type { Element, StatusId } from './defs';

export type IntentTarget = 'one' | 'all' | 'self' | 'allies';

export interface EnemyAction {
  id: string;
  name: string;
  en: string;
  weight: number;
  target: IntentTarget;
  kind: 'attack' | 'status' | 'buff' | 'heal' | 'summon' | 'charge' | 'steal' | 'explode';
  element?: Element;
  power?: number;
  status?: { id: StatusId; turns: number; chance: number };
  /** Heal as a fraction of max HP. */
  heal?: number;
  summon?: string;
  /** For "charge": the action unleashed on the following turn. */
  next?: string;
  /** Only usable as the follow-up to a charge. */
  chargedOnly?: boolean;
  when?: 'hurt' | 'canSummon' | 'partyHasItems' | 'allyHurt';
  es: string;
  enText: string;
  icon: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  art: 'el' | 'la';
  en: string;
  sprite: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  weak: Element[];
  resist: Element[];
  xp: number;
  euros: number;
  drops?: { item: string; chance: number }[];
  actions: EnemyAction[];
  boss?: boolean;
  /** Chance multiplier for sleep and stun (bosses resist). */
  statusResist?: number;
  desc: [string, string];
}

const A = (a: Partial<EnemyAction> & Pick<EnemyAction, 'id' | 'name' | 'en' | 'es' | 'enText'>): EnemyAction => ({
  weight: 1,
  target: 'one',
  kind: 'attack',
  element: 'fisico',
  power: 1,
  icon: '⚔️',
  ...a,
});

export const ENEMIES: Record<string, EnemyDef> = {};
function enemy(e: EnemyDef) {
  ENEMIES[e.id] = e;
}

// ================================================================ Prólogo / Costa
enemy({
  id: 'niebla', name: 'niebla', art: 'la', en: 'Mist', sprite: 'niebla',
  hp: 18, atk: 5, def: 2, spd: 9, weak: ['luz', 'fuego', 'viento'], resist: ['sombra'], xp: 7, euros: 3,
  desc: ['Un trozo del Silencio. Es frío y gris.', 'A scrap of the Silence. Cold and grey.'],
  actions: [
    A({ id: 'toque', name: 'Toque frío', en: 'Cold Touch', weight: 3, es: '{N} va a tocar a {T}.', enText: '{N} is going to touch {T}.' }),
    A({
      id: 'susurro', name: 'Susurro', en: 'Whisper', kind: 'status', element: 'sombra', power: 0.5,
      status: { id: 'debil', turns: 2, chance: 0.6 }, es: '{N} va a susurrar a {T}.', enText: '{N} is going to whisper to {T}.', icon: '🌀',
    }),
  ],
});
enemy({
  id: 'cangrejo', name: 'cangrejo', art: 'el', en: 'Crab', sprite: 'cangrejo',
  hp: 30, atk: 8, def: 7, spd: 6, weak: ['rayo'], resist: ['agua'], xp: 9, euros: 5,
  drops: [{ item: 'churro', chance: 0.2 }],
  desc: ['Un cangrejo gris. Sus pinzas son duras.', 'A grey crab. Its claws are hard.'],
  actions: [
    A({ id: 'pellizco', name: 'Pellizco', en: 'Pinch', weight: 3, es: '{N} va a pellizcar a {T}.', enText: '{N} is going to pinch {T}.' }),
    A({
      id: 'caparazon', name: 'Caparazón', en: 'Shell', target: 'self', kind: 'buff', status: { id: 'escudo', turns: 2, chance: 1 },
      es: '{N} va a esconderse en su caparazón.', enText: '{N} is going to hide in its shell.', icon: '🛡️',
    }),
  ],
});
enemy({
  id: 'gaviota', name: 'gaviota', art: 'la', en: 'Seagull', sprite: 'gaviota',
  hp: 22, atk: 7, def: 3, spd: 14, weak: ['rayo', 'viento'], resist: [], xp: 8, euros: 6,
  desc: ['Una gaviota ladrona. ¡Cuidado con tus churros!', 'A thieving seagull. Watch your churros!'],
  actions: [
    A({ id: 'picotazo', name: 'Picotazo', en: 'Peck', weight: 3, power: 0.9, es: '{N} va a picotear a {T}.', enText: '{N} is going to peck {T}.' }),
    A({
      id: 'robar', name: 'Robo', en: 'Steal', weight: 2, kind: 'steal', when: 'partyHasItems', target: 'all',
      es: '{N} va a robar un objeto.', enText: '{N} is going to steal an item.', icon: '👋',
    }),
  ],
});
enemy({
  id: 'medusa', name: 'medusa', art: 'la', en: 'Jellyfish', sprite: 'medusa',
  hp: 26, atk: 7, def: 4, spd: 8, weak: ['rayo', 'fuego'], resist: ['agua'], xp: 10, euros: 6,
  drops: [{ item: 'te', chance: 0.25 }],
  desc: ['Una medusa transparente. Pica y envenena.', 'A see-through jellyfish. It stings and poisons.'],
  actions: [
    A({
      id: 'picadura', name: 'Picadura', en: 'Sting', weight: 3, element: 'agua', power: 0.9,
      status: { id: 'envenenado', turns: 3, chance: 0.4 }, es: '{N} va a picar a {T}.', enText: '{N} is going to sting {T}.',
    }),
    A({
      id: 'envolver', name: 'Abrazo', en: 'Wrap', kind: 'status', power: 0.4, status: { id: 'lento', turns: 3, chance: 0.8 },
      es: '{N} va a envolver a {T}.', enText: '{N} is going to wrap around {T}.', icon: '🌀',
    }),
  ],
});
enemy({
  id: 'cangrejo_rey', name: 'Cangrejo Rey', art: 'el', en: 'King Crab', sprite: 'cangrejo_rey', boss: true, statusResist: 0.4,
  hp: 170, atk: 11, def: 10, spd: 7, weak: ['rayo'], resist: ['agua'], xp: 70, euros: 60,
  desc: ['El rey de la playa. El Silencio le ha robado la voz.', 'King of the beach. The Silence stole his voice.'],
  actions: [
    A({ id: 'pellizco', name: 'Pellizco', en: 'Pinch', weight: 3, power: 1.1, es: '{N} va a pellizcar a {T}.', enText: '{N} is going to pinch {T}.' }),
    A({
      id: 'preparar', name: 'Pinzas arriba', en: 'Claws Up', weight: 2, target: 'self', kind: 'charge', next: 'aplastar',
      es: '{N} levanta sus pinzas enormes…', enText: '{N} raises its enormous claws…', icon: '⚠️',
    }),
    A({
      id: 'aplastar', name: 'Gran Pellizco', en: 'Crushing Pinch', chargedOnly: true, power: 2.3,
      es: '¡{N} va a aplastar a {T}!', enText: '{N} is going to crush {T}!', icon: '💥',
    }),
    A({
      id: 'llamar', name: 'Llamada', en: 'Call', target: 'self', kind: 'summon', summon: 'cangrejo', when: 'canSummon',
      es: '{N} va a llamar a sus hijos.', enText: '{N} is going to call its children.', icon: '📣',
    }),
    A({
      id: 'ola', name: 'Ola', en: 'Wave', weight: 2, target: 'all', element: 'agua', power: 0.7,
      status: { id: 'mojado', turns: 3, chance: 0.6 }, es: '{N} va a lanzar una ola contra todos.', enText: '{N} is going to hurl a wave at everyone.', icon: '🌊',
    }),
  ],
});

// ================================================================ San Sabor
enemy({
  id: 'rata', name: 'rata', art: 'la', en: 'Rat', sprite: 'rata',
  hp: 40, atk: 13, def: 6, spd: 13, weak: ['fuego'], resist: [], xp: 15, euros: 10,
  desc: ['Una rata del mercado. Le encanta el queso.', 'A market rat. It loves cheese.'],
  actions: [
    A({ id: 'mordisco', name: 'Mordisco', en: 'Bite', weight: 3, es: '{N} va a morder a {T}.', enText: '{N} is going to bite {T}.' }),
    A({
      id: 'robar', name: 'Robo', en: 'Steal', weight: 1, kind: 'steal', when: 'partyHasItems', target: 'all',
      es: '{N} va a robar un objeto.', enText: '{N} is going to steal an item.', icon: '👋',
    }),
  ],
});
enemy({
  id: 'tomate', name: 'tomate furioso', art: 'el', en: 'Furious Tomato', sprite: 'tomate',
  hp: 34, atk: 14, def: 5, spd: 10, weak: ['hielo', 'agua'], resist: ['fuego'], xp: 16, euros: 9,
  drops: [{ item: 'churro', chance: 0.3 }],
  desc: ['Un tomate muy, muy enfadado. ¡Puede explotar!', 'A very, very angry tomato. It can explode!'],
  actions: [
    A({ id: 'golpe', name: 'Tomatazo', en: 'Tomato Slam', weight: 3, es: '{N} va a golpear a {T}.', enText: '{N} is going to hit {T}.' }),
    A({
      id: 'rojo', name: 'Rojo de ira', en: 'Red with Rage', weight: 1, target: 'self', kind: 'charge', next: 'explotar', when: 'hurt',
      es: '{N} se está poniendo muy rojo…', enText: '{N} is turning very red…', icon: '⚠️',
    }),
    A({
      id: 'explotar', name: '¡Explosión!', en: 'Explosion!', chargedOnly: true, target: 'all', kind: 'explode', element: 'fuego', power: 1.3,
      es: '¡{N} va a explotar!', enText: '{N} is going to explode!', icon: '💥',
    }),
  ],
});
enemy({
  id: 'queso', name: 'queso apestoso', art: 'el', en: 'Stinky Cheese', sprite: 'queso',
  hp: 46, atk: 12, def: 9, spd: 6, weak: ['fuego'], resist: ['hielo'], xp: 17, euros: 11,
  desc: ['Un queso con un olor terrible.', 'A cheese with a terrible smell.'],
  actions: [
    A({ id: 'rodar', name: 'Rodar', en: 'Roll', weight: 2, power: 1.1, es: '{N} va a rodar sobre {T}.', enText: '{N} is going to roll over {T}.' }),
    A({
      id: 'apestar', name: 'Peste', en: 'Stench', weight: 2, target: 'all', kind: 'status', element: 'sombra', power: 0.35,
      status: { id: 'envenenado', turns: 3, chance: 0.5 }, es: '{N} va a apestar a todos.', enText: '{N} is going to stink everyone out.', icon: '🌀',
    }),
  ],
});
enemy({
  id: 'pan_duro', name: 'pan duro', art: 'el', en: 'Stale Bread', sprite: 'pan_duro',
  hp: 60, atk: 13, def: 16, spd: 5, weak: ['agua'], resist: ['fisico'], xp: 18, euros: 12,
  drops: [{ item: 'bocadillo', chance: 0.2 }],
  desc: ['Pan de hace una semana. Duro como una piedra. El agua lo ablanda.', 'Week-old bread, hard as a rock. Water softens it.'],
  actions: [
    A({ id: 'golpe', name: 'Barrazo', en: 'Loaf Slam', weight: 3, es: '{N} va a golpear a {T}.', enText: '{N} is going to hit {T}.' }),
    A({
      id: 'endurecer', name: 'Endurecerse', en: 'Harden', target: 'self', kind: 'buff', status: { id: 'escudo', turns: 3, chance: 1 },
      es: '{N} va a ponerse más duro.', enText: '{N} is going to get even harder.', icon: '🛡️',
    }),
  ],
});
enemy({
  id: 'gloton', name: 'Glotón', art: 'el', en: 'The Glutton', sprite: 'gloton', boss: true, statusResist: 0.35,
  hp: 380, atk: 17, def: 12, spd: 8, weak: ['hielo'], resist: ['fuego'], xp: 140, euros: 120,
  desc: ['Se come las palabras de la comida. Siempre tiene hambre.', 'It eats the words for food. Always hungry.'],
  actions: [
    A({ id: 'morder', name: 'Bocado', en: 'Chomp', weight: 3, power: 1.15, es: '{N} va a morder a {T}.', enText: '{N} is going to bite {T}.' }),
    A({
      id: 'hambre', name: 'Hambre', en: 'Hunger', weight: 2, target: 'self', kind: 'charge', next: 'tragar',
      es: '{N} tiene muchísima hambre… se relame.', enText: '{N} is ravenous… it licks its lips.', icon: '⚠️',
    }),
    A({
      id: 'tragar', name: 'Tragar', en: 'Swallow', chargedOnly: true, power: 2.3,
      es: '¡{N} va a comerse a {T}!', enText: '{N} is going to eat {T}!', icon: '💥',
    }),
    A({
      id: 'comer', name: 'Merienda', en: 'Snack', weight: 2, target: 'self', kind: 'heal', heal: 0.12, when: 'hurt',
      es: '{N} va a comer algo.', enText: '{N} is going to eat something.', icon: '💚',
    }),
    A({
      id: 'eructo', name: 'Eructo', en: 'Burp', weight: 2, target: 'all', element: 'viento', power: 0.8,
      status: { id: 'debil', turns: 2, chance: 0.4 }, es: '¡{N} va a eructar!', enText: '{N} is going to burp!', icon: '💨',
    }),
  ],
});

// ================================================================ El Bosque
enemy({
  id: 'lobo', name: 'lobo', art: 'el', en: 'Wolf', sprite: 'lobo',
  hp: 70, atk: 19, def: 10, spd: 14, weak: ['fuego'], resist: [], xp: 30, euros: 16,
  drops: [{ item: 'empanada', chance: 0.15 }],
  desc: ['Un lobo gris y silencioso. Caza en grupo.', 'A grey, silent wolf. It hunts in packs.'],
  actions: [
    A({ id: 'mordisco', name: 'Mordisco', en: 'Bite', weight: 3, es: '{N} va a morder a {T}.', enText: '{N} is going to bite {T}.' }),
    A({
      id: 'aullido', name: 'Aullido', en: 'Howl', target: 'allies', kind: 'buff', status: { id: 'fuerte', turns: 3, chance: 1 },
      es: '{N} va a aullar.', enText: '{N} is going to howl.', icon: '📣',
    }),
  ],
});
enemy({
  id: 'arana', name: 'araña', art: 'la', en: 'Spider', sprite: 'arana',
  hp: 58, atk: 17, def: 9, spd: 12, weak: ['fuego', 'viento'], resist: [], xp: 28, euros: 14,
  drops: [{ item: 'te', chance: 0.3 }],
  desc: ['Una araña enorme. Su telaraña te hace lento.', 'A huge spider. Its web slows you down.'],
  actions: [
    A({
      id: 'picar', name: 'Picadura', en: 'Bite', weight: 3, status: { id: 'envenenado', turns: 3, chance: 0.4 },
      es: '{N} va a picar a {T}.', enText: '{N} is going to bite {T}.',
    }),
    A({
      id: 'telarana', name: 'Telaraña', en: 'Web', weight: 2, kind: 'status', power: 0.3, status: { id: 'lento', turns: 3, chance: 0.9 },
      es: '{N} va a lanzar una telaraña a {T}.', enText: '{N} is going to throw a web at {T}.', icon: '🕸️',
    }),
  ],
});
enemy({
  id: 'seta', name: 'seta venenosa', art: 'la', en: 'Poison Mushroom', sprite: 'seta',
  hp: 50, atk: 15, def: 8, spd: 7, weak: ['fuego'], resist: ['agua'], xp: 26, euros: 12,
  desc: ['¡No te la comas! Sus esporas dan sueño.', "Don't eat it! Its spores make you sleepy."],
  actions: [
    A({ id: 'golpe', name: 'Cabezazo', en: 'Headbutt', weight: 2, es: '{N} va a golpear a {T}.', enText: '{N} is going to hit {T}.' }),
    A({
      id: 'esporas', name: 'Esporas', en: 'Spores', weight: 2, target: 'all', kind: 'status', power: 0.25,
      status: { id: 'dormido', turns: 2, chance: 0.3 }, es: '{N} va a soltar esporas.', enText: '{N} is going to release spores.', icon: '💤',
    }),
  ],
});
enemy({
  id: 'buho', name: 'búho', art: 'el', en: 'Owl', sprite: 'buho',
  hp: 55, atk: 16, def: 9, spd: 15, weak: ['rayo', 'viento'], resist: [], xp: 28, euros: 15,
  desc: ['Un búho con ojos enormes. Te mira sin parpadear.', 'An owl with enormous eyes. It stares without blinking.'],
  actions: [
    A({ id: 'picotazo', name: 'Picotazo', en: 'Peck', weight: 3, es: '{N} va a picotear a {T}.', enText: '{N} is going to peck {T}.' }),
    A({
      id: 'mirada', name: 'Mirada', en: 'Stare', weight: 1, kind: 'status', power: 0, status: { id: 'aturdido', turns: 1, chance: 0.6 },
      es: '{N} va a mirar fijamente a {T}.', enText: '{N} is going to stare at {T}.', icon: '👁️',
    }),
  ],
});
enemy({
  id: 'serpiente', name: 'serpiente', art: 'la', en: 'Snake', sprite: 'serpiente',
  hp: 64, atk: 18, def: 10, spd: 13, weak: ['hielo'], resist: [], xp: 30, euros: 15,
  desc: ['Una serpiente verde. Muerde rápido.', 'A green snake. It bites fast.'],
  actions: [
    A({
      id: 'morder', name: 'Mordedura', en: 'Bite', weight: 3, status: { id: 'envenenado', turns: 3, chance: 0.5 },
      es: '{N} va a morder a {T}.', enText: '{N} is going to bite {T}.',
    }),
    A({
      id: 'enrollarse', name: 'Enroscarse', en: 'Coil', target: 'self', kind: 'buff', status: { id: 'fuerte', turns: 3, chance: 1 },
      es: '{N} va a enroscarse.', enText: '{N} is going to coil up.', icon: '💪',
    }),
  ],
});
enemy({
  id: 'lobezno', name: 'lobezno', art: 'el', en: 'Wolf Cub', sprite: 'lobezno',
  hp: 45, atk: 14, def: 7, spd: 15, weak: ['fuego'], resist: [], xp: 15, euros: 5,
  desc: ['Un lobo pequeño. Está asustado.', 'A little wolf. It is scared.'],
  actions: [A({ id: 'mordisco', name: 'Mordisquito', en: 'Nibble', weight: 1, es: '{N} va a morder a {T}.', enText: '{N} is going to bite {T}.' })],
});
enemy({
  id: 'loba', name: 'Loba Gris', art: 'la', en: 'The Grey She-Wolf', sprite: 'loba', boss: true, statusResist: 0.3,
  hp: 620, atk: 23, def: 14, spd: 15, weak: ['fuego', 'luz'], resist: ['hielo'], xp: 300, euros: 200,
  desc: ['La madre del bosque. Está triste y enfadada: el Silencio se llevó a sus lobeznos.', 'Mother of the forest. Sad and angry: the Silence took her cubs.'],
  actions: [
    A({ id: 'mordisco', name: 'Mordisco', en: 'Bite', weight: 3, power: 1.15, es: '{N} va a morder a {T}.', enText: '{N} is going to bite {T}.' }),
    A({
      id: 'luna', name: 'Aullido a la luna', en: 'Moon Howl', weight: 1, target: 'self', kind: 'summon', summon: 'lobezno', when: 'canSummon',
      es: '{N} va a aullar a la luna.', enText: '{N} is going to howl at the moon.', icon: '📣',
    }),
    A({
      id: 'agacharse', name: 'Agacharse', en: 'Crouch', weight: 2, target: 'self', kind: 'charge', next: 'salto',
      es: '{N} se agacha… se prepara para saltar.', enText: '{N} crouches… getting ready to pounce.', icon: '⚠️',
    }),
    A({ id: 'salto', name: 'Gran Salto', en: 'Pounce', chargedOnly: true, power: 2.4, es: '¡{N} va a saltar sobre {T}!', enText: '{N} is going to pounce on {T}!', icon: '💥' }),
    A({
      id: 'zarpazo', name: 'Zarpazo', en: 'Claw Sweep', weight: 2, target: 'all', power: 0.85,
      es: '{N} va a arañar a todos.', enText: '{N} is going to claw everyone.', icon: '💥',
    }),
  ],
});

// ================================================================ La Montaña
enemy({
  id: 'murcielago', name: 'murciélago', art: 'el', en: 'Bat', sprite: 'murcielago',
  hp: 70, atk: 22, def: 10, spd: 18, weak: ['luz', 'rayo'], resist: ['sombra'], xp: 45, euros: 20,
  desc: ['Vive en las cuevas de la montaña. Chilla muy fuerte.', 'It lives in mountain caves. It screeches very loudly.'],
  actions: [
    A({ id: 'mordisco', name: 'Mordisco', en: 'Bite', weight: 3, es: '{N} va a morder a {T}.', enText: '{N} is going to bite {T}.' }),
    A({
      id: 'chillido', name: 'Chillido', en: 'Screech', weight: 1, target: 'all', power: 0.5, status: { id: 'aturdido', turns: 1, chance: 0.2 },
      es: '{N} va a chillar.', enText: '{N} is going to screech.', icon: '📣',
    }),
  ],
});
enemy({
  id: 'cabra', name: 'cabra loca', art: 'la', en: 'Crazy Goat', sprite: 'cabra',
  hp: 95, atk: 26, def: 14, spd: 12, weak: ['rayo'], resist: ['hielo'], xp: 50, euros: 22,
  drops: [{ item: 'empanada', chance: 0.25 }],
  desc: ['Está como una cabra… porque es una cabra.', "It's “como una cabra” (nuts)… because it is a goat."],
  actions: [
    A({ id: 'embestir', name: 'Embestida', en: 'Ram', weight: 3, power: 1.2, es: '{N} va a embestir a {T}.', enText: '{N} is going to ram {T}.' }),
    A({
      id: 'balar', name: 'Balido', en: 'Bleat', weight: 1, target: 'self', kind: 'buff', status: { id: 'rapido', turns: 3, chance: 1 },
      es: '{N} va a balar como loca.', enText: '{N} is going to bleat like crazy.', icon: '💨',
    }),
  ],
});
enemy({
  id: 'roca', name: 'roca viva', art: 'la', en: 'Living Rock', sprite: 'roca',
  hp: 120, atk: 27, def: 26, spd: 5, weak: ['agua', 'hielo'], resist: ['fisico', 'fuego'], xp: 55, euros: 25,
  desc: ['Una roca que camina. Los golpes no le hacen casi nada.', 'A walking rock. Blows barely hurt it.'],
  actions: [
    A({ id: 'aplastar', name: 'Aplastar', en: 'Crush', weight: 3, power: 1.1, es: '{N} va a aplastar a {T}.', enText: '{N} is going to crush {T}.' }),
    A({
      id: 'endurecer', name: 'Endurecerse', en: 'Harden', target: 'self', kind: 'buff', status: { id: 'escudo', turns: 3, chance: 1 },
      es: '{N} va a endurecerse.', enText: '{N} is going to harden.', icon: '🛡️',
    }),
  ],
});
enemy({
  id: 'fantasma', name: 'fantasma', art: 'el', en: 'Ghost', sprite: 'fantasma',
  hp: 80, atk: 24, def: 12, spd: 14, weak: ['luz'], resist: ['fisico', 'sombra'], xp: 50, euros: 20,
  drops: [{ item: 'horchata', chance: 0.25 }],
  desc: ['Un monje que olvidó todas sus palabras.', 'A monk who forgot all his words.'],
  actions: [
    A({
      id: 'tocar', name: 'Mano helada', en: 'Icy Hand', weight: 3, element: 'hielo', es: '{N} va a tocar a {T}.', enText: '{N} is going to touch {T}.',
    }),
    A({
      id: 'asustar', name: 'Susto', en: 'Scare', weight: 1, kind: 'status', element: 'sombra', power: 0.4, status: { id: 'debil', turns: 3, chance: 0.7 },
      es: '{N} va a asustar a {T}.', enText: '{N} is going to scare {T}.', icon: '🌀',
    }),
    A({
      id: 'callar', name: 'Silenciar', en: 'Silence', weight: 1, kind: 'status', element: 'sombra', power: 0.3, status: { id: 'mudo', turns: 2, chance: 0.6 },
      es: '{N} va a robar la voz a {T}.', enText: "{N} is going to steal {T}'s voice.", icon: '🤐',
    }),
  ],
});
enemy({
  id: 'aguila', name: 'águila', art: 'el', en: 'Eagle', sprite: 'aguila',
  hp: 85, atk: 25, def: 11, spd: 20, weak: ['rayo', 'hielo'], resist: ['viento'], xp: 52, euros: 24,
  desc: ['El águila de la montaña. Ataca desde el cielo.', 'The mountain eagle. It strikes from the sky.'],
  actions: [
    A({ id: 'picado', name: 'En picado', en: 'Dive', weight: 3, power: 1.15, es: '{N} va a atacar a {T} desde el cielo.', enText: '{N} is going to dive at {T} from the sky.' }),
    A({
      id: 'viento', name: 'Aleteo', en: 'Gust', weight: 1, target: 'all', element: 'viento', power: 0.6,
      es: '{N} va a batir las alas.', enText: '{N} is going to beat its wings.', icon: '🌪️',
    }),
  ],
});
enemy({
  id: 'golem', name: 'Gólem', art: 'el', en: 'The Stone Golem', sprite: 'golem', boss: true, statusResist: 0.25,
  hp: 980, atk: 31, def: 26, spd: 7, weak: ['agua', 'rayo'], resist: ['fisico', 'fuego'], xp: 460, euros: 300,
  desc: ['El guardián del templo. Nadie le ha dicho que la guerra terminó.', 'Guardian of the temple. No one told it the war is over.'],
  actions: [
    A({ id: 'golpe', name: 'Puñetazo', en: 'Punch', weight: 3, power: 1.1, es: '{N} va a golpear a {T}.', enText: '{N} is going to punch {T}.' }),
    A({
      id: 'piedra', name: 'Lanzar piedra', en: 'Rock Throw', weight: 2, element: 'tierra', power: 1.3, status: { id: 'aturdido', turns: 1, chance: 0.25 },
      es: '{N} va a lanzar una piedra a {T}.', enText: '{N} is going to throw a rock at {T}.', icon: '🪨',
    }),
    A({
      id: 'cargar', name: 'Cargar energía', en: 'Charge Up', weight: 2, target: 'self', kind: 'charge', next: 'terremoto',
      es: '{N} está cargando energía… el suelo tiembla.', enText: '{N} is charging up… the ground shakes.', icon: '⚠️',
    }),
    A({
      id: 'terremoto', name: 'Terremoto', en: 'Earthquake', chargedOnly: true, target: 'all', element: 'tierra', power: 1.7,
      es: '¡{N} va a hacer temblar la tierra!', enText: '{N} is going to make the earth shake!', icon: '💥',
    }),
    A({
      id: 'reparar', name: 'Repararse', en: 'Repair', target: 'self', kind: 'heal', heal: 0.08, when: 'hurt',
      es: '{N} va a repararse.', enText: '{N} is going to repair itself.', icon: '💚',
    }),
  ],
});

// ================================================================ La Torre Muda
enemy({
  id: 'sombra', name: 'sombra', art: 'la', en: 'Shadow', sprite: 'sombra',
  hp: 110, atk: 31, def: 15, spd: 16, weak: ['luz'], resist: ['sombra', 'fisico'], xp: 75, euros: 30,
  drops: [{ item: 'horchata', chance: 0.2 }],
  desc: ['Una persona sin palabras. Solo queda su sombra.', 'A person without words. Only their shadow remains.'],
  actions: [
    A({ id: 'golpe', name: 'Golpe oscuro', en: 'Dark Strike', weight: 3, element: 'sombra', es: '{N} va a atacar a {T}.', enText: '{N} is going to attack {T}.' }),
    A({
      id: 'esconderse', name: 'Ocultarse', en: 'Hide', target: 'self', kind: 'buff', status: { id: 'escudo', turns: 2, chance: 1 },
      es: '{N} va a esconderse en la oscuridad.', enText: '{N} is going to hide in the dark.', icon: '🛡️',
    }),
  ],
});
enemy({
  id: 'eco', name: 'eco', art: 'el', en: 'Echo', sprite: 'eco',
  hp: 95, atk: 30, def: 14, spd: 17, weak: ['luz', 'viento'], resist: ['sombra'], xp: 72, euros: 28,
  desc: ['Repite las últimas palabras que oyó. Para siempre.', 'It repeats the last words it heard. Forever.'],
  actions: [
    A({
      id: 'grito', name: 'Eco eco eco', en: 'Echo Echo', weight: 3, target: 'all', element: 'sombra', power: 0.75,
      es: '{N} va a gritar muy fuerte.', enText: '{N} is going to shout very loudly.', icon: '📣',
    }),
    A({
      id: 'callar', name: 'Silenciar', en: 'Silence', weight: 2, kind: 'status', element: 'sombra', power: 0.4, status: { id: 'mudo', turns: 2, chance: 0.7 },
      es: '{N} va a callar a {T}.', enText: '{N} is going to silence {T}.', icon: '🤐',
    }),
  ],
});
enemy({
  id: 'caballero', name: 'caballero mudo', art: 'el', en: 'Silent Knight', sprite: 'caballero',
  hp: 165, atk: 35, def: 24, spd: 10, weak: ['rayo', 'luz'], resist: ['fisico'], xp: 90, euros: 40,
  drops: [{ item: 'empanada', chance: 0.3 }],
  desc: ['Un caballero de la torre. No dice nada. Nunca.', 'A knight of the tower. Says nothing. Ever.'],
  actions: [
    A({ id: 'corte', name: 'Corte', en: 'Slash', weight: 3, power: 1.15, es: '{N} va a cortar a {T}.', enText: '{N} is going to slash {T}.' }),
    A({
      id: 'escudo', name: 'Alzar escudo', en: 'Raise Shield', target: 'self', kind: 'buff', status: { id: 'escudo', turns: 2, chance: 1 },
      es: '{N} va a levantar su escudo.', enText: '{N} is going to raise its shield.', icon: '🛡️',
    }),
    A({
      id: 'preparar', name: 'Guardia alta', en: 'High Guard', target: 'self', kind: 'charge', next: 'tajo',
      es: '{N} levanta la espada…', enText: '{N} raises its sword…', icon: '⚠️',
    }),
    A({ id: 'tajo', name: 'Gran Tajo', en: 'Great Slash', chargedOnly: true, target: 'all', power: 1.4, es: '¡{N} va a cortar a todos!', enText: '{N} is going to slash everyone!', icon: '💥' }),
  ],
});
enemy({
  id: 'libro', name: 'libro maldito', art: 'el', en: 'Cursed Book', sprite: 'libro',
  hp: 100, atk: 30, def: 16, spd: 13, weak: ['fuego'], resist: ['sombra'], xp: 80, euros: 35,
  drops: [{ item: 'horchata', chance: 0.35 }],
  desc: ['Un libro sin palabras. Quiere las tuyas.', 'A book with no words. It wants yours.'],
  actions: [
    A({ id: 'fuego', name: 'Llama negra', en: 'Black Flame', weight: 2, element: 'fuego', power: 1.1, status: { id: 'quemado', turns: 3, chance: 0.4 }, es: '{N} va a quemar a {T}.', enText: '{N} is going to burn {T}.', icon: '🔥' }),
    A({
      id: 'borrar', name: 'Borrar', en: 'Erase', weight: 2, kind: 'status', element: 'sombra', power: 0.4, status: { id: 'mudo', turns: 2, chance: 0.8 },
      es: '{N} va a borrar las palabras de {T}.', enText: "{N} is going to erase {T}'s words.", icon: '🤐',
    }),
    A({
      id: 'curar', name: 'Páginas nuevas', en: 'New Pages', target: 'allies', kind: 'heal', heal: 0.2, when: 'allyHurt',
      es: '{N} va a curar a sus aliados.', enText: '{N} is going to heal its allies.', icon: '💚',
    }),
  ],
});
enemy({
  id: 'callado', name: 'Callado', art: 'el', en: 'The Silent One', sprite: 'callado', boss: true, statusResist: 0.2,
  hp: 1500, atk: 37, def: 22, spd: 14, weak: ['luz'], resist: ['sombra'], xp: 0, euros: 0,
  desc: ['Antes era un Palabrista. Perdió su voz… y ahora quiere el silencio para todos.', 'Once a Palabrista. He lost his voice… and now wants silence for everyone.'],
  actions: [
    A({ id: 'golpe', name: 'Golpe mudo', en: 'Mute Strike', weight: 3, element: 'sombra', power: 1.2, es: '{N} va a atacar a {T}.', enText: '{N} is going to attack {T}.' }),
    A({
      id: 'silenciar', name: 'Silencio', en: 'Silence', weight: 2, target: 'all', kind: 'status', element: 'sombra', power: 0.4,
      status: { id: 'mudo', turns: 2, chance: 0.4 }, es: '{N} va a silenciar a todos.', enText: '{N} is going to silence everyone.', icon: '🤐',
    }),
    A({
      id: 'concentrar', name: 'Concentrarse', en: 'Focus', weight: 2, target: 'self', kind: 'charge', next: 'gran_silencio',
      es: '{N} cierra los ojos… todo se queda en silencio.', enText: '{N} closes his eyes… everything goes silent.', icon: '⚠️',
    }),
    A({
      id: 'gran_silencio', name: 'El Gran Silencio', en: 'The Great Silence', chargedOnly: true, target: 'all', element: 'sombra', power: 1.75,
      es: '¡{N} va a lanzar el Gran Silencio!', enText: '{N} is going to unleash the Great Silence!', icon: '💥',
    }),
    A({
      id: 'sombras', name: 'Llamar sombras', en: 'Call Shadows', target: 'self', kind: 'summon', summon: 'sombra', when: 'canSummon',
      es: '{N} va a llamar a las sombras.', enText: '{N} is going to call the shadows.', icon: '📣',
    }),
  ],
});

/** Training dummy for the tutorial and the practice arena: harmless. */
enemy({
  id: 'muneco', name: 'muñeco de paja', art: 'el', en: 'Straw Dummy', sprite: 'muneco', statusResist: 1,
  hp: 999, atk: 0, def: 0, spd: 5, weak: [], resist: [], xp: 16, euros: 0,
  desc: ['El muñeco de práctica de la abuela. No hace nada.', "Grandma's practice dummy. It does nothing."],
  actions: [
    A({ id: 'nada', name: 'Nada', en: 'Nothing', target: 'self', kind: 'buff', power: 0, es: '{N} no va a hacer nada.', enText: '{N} is going to do nothing.', icon: '😶' }),
  ],
});

export function enemySubject(def: EnemyDef, suffix = ''): string {
  return `${def.art === 'el' ? 'El' : 'La'} ${def.name}${suffix}`;
}
