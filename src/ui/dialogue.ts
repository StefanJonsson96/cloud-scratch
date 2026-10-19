// The dialogue box. Spanish lines are shown with every word tappable, and the
// full English translation is one tap (or the T key) away.

import { pushLayer } from '../engine/input';
import { sfx } from '../engine/audio';
import { speak, canSpeak, NARRATOR, type VoiceSpec } from '../engine/speech';
import { portrait as portraitCanvas, hasSprite } from '../engine/sprites';
import type { Settings } from '../state';
import { h, clear, menu } from './dom';
import { spanish, hideGloss } from './spanish';

export interface Line {
  who?: string;
  /** Sprite base name for the portrait ("abuela"). */
  face?: string;
  es?: string;
  en: string;
  /** Who is speaking, for text-to-speech. */
  voice?: VoiceSpec;
}

export interface Option {
  es?: string;
  en: string;
}

export class Dialogue {
  readonly el: HTMLElement;
  private nameEl: HTMLElement;
  private faceEl: HTMLElement;
  private textEl: HTMLElement;
  private enEl: HTMLElement;
  private tools: HTMLElement;
  private optsEl: HTMLElement;
  private moreEl: HTMLElement;
  private showEn = false;

  constructor(
    host: HTMLElement,
    private settings: () => Settings,
  ) {
    this.nameEl = h('div', { class: 'dlg-name' });
    this.faceEl = h('div', { class: 'dlg-face' });
    this.textEl = h('div', { class: 'dlg-text' });
    this.enEl = h('div', { class: 'dlg-en' });
    this.tools = h('div', { class: 'dlg-tools' });
    this.optsEl = h('div', { class: 'dlg-options' });
    this.moreEl = h('div', { class: 'dlg-more' }, '▼');
    this.el = h(
      'div',
      { class: 'dialogue', hidden: true, role: 'dialog', 'aria-live': 'polite' },
      this.faceEl,
      h('div', { class: 'dlg-main' }, this.nameEl, this.textEl, this.enEl, this.optsEl),
      this.tools,
      this.moreEl,
    );
    host.append(this.el);
  }

  get open() {
    return !this.el.hidden;
  }

  close() {
    this.el.hidden = true;
    hideGloss();
  }

  private renderLine(line: Line): HTMLElement[] {
    this.el.hidden = false;
    this.el.classList.toggle('narration', !line.who);
    clear(this.optsEl);
    this.nameEl.textContent = line.who ?? '';
    this.nameEl.hidden = !line.who;
    clear(this.faceEl);
    if (line.face && hasSprite(`${line.face}_down_0`)) {
      this.faceEl.append(portraitCanvas(`${line.face}_down_0`, 4, 11));
      this.faceEl.hidden = false;
    } else this.faceEl.hidden = true;

    clear(this.textEl);
    clear(this.tools);
    const always = this.settings().translations === 'always';
    this.showEn = always;
    const words: HTMLElement[] = [];
    if (line.es) {
      const s = spanish(line.es);
      // Wrap stray text nodes so they can be revealed word by word too.
      for (const node of [...s.childNodes]) {
        if (node.nodeType === Node.TEXT_NODE) {
          const span = h('span', null, node.textContent ?? '');
          s.replaceChild(span, node);
        }
      }
      words.push(...(Array.from(s.children) as HTMLElement[]));
      this.textEl.append(s);
      this.enEl.textContent = line.en;
      this.enEl.hidden = !always;
      const enBtn = h(
        'button',
        { class: 'dlg-tool no-advance', title: 'Show the English translation (T)', onclick: () => this.toggleEn() },
        'EN',
      );
      if (!always) this.tools.append(enBtn);
      if (this.settings().voice && canSpeak(line.es, line.voice ?? NARRATOR)) {
        this.tools.append(h('button', { class: 'dlg-tool no-advance', title: 'Listen again (R)', onclick: () => this.speak(line) }, '🔊'));
        if (this.settings().autoVoice) this.speak(line);
      }
    } else {
      this.textEl.append(h('span', { class: 'en-only' }, line.en));
      this.enEl.hidden = true;
    }
    return words;
  }

  private speak(line: Line) {
    if (line.es) speak(line.es, line.voice ?? NARRATOR);
  }

  toggleEn() {
    if (!this.enEl.textContent) return;
    this.showEn = !this.showEn;
    this.enEl.hidden = !this.showEn;
    this.optsEl.classList.toggle('show-en', this.showEn);
    sfx('blip');
  }

  private async reveal(words: HTMLElement[]): Promise<void> {
    const speed = this.settings().textSpeed;
    if (speed === 'instant' || !words.length) return;
    const delay = speed === 'fast' ? 12 : 28;
    for (const w of words) w.classList.add('pending');
    let skip = false;
    const pop = pushLayer((a) => {
      if (a === 'confirm' || a === 'cancel') skip = true;
      else return false;
      return true;
    });
    const onTap = () => (skip = true);
    this.el.addEventListener('pointerdown', onTap, { once: true });
    for (const w of words) {
      if (skip) break;
      w.classList.remove('pending');
      await new Promise((r) => setTimeout(r, delay + Math.min(60, (w.textContent?.length ?? 1) * 6)));
    }
    for (const w of words) w.classList.remove('pending');
    this.el.removeEventListener('pointerdown', onTap);
    pop();
  }

  /** Show a line and wait for the player to continue. */
  async say(line: Line): Promise<void> {
    const words = this.renderLine(line);
    this.moreEl.hidden = true;
    await this.reveal(words);
    this.moreEl.hidden = false;
    await new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        pop();
        this.el.removeEventListener('pointerup', onTap);
        resolve();
      };
      const onTap = (e: Event) => {
        if ((e.target as HTMLElement).closest('.no-advance, .gloss')) return;
        finish();
      };
      const pop = pushLayer((a) => {
        if (a === 'confirm' || a === 'cancel') {
          sfx('blip');
          finish();
        } else if (a === 'translate') this.toggleEn();
        else if (a === 'speak') this.speak(line);
        else return false;
        return true;
      });
      setTimeout(() => this.el.addEventListener('pointerup', onTap), 30);
    });
    hideGloss();
  }

  /** Show a line with answer options; returns the chosen index. */
  async ask(line: Line, options: Option[], cancel = false): Promise<number> {
    const words = this.renderLine(line);
    this.moreEl.hidden = true;
    await this.reveal(words);
    const always = this.settings().translations === 'always';
    const items = options.map((o) => ({
      label: o.es ? h('span', { lang: 'es' }, o.es) : o.en,
      sub: o.es ? o.en : undefined,
      className: o.es ? 'opt-es' : '',
    }));
    this.optsEl.classList.toggle('show-en', always);
    const r = await menu(this.optsEl, items, {
      cancel,
      onKey: (a) => {
        if (a === 'translate') {
          this.toggleEn();
          return true;
        }
        if (a === 'speak' && line.es) {
          this.speak(line);
          return true;
        }
        return false;
      },
    });
    hideGloss();
    return r ?? -1;
  }
}
