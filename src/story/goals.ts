// The current objective, worked out from the story flags. Shown in the corner
// of the screen at all times so you never have to guess what to do next.

import type { GameState } from '../state';
import type { MapDef } from '../world/types';
import { STOP_BY_ID } from '../world/stops';

export interface Goal {
  es: string;
  en: string;
  /** Where to go: [map, x, y]. The map shows a marker there, or on the exit that leads there. */
  at?: [string, number, number];
}

const count = (g: GameState, keys: string[]) => keys.filter((k) => g.flags[k]).length;
const FLOWERS = ['flor_roja', 'flor_azul', 'flor_amarilla'];
const MONKS = ['monje_mano', 'monje_oreja', 'monje_corazon'];
const NINOTS = ['ninot_cocinera', 'ninot_musico', 'ninot_pintor'];
const NINOT_AT: [number, number][] = [
  [5, 9],
  [12, 9],
  [19, 9],
];
const INGREDIENTS = ['tengo_orujo', 'tengo_limón', 'tengo_café'];
const INGREDIENT_AT: [number, number][] = [
  [5, 12],
  [10, 8],
  [24, 10],
];
const FLOWER_AT: [number, number][] = [
  [5, 9],
  [34, 9],
  [23, 6],
];
const MONK_AT: [number, number][] = [
  [3, 9],
  [18, 9],
  [10, 8],
];

export function currentGoal(g: GameState): Goal | null {
  const f = (k: string) => !!g.flags[k];

  // Prologue and chapter 1
  if (!f('intro_done')) return { es: 'Practica con el muñeco de paja.', en: 'Practise with the straw dummy: walk up to it and press Enter (or A).', at: ['casa_abuela', 8, 5] };
  if (!f('has_bread')) return { es: 'Compra pan en la tienda de Doña Carmen.', en: "Buy bread at Doña Carmen's stall, just south of Grandma's house.", at: ['puerto', 4, 11] };
  if (!f('fog')) return { es: 'Vuelve a casa con el pan.', en: 'Take the bread home to Grandma.', at: ['puerto', 4, 6] };
  if (!f('abuela_silenced')) return { es: 'Corre a casa de la abuela.', en: "Run to Grandma's house!", at: ['casa_abuela', 3, 4] };
  if (!f('mateo_joined')) return { es: 'Busca a Mateo en el muelle.', en: 'Find Mateo on the pier, at the south end of the village.', at: ['puerto', 13, 20] };
  if (!f('gate_cueva')) return { es: 'Ve al faro, al oeste, y abre la puerta de la cueva.', en: 'Go west along the beach to the lighthouse and open the cave gate.', at: ['cueva', 12, 5] };
  if (!f('boss_rey')) return { es: 'Busca la luz del faro en la cueva.', en: "Find the lighthouse's light deep in the cave.", at: ['cueva', 12, 2] };
  if (!f('faro_lit')) return { es: 'Toca el cristal.', en: 'Touch the crystal.', at: ['cueva', 14, 1] };

  // Chapter 2
  if (!f('ch2')) {
    if (!f('ramon_gift')) return { es: 'Habla con Don Ramón y ve al este, a San Sabor.', en: 'Talk to Don Ramón, then take the east road to San Sabor.', at: ['puerto', 22, 15] };
    return { es: 'Ve al este, por el camino a San Sabor.', en: 'Take the east road out of the village to San Sabor.', at: ['camino', 2, 7] };
  }
  if (!f('sansabor_seen')) return { es: 'Sigue el camino hasta San Sabor.', en: 'Follow the road east to San Sabor.', at: ['san_sabor', 2, 12] };
  if (!f('lola_joined')) return { es: 'Busca a la guitarrista en la plaza.', en: 'Find the guitarist by the fountain in the square.', at: ['san_sabor', 18, 12] };
  if (!f('gate_bodega')) return { es: 'Entra en la bodega del panadero y abre la despensa.', en: "Go into the baker's cellar (north-east of the square) and open the pantry door.", at: ['bodega', 11, 5] };
  if (!f('gloton')) return { es: 'Busca al monstruo de la bodega.', en: 'Find the monster in the cellar.', at: ['bodega', 12, 2] };
  if (!f('sabor')) return { es: 'Toca el cristal.', en: 'Touch the crystal.', at: ['bodega', 14, 1] };

  // Chapter 3
  if (!f('ch3')) return { es: 'Ve al norte, al bosque.', en: 'Leave San Sabor by the north road, into the forest.', at: ['bosque', 19, 27] };
  const flowers = count(g, FLOWERS);
  if (flowers < 3) {
    const next = FLOWERS.findIndex((k) => !g.flags[k]);
    return { es: `Devuelve el color a las flores grises (${flowers}/3).`, en: `Bring the colour back to the grey flowers in the forest (${flowers}/3).`, at: ['bosque', ...FLOWER_AT[next]] };
  }
  if (!f('loba')) return { es: 'Cruza las espinas y busca a la loba gris.', en: 'Go north through the thorns and find the grey she-wolf.', at: ['claro', 10, 6] };
  if (!f('color')) return { es: 'Toca el cristal.', en: 'Touch the crystal.', at: ['claro', 10, 4] };

  // Chapter 4
  if (!f('ch4')) return { es: 'Sube al Monte Eco, al norte del claro.', en: 'Head north from the glade to Mount Echo.', at: ['montana', 14, 27] };
  const monks = count(g, MONKS);
  if (monks < 3 && !f('tomas_story') && !monks) return { es: 'Sube la montaña hasta el templo.', en: 'Climb the mountain to the temple.', at: ['templo', 12, 11] };
  if (monks < 3) {
    const next = MONKS.findIndex((k) => !g.flags[k]);
    return { es: `Adivina los gestos de los monjes (${monks}/3).`, en: `Guess what the silent monks are pointing at (${monks}/3) to open the inner gate.`, at: ['templo', ...MONK_AT[next]] };
  }
  if (!f('golem')) return { es: 'Cruza la puerta interior del templo.', en: "Go through the temple's inner gate.", at: ['templo', 10, 2] };
  if (!f('voz')) return { es: 'Toca el cristal.', en: 'Touch the crystal.', at: ['templo', 13, 2] };

  // Chapter 5
  if (!f('ch5')) return { es: 'Entra en la Torre Muda.', en: 'Enter the Mute Tower through the door behind the temple.', at: ['torre1', 10, 12] };
  if (!f('gate_torre1')) return { es: 'Abre la puerta negra.', en: 'Open the black door. (The floating crystals hold memories.)', at: ['torre1', 10, 4] };
  if (!f('gate_torre2')) return { es: 'Abre la segunda puerta.', en: 'Open the second door.', at: ['torre2', 10, 3] };
  if (!f('final')) return { es: 'Sube a la cima. El Callado te espera.', en: 'Climb to the top. El Callado is waiting.', at: ['cima', 8, 3] };
  if (!f('fin')) return null;

  // Act II
  if (!f('act2')) return { es: 'Habla con la abuela en la plaza.', en: 'Talk to everyone at the festival — then to Grandma, in the square.', at: ['puerto', 14, 11] };
  if (!f('ch6')) return { es: 'Toma el tren a La Mancha.', en: 'Go to the station (north of the village) and take the train to La Mancha.', at: ['villamolinos', 4, 9] };

  // Chapter 6
  if (!f('alonso_met')) return { es: 'Busca a Don Alonso en la plaza.', en: 'Find Don Alonso in the village square, in front of his house.', at: ['villamolinos', 27, 11] };
  if (!f('gate_cerro')) return { es: 'Cruza la llanura y abre la puerta del cerro.', en: 'Cross the plain (east of the village) and open the gate up on the ridge.', at: ['cerro', 13, 14] };
  if (!f('gigante')) return { es: 'Sube al molino grande.', en: 'Climb to the biggest windmill.', at: ['cerro', 13, 5] };
  if (!f('mancha_word')) return { es: 'Toca el cristal.', en: 'Touch the crystal.', at: ['cerro', 15, 5] };
  if (!f('mancha_reward')) return { es: 'Vuelve con Don Alonso.', en: 'Go back and tell Don Alonso.', at: ['villamolinos', 27, 11] };
  if (!f('ch7')) return { es: 'Toma el tren a Valencia.', en: 'Take the train to Valencia.', at: ['valencia', 5, 3] };

  // Chapter 7
  if (!f('pepet_met')) return { es: 'Busca al pirotécnico en la plaza.', en: 'Find Pepet, the fireworks master, by the mascletà in the square.', at: ['valencia', 17, 13] };
  if (!f('gate_taller')) return { es: 'Ve a la huerta y llama a la puerta del taller.', en: "Go east to the huerta and knock at Ximo's workshop.", at: ['huerta', 32, 5] };
  const ninots = count(g, NINOTS);
  if (ninots < 3) {
    const next = NINOTS.findIndex((k) => !g.flags[k]);
    return { es: `Despierta a los ninots del taller (${ninots}/3).`, en: `Wake the three big ninots in the workshop with the future tense (${ninots}/3).`, at: ['taller', ...NINOT_AT[next]] };
  }
  if (!f('chispa')) return { es: 'Habla con Ximo.', en: 'Talk to Ximo, behind the gate.', at: ['taller', 12, 3] };
  if (!f('gran_falla')) return { es: 'Vuelve a la plaza: ¡es la noche de la cremà!', en: "Go back to the square with the Spark: it's the night of the cremà!", at: ['valencia', 24, 11] };
  if (!f('valencia_word')) return { es: 'Toca el cristal.', en: 'Touch the crystal.', at: ['valencia', 27, 12] };
  if (!f('valencia_reward')) return { es: 'Habla con Vicenta.', en: 'Talk to Vicenta.', at: ['valencia', 21, 12] };
  if (!f('ch8')) return { es: 'Toma el tren a Sevilla.', en: 'Take the train to Seville.', at: ['sevilla', 5, 3] };

  // Chapter 8
  if (!f('lola_home')) return { es: 'Ve a casa de Lola, en Triana.', en: "Go to Lola's house in Triana, across the bridge.", at: ['sevilla', 34, 9] };
  if (!f('rocio_ok')) return { es: 'Ayuda a la madre de Lola.', en: "Help Lola's mother: tell her what to do.", at: ['sevilla', 33, 6] };
  if (!f('guitarra')) return { es: 'Busca la guitarra en los jardines del Alcázar.', en: "Find Grandad Manolo's guitar in the Alcázar gardens.", at: ['alcazar', 16, 2] };
  if (!f('granada_open')) return { es: 'Lleva la guitarra al abuelo Manolo.', en: 'Take the guitar back to Grandad Manolo.', at: ['sevilla', 36, 7] };
  if (!f('granada_seen')) return { es: 'Toma el tren a Granada.', en: 'Take the train to Granada.', at: ['granada', 5, 3] };
  if (!f('entradas')) return { es: 'Pide entrar en la Alhambra.', en: 'Ask (politely!) to get into the Alhambra.', at: ['granada', 30, 1] };
  if (!f('puerta1')) return { es: 'Abre la primera puerta de la Alhambra.', en: "Open the Alhambra's first door.", at: ['alhambra', 15, 12] };
  if (!f('puerta2')) return { es: 'Abre la segunda puerta.', en: 'Open the second door.', at: ['alhambra', 15, 6] };
  if (!f('leon')) return { es: 'Entra en el Patio de los Leones.', en: 'Go into the Court of the Lions.', at: ['alhambra', 15, 5] };
  if (!f('sevilla_word')) return { es: 'Toca el cristal.', en: 'Touch the crystal.', at: ['alhambra', 10, 4] };
  if (!f('sevilla_reward')) return { es: 'Vuelve a casa de Lola, en Sevilla.', en: "Go back to Lola's house in Seville.", at: ['sevilla', 33, 6] };
  if (!f('ch9')) return { es: 'Toma el tren a Santiago de Compostela.', en: 'Take the train to Santiago de Compostela.', at: ['santiago', 5, 3] };

  // Chapter 9
  if (!f('maruxa_hint')) return { es: 'Habla con la peregrina en la plaza.', en: 'Talk to the pilgrim in front of the cathedral — you met her on the road in chapter 2.', at: ['santiago', 20, 8] };
  if (!f('maruxa_met')) return { es: 'Busca a la meiga en el bosque, al este.', en: 'Find the meiga (the wise woman) in the woods to the east.', at: ['fraga', 26, 10] };
  const got = count(g, INGREDIENTS);
  if (got < 3) {
    const next = INGREDIENTS.findIndex((k) => !g.flags[k]);
    return { es: `Busca los ingredientes de la queimada (${got}/3).`, en: `Find the queimada ingredients in Santiago (${got}/3): orujo, a lemon, coffee.`, at: ['santiago', ...INGREDIENT_AT[next]] };
  }
  if (!f('queimada')) return { es: 'Lleva los ingredientes a Maruxa.', en: 'Take the ingredients to Maruxa, the meiga.', at: ['fraga', 26, 10] };
  if (!f('compana')) return { es: 'Espera a la Santa Compaña en el cruceiro.', en: 'Wait for the Santa Compaña at the stone cross, in the clearing to the east.', at: ['fraga', 34, 14] };
  if (!f('santiago_word')) return { es: 'Toca el cristal.', en: 'Touch the crystal.', at: ['fraga', 32, 12] };
  if (!f('santiago_reward')) return { es: 'Vuelve con la peregrina.', en: 'Go back to the pilgrim in Santiago.', at: ['santiago', 20, 8] };
  if (!f('ch10')) return { es: 'Toma el tren a Salamanca.', en: 'Take the train to Salamanca and rescue Bruno.', at: ['salamanca', 5, 3] };

  // Chapter 10
  if (!f('ines_met')) return { es: 'Busca a la profesora Inés, delante de la universidad.', en: 'Find Professor Inés in front of the university, south of the Plaza Mayor.', at: ['salamanca', 23, 21] };
  if (!f('llave')) return { es: 'Busca la rana en la fachada de la universidad.', en: "Find the frog on the university's carved façade.", at: ['salamanca', 24, 19] };
  if (!f('duda1')) return { es: 'Entra en la biblioteca y abre la primera puerta.', en: "Go into the library (the door right of the façade) and open the first door.", at: ['biblioteca', 14, 15] };
  if (!f('duda2')) return { es: 'Abre la segunda puerta.', en: 'Open the second door.', at: ['biblioteca', 14, 8] };
  if (!f('guardian')) return { es: 'Sube por la escalera.', en: 'Climb the stairs at the back of the library.', at: ['biblioteca', 14, 2] };
  if (!f('bruno_back')) return { es: 'Rescata a Bruno.', en: 'Rescue Bruno.', at: ['libro', 12, 10] };
  if (!f('dama')) return { es: 'Sube hasta la Dama Gris.', en: 'Climb up to the Grey Lady.', at: ['libro', 12, 6] };
  if (!f('salamanca_word')) return { es: 'Toca el cristal.', en: 'Touch the last crystal.', at: ['libro', 14, 3] };
  if (!f('fin2')) return null;
  return { es: '¡Fin! Habla con todos en la fiesta.', en: 'The End! Talk to everyone at the party — friends have come from all over Spain.' };
}

/**
 * Where to put the objective marker on the current map: on the target itself,
 * or on the first exit of the shortest open route towards it — or, when the
 * target is in another region, on the way to this region's train.
 */
export function markerTile(g: GameState, mapId: string, maps: Record<string, MapDef>, goal = currentGoal(g)): [number, number] | null {
  if (!goal?.at) return null;
  const [target, tx, ty] = goal.at;
  if (target === mapId) return [tx, ty];
  const here = maps[mapId]?.region ?? 'puerto';
  const there = maps[target]?.region ?? 'puerto';
  if (here !== there && STOP_BY_ID[here]) return markerTile(g, mapId, maps, { ...goal, at: STOP_BY_ID[here].board });
  const prev = new Map<string, { from: string; x: number; y: number } | null>([[mapId, null]]);
  const queue = [mapId];
  while (queue.length) {
    const id = queue.shift()!;
    if (id === target) break;
    for (const w of maps[id]?.warps ?? []) {
      if (w.to === id || prev.has(w.to) || !maps[w.to]) continue;
      if (w.when && !w.when(g)) continue;
      prev.set(w.to, { from: id, x: w.x, y: w.y });
      queue.push(w.to);
    }
  }
  if (!prev.has(target)) return null;
  let step = prev.get(target)!;
  while (step.from !== mapId) step = prev.get(step.from)!;
  return [step.x, step.y];
}
