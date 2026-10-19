// Act II: the train station in Puerto Alegre. Each region's own maps live in
// ch6.ts … ch10.ts.

import type { MapDef } from '../types';

export const estacion: MapDef = {
  id: 'estacion',
  name: 'La estación',
  nameEn: 'The station',
  music: 'town',
  bg: 'pueblo',
  outside: 'W',
  region: 'puerto',
  rows: [
    'WWWWWWWWWWWWWWWWWWWW',
    'HHHHHHHHHHHHHHHHHHHH',
    'HHHHHHHHHHHHHHHHHHHH',
    'kkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkk',
    'WwwwwwwwwwwwwwwwwwwW',
    'WwttwwwwwwwwwwwwttwW',
    'WwwwwwwwwwwwwwwwwwwW',
    'WVwwwwwwwwwwwwwwwwVW',
    'WWWWWWWWW+WWWWWWWWWW',
  ],
  npcs: [
    { id: 'tren', x: 10, y: 2, sprite: 'tren', deco: true, talk: 'tren:puerto' },
    { id: 'revisor', x: 14, y: 3, sprite: 'revisor', dir: 'down', talk: 'revisor' },
    { id: 'viajera', x: 4, y: 7, sprite: 'vecina2', dir: 'up', talk: 'viajera_estacion', wander: true },
  ],
  warps: [{ x: 9, y: 9, to: 'puerto', tx: 21, ty: 5, dir: 'down' }],
  things: [
    // The whole train can be boarded, not just the middle carriage.
    { x: 9, y: 2, script: 'tren:puerto' }, { x: 11, y: 2, script: 'tren:puerto' },
    { x: 2, y: 6, script: 'banco' },
    { x: 3, y: 6, script: 'banco' },
    { x: 16, y: 6, script: 'banco' },
    { x: 17, y: 6, script: 'banco' },
  ],
};
