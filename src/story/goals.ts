// The current objective, worked out from the story flags. Shown in the corner
// of the screen at all times so you never have to guess what to do next.

import type { GameState } from '../state';
import type { MapDef } from '../world/types';

export interface Goal {
  es: string;
  en: string;
  /** Where to go: [map, x, y]. The map shows a marker there, or on the exit that leads there. */
  at?: [string, number, number];
}

const count = (g: GameState, keys: string[]) => keys.filter((k) => g.flags[k]).length;
const FLOWERS = ['flor_roja', 'flor_azul', 'flor_amarilla'];
const MONKS = ['monje_mano', 'monje_oreja', 'monje_corazon'];
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
  return { es: '¡Fin! Habla con todos en Puerto Alegre.', en: 'The End! Talk to everyone back in Puerto Alegre.' };
}

/**
 * Where to put the objective marker on the current map: on the target itself,
 * or on the first exit of the shortest open route towards it.
 */
export function markerTile(g: GameState, mapId: string, maps: Record<string, MapDef>, goal = currentGoal(g)): [number, number] | null {
  if (!goal?.at) return null;
  const [target, tx, ty] = goal.at;
  if (target === mapId) return [tx, ty];
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
