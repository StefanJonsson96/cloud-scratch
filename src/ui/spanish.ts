// Renders Spanish text with every known word tappable for its translation.

import { annotate, type Entry } from '../learn/dictionary';
import { speak } from '../engine/speech';
import { h } from './dom';

let tip: HTMLElement | null = null;
let onLookup: ((e: Entry) => void) | null = null;

export function setLookupHandler(fn: (e: Entry) => void) {
  onLookup = fn;
}

export function hideGloss() {
  tip?.remove();
  tip = null;
}

function showGloss(anchor: HTMLElement, e: Entry) {
  hideGloss();
  tip = h(
    'div',
    { class: 'gloss-tip', role: 'tooltip' },
    h('div', { class: 'gt-es' }, e.lemma),
    h('div', { class: 'gt-en' }, e.en),
    e.note ? h('div', { class: 'gt-note' }, e.note) : null,
  );
  document.body.append(tip);
  const r = anchor.getBoundingClientRect();
  const tr = tip.getBoundingClientRect();
  const left = Math.max(8, Math.min(window.innerWidth - tr.width - 8, r.left + r.width / 2 - tr.width / 2));
  const top = r.top - tr.height - 8 < 8 ? r.bottom + 8 : r.top - tr.height - 8;
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  onLookup?.(e);
}

document.addEventListener('pointerdown', (ev) => {
  if (tip && !(ev.target as HTMLElement).closest('.gloss, .gloss-tip')) hideGloss();
});

/** Spanish text as a span of tappable words. */
export function spanish(text: string, opts: { speakable?: boolean } = {}): HTMLElement {
  const root = h('span', { class: 'es', lang: 'es' });
  for (const seg of annotate(text)) {
    if (seg.entry) {
      const entry = seg.entry;
      const w = h('span', { class: `gloss${entry.wordId ? ' vocab' : ''}`, tabindex: '-1' }, seg.text);
      w.addEventListener('pointerup', (ev) => {
        ev.stopPropagation();
        showGloss(w, entry);
        if (opts.speakable !== false) speak(seg.text);
      });
      w.addEventListener('pointerenter', (ev) => {
        if ((ev as PointerEvent).pointerType === 'mouse') showGloss(w, entry);
      });
      w.addEventListener('pointerleave', (ev) => {
        if ((ev as PointerEvent).pointerType === 'mouse') hideGloss();
      });
      root.append(w);
    } else {
      root.append(document.createTextNode(seg.text));
    }
  }
  return root;
}
