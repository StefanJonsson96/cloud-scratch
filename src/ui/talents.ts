// Choosing a talent: one of three perks, every few hero levels.

import { modal } from '../engine/input';
import { sfx } from '../engine/audio';
import { TALENTS, talentChoices, talentsEarned, type TalentId } from '../battle/classes';
import type { GameState } from '../state';
import { h, menu } from './dom';

export function pendingTalents(g: GameState): number {
  const hero = g.party.find((m) => m.id === 'hero');
  return hero ? Math.max(0, talentsEarned(hero.level) - g.talents.length) : 0;
}

/** Let the player pick every talent they have earned. */
export async function offerTalents(g: GameState) {
  while (pendingTalents(g) > 0) {
    const choices = talentChoices(g.talents);
    if (!choices.length) return;
    const pick = await modal(() => choose(g, choices));
    g.talents.push(pick);
    sfx('levelup');
  }
}

async function choose(g: GameState, choices: TalentId[]): Promise<TalentId> {
  const host = h('div');
  const panel = h(
    'div',
    { class: 'panel talent-panel', style: { maxWidth: '560px' } },
    h('h2', null, '✨ ¡Nuevo talento!', h('small', null, ' · New talent')),
    h('p', { class: 'muted' }, `${g.heroName} has grown. Choose one perk for the whole party — it lasts the rest of the game.`),
    host,
  );
  const ov = h('div', { class: 'overlay' }, panel);
  document.body.append(ov);
  sfx('levelup');
  const i = await menu(
    host,
    choices.map((id) => {
      const t = TALENTS[id];
      return { label: `${t.icon} ${t.name}`, right: t.en, sub: t.desc };
    }),
  );
  ov.remove();
  return choices[i ?? 0];
}
