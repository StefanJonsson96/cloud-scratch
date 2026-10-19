#!/usr/bin/env node
// An automated player that follows the game's own objective marker — no
// hard-coded routes. Every step it reads where the 🎯 marker points (the
// target, or the exit that leads towards it), walks there, interacts, and
// plays whatever happens: dialogue, challenges (answering some wrong on
// purpose), shops, battles. If the objective doesn't change after many tries,
// the game wasn't clear enough about what to do next, and it says where.
//
//   npm run build && npx vite preview --port 4173 &
//   node tools/playtest/goalbot.mjs [--url http://localhost:4173/] [--wrong 0.15]
//        [--until <flag>] [--from save.json] [--save out.json] [--minutes 60] [--shots dir]
//
// Needs Playwright with a Chromium (`npx playwright install chromium`), or set
// PLAYWRIGHT_MODULE to its index.mjs and CHROMIUM to a browser binary.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]?.startsWith('--') ? 'true' : (all[i + 1] ?? 'true')]] : acc), []),
);
const URL = args.url ?? 'http://localhost:4173/';
const WRONG = Number(args.wrong ?? 0.15);
const UNTIL = args.until;
const MINUTES = Number(args.minutes ?? 90);
const SHOTS = args.shots;
const STUCK_AFTER = Number(args.stuck ?? 14);

async function loadPlaywright() {
  for (const name of [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    if (!name) continue;
    try {
      return await import(name);
    } catch {
      /* try the next one */
    }
  }
  throw new Error('Playwright not found: npm i -D playwright, or set PLAYWRIGHT_MODULE');
}

// ------------------------------------------------------------ playing the UI
const ANSWER = `(() => {
  const ch = window.__challenge;
  const card = document.querySelector('.challenge-card:not(.answered)');
  if (!ch || !card) return 'no challenge';
  if (ch.kind === 'choice') { card.querySelectorAll('.cc-option')[ch.answer].click(); return 'choice'; }
  if (ch.kind === 'type') { card.querySelector('.cc-input').value = ch.accepted[0]; card.querySelector('.cc-submit').click(); return 'type'; }
  const tiles = [...card.querySelectorAll('.cc-tile')];
  const used = new Set();
  for (const w of ch.solutions[0]) { const i = tiles.findIndex((b, j) => !used.has(j) && b.textContent === w); used.add(i); tiles[i].click(); }
  card.querySelector('.cc-submit').click();
  return 'order';
})()`;

const WRONG_ANSWER = `(() => {
  const ch = window.__challenge;
  const card = document.querySelector('.challenge-card:not(.answered)');
  if (ch.kind === 'choice') { card.querySelectorAll('.cc-option')[(ch.answer + 1) % ch.options.length].click(); return 'wrong'; }
  if (ch.kind === 'type') { card.querySelector('.cc-input').value = 'xyz'; card.querySelector('.cc-submit').click(); return 'wrong'; }
  card.querySelector('.cc-tile').click(); card.querySelector('.cc-submit').click(); return 'wrong';
})()`;

/** Pick a battle command: heal or revive when needed, otherwise attack with skills. */
const BATTLE = `(() => {
  const items = [...document.querySelectorAll('.b-cmd .menu-item')];
  const label = (b) => b.querySelector('.mi-label')?.textContent ?? '';
  const ult = items.find((b) => b.classList.contains('ult'));
  const nextStep = document.querySelector('.bg-step.next')?.textContent ?? '';
  if (nextStep && !document.querySelector('.b-cmd .menu.skills')) {
    const want = ['Atacar', 'Palabras', 'Defender'].find((w) => nextStep.includes(w));
    const b = items.find((x) => label(x).includes(want));
    if (b) { b.click(); return 'tutorial'; }
  }
  if (ult) { ult.click(); return 'ultimate'; }
  const hp = [...document.querySelectorAll('.b-member')].map((m) => {
    const [a, b] = (m.querySelector('.bar.hp .bar-text')?.textContent ?? 'PV 1/1').replace('PV ', '').split('/').map(Number);
    return a / b;
  });
  const hurt = hp.some((x) => x > 0 && x < 0.4);
  const dead = hp.some((x) => x === 0);
  if (document.querySelector('.b-cmd .menu.skills')) {
    const ok = items.filter((b) => !b.disabled && !b.classList.contains('back-item'));
    const want = (names) => ok.find((b) => names.some((n) => label(b).includes(n)));
    const pick = (dead && want(['Despertar'])) || (hurt && want(['Canción', 'Luz', 'Recuerdo'])) ||
      want(['Rayo', 'Fuego', 'Hielo', 'Viento', 'Golpe', 'Ancla', 'Remolino', 'Nana', 'Desafinar', 'Agua']) || ok[0];
    if (pick) { pick.click(); return 'skill'; }
    return 'back';
  }
  const skillBtn = items.find((b) => /Palabras|Técnicas|Canciones|Memoria/.test(label(b)));
  if (skillBtn && !skillBtn.disabled && Math.random() < 0.8) { skillBtn.click(); return 'skills'; }
  items[0].click();
  return 'attack';
})()`;

const stats = { defeats: [], wrong: 0, answered: 0 };

async function step(page) {
  const s = await page.evaluate(() => {
    const vis = (sel) => { const el = document.querySelector(sel); return !!el && !el.hidden && el.offsetParent !== null; };
    return {
      chOpen: !!document.querySelector('.challenge-card:not(.answered)'),
      chDone: !!document.querySelector('.challenge-card.answered'),
      tip: !!document.querySelector('.b-tip'),
      resultMenu: !!document.querySelector('.b-result .menu'),
      result: !!document.querySelector('.b-result'),
      cmdTarget: !!document.querySelector('.b-cmd .menu-item.back'),
      cmdMenu: !!document.querySelector('.b-cmd .menu'),
      battle: !!document.querySelector('.battle'),
      dlgOpts: document.querySelectorAll('.dialogue .dlg-options .menu-item').length,
      dlg: vis('.dialogue'),
      card: !!document.querySelector('.chapter-card'),
      travel: !!document.querySelector('.travel-panel .menu'),
      shop: !!document.querySelector('.overlay .panel:not(.talent-panel):not(.travel-panel) .menu'),
      overlay: !!document.querySelector('.overlay'),
    };
  });
  if (s.chOpen) {
    stats.answered++;
    const wrong = Math.random() < WRONG;
    if (wrong) stats.wrong++;
    await page.evaluate(wrong ? WRONG_ANSWER : ANSWER);
    await page.waitForTimeout(300);
    return 'challenge';
  }
  if (s.chDone || s.tip || s.card) return press(page, 'Enter', 'continue');
  if (s.resultMenu) {
    const where = await page.evaluate(() => [window.__game.g.map, window.__game.g.party.map((m) => `${m.id}:L${m.level}`).join(' ')]);
    stats.defeats.push(where.join(' '));
    console.log('      defeat', where.join(' '));
    return press(page, 'Enter', 'retry');
  }
  if (s.result) return press(page, 'Enter', 'victory', 400);
  if (s.cmdTarget) return press(page, 'Enter', 'target');
  if (s.cmdMenu) {
    const r = await page.evaluate(BATTLE);
    if (r === 'back') await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    return 'command';
  }
  if (s.dlgOpts) {
    // Any option: wrong answers in conversation just come round again.
    const i = Math.floor(Math.random() * s.dlgOpts);
    await page.evaluate((i) => document.querySelectorAll('.dialogue .dlg-options .menu-item')[i].click(), i);
    await page.waitForTimeout(250);
    return 'option';
  }
  if (s.dlg) return press(page, 'Enter', 'dialogue', 200);
  // The train: the objective's station is selected already.
  if (s.travel) return press(page, 'Enter', 'train', 400);
  if (s.shop) return press(page, 'Escape', 'shop');
  if (s.battle) {
    await page.waitForTimeout(300);
    return 'battle';
  }
  if (s.overlay) return press(page, 'Enter', 'overlay');
  return 'idle';
}

async function press(page, key, label, ms = 250) {
  await page.keyboard.press(key);
  await page.waitForTimeout(ms);
  return label;
}

async function untilIdle(page) {
  let idle = 0;
  for (let i = 0; i < 2000; i++) {
    const r = await step(page);
    if (r === 'idle') {
      if (++idle >= 3) return;
      await page.waitForTimeout(200);
    } else idle = 0;
  }
}

// ------------------------------------------------------------ moving around
/** Shortest path (arrow keys) to (tx, ty), or to a tile next to it when `adjacent`. */
async function route(page, tx, ty, adjacent) {
  return page.evaluate(([tx, ty, adjacent]) => {
    const w = window.__game.world;
    const key = (x, y) => `${x},${y}`;
    const warps = new Set((w.map.warps || []).map((v) => key(v.x, v.y)));
    const goal = (x, y) => (adjacent ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty);
    const prev = new Map([[key(w.px, w.py), null]]);
    const q = [[w.px, w.py]];
    let end = goal(w.px, w.py) ? [w.px, w.py] : null;
    while (q.length && !end) {
      const [x, y] = q.shift();
      for (const [dx, dy, d] of [[0, -1, 'ArrowUp'], [0, 1, 'ArrowDown'], [-1, 0, 'ArrowLeft'], [1, 0, 'ArrowRight']]) {
        const nx = x + dx, ny = y + dy;
        if (prev.has(key(nx, ny))) continue;
        const isGoal = goal(nx, ny);
        // Don't wander through other exits on the way.
        if (warps.has(key(nx, ny)) && !(isGoal && !adjacent)) continue;
        if (!w.passable(nx, ny)) continue;
        prev.set(key(nx, ny), [x, y, d]);
        if (isGoal) { end = [nx, ny]; break; }
        q.push([nx, ny]);
      }
    }
    if (!end) return null;
    const keys = [];
    let cur = key(end[0], end[1]);
    while (prev.get(cur)) { const [px, py, d] = prev.get(cur); keys.unshift(d); cur = key(px, py); }
    return { keys, end };
  }, [tx, ty, adjacent]);
}

async function busy(page) {
  return page.evaluate(() => window.__game.world.locked || !!document.querySelector('.battle, .dialogue:not([hidden]), .challenge-backdrop, .chapter-card, .overlay'));
}

/** Walk to (tx, ty) or next to it; stops early if anything happens on the way. Returns 'arrived' | 'event' | 'unreachable'. */
async function walk(page, tx, ty, adjacent) {
  for (let n = 0; n < 400; n++) {
    const r = await route(page, tx, ty, adjacent);
    if (!r) return 'unreachable';
    if (!r.keys.length) return 'arrived';
    const before = await page.evaluate(() => [window.__game.world.px, window.__game.world.py, window.__game.g.map]);
    await page.keyboard.down(r.keys[0]);
    await page.waitForTimeout(60);
    await page.keyboard.up(r.keys[0]);
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(40);
      if (await busy(page)) {
        await untilIdle(page);
        return 'event';
      }
      const now = await page.evaluate(() => [window.__game.world.px, window.__game.world.py, window.__game.g.map, window.__game.world.moving]);
      if (now[2] !== before[2]) return 'event';
      if ((now[0] !== before[0] || now[1] !== before[1]) && !now[3]) break;
    }
  }
  return 'unreachable';
}

async function interact(page, tx, ty) {
  await page.evaluate(([tx, ty]) => {
    const w = window.__game.world;
    w.dir = tx > w.px ? 'right' : tx < w.px ? 'left' : ty > w.py ? 'down' : 'up';
  }, [tx, ty]);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  await untilIdle(page);
}

async function info(page) {
  return page.evaluate(() => {
    const gm = window.__game;
    const w = gm.world;
    const goal = document.querySelector('.hud-goal');
    return {
      goal: goal && !goal.hidden ? goal.dataset.key : null,
      goalAt: !!goal?.dataset.at,
      marker: w.marker,
      map: w.map.id,
      x: w.px,
      y: w.py,
      warp: !!w.marker && (w.map.warps || []).some((v) => v.x === w.marker[0] && v.y === w.marker[1]),
      passable: !!w.marker && w.passable(w.marker[0], w.marker[1]),
      flags: gm.g.flags,
      chapter: gm.g.chapter,
      party: gm.g.party.map((m) => `${m.id}:L${m.level}`).join(' '),
    };
  });
}

// ------------------------------------------------------------ main
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
if (args.from) {
  const save = readFileSync(args.from, 'utf8');
  await page.evaluate((s) => localStorage.setItem('palabrista-save-v1', s), save);
}
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
for (let i = 0; i < 4 && (await page.$('.creation')); i++) {
  await page.click('.creation .cr-nav .btn.primary');
  await page.waitForTimeout(250);
}
await page.evaluate(() => {
  const s = window.__game.g.settings;
  s.textSpeed = 'instant';
  s.voice = false;
});
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const t0 = Date.now();
const log = (msg) => console.log(`[${Math.round((Date.now() - t0) / 1000)}s] ${msg}`);
let last = null;
let same = 0;
let result = 'timeout';
let shot = 0;
while (Date.now() - t0 < MINUTES * 60000) {
  await untilIdle(page);
  const s = await info(page);
  if (UNTIL && s.flags[UNTIL]) { result = `reached ${UNTIL}`; break; }
  if (s.flags.fin && (!s.goal || !s.goalAt)) { result = `finished: ${s.goal ?? 'the end'}`; break; }
  if (s.goal !== last) {
    log(`🎯 ${s.goal ?? '(none)'}   [${s.map} ${s.x},${s.y} · ch${s.chapter} · ${s.party}]`);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${String(++shot).padStart(3, '0')}.png` });
    last = s.goal;
    same = 0;
  } else if (++same >= STUCK_AFTER) {
    result = `stuck on "${s.goal}" at ${s.map} ${s.x},${s.y} (marker ${JSON.stringify(s.marker)})`;
    break;
  }
  if (!s.goal) { result = 'no objective'; break; }
  if (!s.marker) {
    // Not on a route to the goal: let the game catch up (or report it).
    await page.waitForTimeout(500);
    continue;
  }
  const [mx, my] = s.marker;
  if (s.warp || s.passable) {
    const r = await walk(page, mx, my, false);
    if (r === 'arrived') {
      // A spot to examine rather than step on: look around it.
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) await interact(page, mx + dx, my + dy);
    }
  } else {
    const r = await walk(page, mx, my, true);
    if (r === 'arrived') await interact(page, mx, my);
  }
}
const end = await info(page);
// Keep the game where the run ended, to start the next run from (--from).
if (args.save) writeFileSync(args.save, await page.evaluate(() => JSON.stringify(window.__game.g)));
console.log(`\nResult: ${result}`);
console.log(`Chapter ${end.chapter} · ${end.party} · ${stats.answered} answers (${stats.wrong} wrong on purpose) · ${stats.defeats.length} defeats · ${Math.round((Date.now() - t0) / 60000)} min`);
if (stats.defeats.length) console.log('Defeats:', stats.defeats.join(' | '));
if (errors.length) console.log('Page errors:', errors);
await browser.close();
process.exit(result === 'finished' || result.startsWith('reached') ? 0 : 1);
