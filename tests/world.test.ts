import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MAPS } from '../src/world/maps';
import { TILES, tileInfo } from '../src/world/tiles';
import { ENEMIES } from '../src/battle/enemies';
import { ITEMS, ACCESSORIES } from '../src/data/items';
import { unknownWords } from '../src/learn/dictionary';
import type { MapDef } from '../src/world/types';
import type { GameState } from '../src/state';

const storyDir = path.join(__dirname, '../src/story');
const storySrc = fs
  .readdirSync(storyDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => fs.readFileSync(path.join(storyDir, f), 'utf8'))
  .join('\n');
const SCRIPT_IDS = new Set([...storySrc.matchAll(/script\('([^']+)'/g)].map((m) => m[1]));

/** A game state with every flag set, so gates are open and late NPCs exist. */
const allFlags = new Proxy({}, { get: () => true, has: () => true }) as Record<string, boolean>;
const LATE = { flags: allFlags } as unknown as GameState;

function tileAt(m: MapDef, x: number, y: number, g?: GameState) {
  const p = g && m.patch?.(g).find(([px, py]) => px === x && py === y);
  if (p) return p[2];
  return m.rows[y]?.[x] ?? ' ';
}

function scriptName(id: string) {
  return id.split(':')[0];
}

describe('maps', () => {
  for (const m of Object.values(MAPS)) {
    describe(m.id, () => {
      it('has a rectangular grid of known tiles', () => {
        const w = m.rows[0].length;
        m.rows.forEach((r, y) => expect(r.length, `row ${y}`).toBe(w));
        for (const r of m.rows) for (const ch of r) expect(TILES[ch], `tile "${ch}"`).toBeDefined();
      });

      it('has valid warps', () => {
        for (const w of m.warps ?? []) {
          const to = MAPS[w.to];
          expect(to, `warp to ${w.to}`).toBeDefined();
          if (w.when && w.blocked) expect(SCRIPT_IDS.has(scriptName(w.blocked)), w.blocked).toBe(true);
          if (w.to === m.id && w.when?.(LATE) === false) continue; // locked doors
          const t = tileAt(to, w.tx, w.ty, LATE);
          expect(tileInfo(t).solid, `${m.id} → ${w.to} (${w.tx},${w.ty}) lands on "${t}"`).toBe(false);
          // Arrivals must not sit on another warp (that would bounce you straight back).
          expect((to.warps ?? []).some((v) => v.x === w.tx && v.y === w.ty), `${m.id} → ${w.to} lands on a warp`).toBe(false);
        }
      });

      it('references scripts, enemies and items that exist', () => {
        const ids = [
          ...(m.npcs ?? []).map((n) => n.talk),
          ...(m.things ?? []).map((t) => t.script),
          ...(m.triggers ?? []).map((t) => t.script),
          ...(m.onEnter ? [m.onEnter] : []),
        ];
        for (const id of ids) expect(SCRIPT_IDS.has(scriptName(id)), `script ${id}`).toBe(true);
        for (const t of m.things ?? []) {
          const [name, item] = t.script.split(':');
          if (name === 'chest') expect(ITEMS[item] ?? ACCESSORIES[item], `chest item ${item}`).toBeDefined();
        }
        for (const [group] of m.encounters?.groups ?? []) for (const e of group) expect(ENEMIES[e], e).toBeDefined();
      });

      it('can reach every NPC, object, exit and trigger on foot', () => {
        const H = m.rows.length;
        const W = m.rows[0].length;
        const npcAt = new Set((m.npcs ?? []).filter((n) => !n.when || n.when(LATE)).map((n) => `${n.x},${n.y}`));
        const warpAt = new Set((m.warps ?? []).map((w) => `${w.x},${w.y}`));
        const ok = (x: number, y: number) =>
          x >= 0 && y >= 0 && x < W && y < H && !tileInfo(tileAt(m, x, y, LATE)).solid && !npcAt.has(`${x},${y}`);
        // Start from every arrival point into this map.
        const starts: [number, number][] = [];
        for (const other of Object.values(MAPS)) for (const w of other.warps ?? []) if (w.to === m.id) starts.push([w.tx, w.ty]);
        if (m.id === 'casa_abuela') starts.push([8, 3]);
        expect(starts.length, 'map has no way in').toBeGreaterThan(0);
        const seen = new Set<string>();
        const q = [...starts];
        for (const [x, y] of q) seen.add(`${x},${y}`);
        while (q.length) {
          const [x, y] = q.shift()!;
          if (warpAt.has(`${x},${y}`) && !starts.some(([sx, sy]) => sx === x && sy === y)) continue;
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            const nx = x + dx;
            const ny = y + dy;
            const k = `${nx},${ny}`;
            if (seen.has(k)) continue;
            if (!ok(nx, ny) && !warpAt.has(k)) continue;
            seen.add(k);
            q.push([nx, ny]);
          }
        }
        const near = (x: number, y: number, r = 1) => {
          for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.abs(dx) + Math.abs(dy) <= r && seen.has(`${x + dx},${y + dy}`)) return true;
          return false;
        };
        for (const n of m.npcs ?? []) expect(near(n.x, n.y), `npc ${n.id} at ${n.x},${n.y}`).toBe(true);
        // Objects behind a market stall are talked to from two tiles away.
        for (const t of m.things ?? []) expect(near(t.x, t.y, 2), `thing ${t.script} at ${t.x},${t.y}`).toBe(true);
        for (const w of m.warps ?? []) expect(seen.has(`${w.x},${w.y}`) || near(w.x, w.y), `warp at ${w.x},${w.y}`).toBe(true);
        for (const t of m.triggers ?? []) {
          let any = false;
          for (let y = t.y; y < t.y + (t.h ?? 1); y++) for (let x = t.x; x < t.x + (t.w ?? 1); x++) any ||= seen.has(`${x},${y}`);
          expect(any, `trigger ${t.script}`).toBe(true);
        }
      });
    });
  }
});

describe('story text', () => {
  // Pull the Spanish arguments out of the story scripts.
  const spanish: string[] = [];
  const clean = (s: string) => s.replace(/\$\{[^}]*\}/g, 'Alex');
  for (const m of storySrc.matchAll(/\.(?:say|ask|quiz)\(\s*'[^']*',\s*(['`"])((?:\\.|(?!\1).)*)\1/g)) spanish.push(clean(m[2]));
  for (const m of storySrc.matchAll(/\[\s*(['`"])((?:\\.|(?!\1).)*)\1,\s*(['`"])/g)) spanish.push(clean(m[2]));
  for (const m of storySrc.matchAll(/narrate\(\s*(['`"])(?:\\.|(?!\1).)*\1,\s*(['`"])((?:\\.|(?!\2).)*)\2/g)) spanish.push(clean(m[3]));

  it('found the dialogue', () => {
    expect(spanish.length).toBeGreaterThan(200);
  });

  it('every Spanish word in the story can be tapped for a translation', () => {
    const names = ['Alex', 'Mateo', 'Lola', 'Rosa', 'Bruno', 'Pepe', 'Lucía', 'Dani', 'Paco', 'Ramón', 'Carmen', 'Julián', 'Pilar', 'Encarna', 'Marta', 'Tomás', 'Sevilla', 'Santiago', 'Compostela', 'Asturias', 'Puerto', 'Alegre', 'San', 'Sabor', 'Callado', 'Glotón', 'Gólem', 'LUZ', 'COLOR', 'VOZ', 'ÑAM', 'Doña', 'Don', 'R', 'Zzz', 'Clic', 'Auuu', 'Auuuuu', 'Auu', 'Uf', 'Eco', 'Monte', 'Gaviota', 'Madrid', 'exhausted', "I'm", 'name', 'm'];
    const missing = new Map<string, number>();
    for (const line of spanish) {
      for (const w of unknownWords(line, names)) {
        if (/^[A-Z]{2,}$/.test(w) && w.length <= 3) continue;
        missing.set(w.toLowerCase(), (missing.get(w.toLowerCase()) ?? 0) + 1);
      }
    }
    expect([...missing.keys()].sort()).toEqual([]);
  });
});
