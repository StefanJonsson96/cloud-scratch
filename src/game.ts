// Ties everything together: the overworld, scripts, battles, menus and saving.

import './art/characters';
import './art/enemies';
import './art/objects';
import { Overworld, type NpcInstance, type WorldHost } from './world/overworld';
import { MAPS } from './world/maps';
import type { MapDef } from './world/types';
import { SCRIPTS, Script } from './story/script';
import './story/index';
import { Dialogue } from './ui/dialogue';
import { h } from './ui/dom';
import { setLookupHandler } from './ui/spanish';
import { openPauseMenu } from './ui/pauseMenu';
import { runBattle, type BattleOutcome, type BattleSetup } from './battle/battle';
import { fullHeal, save, type GameState } from './state';
import { initTouch } from './engine/input';
import { playMusic, setMusic, setSfx } from './engine/audio';
import { setSpeechEnabled } from './engine/speech';

export class Game implements WorldHost {
  g!: GameState;
  readonly screen: HTMLElement;
  readonly hud: HTMLElement;
  readonly overlayHost: HTMLElement;
  readonly world: Overworld;
  readonly dialogue: Dialogue;
  recent: string[] = [];
  onQuit: (() => void) | null = null;

  constructor(readonly app: HTMLElement) {
    this.screen = h('div', { class: 'screen' });
    this.hud = h('div', { class: 'hud' });
    this.world = new Overworld(this);
    this.screen.append(this.world.canvas, this.hud);
    this.dialogue = new Dialogue(this.screen, () => this.g.settings);
    app.append(this.screen);
    initTouch(app);
    this.overlayHost = document.body;
    const menuBtn = h('button', { class: 'hud-btn', title: 'Menu (M / Esc)', onclick: () => this.world.lockWhile(this.openMenu()) }, '☰ Menú');
    this.hud.append(h('div', { class: 'hud-place' }), menuBtn);
    window.addEventListener('resize', () => this.layout());
    window.visualViewport?.addEventListener('resize', () => this.layout());
    setLookupHandler((e) => {
      if (this.g && e.wordId && !this.g.looked.includes(e.wordId)) this.g.looked.push(e.wordId);
    });
    setInterval(() => {
      if (this.g && !document.hidden) this.g.stats.playMs += 1000;
    }, 1000);
  }

  getMap(id: string): MapDef {
    const m = MAPS[id];
    if (!m) throw new Error(`Unknown map ${id}`);
    return m;
  }

  applySettings() {
    const s = this.g.settings;
    setSfx(s.sfx);
    setMusic(s.music);
    setSpeechEnabled(s.voice);
  }

  async start(g: GameState, fresh: boolean) {
    this.g = g;
    this.applySettings();
    document.body.classList.remove('no-world');
    this.screen.hidden = false;
    this.world.load(g.map, g.x, g.y, g.dir);
    this.world.start();
    this.layout();
    if (fresh) await this.world.lockWhile(this.runScript('intro'));
    else if (this.world.map.onEnter) await this.world.lockWhile(this.runScript(this.world.map.onEnter));
  }

  stop() {
    this.world.stop();
    this.dialogue.close();
    this.screen.hidden = true;
    document.body.classList.add('no-world');
  }

  async runScript(id: string, npc?: NpcInstance, at?: { x: number; y: number }) {
    const [name, ...args] = id.split(':');
    const fn = SCRIPTS[name];
    if (!fn) {
      console.warn(`Missing script: ${id}`);
      return;
    }
    const s = new Script(this, npc, args, at);
    try {
      await fn(s);
    } finally {
      this.dialogue.close();
      this.world.refreshNpcs();
      this.world.applyMood();
    }
  }

  async battle(setup: BattleSetup): Promise<BattleOutcome> {
    this.dialogue.close();
    document.body.classList.add('no-world');
    const out = await runBattle({ g: this.g, host: document.body, recent: this.recent, rand: Math.random }, setup);
    document.body.classList.remove('no-world');
    if (out === 'lose' && !setup.noGameOver) await this.wakeUp();
    save(this.g);
    return out;
  }

  async encounter(map: MapDef) {
    const t = map.encounters;
    if (!t) return;
    const total = t.groups.reduce((a, [, w]) => a + w, 0);
    let r = Math.random() * total;
    let group = t.groups[0][0];
    for (const [g, w] of t.groups) {
      r -= w;
      if (r <= 0) {
        group = g;
        break;
      }
    }
    await this.battle({ enemies: group, bg: map.bg });
  }

  async wakeUp() {
    const [m, x, y] = String(this.g.flags.rest ?? 'casa_abuela:4:4').split(':');
    for (const p of this.g.party) fullHeal(p);
    this.world.load(m, Number(x), Number(y), 'down');
    await this.dialogue.say({ es: 'Te despiertas. Todos estáis bien.', en: 'You wake up. Everyone is okay — try again!' });
    this.dialogue.close();
  }

  openMenu(): Promise<void> {
    return openPauseMenu(this);
  }

  changeMap(map: MapDef) {
    playMusic(map.music);
    const place = this.hud.querySelector('.hud-place')!;
    place.replaceChildren(h('div', { class: 'place-toast' }, map.name, h('small', null, map.nameEn)));
    if (this.g) save(this.g);
  }

  toast(text: string) {
    const t = h('div', { class: 'toast' }, text);
    document.body.append(t);
    setTimeout(() => t.remove(), 2500);
  }

  /** Fit the pixel screen to the window (integer scaling when there's room). */
  layout() {
    const style = getComputedStyle(this.app);
    const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const touch = document.body.classList.contains('has-touch');
    const availW = this.app.clientWidth - padX - 16;
    const availH = this.app.clientHeight - padY - 16 - (touch ? 172 : 0);
    const baseW = this.world.canvas.width;
    const baseH = this.world.canvas.height;
    const portrait = availW / availH < 0.95;
    let scale = Math.min(availW / baseW, (portrait ? availH * 0.62 : availH) / baseH);
    if (scale >= 2) scale = Math.floor(scale * 2) / 2;
    const cw = Math.floor(baseW * scale);
    const ch = Math.floor(baseH * scale);
    this.screen.style.width = `${cw}px`;
    this.world.canvas.style.height = `${ch}px`;
    const reserve = portrait ? Math.max(120, Math.min(availH - ch, 200)) : 0;
    this.screen.style.height = `${ch + reserve}px`;
    this.screen.style.setProperty('--reserve', `${reserve}px`);
    this.screen.classList.toggle('portrait', portrait);
    this.screen.style.fontSize = `${Math.max(13, Math.min(19, cw / (portrait ? 26 : 46)))}px`;
  }
}
