// The train: a map of Spain with the stations you've unlocked. Pick one and
// watch the train go — through Madrid, like most of Spain's railways.

import type { GameState } from '../state';
import { STOPS, type Stop } from '../world/stops';
import { sfx } from '../engine/audio';
import { MAPS } from '../world/maps';
import { h, menu, wait } from './dom';

const MADRID = { lon: -3.7, lat: 40.42 };

// Mainland Spain, coarsely, clockwise from Finisterre.
const SPAIN: [number, number][] = [
  [-9.3, 42.9], [-9.2, 43.2], [-8.4, 43.4], [-7.9, 43.75], [-7.0, 43.55], [-5.85, 43.65], [-4.5, 43.4], [-3.8, 43.47],
  [-2.9, 43.4], [-1.8, 43.38], [-1.4, 43.0], [-0.5, 42.8], [0.7, 42.85], [1.45, 42.6], [2.5, 42.4], [3.2, 42.3],
  [3.2, 41.9], [2.2, 41.4], [1.0, 41.1], [0.8, 40.7], [0.0, 40.0], [-0.3, 39.45], [0.2, 38.75], [-0.5, 38.3],
  [-0.75, 37.75], [-0.9, 37.55], [-1.6, 37.3], [-2.0, 36.75], [-3.0, 36.75], [-4.4, 36.7], [-5.0, 36.45], [-5.35, 36.1],
  [-5.6, 36.0], [-6.0, 36.3], [-6.3, 36.55], [-6.4, 36.8], [-6.9, 37.15], [-7.4, 37.2], [-7.5, 37.6], [-7.1, 38.15],
  [-7.3, 38.75], [-7.0, 39.4], [-7.5, 39.65], [-6.9, 40.25], [-6.85, 41.0], [-6.4, 41.55], [-6.6, 41.95], [-7.4, 41.85],
  [-8.1, 42.05], [-8.9, 41.9], [-8.8, 42.4], [-9.1, 42.6],
];
// Portugal, drawn paler: the border above, then its coast.
const PORTUGAL: [number, number][] = [
  [-7.4, 37.2], [-7.5, 37.6], [-7.1, 38.15], [-7.3, 38.75], [-7.0, 39.4], [-7.5, 39.65], [-6.9, 40.25], [-6.85, 41.0],
  [-6.4, 41.55], [-6.6, 41.95], [-7.4, 41.85], [-8.1, 42.05], [-8.9, 41.9], [-8.65, 41.15], [-9.0, 40.4], [-9.5, 38.8],
  [-9.2, 38.65], [-8.8, 38.0], [-8.8, 37.1], [-8.9, 37.0],
];
const MALLORCA: [number, number][] = [[2.35, 39.6], [3.1, 39.95], [3.45, 39.7], [3.05, 39.3], [2.6, 39.45]];

// A line opens when the story gets there (and once its region is built).
const reachable = (s: Stop, g: GameState) => s.open(g) && !!MAPS[s.map];

const W = 300;
const H = 250;
const S = 22;
const px = (lon: number, lat: number): [number, number] => [(lon + 9.7) * S, (44.1 - lat) * S * 1.3];

function drawMap(c: CanvasRenderingContext2D, g: GameState, here: Stop, target: Stop | null, train?: [number, number]) {
  c.fillStyle = '#29366f';
  c.fillRect(0, 0, W, H);
  c.fillStyle = '#3b5dc9';
  for (let y = 4; y < H; y += 9) for (let x = (y * 7) % 13; x < W; x += 26) c.fillRect(x, y, 4, 1);
  const poly = (pts: [number, number][], fill: string, stroke: string) => {
    c.beginPath();
    pts.forEach(([lon, lat], i) => (i ? c.lineTo(...px(lon, lat)) : c.moveTo(...px(lon, lat))));
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.stroke();
  };
  poly(PORTUGAL, '#566c86', '#333c57');
  poly(SPAIN, '#e8c070', '#8b5a3c');
  poly(MALLORCA, '#e8c070', '#8b5a3c');
  // Lines from Madrid to every station you can reach.
  const [mx, my] = px(MADRID.lon, MADRID.lat);
  for (const s of STOPS.filter((s) => reachable(s, g))) {
    c.strokeStyle = 'rgba(90,58,41,0.6)';
    c.setLineDash([3, 3]);
    c.beginPath();
    c.moveTo(mx, my);
    c.lineTo(...px(s.lon, s.lat));
    c.stroke();
  }
  c.setLineDash([]);
  c.fillStyle = '#5a3a29';
  c.fillRect(mx - 2, my - 2, 5, 5);
  c.font = 'bold 10px sans-serif';
  c.fillText('Madrid', mx + 5, my + 4);
  for (const s of STOPS) {
    const [x, y] = px(s.lon, s.lat);
    const open = reachable(s, g);
    c.fillStyle = s === here ? '#38b764' : s === target ? '#b13e53' : open ? '#1a1c2c' : 'rgba(26,28,44,0.3)';
    c.beginPath();
    c.arc(x, y, s === here || s === target ? 5 : 3.5, 0, Math.PI * 2);
    c.fill();
    if (open) {
      c.fillStyle = '#1a1c2c';
      c.font = `${s === target ? 'bold ' : ''}10px sans-serif`;
      const right = s.lon < -7.5 || s.id === 'salamanca' ? -1 : 1;
      const label = s.es.replace(' de Compostela', '');
      c.fillText(label, right > 0 ? x + 7 : x - 7 - c.measureText(label).width, y - 6);
    }
  }
  if (train) {
    const [x, y] = train;
    c.fillStyle = '#c0392b';
    c.fillRect(x - 5, y - 3, 10, 6);
    c.fillStyle = '#f4f4f4';
    c.fillRect(x - 4, y - 2, 8, 2);
  }
}

/** Show the map and let the player choose; returns the stop, or null to stay. */
export async function chooseTrip(host: HTMLElement, g: GameState, hereId: string, wanted?: string): Promise<Stop | null> {
  const here = STOPS.find((s) => s.id === hereId) ?? STOPS[0];
  const canvas = h('canvas', { class: 'travel-map', width: String(W), height: String(H) }) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const panel = h('div', { class: 'panel travel-panel' });
  const ov = h('div', { class: 'overlay' }, panel);
  const list = h('div');
  panel.append(h('h2', null, 'Estación de tren', h('small', null, ' · Where to?')), canvas, list);
  host.append(ov);
  const options = STOPS.filter((s) => s.id !== here.id && reachable(s, g));
  drawMap(ctx, g, here, null);
  const start = Math.max(0, options.findIndex((s) => s.id === wanted));
  const pick = await menu(
    list,
    [
      ...options.map((s) => ({ label: `${s.id === wanted ? '🎯 ' : '🚆 '}${s.es}`, sub: s.en })),
      { label: '👋 Me quedo aquí', sub: 'Stay here' },
    ],
    { cancel: true, start, onFocus: (i) => drawMap(ctx, g, here, options[i] ?? null) },
  );
  const stop = pick === null || pick >= options.length ? null : options[pick];
  if (stop) {
    // Ride: here → Madrid → there.
    list.replaceChildren(h('p', { class: 'muted' }, `Próxima parada: ${stop.es}… · Next stop: ${stop.es}…`));
    sfx('save');
    const path = [px(here.lon, here.lat), px(MADRID.lon, MADRID.lat), px(stop.lon, stop.lat)];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const seg = t < 0.5 ? 0 : 1;
      const k = seg === 0 ? t * 2 : (t - 0.5) * 2;
      const [x0, y0] = path[seg];
      const [x1, y1] = path[seg + 1];
      drawMap(ctx, g, here, stop, [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]);
      await wait(30);
    }
    await wait(300);
  }
  ov.remove();
  return stop;
}
