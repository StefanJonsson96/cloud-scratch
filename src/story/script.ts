// The scripting API used by every cutscene, NPC and puzzle in the story.

import type { Game } from '../game';
import type { NpcInstance } from '../world/overworld';
import type { Dir } from '../state';
import { addItem, addMember, fullHeal, save } from '../state';
import type { MemberId } from '../battle/defs';
import { MEMBERS } from '../battle/defs';
import type { BattleOutcome, BattleSetup } from '../battle/battle';
import { makeChallenge, type Challenge, type ChallengeStyle } from '../learn/challenges';
import { record } from '../learn/srs';
import type { Grade } from '../learn/check';
import { runChallenge } from '../ui/challengeView';
import { ITEMS, ACCESSORIES } from '../data/items';
import { h, menu, wait, waitConfirm } from '../ui/dom';
import { sfx, playMusic } from '../engine/audio';
import { speechAvailable, type VoiceSpec } from '../engine/speech';
import { spanish } from '../ui/spanish';

export type ScriptFn = (s: Script) => Promise<void>;
export const SCRIPTS: Record<string, ScriptFn> = {};

export function script(id: string, fn: ScriptFn) {
  if (SCRIPTS[id]) throw new Error(`Duplicate script ${id}`);
  SCRIPTS[id] = fn;
}

export interface Speaker {
  name: string;
  face?: string;
  voice?: VoiceSpec;
}

const v = (id: string, gender: 'f' | 'm', pitch = 1, rate = 1): VoiceSpec => ({ id, gender, pitch, rate });

export const CAST: Record<string, Speaker> = {
  abuela: { name: 'Abuela Rosa', face: 'abuela', voice: v('abuela', 'f', 0.85, 0.86) },
  mateo: { name: 'Mateo', face: 'mateo', voice: v('mateo', 'm', 1.1, 1.05) },
  lola: { name: 'Lola', face: 'lola', voice: v('lola', 'f', 1.1, 1.05) },
  ramon: { name: 'Don Ramón', face: 'pescador', voice: v('ramon', 'm', 0.8, 0.9) },
  carmen: { name: 'Doña Carmen', face: 'vendedora', voice: v('carmen', 'f', 0.95, 0.95) },
  pepe: { name: 'Pepe', face: 'vecino', voice: v('pepe', 'm', 0.95) },
  lucia: { name: 'Lucía', face: 'vecina', voice: v('lucia', 'f', 1.05) },
  nino: { name: 'Dani', face: 'nino', voice: v('nino', 'm', 1.5, 1.08) },
  guardia: { name: 'Guardia', face: 'guardia', voice: v('guardia', 'm', 0.85, 0.95) },
  peregrina: { name: 'Peregrina', face: 'peregrina', voice: v('peregrina', 'f', 1) },
  monje: { name: 'Hermano Tomás', face: 'monje', voice: v('monje', 'm', 0.8, 0.85) },
  callado: { name: 'El Callado', face: 'callado', voice: v('callado', 'm', 0.6, 0.8) },
  bruno: { name: 'Bruno', face: 'bruno', voice: v('bruno', 'm', 0.75, 0.9) },
  voz: { name: '???', voice: v('voz', 'f', 0.9, 0.88) },
  posadera: { name: 'Doña Pilar', face: 'vecina', voice: v('posadera', 'f', 0.95) },
  frutera: { name: 'La frutera', face: 'vecina2', voice: v('frutera', 'f', 1.05, 1.05) },
  quesero: { name: 'El quesero', face: 'vecino2', voice: v('quesero', 'm', 0.9) },
  pescadera: { name: 'La pescadera', face: 'vecina', voice: v('pescadera', 'f', 1) },
  tendera: { name: 'Doña Encarna', face: 'vendedora', voice: v('tendera', 'f', 0.9, 0.95) },
  panadero: { name: 'Don Julián', face: 'vecino', voice: v('panadero', 'm', 0.9) },
  camarero: { name: 'El camarero', face: 'vecino2', voice: v('camarero', 'm', 1.05, 1.08) },
  nina: { name: 'Marta', face: 'nino', voice: v('nina', 'f', 1.4, 1.08) },
  gloton: { name: 'El Glotón', voice: v('gloton', 'm', 0.5, 0.8) },
  Paco: { name: 'Paco', voice: v('paco', 'm', 0.95) },
  Leñador: { name: 'Leñador', voice: v('lenador', 'm', 0.75, 0.9) },
  Alpinista: { name: 'Alpinista', voice: v('alpinista', 'm', 1) },
};

export class Script {
  constructor(
    readonly game: Game,
    readonly npc?: NpcInstance,
    readonly args: string[] = [],
    readonly at?: { x: number; y: number },
  ) {}

  get g() {
    return this.game.g;
  }

  private speaker(who: string): Speaker {
    if (who === 'hero') return { name: this.g.heroName, face: 'hero', voice: { id: 'hero', gender: this.g.gender ?? 'm' } };
    return CAST[who] ?? { name: who };
  }

  /** A character speaks Spanish (with an English translation one tap away). */
  async say(who: string, es: string, en: string) {
    const sp = this.speaker(who);
    await this.game.dialogue.say({ who: sp.name, face: sp.face, voice: sp.voice, es, en });
  }

  /** English narration (no speaker). */
  async narrate(en: string, es?: string) {
    await this.game.dialogue.say({ en, es });
  }

  /** Ask a question; options are [spanish, english] (spanish may be empty). */
  async ask(who: string, es: string, en: string, options: [string, string][]): Promise<number> {
    const sp = this.speaker(who);
    return this.game.dialogue.ask(
      { who: sp.name, face: sp.face, voice: sp.voice, es, en },
      options.map(([oes, oen]) => ({ es: oes || undefined, en: oen })),
    );
  }

  /** A comprehension check in conversation: true if the right option was picked. */
  async quiz(who: string, es: string, en: string, options: [string, string][], correct: number): Promise<boolean> {
    const i = await this.ask(who, es, en, options);
    const ok = i === correct;
    sfx(ok ? 'correct' : 'wrong');
    return ok;
  }

  end() {
    this.game.dialogue.close();
  }

  /** A standalone Spanish challenge (puzzles, lessons). */
  async challenge(style: ChallengeStyle | Challenge, title = 'Desafío · Challenge'): Promise<Grade> {
    this.end();
    const ch =
      typeof style === 'string'
        ? makeChallenge(style, {
            srs: this.g.srs,
            chapter: this.g.chapter,
            rand: Math.random,
            recent: this.game.recent,
            preferTyping: this.g.settings.typingFocus,
            listening: this.g.settings.voice && speechAvailable(),
          })
        : style;
    this.game.recent.push(ch.key);
    const r = await runChallenge(this.game.overlayHost, ch, { title, voice: this.g.settings.voice, timed: this.g.settings.speedBonus });
    if (ch.srs) record(this.g.srs, ch.key, r.grade, Date.now(), ch.maxBox);
    this.g.stats.answered++;
    if (r.grade === 'fast' || r.grade === 'correct') this.g.stats.right++;
    return r.grade;
  }

  async battle(setup: BattleSetup): Promise<BattleOutcome> {
    this.end();
    return this.game.battle(setup);
  }

  flag(k: string, v: number | boolean | string = true) {
    this.g.flags[k] = v;
  }

  has(k: string): boolean {
    return !!this.g.flags[k];
  }

  num(k: string): number {
    return Number(this.g.flags[k] ?? 0);
  }

  async give(item: string, n = 1) {
    if (ACCESSORIES[item]) {
      if (!this.g.accessories.includes(item)) this.g.accessories.push(item);
      sfx('chest');
      const a = ACCESSORIES[item];
      await this.game.dialogue.say({ es: `Has recibido: ${a.name}.`, en: `You received: ${a.en} ${a.icon} — ${a.desc} (Equip it from the menu: Equipo.)` });
      return;
    }
    addItem(this.g, item, n);
    sfx('chest');
    const i = ITEMS[item];
    await this.game.dialogue.say({
      es: `Has recibido: ${i.name}${n > 1 ? ` ×${n}` : ''}.`,
      en: `You received: ${i.en}${n > 1 ? ` ×${n}` : ''} ${i.icon} — ${i.desc}`,
    });
  }

  async gain(euros: number) {
    this.g.euros += euros;
    sfx('chest');
    await this.game.dialogue.say({ es: `Has recibido ${euros} euros.`, en: `You received ${euros} euros. 💶` });
  }

  async join(id: MemberId) {
    addMember(this.g, id);
    sfx('levelup');
    await this.game.dialogue.say({
      es: `¡${MEMBERS[id].name} se une al grupo!`,
      en: `${MEMBERS[id].name} joins the party! (${MEMBERS[id].roleEn} · fights with ${MEMBERS[id].styleEn.toLowerCase()} challenges)`,
    });
  }

  heal() {
    for (const m of this.g.party) fullHeal(m);
    sfx('heal');
  }

  async warp(map: string, x: number, y: number, dir: Dir = 'down') {
    this.end();
    await this.game.world.transition(map, x, y, dir);
  }

  wait(ms: number) {
    return wait(ms);
  }

  face(dir: Dir) {
    this.game.world.dir = dir;
  }

  npcFace(id: string, dir: Dir) {
    const n = this.game.world.npcs.find((x) => x.def.id === id);
    if (n) n.dir = dir;
  }

  refresh() {
    this.game.world.refreshNpcs();
    this.game.world.applyMood();
  }

  music(name: string) {
    playMusic(name);
  }

  save() {
    save(this.g);
  }

  setRest(map: string, x: number, y: number) {
    this.g.flags.rest = `${map}:${x}:${y}`;
  }

  /** Full-screen chapter title card. */
  async chapter(n: number, title: string, en: string, learn: string) {
    this.end();
    this.g.chapter = Math.max(this.g.chapter, n);
    const card = h(
      'div',
      { class: 'chapter-card' },
      h('div', { class: 'ch-num' }, n === 0 ? 'Prólogo' : `Capítulo ${n}`),
      h('div', { class: 'ch-title' }, title),
      h('div', { class: 'ch-en' }, en),
      h('div', { class: 'ch-learn' }, learn),
      h('div', { class: 'cc-continue' }, 'Enter / tap ▶'),
    );
    document.body.append(card);
    sfx('levelup');
    await wait(400);
    await waitConfirm(card);
    card.remove();
    save(this.g);
  }

  /** A short explanation card ("Nota de la abuela"). */
  async lesson(title: string, body: string, examples: [string, string][] = []) {
    this.end();
    const panel = h(
      'div',
      { class: 'panel', style: { maxWidth: '560px' } },
      h('h2', null, title),
      h('div', { html: body }),
      examples.length
        ? h(
            'div',
            { class: 'card' },
            examples.map(([es, en]) => h('div', null, spanish(es), h('span', { class: 'log-en' }, en))),
          )
        : null,
      h('div', { class: 'cc-continue' }, 'Enter / tap ▶'),
    );
    const ov = h('div', { class: 'overlay' }, panel);
    this.game.overlayHost.append(ov);
    await wait(200);
    await waitConfirm(ov);
    ov.remove();
  }

  /** A shop. Prices are said in Spanish — practise your numbers. */
  async shop(owner: string, stock: string[]) {
    this.end();
    const sp = this.speaker(owner);
    const panel = h('div', { class: 'panel', style: { maxWidth: '560px' } });
    const ov = h('div', { class: 'overlay' }, panel);
    this.game.overlayHost.append(ov);
    const say = h('div');
    const purse = h('div', { class: 'muted' });
    const host = h('div');
    panel.append(h('h2', null, sp.name, h('small', null, 'Tienda · Shop')), say, purse, host);
    let greeting = '¿Qué te pongo?';
    let greetingEn = 'What can I get you?';
    for (;;) {
      say.replaceChildren(spanish(greeting), h('span', { class: 'log-en' }, greetingEn));
      purse.textContent = `Tienes ${this.g.euros} € · You have ${this.g.euros} euros`;
      const items = stock.map((id) => {
        const i = ITEMS[id];
        return {
          label: `${i.icon} ${i.name}`,
          right: `${i.price} €`,
          sub: `${i.en} — ${i.desc}  (tienes ${this.g.inventory[id] ?? 0})`,
          disabled: this.g.euros < i.price,
        };
      });
      const pick = await menu(host, [...items, { label: '👋 Adiós', sub: 'Leave' }], { cancel: true });
      if (pick === null || pick >= stock.length) break;
      const it = ITEMS[stock[pick]];
      this.g.euros -= it.price;
      addItem(this.g, it.id);
      sfx('chest');
      greeting = `Aquí tienes: ${it.name}. Son ${numberWords(it.price)} euros. ¿Algo más?`;
      greetingEn = `Here you go: ${it.en}. That's ${it.price} euros. Anything else?`;
    }
    ov.remove();
    save(this.g);
  }

  /** Rest at an inn or at home. */
  async inn(owner: string, price: number) {
    const i = await this.ask(
      owner,
      price ? `¿Queréis descansar? Son ${numberWords(price)} euros.` : '¿Quieres descansar un poco?',
      price ? `Do you (all) want to rest? It's ${price} euros.` : 'Do you want to rest a bit?',
      [
        ['Sí, por favor.', 'Yes, please.'],
        ['No, gracias.', 'No, thanks.'],
      ],
    );
    if (i !== 0) return false;
    if (this.g.euros < price) {
      await this.say(owner, 'Lo siento, no tienes bastante dinero.', "Sorry, you don't have enough money.");
      return false;
    }
    this.g.euros -= price;
    this.end();
    await this.game.world.fade(1);
    this.heal();
    await wait(500);
    await this.game.world.fade(0);
    this.setRest(this.g.map, this.g.x, this.g.y);
    save(this.g);
    await this.say(owner, '¡Buenos días! Ya estáis como nuevos.', "Good morning! You're (all) as good as new.");
    return true;
  }
}

const UNITS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
const VEINTI = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const TENS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

/** 0–999 in Spanish words (prices are read out so you practise numbers). */
export function numberWords(n: number): string {
  if (n <= 20) return UNITS[n];
  if (n < 30) return VEINTI[n - 20];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    return TENS[t] + (u ? ` y ${UNITS[u]}` : '');
  }
  if (n === 100) return 'cien';
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  const rest = n % 100;
  return hundreds[Math.floor(n / 100)] + (rest ? ' ' + numberWords(rest) : '');
}
