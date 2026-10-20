// El Rosco on screen: the ring of letters, the clue, and a box for the answer.
// «Pasapalabra» skips a letter until the next lap round the ring. With the
// speed bonus on, one generous clock runs for the whole ring (paused while
// you read how you did); with it off there is no clock at all.

import { SECONDS_PER_LETTER, letterState, nextLetter, type LetterState, type RoscoQuestion } from '../learn/rosco';
import { checkTyped, type Grade } from '../learn/check';
import { withArticle } from '../data/vocab';
import { pushLayer } from '../engine/input';
import { sfx } from '../engine/audio';
import { speak } from '../engine/speech';
import { GRADE_TEXT } from './challengeView';
import { h, appendAll, clear, wait, waitConfirm } from './dom';
import { spanish } from './spanish';

export interface RoscoOptions {
  timed: boolean;
  accentsOptional: boolean;
  voice: boolean;
  /** Hints don't lower the grade (the Buena memoria talent). */
  freeHint: boolean;
}

/** How each letter was answered, in the questions' order; null if it never was. */
export type RoscoGrades = (Exclude<Grade, 'fast'> | null)[];

const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'];

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function playRosco(host: HTMLElement, qs: readonly RoscoQuestion[], opts: RoscoOptions): Promise<RoscoGrades> {
  return new Promise((resolve) => {
    const states: LetterState[] = qs.map(() => 'pending');
    const grades: RoscoGrades = qs.map(() => null);
    let current = 0;
    let hinted = false;
    let reading = false;
    let over = false;
    let left = qs.length * SECONDS_PER_LETTER;

    const timer = h('span', { class: 'rosco-timer', hidden: !opts.timed, title: 'Time left for the whole ring' });
    const score = h('span', { class: 'rosco-score' });
    const big = h('div', { class: 'rosco-big', 'aria-hidden': 'true' });
    const lead = h('div', { class: 'rosco-lead' });
    const ring = h('div', { class: 'rosco-ring', style: { '--n': String(qs.length) } }, h('div', { class: 'rosco-center' }, lead, big, score));
    const bubbles = qs.map((q, i) => h('span', { class: 'rosco-letter', style: { '--i': String(i) } }, q.letter));
    ring.append(...bubbles);
    const clue = h('div', { class: 'rosco-clue' });
    const hintBox = h('div', { class: 'rosco-hint', hidden: true });
    const feedback = h('div', { class: 'rosco-feedback', 'aria-live': 'polite' });

    const input = h('input', {
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
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (input.value.trim()) void answer();
      else pass();
    });
    const insert = (chr: string) => {
      const s = input.selectionStart ?? input.value.length;
      const e = input.selectionEnd ?? input.value.length;
      input.value = input.value.slice(0, s) + chr + input.value.slice(e);
      input.setSelectionRange(s + 1, s + 1);
      input.focus();
    };
    const hintBtn = h('button', { class: 'btn no-advance', title: 'Hint — the letter then counts as “almost”', onclick: () => showHint() }, '💡 Pista');
    const sayBtn = opts.voice ? h('button', { class: 'btn no-advance', title: 'Hear the clue', onclick: () => speak(qs[current].clue) }, '🔊') : null;
    const controls = h(
      'div',
      { class: 'rosco-controls' },
      h('div', { class: 'cc-typerow' }, input, h('button', { class: 'cc-submit no-advance', onclick: () => void answer() }, 'OK ↵')),
      h(
        'div',
        { class: 'cc-accents' },
        ACCENTS.map((a) => h('button', { class: 'cc-accent no-advance', tabindex: '-1', onpointerdown: (e: Event) => e.preventDefault(), onclick: () => insert(a) }, a)),
      ),
      h(
        'div',
        { class: 'row' },
        h('button', { class: 'btn primary no-advance', title: 'Skip it for now (Enter on an empty box)', onclick: () => pass() }, '⏭ Pasapalabra'),
        hintBtn,
        sayBtn,
        h('button', { class: 'btn no-advance', title: 'Stop here and keep your score (Esc)', onclick: () => void end() }, '✋ Me planto'),
      ),
      h('div', { class: 'muted rosco-keys' }, 'Enter answers · Enter on an empty box: Pasapalabra · Esc: stop'),
    );
    const body = h('div', { class: 'rosco-body' }, clue, hintBox, feedback, controls);
    const panel = h(
      'div',
      { class: 'panel rosco-panel', role: 'dialog', 'aria-label': 'El Rosco' },
      h('div', { class: 'rosco-head' }, h('h2', null, 'El Rosco', h('small', null, 'one word for every letter')), timer),
      ring,
      body,
    );
    const ov = h('div', { class: 'overlay' }, panel);
    host.append(ov);

    const pop = pushLayer((a) => {
      if (a === 'cancel' && !reading && !over) void end();
      return true;
    });

    const tick = opts.timed
      ? setInterval(() => {
          if (reading || over) return;
          left = Math.max(0, left - 1);
          timer.textContent = `⏱ ${clock(left)}`;
          timer.classList.toggle('low', left <= 30);
          if (!left) void end();
        }, 1000)
      : 0;
    timer.textContent = `⏱ ${clock(left)}`;

    function render() {
      bubbles.forEach((b, i) => {
        b.dataset.state = states[i];
        b.classList.toggle('on', i === current && !over);
      });
      const right = states.filter((s) => s === 'right').length;
      const wrong = states.filter((s) => s === 'wrong').length;
      score.textContent = `✓ ${right} · ✗ ${wrong}`;
    }

    function show(i: number) {
      current = i;
      hinted = false;
      const q = qs[i];
      lead.replaceChildren(spanish(q.mode === 'starts' ? 'Empieza por' : 'Contiene la'));
      big.textContent = q.letter;
      clue.replaceChildren(q.clueLang === 'es' ? spanish(q.clue) : h('span', { class: 'rosco-en', lang: 'en' }, q.clue));
      hintBox.textContent = q.hint;
      hintBox.hidden = true;
      hintBtn.removeAttribute('disabled');
      clear(feedback);
      input.value = '';
      input.className = 'cc-input';
      input.disabled = false;
      render();
      setTimeout(() => input.focus(), 30);
    }

    function showHint() {
      if (reading || over || hinted) return;
      hinted = true;
      hintBox.hidden = false;
      hintBtn.setAttribute('disabled', '');
      sfx('blip');
    }

    function advance() {
      const next = nextLetter(states, current);
      if (next < 0) void end();
      else show(next);
    }

    function pass() {
      if (reading || over) return;
      states[current] = 'passed';
      sfx('blip');
      advance();
    }

    async function answer() {
      if (reading || over || !input.value.trim()) return;
      const q = qs[current];
      const r = checkTyped(input.value, q.accepted, { article: q.article, accentsOptional: opts.accentsOptional, variants: q.variants });
      const grade: Exclude<Grade, 'fast'> = r.grade === 'correct' && hinted && !opts.freeHint ? 'close' : r.grade;
      grades[current] = grade;
      states[current] = letterState(grade);
      reading = true;
      input.disabled = true;
      input.classList.add(grade === 'correct' ? 'right' : grade);
      sfx(grade === 'wrong' ? 'wrong' : grade === 'close' ? 'close' : 'correct');
      const word = q.word.es.split('|')[0];
      if (opts.voice) speak(word);
      const g = GRADE_TEXT[grade];
      feedback.className = `rosco-feedback ${g.cls}`;
      clear(feedback);
      appendAll(
        feedback,
        h('strong', null, spanish(g.es)),
        h('div', null, `${q.letter}: `, spanish(withArticle(q.word)), h('span', { class: 'muted' }, ` = ${q.word.en}`)),
        r.note && grade !== 'wrong' ? h('div', { class: 'rosco-note' }, r.note) : null,
        h('div', { class: 'cc-continue' }, grade === 'correct' ? 'Tap to continue ▶' : 'Enter or tap to continue ▶'),
      );
      render();
      // Let the key press that answered settle before listening for "continue".
      await wait(120);
      await waitConfirm(ov, grade === 'correct' ? 1200 : undefined);
      reading = false;
      if (!over) advance();
    }

    async function end() {
      if (over || reading) return;
      over = true;
      if (tick) clearInterval(tick);
      render();
      const right = states.filter((s) => s === 'right').length;
      const wrong = states.filter((s) => s === 'wrong').length;
      const open = qs.length - right - wrong;
      const review = qs.filter((_, i) => states[i] !== 'right');
      clear(body);
      big.textContent = '🏁';
      lead.replaceChildren(spanish(right === qs.length ? '¡Todas!' : '¡Fin!'));
      appendAll(
        body,
        h(
          'div',
          { class: 'stat-grid rosco-summary' },
          h('span', null, 'Aciertos · right'),
          h('span', null, String(right)),
          h('span', null, 'Fallos · wrong'),
          h('span', null, String(wrong)),
          h('span', null, 'Sin responder · not answered'),
          h('span', null, String(open)),
        ),
        review.length
          ? h(
              'div',
              { class: 'rosco-review' },
              h('div', { class: 'muted' }, 'Para repasar · To review:'),
              review.map((q) => h('div', null, h('b', null, `${q.letter} `), spanish(withArticle(q.word)), h('span', { class: 'muted' }, ` — ${q.word.en}`))),
            )
          : null,
        // Not "no-advance": tapping it is the tap that closes the screen.
        h('button', { class: 'btn primary' }, 'Continuar ▶'),
      );
      sfx(right === qs.length ? 'levelup' : 'save');
      await wait(300);
      await waitConfirm(ov);
      pop();
      ov.remove();
      resolve(grades);
    }

    show(0);
  });
}
