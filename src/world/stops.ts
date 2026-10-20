// The train stations of Act II: where each one is, where you arrive, which
// train to board, and when the line opens. Pure data, shared by the travel
// screen and the objective marker.

import type { Dir, GameState } from '../state';

export interface Stop {
  id: string;
  es: string;
  en: string;
  /** Where it is (degrees). */
  lon: number;
  lat: number;
  /** Where you step off the train. */
  map: string;
  x: number;
  y: number;
  dir: Dir;
  /** The train to talk to when leaving from here. */
  board: [map: string, x: number, y: number];
  open: (g: GameState) => boolean;
}

const f = (k: string) => (g: GameState) => !!g.flags[k];

export const STOPS: Stop[] = [
  { id: 'puerto', es: 'Puerto Alegre', en: 'home, on the north coast', lon: -5.3, lat: 43.55, map: 'estacion', x: 10, y: 3, dir: 'down', board: ['estacion', 10, 2], open: () => true },
  { id: 'mancha', es: 'La Mancha', en: 'windmills and wheat', lon: -3.12, lat: 39.4, map: 'villamolinos', x: 4, y: 9, dir: 'down', board: ['villamolinos', 4, 8], open: f('act2') },
  { id: 'valencia', es: 'Valencia', en: 'Las Fallas', lon: -0.38, lat: 39.47, map: 'valencia', x: 5, y: 3, dir: 'down', board: ['valencia', 5, 2], open: f('mancha_done') },
  { id: 'sevilla', es: 'Sevilla', en: "Lola's home", lon: -5.98, lat: 37.39, map: 'sevilla', x: 5, y: 3, dir: 'down', board: ['sevilla', 5, 2], open: f('valencia_done') },
  { id: 'granada', es: 'Granada', en: 'the Alhambra', lon: -3.6, lat: 37.18, map: 'granada', x: 5, y: 3, dir: 'down', board: ['granada', 5, 2], open: f('granada_open') },
  { id: 'santiago', es: 'Santiago de Compostela', en: 'the end of the Camino', lon: -8.54, lat: 42.88, map: 'santiago', x: 5, y: 3, dir: 'down', board: ['santiago', 5, 2], open: f('sevilla_done') },
  { id: 'salamanca', es: 'Salamanca', en: 'the old university', lon: -5.66, lat: 40.97, map: 'salamanca', x: 5, y: 3, dir: 'down', board: ['salamanca', 5, 2], open: f('santiago_done') },
];

export const STOP_BY_ID: Readonly<Record<string, Stop>> = Object.fromEntries(STOPS.map((s) => [s.id, s]));
