// Small DOM helpers and the keyboard/touch-friendly menu used everywhere.

import { pushLayer, type Action } from '../engine/input';
import { sfx } from '../engine/audio';

type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, unknown> | null = null,
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = String(v);
      else if (k === 'style' && typeof v === 'object') {
        for (const [prop, val] of Object.entries(v as Record<string, string>)) {
          if (prop.startsWith('--')) el.style.setProperty(prop, val);
          else (el.style as unknown as Record<string, string>)[prop] = val;
        }
      }
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
      else if (k === 'html') el.innerHTML = String(v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export function appendAll(el: HTMLElement, ...children: Child[]) {
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
}

export function clear(el: HTMLElement) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()));
}

export interface MenuItem {
  label: string | Node;
  sub?: string;
  right?: string;
  disabled?: boolean;
  /** Explains why it's disabled, or describes the item. */
  title?: string;
  className?: string;
}

export interface MenuOptions {
  columns?: number;
  /** Allow cancelling (Escape / B) — resolves null. */
  cancel?: boolean;
  start?: number;
  className?: string;
  onFocus?: (i: number) => void;
  /** Extra key handling while the menu is open. */
  onKey?: (a: Action) => boolean | void;
}

/**
 * Render a list of buttons into `host` and wait for a choice.
 * Arrow keys / WASD move, Enter / Space / Z pick, Escape / X cancels, 1-9 pick directly.
 */
export function menu(host: HTMLElement, items: MenuItem[], opts: MenuOptions = {}): Promise<number | null> {
  return new Promise((resolve) => {
    const cols = opts.columns ?? 1;
    const list = h('div', { class: `menu ${opts.className ?? ''}`, role: 'menu', style: { '--cols': String(cols) } });
    let index = Math.max(0, Math.min(items.length - 1, opts.start ?? 0));
    if (items[index]?.disabled) index = Math.max(0, items.findIndex((i) => !i.disabled));
    const buttons = items.map((it, i) => {
      const b = h(
        'button',
        {
          class: `menu-item ${it.className ?? ''}`,
          role: 'menuitem',
          disabled: it.disabled,
          title: it.title,
          onclick: () => choose(i),
          onpointerenter: () => focus(i, false),
        },
        h('span', { class: 'mi-label' }, it.label),
        it.right ? h('span', { class: 'mi-right' }, it.right) : null,
        it.sub ? h('span', { class: 'mi-sub' }, it.sub) : null,
      );
      list.append(b);
      return b;
    });
    host.append(list);

    function focus(i: number, sound = true) {
      if (i === index && buttons[i].classList.contains('focus')) return;
      buttons[index]?.classList.remove('focus');
      index = i;
      buttons[index]?.classList.add('focus');
      buttons[index]?.scrollIntoView?.({ block: 'nearest' });
      if (sound) sfx('blip');
      opts.onFocus?.(index);
    }
    function move(dx: number, dy: number) {
      if (!items.length) return;
      let i = index;
      for (let n = 0; n < items.length; n++) {
        if (cols > 1 && dx) i = (i + dx + items.length) % items.length;
        else i = (i + dy * cols + items.length) % items.length;
        if (!items[i].disabled) break;
      }
      focus(i);
    }
    let done = false;
    function finish(v: number | null) {
      if (done) return;
      done = true;
      pop();
      list.remove();
      resolve(v);
    }
    function choose(i: number) {
      if (items[i]?.disabled) {
        sfx('miss');
        return;
      }
      sfx('select');
      finish(i);
    }
    const pop = pushLayer((a) => {
      if (opts.onKey?.(a) === true) return true;
      switch (a) {
        case 'up':
          move(0, -1);
          break;
        case 'down':
          move(0, 1);
          break;
        case 'left':
          if (cols > 1) move(-1, 0);
          else if (opts.cancel) return false;
          break;
        case 'right':
          if (cols > 1) move(1, 0);
          break;
        case 'confirm':
          choose(index);
          break;
        case 'cancel':
          if (opts.cancel) {
            sfx('cancel');
            finish(null);
          }
          break;
        default:
          if (a.startsWith('num')) {
            const n = Number(a.slice(3)) - 1;
            if (n < items.length) choose(n);
          } else return false;
      }
      return true;
    });
    focus(index, false);
  });
}

/** Wait for confirm / tap anywhere on `el` (or the whole screen). */
export function waitConfirm(el?: HTMLElement, ms?: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      pop();
      target.removeEventListener('pointerup', onTap);
      if (t) clearTimeout(t);
      resolve();
    };
    const onTap = (e: Event) => {
      if ((e.target as HTMLElement).closest('button.no-advance, .gloss, a')) return;
      finish();
    };
    const target = el ?? document.body;
    const pop = pushLayer((a) => {
      if (a === 'confirm' || a === 'cancel') finish();
      else return false;
      return true;
    });
    // Defer so the tap that opened this doesn't immediately close it.
    setTimeout(() => target.addEventListener('pointerup', onTap), 50);
    const t = ms ? setTimeout(finish, ms) : 0;
  });
}
