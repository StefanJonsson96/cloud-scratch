// Map tiles, drawn procedurally into 16×16 canvases (a few variants each so
// grass and sand don't look like wallpaper).

import { PALETTE as P } from '../engine/sprites';

export const TILE = 16;

export interface TileInfo {
  solid: boolean;
  /** Random encounters can happen here. */
  encounter?: boolean;
  animated?: boolean;
  name: string;
}

export const TILES: Record<string, TileInfo> = {
  '.': { solid: false, name: 'grass' },
  ',': { solid: false, encounter: true, name: 'tallgrass' },
  ':': { solid: false, name: 'path' },
  s: { solid: false, name: 'sand' },
  z: { solid: false, encounter: true, name: 'dunes' },
  w: { solid: false, name: 'floor' },
  _: { solid: false, name: 'rug' },
  c: { solid: false, name: 'cave' },
  x: { solid: false, encounter: true, name: 'cavedark' },
  k: { solid: false, name: 'stone' },
  y: { solid: false, encounter: true, name: 'stonedark' },
  u: { solid: false, name: 'towerfloor' },
  '=': { solid: false, name: 'bridge' },
  f: { solid: false, name: 'flowers' },
  n: { solid: false, name: 'snow' },
  m: { solid: false, encounter: true, name: 'snowdeep' },
  '+': { solid: false, name: 'doormat' },
  D: { solid: false, name: 'door' },
  '>': { solid: false, name: 'stairs' },
  '~': { solid: true, animated: true, name: 'water' },
  T: { solid: true, name: 'tree' },
  P: { solid: true, name: 'pine' },
  B: { solid: true, name: 'bush' },
  R: { solid: true, name: 'rock' },
  '#': { solid: true, name: 'cliff' },
  W: { solid: true, name: 'wall' },
  X: { solid: true, name: 'cavewall' },
  F: { solid: true, name: 'fence' },
  r: { solid: true, name: 'roof' },
  Q: { solid: true, name: 'roofblue' },
  h: { solid: true, name: 'house' },
  v: { solid: true, name: 'window' },
  K: { solid: true, name: 'shelf' },
  t: { solid: true, name: 'table' },
  b: { solid: true, name: 'bed' },
  '|': { solid: true, name: 'towerwall' },
  I: { solid: true, name: 'lighthouse' },
  J: { solid: true, name: 'lamp' },
  o: { solid: true, name: 'barrel' },
  L: { solid: true, name: 'lamppost' },
  Y: { solid: true, name: 'sign' },
  C: { solid: true, name: 'chest' },
  S: { solid: true, name: 'stall' },
  O: { solid: true, name: 'fountain' },
  M: { solid: true, name: 'mountain' },
  G: { solid: true, name: 'gate' },
  A: { solid: true, name: 'altar' },
  V: { solid: true, name: 'pot' },
  ' ': { solid: true, name: 'void' },
};

export function tileInfo(ch: string): TileInfo {
  return TILES[ch] ?? TILES[' '];
}

const cache = new Map<string, HTMLCanvasElement>();

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

type Ctx = CanvasRenderingContext2D;
const px = (c: Ctx, x: number, y: number, col: string, w = 1, h = 1) => {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
};

function speckle(c: Ctx, r: () => number, base: string, dots: [string, number][]) {
  px(c, 0, 0, base, 16, 16);
  for (const [col, n] of dots) for (let i = 0; i < n; i++) px(c, Math.floor(r() * 16), Math.floor(r() * 16), col);
}

function grass(c: Ctx, r: () => number) {
  speckle(c, r, P['6'], [[P['5'], 6], [P.q, 8]]);
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(r() * 14) + 1;
    const y = Math.floor(r() * 13) + 2;
    px(c, x, y, P['5']);
    px(c, x + 1, y - 1, P['5']);
  }
}

/** Neighbour mask bits: which sides continue the same tile (for edges). */
export const UP = 1;
export const RIGHT = 2;
export const DOWN = 4;
export const LEFT = 8;

function drawers(): Record<string, (c: Ctx, r: () => number, frame: number, mask: number) => void> {
  return {
    grass,
    tallgrass(c, r) {
      grass(c, r);
      for (let i = 0; i < 4; i++) {
        const x = 1 + i * 4;
        const y = 4 + Math.floor(r() * 6);
        px(c, x, y, P.q, 1, 6);
        px(c, x + 1, y + 2, P.q, 1, 5);
        px(c, x + 2, y + 1, P['5'], 1, 5);
      }
    },
    path(c, r) {
      speckle(c, r, P.h, [[P.n, 10], [P.g, 8], [P.m, 3]]);
    },
    sand(c, r) {
      speckle(c, r, P.m, [[P.n, 10], [P.v, 6]]);
    },
    dunes(c, r) {
      speckle(c, r, P.m, [[P.n, 10], [P.v, 6]]);
      for (let i = 0; i < 3; i++) {
        const y = 3 + i * 5;
        px(c, 2 + Math.floor(r() * 4), y, P.n, 6, 1);
        px(c, 1 + Math.floor(r() * 6), y + 1, P.v, 5, 1);
      }
      px(c, 11, 4, P['6'], 1, 4);
      px(c, 12, 5, P.q, 1, 3);
    },
    floor(c, r) {
      px(c, 0, 0, P.r, 16, 16);
      for (let y = 0; y < 16; y += 4) px(c, 0, y, P.g, 16, 1);
      for (let y = 0; y < 16; y += 4) px(c, (y * 5 + 3) % 16, y + 1, P.g, 1, 3);
      for (let i = 0; i < 4; i++) px(c, Math.floor(r() * 16), Math.floor(r() * 16), P.h);
    },
    rug(c) {
      px(c, 0, 0, P['2'], 16, 16);
      px(c, 1, 1, P.l, 14, 14);
      px(c, 2, 2, P['2'], 12, 12);
      px(c, 6, 6, P['4'], 4, 4);
      px(c, 7, 7, P['2'], 2, 2);
    },
    cave(c, r) {
      speckle(c, r, P.f, [[P.e, 8], [P['0'], 6]]);
    },
    cavedark(c, r) {
      speckle(c, r, P.w, [[P.f, 12], [P['0'], 8]]);
    },
    stone(c, r) {
      px(c, 0, 0, P.d, 16, 16);
      px(c, 0, 7, P.e, 16, 1);
      px(c, 0, 15, P.e, 16, 1);
      px(c, 7, 0, P.e, 1, 7);
      px(c, 3, 8, P.e, 1, 7);
      px(c, 12, 8, P.e, 1, 7);
      for (let i = 0; i < 5; i++) px(c, Math.floor(r() * 16), Math.floor(r() * 16), P.u);
    },
    stonedark(c, r) {
      px(c, 0, 0, P.e, 16, 16);
      px(c, 0, 7, P.f, 16, 1);
      px(c, 0, 15, P.f, 16, 1);
      px(c, 7, 0, P.f, 1, 7);
      px(c, 3, 8, P.f, 1, 7);
      px(c, 12, 8, P.f, 1, 7);
      for (let i = 0; i < 5; i++) px(c, Math.floor(r() * 16), Math.floor(r() * 16), P.d);
    },
    towerfloor(c, r) {
      px(c, 0, 0, P.w, 16, 16);
      px(c, 0, 7, P['1'], 16, 1);
      px(c, 0, 15, P['1'], 16, 1);
      px(c, 7, 0, P['1'], 1, 7);
      px(c, 3, 8, P['1'], 1, 7);
      px(c, 12, 8, P['1'], 1, 7);
      for (let i = 0; i < 4; i++) px(c, Math.floor(r() * 16), Math.floor(r() * 16), P.o);
    },
    bridge(c) {
      px(c, 0, 0, P.r, 16, 16);
      for (let x = 0; x < 16; x += 4) px(c, x, 0, P.i, 1, 16);
      px(c, 0, 0, P.g, 16, 1);
      px(c, 0, 15, P.g, 16, 1);
    },
    flowers(c, r) {
      grass(c, r);
      const cols = [P.c, P['4'], P.p, P['2']];
      for (let i = 0; i < 5; i++) {
        const x = 1 + Math.floor(r() * 13);
        const y = 1 + Math.floor(r() * 13);
        const col = cols[Math.floor(r() * cols.length)];
        px(c, x, y, col);
        px(c, x + 1, y, col);
        px(c, x, y + 1, col);
        px(c, x + 1, y + 1, P['4']);
      }
    },
    snow(c, r) {
      speckle(c, r, P.c, [[P.u, 10], [P.d, 3]]);
    },
    snowdeep(c, r) {
      speckle(c, r, P.u, [[P.c, 14], [P.d, 8]]);
    },
    doormat(c, r) {
      speckle(c, r, P.h, [[P.n, 10], [P.g, 8]]);
      px(c, 3, 4, P['2'], 10, 8);
      px(c, 4, 5, P.l, 8, 6);
    },
    door(c) {
      px(c, 0, 0, P.c, 16, 16);
      px(c, 3, 2, P.i, 10, 14);
      px(c, 4, 3, P.g, 8, 13);
      px(c, 7, 3, P.i, 1, 13);
      px(c, 10, 9, P['4'], 1, 2);
      px(c, 2, 1, P.u, 12, 1);
    },
    stairs(c) {
      px(c, 0, 0, P.f, 16, 16);
      for (let y = 0; y < 16; y += 4) {
        px(c, 1, y, P.d, 14, 3);
        px(c, 1, y + 3, P.e, 14, 1);
      }
    },
    water(c, r, frame, mask) {
      px(c, 0, 0, P['9'], 16, 16);
      for (let i = 0; i < 6; i++) px(c, Math.floor(r() * 16), Math.floor(r() * 16), P['8']);
      const o = frame ? 3 : 0;
      for (let y = 2; y < 16; y += 6) {
        px(c, (2 + o + y) % 16, y, P.a, 4, 1);
        px(c, (10 + o + y) % 16, y + 3, P.a, 3, 1);
      }
      // Foam where the water meets land.
      const foam = frame ? P.b : P.c;
      if (!(mask & UP)) {
        px(c, 0, 0, foam, 16, 2);
        px(c, 2 + o, 2, P.b, 3, 1);
      }
      if (!(mask & DOWN)) px(c, 0, 14, P.a, 16, 2);
      if (!(mask & LEFT)) px(c, 0, 0, P.b, 1, 16);
      if (!(mask & RIGHT)) px(c, 15, 0, P.b, 1, 16);
    },
    tree(c, r) {
      grass(c, r);
      px(c, 7, 11, P.i, 2, 4);
      px(c, 2, 2, P.q, 12, 9);
      px(c, 3, 1, P.q, 10, 11);
      px(c, 1, 4, P.q, 14, 5);
      px(c, 3, 2, P['6'], 9, 7);
      px(c, 4, 3, P['5'], 3, 2);
      px(c, 9, 6, P['5'], 2, 1);
      px(c, 2, 12, 'rgba(0,0,0,0.2)', 12, 2);
    },
    pine(c, r) {
      speckle(c, r, P['6'], [[P.q, 8]]);
      px(c, 7, 13, P.i, 2, 3);
      for (let i = 0; i < 6; i++) px(c, 7 - i, 1 + i * 2, P.q, 2 + i * 2, 2);
      for (let i = 0; i < 5; i++) px(c, 7 - i, 2 + i * 2, P['7'], 1 + i, 1);
    },
    bush(c, r) {
      grass(c, r);
      px(c, 2, 5, P.q, 12, 9);
      px(c, 1, 7, P.q, 14, 6);
      px(c, 3, 6, P['6'], 10, 6);
      px(c, 4, 7, P['5'], 3, 2);
    },
    rock(c, r) {
      grass(c, r);
      px(c, 2, 5, P.e, 12, 9);
      px(c, 3, 4, P.e, 10, 11);
      px(c, 3, 5, P.d, 9, 6);
      px(c, 4, 6, P.u, 3, 2);
    },
    cliff(c) {
      px(c, 0, 0, P.g, 16, 16);
      px(c, 0, 0, P.h, 16, 3);
      for (let y = 4; y < 16; y += 4) px(c, 0, y, P.i, 16, 1);
      px(c, 5, 4, P.i, 1, 4);
      px(c, 11, 8, P.i, 1, 4);
      px(c, 3, 12, P.i, 1, 4);
    },
    mountain(c) {
      px(c, 0, 0, P.e, 16, 16);
      px(c, 0, 0, P.d, 16, 2);
      for (let y = 3; y < 16; y += 4) px(c, 0, y, P.f, 16, 1);
      px(c, 4, 4, P.f, 1, 3);
      px(c, 10, 8, P.f, 1, 3);
    },
    wall(c) {
      px(c, 0, 0, P.m, 16, 16);
      px(c, 0, 12, P.n, 16, 4);
      px(c, 0, 12, P.g, 16, 1);
      px(c, 0, 0, P.v, 16, 1);
    },
    cavewall(c, r) {
      speckle(c, r, P.w, [[P['0'], 10], [P.f, 8]]);
      px(c, 0, 13, P['0'], 16, 3);
    },
    fence(c, r) {
      grass(c, r);
      px(c, 0, 6, P.r, 16, 2);
      px(c, 0, 10, P.r, 16, 2);
      px(c, 2, 4, P.g, 2, 10);
      px(c, 12, 4, P.g, 2, 10);
    },
    roof(c) {
      px(c, 0, 0, P['3'], 16, 16);
      for (let y = 1; y < 16; y += 4) for (let x = (y % 8 === 1 ? 0 : 2); x < 16; x += 4) px(c, x, y, P.s, 3, 2);
      px(c, 0, 15, P.s, 16, 1);
    },
    roofblue(c) {
      px(c, 0, 0, P['9'], 16, 16);
      for (let y = 1; y < 16; y += 4) for (let x = (y % 8 === 1 ? 0 : 2); x < 16; x += 4) px(c, x, y, P['8'], 3, 2);
      px(c, 0, 15, P['8'], 16, 1);
    },
    house(c) {
      px(c, 0, 0, P.c, 16, 16);
      px(c, 0, 13, P.u, 16, 3);
      px(c, 0, 0, P.u, 16, 1);
    },
    window(c) {
      px(c, 0, 0, P.c, 16, 16);
      px(c, 0, 13, P.u, 16, 3);
      px(c, 3, 3, P['8'], 10, 8);
      px(c, 4, 4, P.a, 8, 6);
      px(c, 7, 4, P['8'], 1, 6);
      px(c, 4, 7, P['8'], 8, 1);
      px(c, 2, 11, P['6'], 12, 2);
      px(c, 3, 10, P['2'], 2, 1);
      px(c, 9, 10, P.p, 2, 1);
    },
    shelf(c) {
      px(c, 0, 0, P.i, 16, 16);
      px(c, 1, 1, P.g, 14, 14);
      for (let y = 1; y < 15; y += 5) {
        px(c, 1, y + 4, P.i, 14, 1);
        const cols = [P['2'], P['9'], P['6'], P['4'], P.o];
        for (let x = 2; x < 14; x += 2) px(c, x, y, cols[(x + y) % cols.length], 2, 4);
      }
    },
    table(c, r) {
      drawers().floor(c, r, 0, 15);
      px(c, 1, 3, P.i, 14, 9);
      px(c, 1, 3, P.g, 14, 7);
      px(c, 2, 12, P.i, 2, 3);
      px(c, 12, 12, P.i, 2, 3);
      px(c, 6, 4, P.c, 4, 3);
    },
    bed(c, r) {
      drawers().floor(c, r, 0, 15);
      px(c, 1, 1, P.i, 14, 15);
      px(c, 2, 2, P.c, 12, 4);
      px(c, 2, 6, P['9'], 12, 9);
      px(c, 2, 6, P.a, 12, 1);
    },
    towerwall(c) {
      px(c, 0, 0, P.w, 16, 16);
      for (let y = 0; y < 16; y += 4) px(c, 0, y, P['0'], 16, 1);
      for (let y = 0; y < 16; y += 4) px(c, y % 8 ? 4 : 10, y, P['0'], 1, 4);
      px(c, 0, 1, P.o, 16, 1);
    },
    lighthouse(c) {
      px(c, 2, 0, P.c, 12, 16);
      px(c, 2, 4, P['2'], 12, 4);
      px(c, 2, 12, P['2'], 12, 4);
      px(c, 2, 0, P.u, 2, 16);
      px(c, 12, 0, P.d, 2, 16);
    },
    lamp(c) {
      px(c, 3, 2, P['0'], 10, 14);
      px(c, 4, 4, P.v, 8, 8);
      px(c, 2, 0, P['2'], 12, 3);
      px(c, 2, 12, P['2'], 12, 4);
    },
    barrel(c, r) {
      drawers().path(c, r, 0, 15);
      px(c, 3, 2, P.g, 10, 13);
      px(c, 2, 4, P.g, 12, 9);
      px(c, 2, 5, P.i, 12, 1);
      px(c, 2, 11, P.i, 12, 1);
      px(c, 5, 2, P.h, 2, 13);
    },
    lamppost(c, r) {
      drawers().path(c, r, 0, 15);
      px(c, 7, 4, P['0'], 2, 12);
      px(c, 5, 0, P['0'], 6, 5);
      px(c, 6, 1, P['4'], 4, 3);
    },
    sign(c, r) {
      grass(c, r);
      px(c, 7, 9, P.i, 2, 6);
      px(c, 2, 3, P.i, 12, 7);
      px(c, 3, 4, P.h, 10, 5);
      px(c, 4, 5, P.i, 8, 1);
      px(c, 4, 7, P.i, 6, 1);
    },
    chest(c, r) {
      drawers().floor(c, r, 0, 15);
      px(c, 2, 4, P.i, 12, 11);
      px(c, 3, 5, P.g, 10, 9);
      px(c, 3, 8, P.i, 10, 1);
      px(c, 7, 7, P['4'], 2, 3);
    },
    stall(c) {
      px(c, 0, 0, P.h, 16, 16);
      for (let x = 0; x < 16; x += 4) px(c, x, 0, P['2'], 2, 6);
      for (let x = 2; x < 16; x += 4) px(c, x, 0, P.c, 2, 6);
      px(c, 0, 6, P.l, 16, 1);
      px(c, 1, 9, P.g, 14, 6);
      px(c, 3, 10, P['2'], 2, 2);
      px(c, 7, 10, P['4'], 2, 2);
      px(c, 11, 10, P['6'], 2, 2);
    },
    fountain(c, _r, frame, mask) {
      px(c, 0, 0, P.a, 16, 16);
      px(c, (frame ? 4 : 9), 6, P.b, 3, 1);
      px(c, (frame ? 9 : 3), 11, P.b, 2, 1);
      // Stone rim on the outside edges of the basin.
      if (!(mask & UP)) px(c, 0, 0, P.d, 16, 3);
      if (!(mask & DOWN)) {
        px(c, 0, 12, P.d, 16, 4);
        px(c, 0, 15, P.e, 16, 1);
      }
      if (!(mask & LEFT)) px(c, 0, 0, P.d, 3, 16);
      if (!(mask & RIGHT)) px(c, 13, 0, P.d, 3, 16);
      // A quarter of the central pedestal sits in the inner corner of each tile.
      const cx = mask & RIGHT ? 13 : mask & LEFT ? 0 : 6;
      const cy = mask & DOWN ? 12 : mask & UP ? 0 : 5;
      px(c, cx, cy, P.u, 3, 4);
      px(c, cx + (mask & RIGHT ? 1 : 0), cy - (mask & DOWN ? 3 : 0), P.c, 2, 3);
    },
    gate(c) {
      px(c, 0, 0, P.f, 16, 16);
      for (let x = 1; x < 16; x += 3) px(c, x, 0, P.e, 2, 16);
      px(c, 0, 7, P.e, 16, 2);
    },
    altar(c) {
      px(c, 0, 0, P.d, 16, 16);
      px(c, 1, 4, P.u, 14, 11);
      px(c, 6, 0, P['4'], 4, 4);
      px(c, 7, 1, P.v, 2, 2);
    },
    pot(c, r) {
      drawers().floor(c, r, 0, 15);
      px(c, 4, 4, P.s, 8, 11);
      px(c, 3, 6, P.s, 10, 7);
      px(c, 5, 3, P['3'], 6, 2);
      px(c, 5, 7, P['3'], 2, 4);
    },
    void(c) {
      px(c, 0, 0, P['0'], 16, 16);
    },
  };
}

const DRAW = drawers();

export function tileCanvas(ch: string, x: number, y: number, frame = 0, mask = 15): HTMLCanvasElement {
  const info = tileInfo(ch);
  const variant = (x * 7 + y * 13) % 4;
  const animated = info.animated || ch === 'O';
  const k = `${info.name}:${variant}:${animated ? frame : 0}:${mask}`;
  let c = cache.get(k);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = c.height = TILE;
  const ctx = c.getContext('2d')!;
  (DRAW[info.name] ?? DRAW.void)(ctx, rng(variant * 977 + info.name.length * 131 + 7), frame, mask);
  cache.set(k, c);
  return c;
}
