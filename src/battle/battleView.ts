// Battle screen: enemies with their Spanish intent bubbles, the turn-order
// timeline, the Racha meter, party cards, command menus and hit animations.

import {
  alive,
  fleeChance,
  has,
  livingEnemies,
  livingParty,
  party,
  preview,
  RACHA_MAX,
  enemies,
  type BattleEvent,
  type BattleState,
  type Unit,
} from './rules';
import { ELEMENTS, MEMBERS, STATUSES, ULTIMATES, skillsFor, type MemberId, type SkillDef, type TargetKind } from './defs';
import { ENEMIES } from './enemies';
import { ITEMS } from '../data/items';
import type { GameState, LevelUp } from '../state';
import type { Grade } from '../learn/check';
import { h, clear, menu, wait, waitConfirm, type MenuItem } from '../ui/dom';
import { spanish, hideGloss } from '../ui/spanish';
import { cornerButtons } from '../ui/corner';
import { spriteCanvas, portrait, sprite } from '../engine/sprites';
import { pushLayer } from '../engine/input';
import { sfx } from '../engine/audio';
import { speak } from '../engine/speech';
import { xpToNext } from './defs';

export type Command =
  | { kind: 'attack'; target: string }
  | { kind: 'skill'; skill: SkillDef; target?: string }
  | { kind: 'defend' }
  | { kind: 'item'; item: string; target: string }
  | { kind: 'flee' }
  | { kind: 'ultimate'; target?: string };

export interface Practiced {
  es: string;
  en: string;
  grade: Grade;
}

const SKILL_MENU: Record<MemberId, { es: string; en: string; icon: string }> = {
  hero: { es: 'Palabras', en: 'Words', icon: '✨' },
  mateo: { es: 'Técnicas', en: 'Techniques', icon: '💪' },
  lola: { es: 'Canciones', en: 'Songs', icon: '🎵' },
  bruno: { es: 'Memoria', en: 'Memory', icon: '🌙' },
};

export class BattleView {
  readonly layer: HTMLElement;
  private enemyRow: HTMLElement;
  private partyRow: HTMLElement;
  private cmd: HTMLElement;
  private logEl: HTMLElement;
  private timeline: HTMLElement;
  private racha: HTMLElement;
  private banner: HTMLElement;
  private enemyEls = new Map<string, HTMLElement>();
  private memberEls = new Map<string, HTMLElement>();
  private showIntentEn = new Set<string>();
  private active: Unit | null = null;

  constructor(
    host: HTMLElement,
    private s: BattleState,
    private g: GameState,
    bg: string,
  ) {
    this.timeline = h('div', { class: 'b-timeline', title: 'Turn order — who acts next' });
    this.racha = h('div', { class: 'b-racha' });
    this.enemyRow = h('div', { class: 'b-enemies' });
    this.partyRow = h('div', { class: 'b-party' });
    this.cmd = h('div', { class: 'b-cmd' });
    this.logEl = h('div', { class: 'b-log', 'aria-live': 'polite' });
    this.banner = h('div', { class: 'b-banner', hidden: true });
    this.layer = h(
      'div',
      { class: `battle bg-${bg}` },
      h('div', { class: 'b-top' }, this.timeline, h('div', { class: 'b-top-right' }, this.racha, cornerButtons())),
      h('div', { class: 'b-stage' }, this.enemyRow, this.banner),
      this.logEl,
      h('div', { class: 'b-bottom' }, this.partyRow, this.cmd),
    );
    host.append(this.layer);
    this.build();
    this.refresh();
  }

  /** The practice checklist shown during the tutorial fight. */
  checklist(steps: { es: string; en: string; done: boolean }[]) {
    let el = this.layer.querySelector<HTMLElement>('.b-goals');
    if (!el) {
      el = h('div', { class: 'b-goals' });
      this.layer.querySelector('.b-top')!.insertBefore(el, this.racha.parentElement);
    }
    const next = steps.find((t) => !t.done);
    el.replaceChildren(
      h('div', { class: 'bg-title' }, 'Práctica', h('small', null, ' · try each one')),
      ...steps.map((t) =>
        h(
          'div',
          { class: `bg-step${t.done ? ' done' : ''}${t === next ? ' next' : ''}` },
          h('span', { class: 'bg-check', 'aria-hidden': 'true' }, t.done ? '✅' : '⬜'),
          h('span', null, spanish(t.es), h('small', null, t.en)),
        ),
      ),
    );
  }

  destroy() {
    hideGloss();
    this.layer.remove();
  }

  private speedK() {
    const sp = this.g.settings.textSpeed;
    return sp === 'instant' ? 0.4 : sp === 'fast' ? 0.65 : 1;
  }

  private pause(ms: number) {
    return wait(ms * this.speedK());
  }

  // ------------------------------------------------------------------ build
  private build() {
    clear(this.enemyRow);
    this.enemyEls.clear();
    for (const e of enemies(this.s)) this.addEnemy(e);
    clear(this.partyRow);
    this.memberEls.clear();
    for (const u of party(this.s)) {
      const card = h(
        'button',
        { class: 'b-member', 'data-uid': u.uid },
        h('div', { class: 'bm-face' }, portrait(`${MEMBERS[u.id as MemberId].sprite}_down_0`, 3, 10)),
        h(
          'div',
          { class: 'bm-info' },
          h('div', { class: 'bm-name' }, h('span', null, u.name), h('span', { class: 'bm-lv' }, `Nv ${u.level}`)),
          h('div', { class: 'bar hp' }, h('div', { class: 'fill' }), h('span', { class: 'bar-text' })),
          h('div', { class: 'bar mp' }, h('div', { class: 'fill' }), h('span', { class: 'bar-text' })),
          h('div', { class: 'b-status' }),
        ),
      );
      this.memberEls.set(u.uid, card);
      this.partyRow.append(card);
    }
  }

  private addEnemy(e: Unit) {
    const def = ENEMIES[e.id];
    const src = sprite(def.sprite);
    const scale = def.boss ? (src.width >= 32 ? 4 : 5) : src.width >= 24 ? 3 : 4;
    const intent = h('button', { class: 'b-intent no-advance', title: 'Tap for the English translation' });
    intent.addEventListener('click', (ev) => {
      if ((ev.target as HTMLElement).closest('.gloss')) return;
      if (this.showIntentEn.has(e.uid)) this.showIntentEn.delete(e.uid);
      else this.showIntentEn.add(e.uid);
      this.renderIntent(e);
    });
    const el = h(
      'button',
      { class: `b-enemy${def.boss ? ' boss' : ''}`, 'data-uid': e.uid },
      intent,
      h('div', { class: 'be-sprite' }, spriteCanvas(def.sprite, scale)),
      h('div', { class: 'be-name' }, h('span', { lang: 'es' }, e.name), h('span', { class: 'be-en' }, def.en.replace(/^The /, ''))),
      h('div', { class: 'bar hp small' }, h('div', { class: 'fill' })),
      h('div', { class: 'b-status' }),
    );
    el.title = `${def.desc[0]}\n${def.desc[1]}\nWeak: ${def.weak.map((w) => ELEMENTS[w].en).join(', ') || '—'}`;
    this.enemyEls.set(e.uid, el);
    this.enemyRow.append(el);
  }

  private renderIntent(e: Unit) {
    const el = this.enemyEls.get(e.uid)?.querySelector<HTMLElement>('.b-intent');
    if (!el) return;
    clear(el);
    if (!alive(e) || !e.intent) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const sleeping = has(e, 'dormido') || has(e, 'congelado') || has(e, 'aturdido');
    el.classList.toggle('danger', e.intent.icon === '💥' || has(e, 'cargando'));
    el.classList.toggle('asleep', sleeping);
    el.append(h('span', { class: 'bi-icon' }, sleeping ? '💤' : e.intent.icon), spanish(e.intent.es));
    const always = this.g.settings.translations === 'always';
    if (always || this.showIntentEn.has(e.uid)) el.append(h('span', { class: 'bi-en' }, e.intent.en));
    else el.append(h('span', { class: 'bi-tap' }, 'EN'));
  }

  // ---------------------------------------------------------------- refresh
  refresh() {
    for (const u of this.s.units) {
      if (u.side === 'enemy' && !this.enemyEls.has(u.uid)) this.addEnemy(u);
    }
    for (const e of enemies(this.s)) {
      const el = this.enemyEls.get(e.uid)!;
      el.classList.toggle('ko', !alive(e));
      (el.querySelector('.fill') as HTMLElement).style.width = `${(100 * e.hp) / e.maxHp}%`;
      this.renderStatuses(el.querySelector('.b-status')!, e);
      this.renderIntent(e);
    }
    for (const u of party(this.s)) {
      const el = this.memberEls.get(u.uid)!;
      el.classList.toggle('ko', !alive(u));
      el.classList.toggle('active', this.active === u);
      const [hp, mp] = el.querySelectorAll<HTMLElement>('.bar');
      (hp.querySelector('.fill') as HTMLElement).style.width = `${(100 * u.hp) / u.maxHp}%`;
      hp.classList.toggle('low', u.hp < u.maxHp * 0.3);
      hp.querySelector('.bar-text')!.textContent = `PV ${u.hp}/${u.maxHp}`;
      (mp.querySelector('.fill') as HTMLElement).style.width = `${u.maxMp ? (100 * u.mp) / u.maxMp : 0}%`;
      mp.querySelector('.bar-text')!.textContent = `PM ${u.mp}/${u.maxMp}`;
      this.renderStatuses(el.querySelector('.b-status')!, u);
    }
    // Timeline.
    clear(this.timeline);
    this.timeline.append(h('span', { class: 'tl-label' }, 'Turnos'));
    preview(this.s, 7).forEach((u, i) => {
      const face =
        u.side === 'party' ? portrait(`${MEMBERS[u.id as MemberId].sprite}_down_0`, 2, 10) : spriteCanvas(ENEMIES[u.id].sprite, 1, 'px tl-enemy');
      this.timeline.append(h('div', { class: `tl-item ${u.side}${i === 0 ? ' now' : ''}`, title: u.name }, face));
    });
    // Racha.
    clear(this.racha);
    const full = this.s.racha >= RACHA_MAX;
    this.racha.classList.toggle('full', full);
    this.racha.append(
      h('span', { class: 'rc-label', title: 'Streak: right answers fill it, mistakes drain it. When full: Palabra Final!' }, full ? '¡Racha llena!' : 'Racha'),
      ...Array.from({ length: RACHA_MAX }, (_, i) => h('span', { class: `pip${i < this.s.racha ? ' on' : ''}` }, '🔥')),
    );
  }

  private renderStatuses(el: Element, u: Unit) {
    clear(el as HTMLElement);
    for (const st of u.statuses) {
      const d = STATUSES[st.id];
      el.append(h('span', { class: `st ${d.good ? 'good' : 'bad'}`, title: `${d.es} (${d.en}): ${d.desc}` }, d.icon));
    }
    if (u.defending) el.append(h('span', { class: 'st good', title: 'Defendiendo (Defending): half damage' }, '🛡️'));
    if (u.guarding) {
      const ward = this.s.units.find((x) => x.uid === u.guarding);
      el.append(h('span', { class: 'st good', title: `Protegiendo a ${ward?.name}` }, '🤝'));
    }
  }

  setActive(u: Unit) {
    this.active = u;
    for (const [uid, el] of this.enemyEls) el.classList.toggle('acting', uid === u.uid);
    this.refresh();
  }

  // ---------------------------------------------------------------- messages
  log(es: string | undefined, en?: string) {
    clear(this.logEl);
    if (es) this.logEl.append(spanish(es));
    if (en) this.logEl.append(h('span', { class: 'log-en' }, en));
  }

  async message(m: { es: string; en: string }, ms = 1100) {
    this.log(m.es, m.en);
    await this.pause(ms);
  }

  async intro(m: { es: string; en: string }) {
    this.log(m.es, m.en);
    if (this.g.settings.voice) speak(m.es);
    this.layer.classList.add('entering');
    await this.pause(900);
    this.layer.classList.remove('entering');
  }

  async tip(text: string) {
    const box = h('div', { class: 'b-tip' }, h('div', { class: 'b-tip-text', html: text }), h('div', { class: 'b-tip-more' }, 'OK ▶'));
    this.layer.append(box);
    await waitConfirm(box);
    box.remove();
  }

  async enemyTurn(e: Unit) {
    const el = this.enemyEls.get(e.uid);
    el?.classList.add('turn');
    if (e.intent) this.log(e.intent.es, this.g.settings.translations === 'always' ? e.intent.en : undefined);
    await this.pause(650);
    el?.classList.remove('turn');
  }

  // ---------------------------------------------------------------- commands
  async chooseCommand(actor: Unit): Promise<Command> {
    for (;;) {
      clear(this.cmd);
      const mid = actor.id as MemberId;
      const sk = SKILL_MENU[mid];
      const silenced = has(actor, 'mudo');
      const ult = this.s.racha >= RACHA_MAX && !silenced;
      const consumables = Object.entries(this.s.inventory).filter(([id, n]) => n > 0 && ITEMS[id] && ITEMS[id].kind !== 'key');
      const flee = fleeChance(this.s);
      this.cmd.append(h('div', { class: 'cmd-title' }, spanish(`¿Qué hace ${actor.name}?`), h('span', { class: 'log-en' }, `What will ${actor.name} do?`)));
      const entries: { id: string; item: MenuItem }[] = [];
      if (ult) {
        const u = ULTIMATES[mid];
        entries.push({ id: 'ult', item: { label: `🌟 ${u.name}`, sub: `Palabra Final — ${u.desc}`, className: 'ult' } });
      }
      entries.push(
        { id: 'attack', item: { label: '⚔️ Atacar', sub: 'Attack (roll a d20)' } },
        {
          id: 'skill',
          item: {
            label: `${sk.icon} ${sk.es}`,
            sub: silenced ? 'Silenced! 🤐' : `${sk.en} — needs Spanish`,
            disabled: silenced,
          },
        },
        { id: 'defend', item: { label: '🛡️ Defender', sub: 'Defend (+PM)' } },
        { id: 'item', item: { label: '🎒 Objetos', sub: `Items (${consumables.reduce((a, [, n]) => a + n, 0)})`, disabled: !consumables.length } },
        { id: 'flee', item: { label: '🏃 Huir', sub: flee ? `Run (${Math.round(flee * 100)}%)` : 'Run — impossible!', disabled: !flee } },
      );
      const pick = await menu(this.cmd, entries.map((e) => e.item), { columns: 2 });
      const id = pick === null ? 'attack' : entries[pick].id;
      let cmd: Command | null = null;
      if (id === 'attack') {
        const t = await this.pickTarget('enemy', actor, 'Atacar');
        if (t) cmd = { kind: 'attack', target: t };
      } else if (id === 'defend') cmd = { kind: 'defend' };
      else if (id === 'flee') cmd = { kind: 'flee' };
      else if (id === 'skill') cmd = await this.chooseSkill(actor);
      else if (id === 'item') cmd = await this.chooseItem(actor);
      else if (id === 'ult') {
        const u = ULTIMATES[mid];
        if (u.target === 'enemy') {
          const t = await this.pickTarget('enemy', actor, u.name);
          if (t) cmd = { kind: 'ultimate', target: t };
        } else cmd = { kind: 'ultimate' };
      }
      if (cmd) {
        clear(this.cmd);
        return cmd;
      }
    }
  }

  private async chooseSkill(actor: Unit): Promise<Command | null> {
    clear(this.cmd);
    const skills = skillsFor(actor.id as MemberId, actor.level, actor.cls);
    this.cmd.append(h('div', { class: 'cmd-title' }, `${SKILL_MENU[actor.id as MemberId].es} · ${MEMBERS[actor.id as MemberId].styleEn} challenge`));
    const items: MenuItem[] = skills.map((sk) => {
      const noTarget = this.candidates(sk.target, actor).length === 0;
      const noMp = actor.mp < sk.mp;
      return {
        label: `${ELEMENTS[sk.element].icon} ${sk.name}`,
        right: `${sk.mp} PM`,
        sub: `${sk.en} — ${noTarget ? (sk.target === 'deadAlly' ? 'nobody has fallen' : 'no one to target') : sk.desc}`,
        disabled: noMp || noTarget,
        title: noMp ? 'Not enough PM (magic points). Defend to recover some.' : sk.desc,
      };
    });
    items.push({ label: '↩ Volver', sub: 'Back', className: 'back-item' });
    const i = await menu(this.cmd, items, { cancel: true, className: 'skills' });
    if (i === null || i >= skills.length) return null;
    const skill = skills[i];
    if (skill.target === 'allEnemies' || skill.target === 'allAllies' || skill.target === 'self') return { kind: 'skill', skill };
    const t = await this.pickTarget(skill.target, actor, skill.name);
    return t ? { kind: 'skill', skill, target: t } : this.chooseSkill(actor);
  }

  private async chooseItem(actor: Unit): Promise<Command | null> {
    clear(this.cmd);
    const list = Object.entries(this.s.inventory).filter(([id, n]) => n > 0 && ITEMS[id] && ITEMS[id].kind !== 'key');
    this.cmd.append(h('div', { class: 'cmd-title' }, 'Objetos · Items'));
    const i = await menu(
      this.cmd,
      [
        ...list.map(([id, n]) => {
          const reviveless = ITEMS[id].kind === 'revive' && this.candidates('deadAlly', actor).length === 0;
          return {
            label: `${ITEMS[id].icon} ${ITEMS[id].name}`,
            right: `×${n}`,
            sub: `${ITEMS[id].en} — ${reviveless ? 'nobody has fallen' : ITEMS[id].desc}`,
            disabled: reviveless,
          };
        }),
        { label: '↩ Volver', sub: 'Back', className: 'back-item' },
      ],
      { cancel: true, className: 'skills' },
    );
    if (i === null || i >= list.length) return null;
    const item = ITEMS[list[i][0]];
    if (item.kind === 'healAll') return { kind: 'item', item: item.id, target: actor.uid };
    const t = await this.pickTarget(item.kind === 'revive' ? 'deadAlly' : 'ally', actor, item.name);
    return t ? { kind: 'item', item: item.id, target: t } : this.chooseItem(actor);
  }

  private candidates(kind: TargetKind, actor: Unit): Unit[] {
    switch (kind) {
      case 'enemy':
      case 'allEnemies':
        return livingEnemies(this.s);
      case 'deadAlly':
        return party(this.s).filter((u) => !alive(u));
      case 'otherAlly':
        return livingParty(this.s).filter((u) => u.uid !== actor.uid);
      default:
        return livingParty(this.s);
    }
  }

  /** Let the player pick a target by tapping it or with the arrow keys. */
  pickTarget(kind: TargetKind, actor: Unit, what: string): Promise<string | null> {
    const cands = this.candidates(kind, actor);
    clear(this.cmd);
    const enemySide = kind === 'enemy';
    this.cmd.append(
      h('div', { class: 'cmd-title' }, `${what}: ${enemySide ? '¿A quién?' : '¿A quién?'}`, h('span', { class: 'log-en' }, 'Choose a target — tap it, or use ← → and Enter')),
    );
    if (!cands.length) {
      this.cmd.append(h('div', { class: 'cmd-empty' }, kind === 'deadAlly' ? 'Nadie ha caído. (Nobody has fallen.)' : 'No hay objetivos. (No targets.)'));
    }
    const back = h('button', { class: 'menu-item back' }, '↩ Volver (Back)');
    this.cmd.append(back);
    return new Promise((resolve) => {
      let i = 0;
      const els = cands.map((u) => (u.side === 'enemy' ? this.enemyEls.get(u.uid)! : this.memberEls.get(u.uid)!));
      const focus = (n: number) => {
        els.forEach((e) => e.classList.remove('targeting'));
        i = (n + els.length) % Math.max(1, els.length);
        els[i]?.classList.add('targeting');
      };
      const cleanup = () => {
        pop();
        els.forEach((e) => {
          e.classList.remove('targeting', 'targetable');
          e.removeEventListener('click', handlers.get(e)!);
        });
        back.remove();
      };
      const done = (v: string | null) => {
        cleanup();
        sfx(v ? 'select' : 'cancel');
        resolve(v);
      };
      const handlers = new Map<HTMLElement, (ev: Event) => void>();
      els.forEach((el, n) => {
        el.classList.add('targetable');
        const fn = (ev: Event) => {
          if ((ev.target as HTMLElement).closest('.b-intent')) return;
          done(cands[n].uid);
        };
        handlers.set(el, fn);
        el.addEventListener('click', fn);
      });
      back.addEventListener('click', () => done(null));
      const pop = pushLayer((a) => {
        if (a === 'left' || a === 'up') {
          focus(i - 1);
          sfx('blip');
        } else if (a === 'right' || a === 'down') {
          focus(i + 1);
          sfx('blip');
        } else if (a === 'confirm') done(cands.length ? cands[i].uid : null);
        else if (a === 'cancel') done(null);
        else if (a.startsWith('num')) {
          const n = Number(a.slice(3)) - 1;
          if (n < cands.length) done(cands[n].uid);
        }
        return true;
      });
      if (els.length) focus(0);
    });
  }

  // -------------------------------------------------------------- animation
  private elFor(uid: string): HTMLElement | undefined {
    return this.enemyEls.get(uid) ?? this.memberEls.get(uid);
  }

  private floater(uid: string, text: string, cls: string) {
    const el = this.elFor(uid);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const lr = this.layer.getBoundingClientRect();
    const f = h('div', { class: `floater ${cls}` }, text);
    f.style.left = `${r.left - lr.left + r.width / 2 + (Math.random() * 24 - 12)}px`;
    f.style.top = `${r.top - lr.top + r.height * (el.classList.contains('b-enemy') ? 0.45 : 0.2)}px`;
    this.layer.append(f);
    setTimeout(() => f.remove(), 1400);
  }

  private flash(uid: string, cls: string) {
    const el = this.elFor(uid);
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 450);
  }

  private showBanner(name: string, en: string | undefined, element?: string) {
    clear(this.banner);
    this.banner.className = `b-banner el-${element ?? 'fisico'}`;
    this.banner.append(h('strong', { lang: 'es' }, name), en && en !== name ? h('span', null, en) : '');
    this.banner.hidden = false;
  }

  async play(events: BattleEvent[]) {
    for (const e of events) {
      switch (e.t) {
        case 'action': {
          const u = this.s.units.find((x) => x.uid === e.uid);
          this.showBanner(e.name, e.en, e.element);
          if (u) this.log(`${u.side === 'enemy' ? u.subject : u.name} usa ${e.name}.`, `${u.name} uses ${e.en ?? e.name}.`);
          if (u?.side === 'party') this.flash(u.uid, 'acting-flash');
          if (e.element && e.element !== 'fisico') sfx('magic');
          await this.pause(420);
          break;
        }
        case 'roll':
          sfx('dice');
          this.floater(e.uid, `🎲 ${e.value}`, e.value === 20 ? 'roll crit' : e.value === 1 ? 'roll fail' : 'roll');
          await this.pause(380);
          break;
        case 'damage': {
          sfx(e.crit ? 'crit' : 'hit');
          this.flash(e.uid, 'hit');
          this.floater(e.uid, `-${e.amount}`, `dmg el-${e.element}${e.crit ? ' crit' : ''}`);
          if (e.crit) this.floater(e.uid, '¡Crítico!', 'note crit');
          if (e.eff === 'weak') this.floater(e.uid, '¡Es muy eficaz!', 'note weak');
          if (e.eff === 'resist') this.floater(e.uid, 'No es muy eficaz…', 'note resist');
          if (e.combo && (e.combo.includes('×') || e.combo.includes('¡'))) this.floater(e.uid, e.combo, 'note combo');
          this.refresh();
          await this.pause(e.eff || e.combo || e.crit ? 650 : 420);
          break;
        }
        case 'heal':
          if (e.amount > 0 || !e.mp) {
            sfx('heal');
            this.floater(e.uid, `+${e.amount}${e.mp ? ' PM' : ''}`, e.mp ? 'mp' : 'heal');
          }
          this.refresh();
          await this.pause(320);
          break;
        case 'status': {
          const d = STATUSES[e.id];
          if (e.on) this.floater(e.uid, `${d.icon} ${d.es}`, `status ${d.good ? 'good' : 'bad'}`);
          this.refresh();
          if (e.on) await this.pause(380);
          break;
        }
        case 'miss':
          sfx('miss');
          this.floater(e.uid, 'Fallo', 'miss');
          await this.pause(380);
          break;
        case 'ko': {
          sfx('ko');
          const u = this.s.units.find((x) => x.uid === e.uid)!;
          this.log(`${u.side === 'enemy' ? u.subject : u.name} ha caído.`, `${u.name} has fallen.`);
          this.refresh();
          await this.pause(520);
          break;
        }
        case 'revive':
          sfx('heal');
          this.floater(e.uid, `¡Arriba! +${e.amount}`, 'heal');
          this.refresh();
          await this.pause(420);
          break;
        case 'summon':
          this.refresh();
          this.flash(e.uid, 'appear');
          await this.pause(500);
          break;
        case 'steal':
          this.floater(e.uid, `👋 ${ITEMS[e.item]?.name ?? e.item}`, 'status bad');
          await this.pause(300);
          break;
        case 'guard': {
          const gu = this.s.units.find((x) => x.uid === e.guard)!;
          const wu = this.s.units.find((x) => x.uid === e.ward)!;
          this.floater(e.guard, '🛡️', 'status good');
          this.log(`¡${gu.name} protege a ${wu.name}!`, `${gu.name} protects ${wu.name}!`);
          await this.pause(420);
          break;
        }
        case 'text':
          this.log(e.text, e.en);
          await this.pause(850);
          break;
      }
    }
    this.banner.hidden = true;
    this.refresh();
  }

  // -------------------------------------------------------------- endings
  async victory(r: { xp: number; euros: number; drops: string[]; recovered: string[]; ups: LevelUp[]; practiced: Practiced[] }) {
    this.log('¡Victoria!', 'Victory!');
    const right = r.practiced.filter((p) => p.grade === 'fast' || p.grade === 'correct').length;
    const cheer = this.cheer();
    const panel = h(
      'div',
      { class: 'b-result win' },
      h('h2', null, '¡Victoria!', h('small', null, 'Victory')),
      cheer ? h('div', { class: 'res-cheer' }, h('b', null, `${cheer[0]}: `), spanish(cheer[1]), h('span', { class: 'log-en' }, cheer[2])) : null,
      h(
        'div',
        { class: 'res-row' },
        h('div', null, h('b', null, `+${r.xp}`), ' PX', h('small', null, 'experience')),
        h('div', null, h('b', null, `+${r.euros}`), ' €', h('small', null, 'euros')),
        r.practiced.length ? h('div', null, h('b', null, `${right}/${r.practiced.length}`), ' ✓', h('small', null, 'Spanish right')) : null,
      ),
      [...r.drops, ...r.recovered].length
        ? h('div', { class: 'res-items' }, 'Objetos: ', [...r.drops, ...r.recovered].map((id) => `${ITEMS[id]?.icon} ${ITEMS[id]?.name}`).join(', '))
        : null,
      r.ups.map((u) =>
        h(
          'div',
          { class: 'res-lvl' },
          `⭐ ${u.id === 'hero' ? this.g.heroName : MEMBERS[u.id].name} sube al nivel ${u.level}!`,
          h('small', null, ` (reaches level ${u.level})`),
          u.newSkills.length ? h('div', { class: 'res-new' }, `Nueva habilidad: ${u.newSkills.join(', ')}`) : null,
        ),
      ),
      r.practiced.length
        ? h(
            'div',
            { class: 'res-words' },
            h('div', { class: 'rw-title' }, 'Palabras de esta batalla · Words from this battle'),
            r.practiced.map((p) =>
              h('div', { class: `rw ${p.grade}` }, h('span', null, p.grade === 'wrong' ? '✗' : p.grade === 'close' ? '≈' : '✓'), h('span', { lang: 'es' }, p.es), h('span', { class: 'rw-en' }, p.en)),
            ),
          )
        : null,
      h('div', { class: 'res-xp' }, this.g.party.map((m) => `${m.id === 'hero' ? this.g.heroName : MEMBERS[m.id].name} ${m.xp}/${xpToNext(m.level)} PX`).join(' · ')),
      h('div', { class: 'cc-continue' }, 'Enter / tap to continue ▶'),
    );
    this.layer.append(panel);
    await wait(250);
    await waitConfirm(panel);
  }

  /** A short victory shout in colloquial Spain Spanish, now and then. */
  private cheer(): [string, string, string] | null {
    const living = party(this.s).filter(alive);
    if (!living.length || Math.random() > 0.55) return null;
    const lines: Record<string, [string, string][]> = {
      hero: [
        ['¡Las palabras son poder!', 'Words are power!'],
        ['¡Qué guay!', 'How cool!'],
        ['¡Vamos bien!', "We're doing well!"],
      ],
      mateo: [
        ['¡Toma ya!', 'Take that!'],
        ['¡Uf! Ahora tengo hambre.', "Phew! Now I'm hungry."],
        ['¡Ha sido pan comido!', 'That was a piece of cake!'],
      ],
      lola: [
        ['¡Olé!', 'Olé! (Bravo!)'],
        ['¡Qué arte tenemos!', 'We’ve got such flair!'],
        ['¡Madre mía, qué equipo!', 'Oh my goodness, what a team!'],
      ],
    };
    const u = living[Math.floor(Math.random() * living.length)];
    const pool = lines[u.id] ?? lines.hero;
    const [es, en] = pool[Math.floor(Math.random() * pool.length)];
    return [u.name, es, en];
  }

  async defeat(noGameOver: boolean, animo: number, boss = false): Promise<'retry' | 'giveup'> {
    const panel = h(
      'div',
      { class: 'b-result lose' },
      h('h2', null, 'Derrota…', h('small', null, 'Defeat')),
      h('p', null, spanish('No pasa nada. ¡Venga, otra vez!'), h('span', { class: 'log-en' }, "No worries. Come on, once more!")),
    );
    this.layer.append(panel);
    const opts: MenuItem[] = [{ label: '🔁 Intentar de nuevo', sub: `Retry from the start — ¡Ánimo! enemies −${animo * 10}% attack${boss ? ', and you start rested' : ''}` }];
    if (!noGameOver) opts.push({ label: '🏠 Volver a casa', sub: 'Wake up at the last place you rested' });
    const r = await menu(panel, opts);
    return r === 1 ? 'giveup' : 'retry';
  }
}
