// The challenge card: the moment a spell is cast you answer a Spanish
// question, and how well you answer decides how hard the spell hits.

import { checkOrder, type Challenge } from '../learn/challenges';
import { checkTyped, type Grade } from '../learn/check';
import { pushLayer } from '../engine/input';
import { sfx } from '../engine/audio';
import { speak, speechAvailable } from '../engine/speech';
import { h, appendAll, waitConfirm } from './dom';

export interface ChallengeResult {
  grade: Grade;
  usedHint: boolean;
  ms: number;
}

export interface ChallengeOptions {
  title: string;
  /** e.g. "×1.3 if correct" */
  stakes?: string;
  accentsOptional?: boolean;
  slowTimer?: number;
  voice?: boolean;
}

const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'];

export const GRADE_TEXT: Record<Grade, { es: string; en: string; cls: string }> = {
  fast: { es: '¡Perfecto!', en: 'Perfect — fast bonus!', cls: 'g-fast' },
  correct: { es: '¡Correcto!', en: 'Correct', cls: 'g-correct' },
  close: { es: '¡Casi!', en: 'Almost', cls: 'g-close' },
  wrong: { es: '¡Uy! No es correcto', en: 'Not quite', cls: 'g-wrong' },
};

export function runChallenge(host: HTMLElement, ch: Challenge, opts: ChallengeOptions): Promise<ChallengeResult> {
  return new Promise((resolve) => {
    const voice = opts.voice !== false && speechAvailable();
    let usedHint = false;
    let answered = false;
    const t0 = performance.now();
    const fastMs = ch.fastMs * (opts.slowTimer ?? 1);

    const hintBox = h('div', { class: 'cc-hint', hidden: true }, ch.hint ?? '');
    const hintBtn = ch.hint
      ? h('button', { class: 'cc-tool no-advance', title: 'Hint (H) — reveals help, but the answer counts as “almost”', onclick: () => showHint() }, '💡 Hint')
      : null;
    const sayBtn =
      voice && ch.speak && ch.listening
        ? h('button', { class: 'cc-tool no-advance', title: 'Listen again (R)', onclick: () => speak(ch.speak!, 0.9) }, '🔊')
        : null;

    const timerFill = h('div', { class: 'cc-timer-fill' });
    timerFill.style.setProperty('animation-duration', `${fastMs}ms`, 'important');
    const body = h('div', { class: 'cc-body' });
    const result = h('div', { class: 'cc-result', 'aria-live': 'polite' });
    const card = h(
      'div',
      { class: `challenge-card kind-${ch.kind}`, role: 'dialog', 'aria-label': 'Spanish challenge' },
      h(
        'div',
        { class: 'cc-head' },
        h('div', { class: 'cc-title' }, opts.title),
        h('div', { class: 'cc-tools' }, sayBtn, hintBtn),
      ),
      h('div', { class: 'cc-label' }, ch.isNew ? h('span', { class: 'badge-new' }, 'NEW') : null, ch.label, opts.stakes ? h('span', { class: 'cc-stakes' }, opts.stakes) : null),
      h('div', { class: 'cc-timer', title: 'Answer before the bar runs out for a fast bonus' }, timerFill),
      h('div', { class: `cc-prompt ${ch.promptLang === 'es' ? 'es' : 'en'}${ch.listening ? ' listening' : ''}`, lang: ch.promptLang }, ch.prompt),
      ch.sub ? h('div', { class: 'cc-sub' }, ch.sub) : null,
      hintBox,
      body,
      result,
    );
    const backdrop = h('div', { class: 'challenge-backdrop' }, card);
    host.append(backdrop);
    // Exposed for automated play-testing.
    (window as unknown as { __challenge?: Challenge }).__challenge = ch;

    if (ch.listening && voice && ch.speak) setTimeout(() => speak(ch.speak!, 0.9), 250);

    function showHint() {
      if (answered || !ch.hint) return;
      usedHint = true;
      hintBox.hidden = false;
      hintBtn?.setAttribute('disabled', '');
      card.classList.add('hinted');
      sfx('blip');
    }

    function gradeFor(correct: boolean, typed?: Grade): Grade {
      const ms = performance.now() - t0;
      if (!correct) return 'wrong';
      if (typed === 'close') return 'close';
      if (usedHint) return 'close';
      return ms <= fastMs ? 'fast' : 'correct';
    }

    let focusables: HTMLElement[] = [];
    let input: HTMLInputElement | null = null;

    // ---------------------------------------------------- multiple choice
    if (ch.kind === 'choice') {
      const grid = h('div', { class: `cc-options${ch.emojiOptions ? ' emoji' : ''} n${ch.options!.length}` });
      ch.options!.forEach((opt, i) => {
        const b = h(
          'button',
          { class: 'cc-option no-advance', onclick: () => pickOption(i) },
          h('span', { class: 'cc-key' }, String(i + 1)),
          h('span', { class: 'cc-opt-text', lang: ch.promptLang === 'en' || ch.label.startsWith('¿') || ch.kind === 'choice' ? undefined : 'es' }, opt),
        );
        grid.append(b);
        focusables.push(b);
      });
      body.append(grid);
    }
    function pickOption(i: number) {
      if (answered) return;
      const correct = i === ch.answer;
      focusables[ch.answer!]?.classList.add('right');
      if (!correct) focusables[i]?.classList.add('wrong');
      finish(gradeFor(correct));
    }

    // ------------------------------------------------------------- typing
    if (ch.kind === 'type') {
      input = h('input', {
        class: 'cc-input',
        type: 'text',
        autocomplete: 'off',
        autocapitalize: 'off',
        autocorrect: 'off',
        spellcheck: 'false',
        lang: 'es',
        placeholder: 'Escribe aquí…',
        'aria-label': 'Your answer in Spanish',
      }) as HTMLInputElement;
      const accents = h(
        'div',
        { class: 'cc-accents' },
        ACCENTS.map((a) =>
          h(
            'button',
            {
              class: 'cc-accent no-advance',
              tabindex: '-1',
              onpointerdown: (e: Event) => e.preventDefault(),
              onclick: () => insert(a),
            },
            a,
          ),
        ),
      );
      const submit = h('button', { class: 'cc-submit no-advance', onclick: () => submitTyped() }, 'OK ↵');
      const dunno = h('button', { class: 'cc-dunno no-advance', onclick: () => giveUp() }, 'No lo sé');
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitTyped();
        }
      });
      body.append(h('div', { class: 'cc-typerow' }, input, submit), accents, dunno);
      setTimeout(() => input?.focus(), 60);
    }
    function insert(chr: string) {
      if (!input) return;
      const s = input.selectionStart ?? input.value.length;
      const e = input.selectionEnd ?? input.value.length;
      input.value = input.value.slice(0, s) + chr + input.value.slice(e);
      input.setSelectionRange(s + 1, s + 1);
      input.focus();
    }
    let typedValue = '';
    let typedNote: string | undefined;
    function submitTyped() {
      if (answered || !input) return;
      typedValue = input.value;
      if (!typedValue.trim()) {
        input.classList.add('shake');
        setTimeout(() => input?.classList.remove('shake'), 300);
        return;
      }
      const r = checkTyped(typedValue, ch.accepted!, { article: ch.article, accentsOptional: opts.accentsOptional });
      typedNote = r.note;
      input.disabled = true;
      input.classList.add(r.grade === 'wrong' ? 'wrong' : r.grade === 'close' ? 'close' : 'right');
      finish(gradeFor(r.grade !== 'wrong', r.grade));
    }
    function giveUp() {
      if (answered) return;
      typedValue = '';
      if (input) input.disabled = true;
      finish('wrong');
    }

    // ------------------------------------------------------ word order
    const chosen: number[] = [];
    const bank = h('div', { class: 'cc-bank' });
    const line = h('div', { class: 'cc-line', 'aria-label': 'Your sentence' });
    const tileButtons: HTMLButtonElement[] = [];
    if (ch.kind === 'order') {
      ch.tiles!.forEach((t, i) => {
        const b = h('button', { class: 'cc-tile no-advance', lang: 'es', onclick: () => toggleTile(i) }, t) as HTMLButtonElement;
        tileButtons.push(b);
        bank.append(b);
      });
      const submit = h('button', { class: 'cc-submit no-advance', onclick: () => submitOrder() }, 'OK ↵');
      const undo = h('button', { class: 'cc-dunno no-advance', onclick: () => chosen.length && toggleTile(chosen[chosen.length - 1]) }, '⌫ Undo');
      body.append(line, bank, h('div', { class: 'cc-typerow' }, undo, submit));
    }
    function toggleTile(i: number) {
      if (answered) return;
      const at = chosen.indexOf(i);
      if (at >= 0) {
        chosen.splice(at, 1);
        bank.append(tileButtons[i]);
      } else {
        chosen.push(i);
        line.append(tileButtons[i]);
      }
      sfx('blip');
    }
    function submitOrder() {
      if (answered || !chosen.length) return;
      const words = chosen.map((i) => ch.tiles![i]);
      finish(gradeFor(checkOrder(words, ch.solutions!)));
    }

    // ------------------------------------------------------------ keys
    const pop = pushLayer((a) => {
      if (answered) return true;
      if (a === 'hint') showHint();
      else if (a === 'speak' && ch.speak && voice && ch.listening) speak(ch.speak, 0.9);
      else if (ch.kind === 'choice' && a.startsWith('num')) {
        const n = Number(a.slice(3)) - 1;
        if (n < ch.options!.length) pickOption(n);
      } else if (ch.kind === 'order' && a.startsWith('num')) {
        const n = Number(a.slice(3)) - 1;
        if (n < tileButtons.length) toggleTile(n);
      } else if (ch.kind === 'order' && a === 'confirm') submitOrder();
      else if (ch.kind === 'order' && a === 'cancel') {
        if (chosen.length) toggleTile(chosen[chosen.length - 1]);
      } else if (ch.kind === 'choice' && (a === 'up' || a === 'down' || a === 'left' || a === 'right' || a === 'confirm')) {
        const cur = focusables.indexOf(document.activeElement as HTMLElement);
        if (a === 'confirm') {
          if (cur >= 0) pickOption(cur);
          return true;
        }
        const cols = ch.options!.length === 2 ? 2 : 2;
        const delta = a === 'left' ? -1 : a === 'right' ? 1 : a === 'up' ? -cols : cols;
        const next = cur < 0 ? 0 : (cur + delta + focusables.length) % focusables.length;
        focusables[next]?.focus();
      }
      return true;
    });

    // ----------------------------------------------------------- result
    async function finish(grade: Grade) {
      if (answered) return;
      answered = true;
      const ms = performance.now() - t0;
      card.classList.add('answered', GRADE_TEXT[grade].cls);
      timerFill.style.animationPlayState = 'paused';
      for (const b of card.querySelectorAll<HTMLButtonElement>('.cc-option, .cc-tile, .cc-accent, .cc-submit, .cc-dunno')) b.disabled = true;
      sfx(grade === 'wrong' ? 'wrong' : grade === 'close' ? 'close' : 'correct');
      if (voice && ch.speak) setTimeout(() => speak(ch.speak!), 150);

      const g = GRADE_TEXT[grade];
      const detailed = grade === 'wrong' || grade === 'close';
      appendAll(
        result,
        h('div', { class: 'cc-banner' }, h('strong', null, g.es), h('span', null, g.en)),
        typedNote && grade === 'close' ? h('div', { class: 'cc-typed-note' }, typedNote) : null,
        ch.kind === 'type' && grade === 'wrong' && typedValue ? h('div', { class: 'cc-yours' }, `You wrote: “${typedValue}”`) : null,
        h(
          'div',
          { class: 'cc-reveal' },
          h('span', { class: 'es', lang: 'es' }, ch.reveal.es),
          h('span', { class: 'eq' }, '='),
          h('span', { class: 'en' }, ch.reveal.en),
          voice && ch.speak ? h('button', { class: 'cc-tool no-advance', onclick: () => speak(ch.speak!) }, '🔊') : null,
        ),
        detailed && ch.note ? h('div', { class: 'cc-note' }, '📜 ', ch.note) : null,
        detailed && ch.table
          ? h(
              'table',
              { class: 'cc-table' },
              h('caption', null, ch.table.title),
              ch.table.rows.map(([p, f], i) => h('tr', { class: i === ch.table!.highlight ? 'hl' : '' }, h('td', null, p), h('td', { lang: 'es' }, f))),
            )
          : null,
        ch.example && detailed ? h('div', { class: 'cc-example' }, h('span', { lang: 'es' }, ch.example[0]), h('span', null, ch.example[1])) : null,
        h('div', { class: 'cc-continue' }, detailed ? 'Press Enter or tap to continue ▶' : 'Tap to continue ▶'),
      );
      card.querySelector('.cc-body')?.classList.add('done');
      result.scrollIntoView?.({ block: 'nearest' });
      // Let the keypress that answered settle before listening for "continue".
      await new Promise((r) => setTimeout(r, 120));
      await waitConfirm(backdrop, detailed ? undefined : 1500);
      pop();
      backdrop.remove();
      resolve({ grade, usedHint, ms });
    }
  });
}
