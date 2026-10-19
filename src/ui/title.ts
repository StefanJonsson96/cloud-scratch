// Title screen and new-game setup.

import { h, menu, clear, appendAll } from './dom';
import { spriteCanvas, PALETTE } from '../engine/sprites';
import { unlockAudio, playMusic, sfx } from '../engine/audio';
import { dayStreak, hasSave, load, deleteSave, type GameState, type NewGameOptions } from '../state';
import { characterCreation } from './creation';
import { cornerButtons } from './corner';

export interface TitleResult {
  mode: 'continue' | 'new';
  save?: GameState;
  options?: NewGameOptions;
}

/** Draws a field of azulejo tiles — the blue-and-white ceramic of Spanish walls. */
function azulejos(canvas: HTMLCanvasElement) {
  const size = 24;
  const w = (canvas.width = Math.ceil(window.innerWidth / 3));
  const hgt = (canvas.height = Math.ceil(window.innerHeight / 3));
  const c = canvas.getContext('2d')!;
  c.fillStyle = PALETTE['8'];
  c.fillRect(0, 0, w, hgt);
  for (let y = 0; y < hgt; y += size) {
    for (let x = 0; x < w; x += size) {
      c.fillStyle = PALETTE.u;
      c.fillRect(x + 1, y + 1, size - 2, size - 2);
      c.fillStyle = PALETTE['9'];
      const m = size / 2;
      c.fillRect(x + m - 1, y + 3, 2, size - 6);
      c.fillRect(x + 3, y + m - 1, size - 6, 2);
      c.fillRect(x + m - 4, y + m - 4, 8, 8);
      c.fillStyle = PALETTE.u;
      c.fillRect(x + m - 2, y + m - 2, 4, 4);
      c.fillStyle = PALETTE['4'];
      c.fillRect(x + m - 1, y + m - 1, 2, 2);
      c.fillStyle = PALETTE['9'];
      for (const [cx, cy] of [
        [x + 2, y + 2],
        [x + size - 5, y + 2],
        [x + 2, y + size - 5],
        [x + size - 5, y + size - 5],
      ])
        c.fillRect(cx, cy, 3, 3);
    }
  }
}

export function showTitle(): Promise<TitleResult> {
  return new Promise((resolve) => {
    const tiles = h('canvas', { class: 'tiles', 'aria-hidden': 'true' }) as HTMLCanvasElement;
    azulejos(tiles);
    const inner = h('div', { class: 'title-inner' });
    const screen = h('div', { class: 'title-screen' }, tiles, h('div', { class: 'title-corner' }, cornerButtons()), inner);
    document.body.append(screen);
    document.body.classList.add('no-world');

    const home = () => {
      clear(inner);
      const existing = hasSave() ? load() : null;
      const streak = existing ? dayStreak(existing.stats.days) : 0;
      appendAll(
        inner,
        h('div', { class: 'title-sprites' }, spriteCanvas('mateo_down_0', 4), spriteCanvas('hero_down_0', 5), spriteCanvas('lola_down_0', 4)),
        h('h1', { class: 'logo' }, 'Palabrista'),
        h('p', { class: 'logo-sub' }, 'A turn-based adventure where your spells are Spanish words — Spanish from Spain.'),
        streak ? h('div', { class: 'streak' }, `🔥 Racha: ${streak} ${streak === 1 ? 'día' : 'días'} seguidos`) : null,
      );
      const items = [];
      if (existing) items.push({ label: '▶ Continuar', sub: `${existing.heroName} · Capítulo ${existing.chapter} · ${Math.round(existing.stats.playMs / 60000)} min` });
      items.push({ label: '✨ Nueva partida', sub: 'New game' });
      items.push({ label: '❓ Cómo se juega', sub: 'How to play' });
      const host = h('div', { style: { width: '100%', display: 'flex', justifyContent: 'center' } });
      inner.append(host, h('p', { class: 'footnote' }, 'Arrow keys or tap · Enter to choose. Best with sound on: every character speaks their lines in Spanish from Spain.'));
      void menu(host, items).then((i) => {
        unlockAudio();
        playMusic('town');
        const id = existing ? i : (i ?? 0) + 1;
        if (id === 0 && existing) finish({ mode: 'continue', save: existing });
        else if (id === 1) void setup(!!existing);
        else help();
      });
    };

    const help = () => {
      clear(inner);
      inner.append(
        h('h2', { class: 'logo', style: { fontSize: '34px' } }, 'Cómo se juega'),
        h(
          'div',
          { class: 'panel', style: { textAlign: 'left' } },
          h('p', null, '🗺️ Walk with the arrow keys / WASD (or the on-screen pad). Talk and confirm with Enter, Space or Z.'),
          h('p', null, '⚔️ Battles are turn-based. The bar at the top shows who acts next. Enemies announce their next move in Spanish — read it and react (defend, protect, or put them to sleep).'),
          h('p', null, '✨ Special moves need Spanish: answer a quick challenge. Right = full power, wrong = weak — and there is no clock: take your time. Each friend practises a different skill: you do vocabulary, Mateo does el/la, ser/estar and por/para, Lola does verbs.'),
          h('p', null, '🔥 Right answers fill the Racha. When it is full, unleash a Palabra Final by building a sentence.'),
          h('p', null, '🇬🇧 Translations are always one tap away: press EN (or T) for a whole line, or tap any underlined word. 💡 gives a hint in challenges.'),
          h('p', null, '📖 The menu (M) holds the Grimorio — your dictionary, verb tables and grammar notes — plus a quick Repaso to review on the go.'),
        ),
      );
      const host = h('div');
      inner.append(host);
      void menu(host, [{ label: '↩ Volver', sub: 'Back' }], { cancel: true }).then(home);
    };

    const setup = async (overwrite: boolean) => {
      clear(inner);
      inner.classList.add('wide');
      const r = await characterCreation(inner, overwrite);
      inner.classList.remove('wide');
      if (!r) return home();
      if (overwrite) deleteSave();
      finish({ mode: 'new', options: r });
    };

    const finish = (r: TitleResult) => {
      sfx('select');
      screen.remove();
      resolve(r);
    };
    home();
  });
}
