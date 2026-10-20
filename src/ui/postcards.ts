// The postcard album (Menú → Postales) and the note that pops up when a new
// postcard arrives.

import { POSTCARDS, POSTCARD_REGIONS, unlockedPostcards, type Postcard } from '../data/postcards';
import { STOP_BY_ID } from '../world/stops';
import type { GameState } from '../state';
import { sfx } from '../engine/audio';
import { speak } from '../engine/speech';
import { h, clear } from './dom';
import { spanish } from './spanish';

function regionName(region: string): [string, string] {
  const stop = STOP_BY_ID[region];
  return POSTCARD_REGIONS[region] ?? [stop?.es ?? region, stop?.en ?? ''];
}

export function postcardAlbum(g: GameState, el: HTMLElement) {
  const got = new Set(unlockedPostcards(g.flags).map((p) => p.id));
  const detail = h('div', { class: 'card postal-detail', hidden: true });
  const open = (p: Postcard) => {
    sfx('select');
    detail.hidden = false;
    clear(detail);
    detail.append(
      h(
        'div',
        { class: 'row', style: { justifyContent: 'space-between' } },
        h('h3', null, `${p.icon} `, spanish(p.es), h('small', null, p.en)),
        h('button', { class: 'cc-tool', title: 'Listen', onclick: () => speak(p.note[0]) }, '🔊'),
      ),
      h('div', null, spanish(p.note[0])),
      h('span', { class: 'log-en' }, p.note[1]),
      h('div', { class: 'muted postal-place' }, `📍 ${p.place}`),
    );
    detail.scrollIntoView?.({ block: 'nearest' });
  };
  el.append(
    h('p', { class: 'muted' }, `${got.size}/${POSTCARDS.length} postales · Collect a postcard from every place on your journey. Tap one to read it.`),
    detail,
  );
  for (const region of new Set(POSTCARDS.map((p) => p.region))) {
    const [es, en] = regionName(region);
    const grid = h('div', { class: 'postal-grid' });
    for (const p of POSTCARDS.filter((x) => x.region === region)) {
      grid.append(
        got.has(p.id)
          ? h('button', { class: 'postal', onclick: () => open(p) }, h('span', { class: 'postal-icon' }, p.icon), h('span', { class: 'postal-title' }, spanish(p.es)), h('small', null, p.en))
          : h('div', { class: 'postal locked', title: `Not found yet — somewhere in ${p.place}` }, h('span', { class: 'postal-icon' }, '❔'), h('span', { class: 'postal-title' }, '???'), h('small', null, `📍 ${p.place}`)),
      );
    }
    el.append(h('h3', null, es, h('small', null, en)), grid);
  }
}

/** "📮 Nueva postal: El AVE" — shown when a story flag unlocks postcards. */
export function postcardToast(cards: readonly Postcard[]) {
  if (!cards.length) return;
  const one = cards.length === 1;
  const names = cards.map((p) => p.es).join(', ');
  const toast = h(
    'div',
    { class: 'postal-toast', role: 'status' },
    h('span', { class: 'postal-icon' }, '📮'),
    h(
      'div',
      null,
      spanish(one ? `Nueva postal: ${names}` : `Nuevas postales: ${names}`),
      h('small', null, `New postcard${one ? '' : 's'}: ${cards.map((p) => p.en).join(', ')} · Menú → Postales`),
    ),
  );
  document.body.append(toast);
  sfx('save');
  setTimeout(() => toast.remove(), 4500);
}
