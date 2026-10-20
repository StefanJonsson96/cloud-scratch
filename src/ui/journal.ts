// The travel diary (Menú → Diario): the story so far, retold in the past.

import { JOURNAL, journalEntries } from '../data/journal';
import { agree } from '../story/agree';
import type { GameState } from '../state';
import { h } from './dom';
import { spanish } from './spanish';

export function journalView(g: GameState, el: HTMLElement) {
  const entries = journalEntries(g.flags);
  el.append(
    h(
      'p',
      { class: 'muted' },
      'Your travel diary: the story so far, told the Spanish way — the imperfecto sets the scene (vivía, estaba), the indefinido tells what happened (fui, encontré). Tap any word.',
    ),
  );
  let ch = -1;
  for (const e of entries) {
    if (e.ch !== ch) {
      ch = e.ch;
      el.append(h('h3', null, spanish(ch === 0 ? 'Prólogo' : `Capítulo ${ch}`)));
    }
    el.append(
      h(
        'div',
        { class: 'rule diario-entry' },
        h('h4', null, spanish(e.title[0]), h('small', { class: 'muted' }, ` · ${e.title[1]}`)),
        h('div', null, spanish(agree(e.es, g.gender))),
        h('span', { class: 'log-en' }, agree(e.en, g.gender)),
      ),
    );
  }
  if (!entries.length) el.append(h('p', null, spanish('Todavía no hay nada.'), h('span', { class: 'log-en' }, 'Nothing yet.')));
  else if (entries.length < JOURNAL.length) el.append(h('p', { class: 'muted' }, spanish('Continuará…'), ' · To be continued…'));
}
