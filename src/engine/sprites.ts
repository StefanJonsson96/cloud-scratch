// Pixel-art sprites defined as strings of palette characters, rendered once to
// offscreen canvases. Outlines are added automatically so the art stays crisp.

export const PALETTE: Record<string, string> = {
  '0': '#1a1c2c', // outline / near-black
  '1': '#5d275d', // plum
  '2': '#b13e53', // red
  '3': '#ef7d57', // orange
  '4': '#ffcd75', // yellow
  '5': '#a7f070', // light green
  '6': '#38b764', // green
  '7': '#257179', // teal
  '8': '#29366f', // navy
  '9': '#3b5dc9', // blue
  a: '#41a6f6', // sky
  b: '#73eff7', // cyan
  c: '#f4f4f4', // white
  d: '#94b0c2', // light grey
  e: '#566c86', // grey
  f: '#333c57', // dark grey
  g: '#8b5a3c', // brown
  h: '#c28560', // tan
  i: '#5a3a29', // dark brown
  j: '#f2c49b', // light skin
  k: '#d08b6a', // skin shade
  l: '#6e2d43', // maroon
  m: '#e8e0a8', // pale sand
  n: '#d4a95b', // gold / dark sand
  o: '#7a4a8c', // purple
  p: '#c86ab3', // pink
  q: '#2e6b3f', // dark green
  r: '#9c6b43', // wood
  s: '#a3462f', // rust
  t: '#4b2c20', // deep brown
  u: '#b8c7d3', // pale grey
  v: '#ffe9a8', // pale yellow
  w: '#3e2a4f', // dusk purple
};

export interface SpriteDef {
  rows: string[];
  /** Map letters to palette keys (for palette-swapped templates). */
  map?: Record<string, string>;
  outline?: string | false;
}

const cache = new Map<string, HTMLCanvasElement>();
const defs = new Map<string, SpriteDef>();

export function defineSprite(name: string, def: SpriteDef) {
  defs.set(name, def);
  // Drop the cached canvas and its flipped / greyed copies.
  for (const k of [...cache.keys()]) if (k === name || k.startsWith(`${name}:`)) cache.delete(k);
}

export function hasSprite(name: string) {
  return defs.has(name);
}

/** Resolve a sprite to a grid of CSS colours (null = transparent). */
export function pixels(def: SpriteDef): (string | null)[][] {
  const h = def.rows.length;
  const w = Math.max(...def.rows.map((r) => r.length));
  const grid: (string | null)[][] = [];
  for (let y = 0; y < h; y++) {
    const row: (string | null)[] = [];
    for (let x = 0; x < w; x++) {
      const ch = def.rows[y][x] ?? '.';
      const key = def.map?.[ch] ?? ch;
      row.push(key === '.' || key === ' ' ? null : (PALETTE[key] ?? null));
    }
    grid.push(row);
  }
  const outline = def.outline === undefined ? '0' : def.outline;
  if (outline) {
    const oc = PALETTE[outline];
    const add: [number, number][] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (grid[y][x]) continue;
        const n = [grid[y - 1]?.[x], grid[y + 1]?.[x], grid[y]?.[x - 1], grid[y]?.[x + 1]];
        if (n.some((c) => c && c !== oc)) add.push([x, y]);
      }
    }
    for (const [x, y] of add) grid[y][x] = oc;
  }
  return grid;
}

export function render(def: SpriteDef, flip = false): HTMLCanvasElement {
  const grid = pixels(def);
  const c = document.createElement('canvas');
  c.width = grid[0]?.length ?? 1;
  c.height = grid.length;
  const ctx = c.getContext('2d')!;
  grid.forEach((row, y) =>
    row.forEach((col, x) => {
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(flip ? c.width - 1 - x : x, y, 1, 1);
    }),
  );
  return c;
}

/** Get a cached canvas for a named sprite ("name" or "name:flip"). */
export function sprite(name: string): HTMLCanvasElement {
  let c = cache.get(name);
  if (c) return c;
  const flip = name.endsWith(':flip');
  const base = flip ? name.slice(0, -5) : name;
  const def = defs.get(base);
  if (!def) {
    c = document.createElement('canvas');
    c.width = c.height = 16;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(0, 0, 16, 16);
  } else {
    c = render(def, flip);
  }
  cache.set(name, c);
  return c;
}

/** A scaled-up copy for the DOM (battle sprites, portraits). */
export function spriteCanvas(name: string, scale: number, className = 'px'): HTMLCanvasElement {
  const src = sprite(name);
  const c = document.createElement('canvas');
  c.width = src.width * scale;
  c.height = src.height * scale;
  c.className = className;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/** Crop the top part of a sprite (for portraits). */
export function portrait(name: string, scale: number, rows = 10): HTMLCanvasElement {
  const src = sprite(name);
  const c = document.createElement('canvas');
  c.width = src.width * scale;
  c.height = rows * scale;
  c.className = 'px portrait';
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, src.width, rows, 0, 0, c.width, c.height);
  return c;
}

/** A desaturated copy of a sprite (for people the Silence has touched). */
export function greySprite(name: string): HTMLCanvasElement {
  const k = `${name}:grey`;
  let c = cache.get(k);
  if (c) return c;
  const src = sprite(name);
  c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const l = Math.round(d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11);
    const v = Math.round(l * 0.85 + 30);
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = Math.min(255, v + 12);
  }
  ctx.putImageData(img, 0, 0);
  cache.set(k, c);
  return c;
}
