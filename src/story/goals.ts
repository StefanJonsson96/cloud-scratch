// The current objective, worked out from the story flags. Shown in the corner
// of the screen at all times so you never have to guess what to do next.

import type { GameState } from '../state';

export interface Goal {
  es: string;
  en: string;
}

const count = (g: GameState, keys: string[]) => keys.filter((k) => g.flags[k]).length;
const FLOWERS = ['flor_roja', 'flor_azul', 'flor_amarilla'];
const MONKS = ['monje_mano', 'monje_oreja', 'monje_corazon'];

export function currentGoal(g: GameState): Goal | null {
  const f = (k: string) => !!g.flags[k];

  // Prologue and chapter 1
  if (!f('intro_done')) return { es: 'Practica con el muñeco de paja.', en: 'Practise with the straw dummy: walk up to it and press Enter (or A).' };
  if (!f('has_bread')) return { es: 'Compra pan en la tienda de Doña Carmen.', en: "Buy bread at Doña Carmen's stall, just south of Grandma's house." };
  if (!f('fog')) return { es: 'Vuelve a casa con el pan.', en: 'Take the bread home to Grandma.' };
  if (!f('abuela_silenced')) return { es: 'Corre a casa de la abuela.', en: "Run to Grandma's house!" };
  if (!f('mateo_joined')) return { es: 'Busca a Mateo en el muelle.', en: 'Find Mateo on the pier, at the south end of the village.' };
  if (!f('gate_cueva')) return { es: 'Ve al faro, al oeste, y abre la puerta de la cueva.', en: 'Go west along the beach to the lighthouse and open the cave gate.' };
  if (!f('boss_rey')) return { es: 'Busca la luz del faro en la cueva.', en: "Find the lighthouse's light deep in the cave." };
  if (!f('faro_lit')) return { es: 'Toca el cristal.', en: 'Touch the crystal.' };

  // Chapter 2
  if (!f('ch2')) {
    if (!f('ramon_gift')) return { es: 'Habla con Don Ramón y ve al este, a San Sabor.', en: 'Talk to Don Ramón, then take the east road to San Sabor.' };
    return { es: 'Ve al este, por el camino a San Sabor.', en: 'Take the east road out of the village to San Sabor.' };
  }
  if (!f('sansabor_seen')) return { es: 'Sigue el camino hasta San Sabor.', en: 'Follow the road east to San Sabor.' };
  if (!f('lola_joined')) return { es: 'Busca a la guitarrista en la plaza.', en: 'Find the guitarist by the fountain in the square.' };
  if (!f('gate_bodega')) return { es: 'Entra en la bodega del panadero y abre la despensa.', en: "Go into the baker's cellar (north-east of the square) and open the pantry door." };
  if (!f('gloton')) return { es: 'Busca al monstruo de la bodega.', en: 'Find the monster in the cellar.' };
  if (!f('sabor')) return { es: 'Toca el cristal.', en: 'Touch the crystal.' };

  // Chapter 3
  if (!f('ch3')) return { es: 'Ve al norte, al bosque.', en: 'Leave San Sabor by the north road, into the forest.' };
  const flowers = count(g, FLOWERS);
  if (flowers < 3) return { es: `Devuelve el color a las flores grises (${flowers}/3).`, en: `Bring the colour back to the grey flowers in the forest (${flowers}/3).` };
  if (!f('loba')) return { es: 'Cruza las espinas y busca a la loba gris.', en: 'Go north through the thorns and find the grey she-wolf.' };
  if (!f('color')) return { es: 'Toca el cristal.', en: 'Touch the crystal.' };

  // Chapter 4
  if (!f('ch4')) return { es: 'Sube al Monte Eco, al norte del claro.', en: 'Head north from the glade to Mount Echo.' };
  const monks = count(g, MONKS);
  if (monks < 3 && !f('tomas_story') && !monks) return { es: 'Sube la montaña hasta el templo.', en: 'Climb the mountain to the temple.' };
  if (monks < 3) return { es: `Adivina los gestos de los monjes (${monks}/3).`, en: `Guess what the silent monks are pointing at (${monks}/3) to open the inner gate.` };
  if (!f('golem')) return { es: 'Cruza la puerta interior del templo.', en: "Go through the temple's inner gate." };
  if (!f('voz')) return { es: 'Toca el cristal.', en: 'Touch the crystal.' };

  // Chapter 5
  if (!f('ch5')) return { es: 'Entra en la Torre Muda.', en: 'Enter the Mute Tower through the door behind the temple.' };
  if (!f('gate_torre1')) return { es: 'Abre la puerta negra.', en: 'Open the black door. (The floating crystals hold memories.)' };
  if (!f('gate_torre2')) return { es: 'Abre la segunda puerta.', en: 'Open the second door.' };
  if (!f('final')) return { es: 'Sube a la cima. El Callado te espera.', en: 'Climb to the top. El Callado is waiting.' };
  if (!f('fin')) return null;
  return { es: '¡Fin! Habla con todos en Puerto Alegre.', en: 'The End! Talk to everyone back in Puerto Alegre.' };
}
