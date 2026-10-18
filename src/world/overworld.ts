// The overworld: tile maps, walking, NPCs, warps, triggers and random encounters.

import { TILE, tileInfo, tileCanvas } from './tiles';
import { sprite, greySprite, hasSprite } from '../engine/sprites';
import { heldDirection, isRunning, pushLayer } from '../engine/input';
import { sfx } from '../engine/audio';
import type { Dir, GameState } from '../state';
import type { MapDef, NpcDef } from './types';

export const VIEW_W = 17;
export const VIEW_H = 13;

export interface NpcInstance {
  def: NpcDef;
  x: number;
  y: number;
  dir: Dir;
  homeX: number;
  homeY: number;
  moveT: number;
  fromX: number;
  fromY: number;
  nextWander: number;
  step: number;
}

export interface WorldHost {
  g: GameState;
  getMap(id: string): MapDef;
  runScript(id: string, npc?: NpcInstance, at?: { x: number; y: number }): Promise<void>;
  encounter(map: MapDef): Promise<void>;
  openMenu(): Promise<void>;
  changeMap(map: MapDef): void;
}

const DELTA: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export class Overworld {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  map!: MapDef;
  npcs: NpcInstance[] = [];
  px = 0;
  py = 0;
  dir: Dir = 'down';
  private moving = false;
  private moveT = 0;
  private fromX = 0;
  private fromY = 0;
  private stepCount = 0;
  private stepsSinceBattle = 0;
  private time = 0;
  /** Number of things (scripts, menus, battles) currently blocking movement. */
  private locks = 0;
  private last = 0;
  private running = false;
  private popLayer: (() => void) | null = null;
  private fading = 0;
  private patches = new Map<string, string>();

  constructor(private host: WorldHost) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = VIEW_W * TILE;
    this.canvas.height = VIEW_H * TILE;
    this.canvas.className = 'world';
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
  }

  get g() {
    return this.host.g;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.popLayer = pushLayer((a) => {
      if (this.locked) return true;
      if (a === 'confirm') void this.interact();
      else if (a === 'menu' || a === 'cancel') void this.lockWhile(this.host.openMenu());
      else if (a === 'up' || a === 'down' || a === 'left' || a === 'right') {
        if (!this.moving) this.tryStep(a);
      }
      return true;
    });
    this.last = performance.now();
    const loop = (t: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    this.popLayer?.();
    this.popLayer = null;
  }

  get locked() {
    return this.locks > 0;
  }

  async lockWhile<T>(p: Promise<T>): Promise<T> {
    this.locks++;
    try {
      return await p;
    } finally {
      this.locks--;
    }
  }

  lock() {
    this.locks++;
  }

  unlock() {
    this.locks = Math.max(0, this.locks - 1);
  }

  // ------------------------------------------------------------- loading
  load(mapId: string, x: number, y: number, dir: Dir = this.dir) {
    this.map = this.host.getMap(mapId);
    this.px = x;
    this.py = y;
    this.dir = dir;
    this.moving = false;
    this.stepsSinceBattle = 0;
    this.g.map = mapId;
    this.g.x = x;
    this.g.y = y;
    this.g.dir = dir;
    this.refreshNpcs();
    this.applyMood();
    this.host.changeMap(this.map);
  }

  refreshNpcs() {
    this.patches.clear();
    for (const [x, y, ch] of this.map.patch?.(this.g) ?? []) this.patches.set(`${x},${y}`, ch);
    const keep = new Map(this.npcs.map((n) => [n.def.id, n]));
    this.npcs = (this.map.npcs ?? [])
      .filter((d) => !d.when || d.when(this.g))
      .map((d) => {
        const old = keep.get(d.id);
        if (old && old.def === d) return old;
        return { def: d, x: d.x, y: d.y, dir: d.dir ?? 'down', homeX: d.x, homeY: d.y, moveT: 1, fromX: d.x, fromY: d.y, nextWander: 2 + Math.random() * 3, step: 0 };
      });
  }

  applyMood() {
    const grey = this.map.grey?.(this.g) ?? 0;
    this.canvas.style.filter = grey > 0 ? `grayscale(${grey}) brightness(${1 - grey * 0.12})` : '';
  }

  // ------------------------------------------------------------ queries
  tileAt(x: number, y: number): string {
    const p = this.patches.get(`${x},${y}`);
    if (p) return p;
    const row = this.map.rows[y];
    if (!row || x < 0 || x >= row.length) return this.map.outside ?? ' ';
    return row[x] ?? ' ';
  }

  npcAt(x: number, y: number): NpcInstance | undefined {
    return this.npcs.find((n) => n.x === x && n.y === y);
  }

  passable(x: number, y: number, forNpc = false): boolean {
    if (y < 0 || y >= this.map.rows.length || x < 0 || x >= this.map.rows[0].length) return false;
    if (tileInfo(this.tileAt(x, y)).solid) return false;
    if (this.npcAt(x, y)) return false;
    if (forNpc) {
      if (x === this.px && y === this.py) return false;
      if ((this.map.warps ?? []).some((w) => w.x === x && w.y === y)) return false;
    }
    return true;
  }

  // ----------------------------------------------------------- movement
  private tryStep(d: Dir) {
    this.dir = d;
    this.g.dir = d;
    const [dx, dy] = DELTA[d];
    const nx = this.px + dx;
    const ny = this.py + dy;
    const warp = (this.map.warps ?? []).find((w) => w.x === nx && w.y === ny);
    const inside = ny >= 0 && ny < this.map.rows.length && nx >= 0 && nx < this.map.rows[0].length;
    if (!inside && !warp) return;
    if (!warp && !this.passable(nx, ny)) return;
    if (warp && this.npcAt(nx, ny)) return;
    this.moving = true;
    this.moveT = 0;
    this.fromX = this.px;
    this.fromY = this.py;
    this.px = nx;
    this.py = ny;
    this.stepCount++;
  }

  private async arrive() {
    this.g.x = this.px;
    this.g.y = this.py;
    const warp = (this.map.warps ?? []).find((w) => w.x === this.px && w.y === this.py);
    if (warp) {
      if (warp.when && !warp.when(this.g)) {
        // Step back and explain why.
        this.px = this.fromX;
        this.py = this.fromY;
        this.g.x = this.px;
        this.g.y = this.py;
        if (warp.blocked) await this.lockWhile(this.host.runScript(warp.blocked));
        return;
      }
      await this.lockWhile(this.transition(warp.to, warp.tx, warp.ty, warp.dir ?? this.dir));
      return;
    }
    const trig = (this.map.triggers ?? []).find(
      (t) => this.px >= t.x && this.px < t.x + (t.w ?? 1) && this.py >= t.y && this.py < t.y + (t.h ?? 1) && (!t.when || t.when(this.g)),
    );
    if (trig) {
      await this.lockWhile(this.host.runScript(trig.script));
      return;
    }
    if (tileInfo(this.tileAt(this.px, this.py)).encounter && this.map.encounters) {
      this.stepsSinceBattle++;
      const rate = this.map.encounters.rate * (this.g.settings.encounters === 'low' ? 0.45 : 1);
      if (this.stepsSinceBattle > 4 && Math.random() < rate) {
        this.stepsSinceBattle = 0;
        await this.lockWhile(this.host.encounter(this.map));
      }
    }
  }

  async transition(to: string, x: number, y: number, dir: Dir) {
    sfx('door');
    await this.fade(1);
    this.load(to, x, y, dir);
    await this.fade(0);
    if (this.map.onEnter) await this.host.runScript(this.map.onEnter);
  }

  fade(target: 0 | 1): Promise<void> {
    return new Promise((resolve) => {
      const startV = this.fading;
      const t0 = performance.now();
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / 220);
        this.fading = startV + (target - startV) * k;
        if (!this.running) this.render();
        if (k < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  private async interact() {
    if (this.moving) return;
    const [dx, dy] = DELTA[this.dir];
    const tx = this.px + dx;
    const ty = this.py + dy;
    const npc = this.npcAt(tx, ty);
    if (npc) {
      npc.dir = ({ up: 'down', down: 'up', left: 'right', right: 'left' } as const)[this.dir];
      await this.lockWhile(this.host.runScript(npc.def.talk, npc));
      this.refreshNpcs();
      return;
    }
    // Talk across counters and stalls.
    const thing = (this.map.things ?? []).find(
      (t) => (t.x === tx && t.y === ty) || (t.x === tx + dx && t.y === ty + dy && tileInfo(this.tileAt(tx, ty)).name === 'stall'),
    );
    if (thing && (!thing.when || thing.when(this.g))) {
      await this.lockWhile(this.host.runScript(thing.script, undefined, { x: thing.x, y: thing.y }));
      this.refreshNpcs();
    }
  }

  // -------------------------------------------------------------- update
  update(dt: number) {
    this.time += dt;
    if (this.moving) {
      const speed = isRunning() ? 8.5 : 4.6;
      this.moveT += dt * speed;
      if (this.moveT >= 1) {
        this.moveT = 1;
        this.moving = false;
        void this.arrive();
      }
    }
    if (!this.moving && !this.locked) {
      const d = heldDirection();
      if (d) this.tryStep(d);
    }
    for (const n of this.npcs) this.updateNpc(n, dt);
  }

  private updateNpc(n: NpcInstance, dt: number) {
    if (n.moveT < 1) {
      n.moveT = Math.min(1, n.moveT + dt * 3);
      return;
    }
    if (!n.def.wander || this.locked || n.def.grey?.(this.g)) return;
    n.nextWander -= dt;
    if (n.nextWander > 0) return;
    n.nextWander = 1.5 + Math.random() * 3;
    const dirs: Dir[] = ['up', 'down', 'left', 'right'];
    const d = dirs[Math.floor(Math.random() * 4)];
    const [dx, dy] = DELTA[d];
    const nx = n.x + dx;
    const ny = n.y + dy;
    n.dir = d;
    if (Math.abs(nx - n.homeX) > 2 || Math.abs(ny - n.homeY) > 2) return;
    if (!this.passable(nx, ny, true)) return;
    if (this.moving && nx === this.px && ny === this.py) return;
    n.fromX = n.x;
    n.fromY = n.y;
    n.x = nx;
    n.y = ny;
    n.moveT = 0;
    n.step++;
  }

  // -------------------------------------------------------------- render
  render() {
    const c = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const mapW = this.map.rows[0].length * TILE;
    const mapH = this.map.rows.length * TILE;
    const t = this.moving ? this.moveT : 1;
    const ppx = (this.fromX + (this.px - this.fromX) * t) * TILE;
    const ppy = (this.fromY + (this.py - this.fromY) * t) * TILE;
    let camX = Math.round(ppx + TILE / 2 - W / 2);
    let camY = Math.round(ppy + TILE / 2 - H / 2);
    camX = mapW <= W ? Math.round((mapW - W) / 2) : Math.max(0, Math.min(mapW - W, camX));
    camY = mapH <= H ? Math.round((mapH - H) / 2) : Math.max(0, Math.min(mapH - H, camY));

    c.fillStyle = '#1a1c2c';
    c.fillRect(0, 0, W, H);
    const frame = Math.floor(this.time * 2) % 2;
    const x0 = Math.floor(camX / TILE) - 1;
    const y0 = Math.floor(camY / TILE) - 1;
    for (let ty = y0; ty <= y0 + VIEW_H + 2; ty++) {
      for (let tx = x0; tx <= x0 + VIEW_W + 2; tx++) {
        const ch = this.tileAt(tx, ty);
        if (ch === 'C' && this.g.flags[`chest:${this.map.id}:${tx}:${ty}`]) {
          const under = [this.tileAt(tx - 1, ty), this.tileAt(tx + 1, ty), this.tileAt(tx, ty + 1)].find((t) => !tileInfo(t).solid) ?? 'w';
          c.drawImage(tileCanvas(under, tx, ty, frame), tx * TILE - camX, ty * TILE - camY);
          this.drawOpenChest(tx * TILE - camX, ty * TILE - camY);
        } else {
          c.drawImage(tileCanvas(ch, tx, ty, frame), tx * TILE - camX, ty * TILE - camY);
        }
      }
    }

    // Sprites, back to front.
    const ents: { y: number; draw: () => void }[] = [];
    for (const n of this.npcs) {
      const k = n.moveT;
      const nx = (n.fromX + (n.x - n.fromX) * k) * TILE - camX;
      const ny = (n.fromY + (n.y - n.fromY) * k) * TILE - camY;
      const f = k < 1 ? (n.step % 2 ? 1 : 2) : 0;
      const grey = n.def.grey?.(this.g) ?? false;
      ents.push({ y: ny, draw: () => this.drawChar(n.def.sprite, n.dir, f, nx, ny, grey, n.def.still) });
    }
    const pf = this.moving ? (this.stepCount % 2 ? 1 : 2) : 0;
    ents.push({ y: ppy - camY, draw: () => this.drawChar('hero', this.dir, pf, ppx - camX, ppy - camY, false) });
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.draw());

    if (this.map.dark) {
      const cx = ppx - camX + TILE / 2;
      const cy = ppy - camY + TILE / 2;
      const grad = c.createRadialGradient(cx, cy, 18, cx, cy, 90);
      grad.addColorStop(0, 'rgba(10,8,20,0)');
      grad.addColorStop(1, 'rgba(10,8,20,0.82)');
      c.fillStyle = grad;
      c.fillRect(0, 0, W, H);
    }
    if (this.fading > 0) {
      c.fillStyle = `rgba(10,8,20,${this.fading})`;
      c.fillRect(0, 0, W, H);
    }
  }

  private drawChar(base: string, dir: Dir, f: number, x: number, y: number, grey: boolean, still?: boolean) {
    const c = this.ctx;
    let name: string;
    if (still || !hasSprite(`${base}_down_0`)) name = base;
    else {
      const d = dir === 'right' ? 'left' : dir;
      name = `${base}_${d}_${f}`;
      if (dir === 'right') name += ':flip';
    }
    // Shadow.
    c.fillStyle = 'rgba(0,0,0,0.22)';
    c.fillRect(Math.round(x) + 3, Math.round(y) + 14, 10, 2);
    const img = grey ? greySprite(name) : sprite(name);
    const bob = still ? Math.round(Math.sin(this.time * 3) * 1.5) : 0;
    c.drawImage(img, Math.round(x - (img.width - 16) / 2), Math.round(y) - 1 + bob - (img.height - 16));
  }

  private drawOpenChest(x: number, y: number) {
    const c = this.ctx;
    c.fillStyle = '#5a3a29';
    c.fillRect(x + 2, y + 6, 12, 9);
    c.fillStyle = '#1a1c2c';
    c.fillRect(x + 3, y + 7, 10, 3);
    c.fillStyle = '#8b5a3c';
    c.fillRect(x + 3, y + 10, 10, 4);
    c.fillStyle = '#5a3a29';
    c.fillRect(x + 2, y + 2, 12, 4);
  }
}
