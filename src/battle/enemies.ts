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
  hp: 900, atk: 28, def: 26, spd: 7, weak: ['agua', 'rayo'], resist: ['fisico', 'fuego'], xp: 460, euros: 300,
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
  hp: 1380, atk: 33, def: 22, spd: 14, weak: ['luz'], resist: ['sombra'], xp: 0, euros: 0,
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

// ================================================================ Act II · La Mancha
enemy({
  id: 'oveja_negra', name: 'oveja negra', art: 'la', en: 'Black Sheep', sprite: 'oveja_negra',
  hp: 150, atk: 33, def: 18, spd: 12, weak: ['fuego', 'rayo'], resist: [], xp: 70, euros: 30,
  drops: [{ item: 'queso_manchego', chance: 0.15 }],
  desc: ['La oveja negra del rebaño. Si la cuentas, te duermes.', 'The black sheep of the flock. Count it and you fall asleep.'],
  actions: [
    A({ id: 'embestida', name: 'Embestida', en: 'Ram', weight: 3, power: 1.1, es: '{N} va a embestir a {T}.', enText: '{N} is going to ram {T}.' }),
    A({
      id: 'balido', name: '¡Beee!', en: 'Baa!', weight: 2, target: 'all', kind: 'status', power: 0.3,
      status: { id: 'dormido', turns: 2, chance: 0.3 }, es: '{N} va a balar: ¡beee! Una oveja, dos ovejas…', enText: '{N} is going to bleat: baa! One sheep, two sheep…', icon: '💤',
    }),
  ],
});
enemy({
  id: 'aspa', name: 'aspa', art: 'el', en: 'Windmill Sail', sprite: 'aspa',
  hp: 135, atk: 35, def: 16, spd: 18, weak: ['fuego'], resist: ['viento'], xp: 68, euros: 28,
  desc: ['Un aspa de molino que gira sola. Es femenina, pero se dice «el aspa», como «el agua».', 'A windmill sail spinning on its own. It’s feminine, but you say “el aspa”, like “el agua”.'],
  actions: [
    A({ id: 'giro', name: 'Giro', en: 'Spin', weight: 3, es: '{N} va a girar contra {T}.', enText: '{N} is going to spin into {T}.' }),
    A({
      id: 'remolino', name: 'Remolino', en: 'Whirlwind', weight: 2, target: 'all', element: 'viento', power: 0.7,
      status: { id: 'lento', turns: 2, chance: 0.25 }, es: '{N} va a levantar un remolino.', enText: '{N} is going to whip up a whirlwind.', icon: '🌪️',
    }),
  ],
});
enemy({
  id: 'polvo', name: 'polvo', art: 'el', en: 'Dust Devil', sprite: 'polvo',
  hp: 120, atk: 34, def: 14, spd: 20, weak: ['agua', 'hielo'], resist: ['fisico', 'viento'], xp: 66, euros: 26,
  desc: ['El polvo del camino, con mal humor. Se te mete en los ojos.', 'The dust of the road, in a bad mood. It gets in your eyes.'],
  actions: [
    A({ id: 'arena', name: 'Polvareda', en: 'Dust Cloud', weight: 3, element: 'tierra', es: '{N} va a echar polvo a {T}.', enText: '{N} is going to throw dust at {T}.', icon: '🟫' }),
    A({
      id: 'cegar', name: 'Cegar', en: 'Blind', weight: 2, kind: 'status', element: 'tierra', power: 0.4,
      status: { id: 'debil', turns: 2, chance: 0.6 }, es: '{N} va a meterse en los ojos de {T}.', enText: "{N} is going to get in {T}'s eyes.", icon: '🌀',
    }),
  ],
});
enemy({
  id: 'borrador', name: 'borrador', art: 'el', en: 'Eraser', sprite: 'borrador',
  hp: 165, atk: 34, def: 20, spd: 13, weak: ['luz', 'fuego'], resist: ['sombra'], xp: 78, euros: 34,
  drops: [{ item: 'horchata', chance: 0.3 }],
  desc: ['Un sirviente de la Dama Gris. Todo lo que toca, se olvida.', 'A servant of the Grey Lady. Whatever it touches is forgotten.'],
  actions: [
    A({ id: 'golpe', name: 'Golpe gris', en: 'Grey Strike', weight: 3, element: 'sombra', es: '{N} va a golpear a {T}.', enText: '{N} is going to hit {T}.' }),
    A({
      id: 'borrar', name: 'Borrar', en: 'Erase', weight: 2, kind: 'status', element: 'sombra', power: 0.4, status: { id: 'mudo', turns: 2, chance: 0.6 },
      es: '{N} va a borrar las palabras de {T}.', enText: "{N} is going to erase {T}'s words.", icon: '🤐',
    }),
    A({
      id: 'goma', name: 'Goma nueva', en: 'Fresh Rubber', target: 'self', kind: 'heal', heal: 0.15, when: 'hurt',
      es: '{N} va a recomponerse.', enText: '{N} is going to pull itself back together.', icon: '💚',
    }),
  ],
});
enemy({
  id: 'gigante', name: 'Gigante', art: 'el', en: 'The Giant', sprite: 'gigante', boss: true, statusResist: 0.25,
  hp: 1400, atk: 35, def: 24, spd: 9, weak: ['fuego', 'rayo'], resist: ['viento', 'tierra'], xp: 620, euros: 360,
  desc: ['«No son molinos, son gigantes», decía Don Quijote. Esta vez, tenía razón.', '“They aren’t windmills, they’re giants,” said Don Quixote. This time, he was right.'],
  actions: [
    A({ id: 'aspazo', name: 'Aspazo', en: 'Sail Smash', weight: 3, power: 1.15, es: '{N} va a golpear a {T} con un aspa.', enText: '{N} is going to smash {T} with a sail.' }),
    A({
      id: 'harina', name: 'Nube de harina', en: 'Flour Cloud', weight: 2, target: 'all', kind: 'status', power: 0.35,
      status: { id: 'debil', turns: 2, chance: 0.45 }, es: '{N} va a soltar una nube de harina.', enText: '{N} is going to release a cloud of flour.', icon: '🌫️',
    }),
    A({
      id: 'girar', name: 'Girar y girar', en: 'Wind Up', weight: 2, target: 'self', kind: 'charge', next: 'gran_giro',
      es: '{N} empieza a girar cada vez más rápido…', enText: '{N} starts spinning faster and faster…', icon: '⚠️',
    }),
    A({
      id: 'gran_giro', name: 'Gran Giro', en: 'Great Spin', chargedOnly: true, target: 'all', element: 'viento', power: 1.7,
      es: '¡{N} va a golpear a todos con sus cuatro brazos!', enText: '{N} is going to hit everyone with its four arms!', icon: '💥',
    }),
    A({
      id: 'llamar', name: 'Aspas sueltas', en: 'Loose Sails', target: 'self', kind: 'summon', summon: 'aspa', when: 'canSummon',
      es: '{N} va a soltar un aspa.', enText: '{N} is going to throw off a sail.', icon: '📣',
    }),
  ],
});

// ================================================================ Act II · Valencia
enemy({
  id: 'petardo', name: 'petardo', art: 'el', en: 'Firecracker', sprite: 'petardo',
  hp: 115, atk: 38, def: 16, spd: 19, weak: ['agua'], resist: ['fuego'], xp: 76, euros: 30,
  desc: ['Un petardo con muy mal genio. Más vale prevenir que curar.', 'A firecracker with a very short temper. Better safe than sorry.'],
  actions: [
    A({
      id: 'chispa', name: 'Chispazo', en: 'Spark', weight: 3, element: 'fuego', power: 0.9, status: { id: 'quemado', turns: 3, chance: 0.35 },
      es: '{N} va a soltar chispas sobre {T}.', enText: '{N} is going to spray sparks at {T}.', icon: '🔥',
    }),
    A({
      id: 'mecha', name: 'Mecha encendida', en: 'Lit Fuse', weight: 1, target: 'self', kind: 'charge', next: 'petar', when: 'hurt',
      es: 'La mecha de {N} se está quemando… ¡ssss!', enText: "{N}'s fuse is burning… hissss!", icon: '⚠️',
    }),
    A({
      id: 'petar', name: '¡PUM!', en: 'BANG!', chargedOnly: true, target: 'all', kind: 'explode', element: 'fuego', power: 1.4,
      es: '¡{N} va a explotar!', enText: '{N} is going to explode!', icon: '💥',
    }),
  ],
});
enemy({
  id: 'ninot', name: 'ninot', art: 'el', en: 'Ninot', sprite: 'ninot',
  hp: 200, atk: 38, def: 24, spd: 11, weak: ['fuego', 'agua'], resist: ['viento'], xp: 88, euros: 36,
  drops: [{ item: 'farton', chance: 0.25 }],
  desc: ['Una figura de cartón de una falla. La Dama le ha dado vida… y muy mala leche.', 'A papier-mâché figure from a falla. The Lady brought it to life… in a foul mood.'],
  actions: [
    A({ id: 'cartonazo', name: 'Cartonazo', en: 'Cardboard Slam', weight: 3, es: '{N} va a golpear a {T}.', enText: '{N} is going to hit {T}.' }),
    A({
      id: 'burla', name: 'Burla', en: 'Mockery', weight: 2, kind: 'status', power: 0.3, status: { id: 'debil', turns: 2, chance: 0.6 },
      es: '{N} va a burlarse de {T}.', enText: '{N} is going to make fun of {T}.', icon: '🤪',
    }),
    A({
      id: 'posar', name: 'Posar', en: 'Strike a Pose', target: 'self', kind: 'buff', status: { id: 'escudo', turns: 2, chance: 1 },
      es: '{N} va a posar para la foto.', enText: '{N} is going to pose for a photo.', icon: '🛡️',
    }),
  ],
});
enemy({
  id: 'mosquito', name: 'mosquito', art: 'el', en: 'Mosquito', sprite: 'mosquito',
  hp: 120, atk: 37, def: 14, spd: 24, weak: ['viento', 'hielo'], resist: [], xp: 80, euros: 28,
  desc: ['El mosquito de la Albufera. ¡Bzzz! Nunca duerme, y tú tampoco.', 'The mosquito of the Albufera lagoon. Bzzz! It never sleeps, and neither will you.'],
  actions: [
    A({
      id: 'picar', name: 'Picadura', en: 'Bite', weight: 3, status: { id: 'envenenado', turns: 3, chance: 0.4 },
      es: '{N} va a picar a {T}.', enText: '{N} is going to bite {T}.', icon: '🦟',
    }),
    A({
      id: 'zumbido', name: 'Zumbido', en: 'Buzz', weight: 2, target: 'all', kind: 'status', power: 0.25, status: { id: 'lento', turns: 2, chance: 0.4 },
      es: '{N} va a zumbar en las orejas de todos. ¡Bzzz!', enText: "{N} is going to buzz in everyone's ears. Bzzz!", icon: '🌀',
    }),
  ],
});
enemy({
  id: 'naranja', name: 'naranja amarga', art: 'la', en: 'Bitter Orange', sprite: 'naranja',
  hp: 175, atk: 39, def: 22, spd: 12, weak: ['hielo', 'rayo'], resist: ['agua'], xp: 84, euros: 34,
  drops: [{ item: 'horchata', chance: 0.25 }],
  desc: ['Las naranjas de los árboles de la calle son amargas. Esta, además, está enfadada.', 'The oranges on the street trees are bitter. This one is angry, too.'],
  actions: [
    A({ id: 'rodar', name: 'Rodar', en: 'Roll', weight: 3, power: 1.1, es: '{N} va a rodar sobre {T}.', enText: '{N} is going to roll over {T}.' }),
    A({
      id: 'zumo', name: 'Zumo ácido', en: 'Sour Juice', weight: 2, element: 'agua', power: 0.8, status: { id: 'debil', turns: 2, chance: 0.4 },
      es: '{N} va a echar zumo en los ojos de {T}.', enText: "{N} is going to squirt juice in {T}'s eyes.", icon: '🍊',
    }),
  ],
});
enemy({
  id: 'gran_falla', name: 'Gran Falla', art: 'la', en: 'The Great Falla', sprite: 'gran_falla', boss: true, statusResist: 0.25,
  hp: 1900, atk: 40, def: 26, spd: 10, weak: ['fuego'], resist: ['fisico', 'sombra'], xp: 800, euros: 450,
  desc: ['Un rey de cartón de diez metros. Una página gris le late en el pecho.', 'A cardboard king ten metres tall. A grey page beats in his chest.'],
  actions: [
    A({ id: 'cetro', name: 'Cetrazo', en: 'Sceptre Blow', weight: 3, power: 1.2, status: { id: 'aturdido', turns: 1, chance: 0.2 }, es: '{N} va a golpear a {T} con el cetro.', enText: '{N} is going to strike {T} with the sceptre.' }),
    A({
      id: 'confeti', name: 'Lluvia de cartón', en: 'Cardboard Rain', weight: 2, target: 'all', power: 0.6, status: { id: 'lento', turns: 2, chance: 0.3 },
      es: '{N} va a dejar caer trozos de cartón sobre todos.', enText: '{N} is going to drop chunks of cardboard on everyone.', icon: '📦',
    }),
    A({
      id: 'polvora', name: 'Llenarse de pólvora', en: 'Load Gunpowder', weight: 2, target: 'self', kind: 'charge', next: 'mascleta',
      es: '{N} se llena de pólvora… huele a petardo.', enText: '{N} is filling up with gunpowder… it smells of firecrackers.', icon: '⚠️',
    }),
    A({
      id: 'mascleta', name: '¡Mascletà!', en: 'Mascletà!', chargedOnly: true, target: 'all', element: 'fuego', power: 1.75,
      es: '¡{N} va a disparar una mascletà contra todos!', enText: '{N} is going to set off a mascletà at everyone!', icon: '💥',
    }),
    A({
      id: 'ninots', name: 'Llamar ninots', en: 'Call Ninots', target: 'self', kind: 'summon', summon: 'ninot', when: 'canSummon',
      es: '{N} va a llamar a sus ninots.', enText: '{N} is going to call its ninots.', icon: '📣',
    }),
  ],
});

// ================================================================ Act II · Andalucía
enemy({
  id: 'sol', name: 'sol de agosto', art: 'el', en: 'August Sun', sprite: 'sol',
  hp: 175, atk: 43, def: 22, spd: 15, weak: ['agua', 'hielo'], resist: ['fuego', 'luz'], xp: 98, euros: 38,
  drops: [{ item: 'gazpacho', chance: 0.12 }],
  desc: ['El sol de Sevilla en agosto. Cuarenta y cinco grados a la sombra.', 'The Seville sun in August. Forty-five degrees in the shade.'],
  actions: [
    A({
      id: 'rayo', name: 'Solazo', en: 'Scorcher', weight: 3, element: 'fuego', status: { id: 'quemado', turns: 3, chance: 0.3 },
      es: '{N} va a quemar a {T}.', enText: '{N} is going to scorch {T}.', icon: '☀️',
    }),
    A({
      id: 'calor', name: 'Ola de calor', en: 'Heatwave', weight: 2, target: 'all', element: 'fuego', power: 0.55, status: { id: 'debil', turns: 2, chance: 0.4 },
      es: '{N} va a traer una ola de calor. ¡Qué calor!', enText: '{N} is going to bring a heatwave. So hot!', icon: '🥵',
    }),
  ],
});
enemy({
  id: 'abanico', name: 'abanico', art: 'el', en: 'Fan', sprite: 'abanico',
  hp: 180, atk: 41, def: 24, spd: 22, weak: ['fuego'], resist: ['viento'], xp: 94, euros: 36,
  desc: ['Un abanico de flamenca con muy mal carácter. ¡Zas, zas!', 'A flamenco fan with a very bad temper. Swish, swish!'],
  actions: [
    A({ id: 'golpe', name: 'Abanicazo', en: 'Fan Slap', weight: 3, es: '{N} va a golpear a {T}.', enText: '{N} is going to slap {T}.' }),
    A({
      id: 'aire', name: 'Aire fresco', en: 'Cool Breeze', weight: 2, target: 'all', element: 'viento', power: 0.6, status: { id: 'lento', turns: 2, chance: 0.3 },
      es: '{N} va a abanicar a todos.', enText: '{N} is going to fan everyone.', icon: '🌬️',
    }),
    A({
      id: 'abrirse', name: 'Abrirse', en: 'Snap Open', target: 'self', kind: 'buff', status: { id: 'rapido', turns: 3, chance: 1 },
      es: '{N} se va a abrir de golpe.', enText: '{N} is going to snap open.', icon: '💨',
    }),
  ],
});
enemy({
  id: 'castanuela', name: 'castañuela', art: 'la', en: 'Castanet', sprite: 'castanuela',
  hp: 160, atk: 42, def: 26, spd: 20, weak: ['fuego', 'agua'], resist: ['fisico'], xp: 92, euros: 34,
  desc: ['Una castañuela que no para de tocar. Clac, clac, clac.', "A castanet that won't stop playing. Clack, clack, clack."],
  actions: [
    A({ id: 'clac', name: '¡Clac, clac!', en: 'Clack Clack!', weight: 3, power: 1.1, es: '{N} va a morder a {T}: ¡clac!', enText: '{N} is going to snap at {T}: clack!' }),
    A({
      id: 'ritmo', name: 'Ritmo', en: 'Rhythm', weight: 2, target: 'allies', kind: 'buff', status: { id: 'fuerte', turns: 3, chance: 1 },
      es: '{N} va a marcar el ritmo para sus amigos.', enText: '{N} is going to beat out a rhythm for its friends.', icon: '💪',
    }),
  ],
});
enemy({
  id: 'salamanquesa', name: 'salamanquesa', art: 'la', en: 'Gecko', sprite: 'salamanquesa',
  hp: 150, atk: 40, def: 22, spd: 26, weak: ['hielo'], resist: [], xp: 90, euros: 32,
  desc: ['La pequeña salamanquesa de las paredes blancas. Rápida como un rayo.', 'The little gecko of the white walls. Quick as lightning.'],
  actions: [
    A({ id: 'mordisco', name: 'Mordisco', en: 'Bite', weight: 3, es: '{N} va a morder a {T}.', enText: '{N} is going to bite {T}.' }),
    A({
      id: 'pared', name: 'Subir por la pared', en: 'Up the Wall', weight: 1, target: 'self', kind: 'buff', status: { id: 'escudo', turns: 2, chance: 1 },
      es: '{N} va a subir por la pared.', enText: '{N} is going to scurry up the wall.', icon: '🛡️',
    }),
  ],
});
enemy({
  id: 'leon_piedra', name: 'León de Piedra', art: 'el', en: 'The Stone Lion', sprite: 'leon_piedra', boss: true, statusResist: 0.2,
  hp: 2300, atk: 44, def: 30, spd: 11, weak: ['agua', 'rayo'], resist: ['fisico', 'fuego'], xp: 1000, euros: 520,
  desc: ['Uno de los doce leones de la fuente. Una página gris le ha despertado.', 'One of the twelve lions of the fountain. A grey page has woken it up.'],
  actions: [
    A({ id: 'zarpazo', name: 'Zarpazo', en: 'Claw', weight: 3, power: 1.2, es: '{N} va a dar un zarpazo a {T}.', enText: '{N} is going to claw {T}.' }),
    A({
      id: 'chorro', name: 'Chorro de agua', en: 'Water Jet', weight: 2, element: 'agua', power: 1.0, status: { id: 'mojado', turns: 3, chance: 0.7 },
      es: '{N} va a echar agua a {T} por la boca.', enText: '{N} is going to spout water at {T}.', icon: '🌊',
    }),
    A({
      id: 'rugido', name: 'Rugido', en: 'Roar', weight: 2, target: 'all', kind: 'status', power: 0.4, status: { id: 'aturdido', turns: 1, chance: 0.25 },
      es: '{N} va a rugir.', enText: '{N} is going to roar.', icon: '📣',
    }),
    A({
      id: 'agazaparse', name: 'Agazaparse', en: 'Crouch', weight: 2, target: 'self', kind: 'charge', next: 'salto',
      es: '{N} se agazapa… va a saltar.', enText: '{N} crouches low… it is going to pounce.', icon: '⚠️',
    }),
    A({
      id: 'salto', name: 'Gran Salto', en: 'Great Pounce', chargedOnly: true, target: 'all', element: 'tierra', power: 1.75,
      es: '¡{N} va a caer sobre todos!', enText: '{N} is going to land on everyone!', icon: '💥',
    }),
    A({
      id: 'fuente', name: 'Agua de la fuente', en: 'Fountain Water', target: 'self', kind: 'heal', heal: 0.07, when: 'hurt',
      es: '{N} va a beber de la fuente.', enText: '{N} is going to drink from the fountain.', icon: '💚',
    }),
  ],
});

// ================================================================ Act II · Galicia
enemy({
  id: 'trasno', name: 'trasno', art: 'el', en: 'Trasno', sprite: 'trasno',
  hp: 220, atk: 45, def: 26, spd: 22, weak: ['luz'], resist: ['sombra'], xp: 108, euros: 42,
  desc: ['El duende travieso de las casas gallegas. Esconde cosas y se ríe.', 'The mischievous goblin of Galician homes. It hides things and laughs.'],
  actions: [
    A({ id: 'travesura', name: 'Travesura', en: 'Prank', weight: 3, es: '{N} va a hacerle una travesura a {T}.', enText: '{N} is going to play a prank on {T}.' }),
    A({
      id: 'esconder', name: 'Esconder', en: 'Hide It', weight: 2, kind: 'steal', when: 'partyHasItems', target: 'all',
      es: '{N} va a esconder algo de vuestra bolsa.', enText: '{N} is going to hide something from your bag.', icon: '👜',
    }),
  ],
});
enemy({
  id: 'bretema', name: 'brétema', art: 'la', en: 'Sea Fog', sprite: 'bretema',
  hp: 210, atk: 44, def: 24, spd: 14, weak: ['viento', 'fuego'], resist: ['agua', 'fisico'], xp: 104, euros: 40,
  desc: ['La niebla del Atlántico. En gallego se llama «brétema».', 'The Atlantic fog. In Galician it is called «brétema».'],
  actions: [
    A({ id: 'frio', name: 'Frío húmedo', en: 'Damp Chill', weight: 3, element: 'agua', es: '{N} va a envolver a {T} en frío.', enText: '{N} is going to wrap {T} in cold.', icon: '🌫️' }),
    A({
      id: 'espesa', name: 'Niebla espesa', en: 'Thick Fog', weight: 2, target: 'all', kind: 'status', element: 'agua', power: 0.35, status: { id: 'debil', turns: 2, chance: 0.45 },
      es: '{N} se va a hacer más espesa.', enText: '{N} is going to thicken.', icon: '🌀',
    }),
  ],
});
enemy({
  id: 'vela', name: 'vela', art: 'la', en: 'Candle Soul', sprite: 'vela',
  hp: 190, atk: 46, def: 24, spd: 18, weak: ['agua', 'viento'], resist: ['fuego', 'sombra'], xp: 106, euros: 40,
  desc: ['Una vela de la Santa Compaña. Su llama es un alma que ha olvidado su nombre.', 'A candle of the Santa Compaña. Its flame is a soul that has forgotten its name.'],
  actions: [
    A({
      id: 'llama', name: 'Llama pálida', en: 'Pale Flame', weight: 3, element: 'fuego', status: { id: 'quemado', turns: 3, chance: 0.3 },
      es: '{N} va a quemar a {T}.', enText: '{N} is going to burn {T}.', icon: '🕯️',
    }),
    A({
      id: 'alma', name: 'Luz de alma', en: 'Soul Light', target: 'allies', kind: 'heal', heal: 0.15, when: 'allyHurt',
      es: '{N} va a dar luz a sus compañeras.', enText: '{N} is going to share its light with its companions.', icon: '💚',
    }),
  ],
});
enemy({
  id: 'corvo', name: 'corvo', art: 'el', en: 'Crow', sprite: 'corvo',
  hp: 200, atk: 47, def: 25, spd: 25, weak: ['rayo', 'hielo'], resist: ['viento'], xp: 106, euros: 40,
  desc: ['Un cuervo negro. En gallego, «corvo». Lo ve todo desde los pinos.', 'A black crow — «corvo» in Galician. It watches everything from the pines.'],
  actions: [
    A({ id: 'picotazo', name: 'Picotazo', en: 'Peck', weight: 3, power: 1.1, es: '{N} va a picotear a {T}.', enText: '{N} is going to peck {T}.' }),
    A({
      id: 'graznido', name: 'Graznido', en: 'Caw', weight: 1, target: 'all', kind: 'status', power: 0.3, status: { id: 'aturdido', turns: 1, chance: 0.2 },
      es: '{N} va a graznar: ¡cra, cra!', enText: '{N} is going to caw: craw, craw!', icon: '📣',
    }),
  ],
});
enemy({
  id: 'santa_compana', name: 'Santa Compaña', art: 'la', en: 'The Holy Company', sprite: 'santa_compana', boss: true, statusResist: 0.2,
  hp: 2800, atk: 47, def: 30, spd: 12, weak: ['luz', 'fuego'], resist: ['sombra', 'fisico'], xp: 1250, euros: 600,
  desc: ['Una procesión de almas con velas. Esta noche, la Dama Gris la guía.', 'A procession of souls carrying candles. Tonight, the Grey Lady leads it.'],
  actions: [
    A({
      id: 'frio', name: 'Frío del más allá', en: 'Chill of the Beyond', weight: 3, element: 'sombra', power: 1.2, status: { id: 'debil', turns: 2, chance: 0.3 },
      es: '{N} va a tocar a {T} con su frío.', enText: '{N} is going to touch {T} with its chill.',
    }),
    A({
      id: 'lamento', name: 'Lamento', en: 'Lament', weight: 2, target: 'all', kind: 'status', element: 'sombra', power: 0.4, status: { id: 'mudo', turns: 2, chance: 0.35 },
      es: '{N} va a cantar un lamento.', enText: '{N} is going to sing a lament.', icon: '🤐',
    }),
    A({
      id: 'detenerse', name: 'Detenerse', en: 'Halt', weight: 2, target: 'self', kind: 'charge', next: 'procesion',
      es: '{N} se detiene… las velas tiemblan.', enText: '{N} halts… the candles tremble.', icon: '⚠️',
    }),
    A({
      id: 'procesion', name: 'La Procesión', en: 'The Procession', chargedOnly: true, target: 'all', element: 'sombra', power: 1.75,
      es: '¡{N} va a pasar a través de todos!', enText: '{N} is going to pass right through everyone!', icon: '💥',
    }),
    A({
      id: 'velas', name: 'Encender velas', en: 'Light Candles', target: 'self', kind: 'summon', summon: 'vela', when: 'canSummon',
      es: '{N} va a encender más velas.', enText: '{N} is going to light more candles.', icon: '🕯️',
    }),
  ],
});

// ================================================================ Act II · Salamanca
enemy({
  id: 'pagina', name: 'página suelta', art: 'la', en: 'Loose Page', sprite: 'pagina',
  hp: 200, atk: 48, def: 26, spd: 26, weak: ['fuego'], resist: ['viento'], xp: 118, euros: 44,
  desc: ['Una página arrancada del Libro del Olvido. Vuela como un murciélago.', 'A page torn from the Book of Forgetting. It flies like a bat.'],
  actions: [
    A({ id: 'corte', name: 'Corte de papel', en: 'Paper Cut', weight: 3, es: '{N} va a cortar a {T}.', enText: '{N} is going to give {T} a paper cut.' }),
    A({
      id: 'revolotear', name: 'Revolotear', en: 'Flutter', weight: 2, target: 'all', element: 'viento', power: 0.6,
      es: '{N} va a revolotear alrededor de todos.', enText: '{N} is going to flutter around everyone.', icon: '🌀',
    }),
  ],
});
enemy({
  id: 'tintero', name: 'tintero', art: 'el', en: 'Inkwell', sprite: 'tintero',
  hp: 240, atk: 49, def: 28, spd: 14, weak: ['luz', 'rayo'], resist: ['sombra', 'agua'], xp: 122, euros: 46,
  drops: [{ item: 'farton', chance: 0.3 }],
  desc: ['Un tintero antiguo. Su tinta borra en vez de escribir.', 'An old inkwell. Its ink erases instead of writing.'],
  actions: [
    A({
      id: 'mancha', name: 'Mancha de tinta', en: 'Ink Blot', weight: 3, element: 'sombra', power: 1.0, status: { id: 'mudo', turns: 2, chance: 0.35 },
      es: '{N} va a manchar a {T} de tinta.', enText: '{N} is going to splash ink on {T}.', icon: '🖋️',
    }),
    A({
      id: 'charco', name: 'Charco negro', en: 'Black Puddle', weight: 2, target: 'all', kind: 'status', element: 'sombra', power: 0.35, status: { id: 'lento', turns: 2, chance: 0.4 },
      es: '{N} va a derramar su tinta por el suelo.', enText: '{N} is going to spill its ink across the floor.', icon: '🌀',
    }),
  ],
});
enemy({
  id: 'polilla', name: 'polilla', art: 'la', en: 'Moth', sprite: 'polilla',
  hp: 210, atk: 48, def: 25, spd: 24, weak: ['fuego', 'viento'], resist: [], xp: 118, euros: 42,
  desc: ['Una polilla gris que se come los libros. Y las palabras.', 'A grey moth that eats books. And words.'],
  actions: [
    A({ id: 'mordisco', name: 'Mordisquito', en: 'Nibble', weight: 3, es: '{N} va a morder a {T}.', enText: '{N} is going to nibble {T}.' }),
    A({
      id: 'polvo', name: 'Polvo de alas', en: 'Wing Dust', weight: 2, target: 'all', kind: 'status', power: 0.25, status: { id: 'dormido', turns: 2, chance: 0.25 },
      es: '{N} va a sacudir el polvo de sus alas.', enText: '{N} is going to shake the dust off its wings.', icon: '💤',
    }),
  ],
});
enemy({
  id: 'borrador_mayor', name: 'Gran Borrador', art: 'el', en: 'Great Eraser', sprite: 'borrador_mayor', statusResist: 0.5,
  hp: 420, atk: 52, def: 30, spd: 12, weak: ['luz', 'fuego'], resist: ['sombra', 'fisico'], xp: 190, euros: 80,
  drops: [{ item: 'tarta', chance: 0.3 }],
  desc: ['El borrador más grande de la Dama. Borra escaleras enteras.', "The Lady's biggest eraser. It rubs out whole staircases."],
  actions: [
    A({ id: 'aplastar', name: 'Aplastar', en: 'Squash', weight: 3, power: 1.3, es: '{N} va a aplastar a {T}.', enText: '{N} is going to squash {T}.' }),
    A({
      id: 'borrar', name: 'Borrar', en: 'Erase', weight: 2, kind: 'status', element: 'sombra', power: 0.5, status: { id: 'mudo', turns: 2, chance: 0.6 },
      es: '{N} va a borrar las palabras de {T}.', enText: "{N} is going to erase {T}'s words.", icon: '🤐',
    }),
    A({
      id: 'goma', name: 'Goma nueva', en: 'Fresh Rubber', target: 'self', kind: 'heal', heal: 0.12, when: 'hurt',
      es: '{N} va a recomponerse.', enText: '{N} is going to pull itself back together.', icon: '💚',
    }),
  ],
});
enemy({
  id: 'dama_gris', name: 'Dama Gris', art: 'la', en: 'The Grey Lady', sprite: 'dama_gris', boss: true, statusResist: 0.15,
  hp: 4200, atk: 52, def: 32, spd: 14, weak: ['luz'], resist: ['sombra'], xp: 0, euros: 0,
  desc: ['Una mujer hecha de palabras olvidadas. Quiere guardarlas todas en su libro… para siempre.', 'A woman made of forgotten words. She wants to keep them all in her book… forever.'],
  actions: [
    A({
      id: 'borrar', name: 'Borrar', en: 'Erase', weight: 3, element: 'sombra', power: 1.25, status: { id: 'mudo', turns: 2, chance: 0.35 },
      es: '{N} va a borrar a {T} de su libro.', enText: '{N} is going to erase {T} from her book.',
    }),
    A({
      id: 'olvido', name: 'Niebla de olvido', en: 'Mist of Forgetting', weight: 2, target: 'all', kind: 'status', element: 'sombra', power: 0.45, status: { id: 'debil', turns: 2, chance: 0.45 },
      es: '{N} va a hacer que todos olviden.', enText: '{N} is going to make everyone forget.', icon: '🌫️',
    }),
    A({
      id: 'escribir', name: 'Escribir vuestros nombres', en: 'Write Your Names', weight: 2, target: 'self', kind: 'charge', next: 'el_olvido',
      es: '{N} abre su libro y empieza a escribir vuestros nombres…', enText: '{N} opens her book and starts writing your names…', icon: '⚠️',
    }),
    A({
      id: 'el_olvido', name: 'El Olvido', en: 'Oblivion', chargedOnly: true, target: 'all', element: 'sombra', power: 1.85,
      es: '¡{N} va a cerrar el libro sobre todos!', enText: '{N} is going to close the book on everyone!', icon: '💥',
    }),
    A({
      id: 'paginas', name: 'Arrancar páginas', en: 'Tear Pages', target: 'self', kind: 'summon', summon: 'pagina', when: 'canSummon',
      es: '{N} va a arrancar páginas de su libro.', enText: '{N} is going to tear pages from her book.', icon: '📣',
    }),
    A({
      id: 'leer', name: 'Leer en voz baja', en: 'Read Softly', target: 'self', kind: 'heal', heal: 0.05, when: 'hurt',
      es: '{N} va a leer una página en voz baja.', enText: '{N} is going to read a page under her breath.', icon: '💚',
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
