// La Torre de los Ecos, the post-game gauntlet: the enemies on each of its ten
// floors (a boss every few floors), and the kind of review question between them.

import type { ChallengeStyle } from '../learn/challenges';

export const TOWER_FLOORS: string[][] = [
  ['sombra', 'eco', 'caballero'],
  ['oveja_negra', 'aspa', 'borrador'],
  ['golem'],
  ['ninot', 'petardo', 'naranja'],
  ['gigante', 'aspa'],
  ['sol', 'abanico', 'castanuela'],
  ['gran_falla'],
  ['trasno', 'bretema', 'corvo'],
  ['leon_piedra'],
  ['santa_compana', 'borrador_mayor'],
];

export const TOWER_REVIEW: ChallengeStyle[] = ['vocab', 'verb', 'quick', 'sentence'];
