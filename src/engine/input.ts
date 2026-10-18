// Keyboard + touch input.
//
// Discrete presses go to the top of a layer stack, so a menu opened over the
// world (or a challenge opened over a battle) gets the keys first. Held
// directions are tracked separately for walking around the overworld.

export type Action =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'confirm'
  | 'cancel'
  | 'menu'
  | 'translate'
  | 'hint'
  | 'speak'
  | `num${number}`;

export type Layer = (a: Action, e?: KeyboardEvent) => boolean | void;

const layers: Layer[] = [];
const held = new Set<string>();
let runHeld = false;

export function pushLayer(l: Layer): () => void {
  layers.push(l);
  return () => {
    const i = layers.lastIndexOf(l);
    if (i >= 0) layers.splice(i, 1);
  };
}

export function dispatch(a: Action, e?: KeyboardEvent): boolean {
  for (let i = layers.length - 1; i >= 0; i--) {
    const r = layers[i](a, e);
    if (r !== false) return true;
    // Returning false lets the action fall through to the layer below.
  }
  return false;
}

const KEYMAP: Record<string, Action> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  Enter: 'confirm',
  Space: 'confirm',
  KeyZ: 'confirm',
  KeyE: 'confirm',
  Escape: 'cancel',
  KeyX: 'cancel',
  Backspace: 'cancel',
  KeyM: 'menu',
  Tab: 'menu',
  KeyT: 'translate',
  KeyH: 'hint',
  KeyR: 'speak',
};

function isTyping(): boolean {
  const el = document.activeElement as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

export function heldDirection(): 'up' | 'down' | 'left' | 'right' | null {
  // Most recently pressed direction wins.
  const order = [...held].reverse();
  for (const k of order) {
    const a = KEYMAP[k] ?? (k.startsWith('touch:') ? (k.slice(6) as Action) : undefined);
    if (a === 'up' || a === 'down' || a === 'left' || a === 'right') return a;
  }
  return null;
}

export function isRunning(): boolean {
  return runHeld;
}

export function initInput() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') runHeld = true;
    if (isTyping()) {
      // Inputs handle their own keys; only Escape is routed.
      if (e.code === 'Escape') dispatch('cancel', e);
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    let a: Action | undefined = KEYMAP[e.code];
    if (!a && /^Digit[1-9]$/.test(e.code)) a = `num${Number(e.code.slice(5))}`;
    if (!a && /^Numpad[1-9]$/.test(e.code)) a = `num${Number(e.code.slice(6))}`;
    if (!a) return;
    e.preventDefault();
    if (!e.repeat) held.add(e.code);
    if (e.repeat && (a === 'confirm' || a === 'cancel' || a === 'menu')) return;
    dispatch(a, e);
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') runHeld = false;
    held.delete(e.code);
  });
  window.addEventListener('blur', () => {
    held.clear();
    runHeld = false;
  });
}

/** On-screen controls for phones and tablets. */
export function initTouch(root: HTMLElement) {
  const pad = document.createElement('div');
  pad.className = 'touch';
  pad.innerHTML = `
    <div class="dpad">
      <button data-dir="up" aria-label="Up">▲</button>
      <button data-dir="left" aria-label="Left">◀</button>
      <button data-dir="right" aria-label="Right">▶</button>
      <button data-dir="down" aria-label="Down">▼</button>
    </div>
    <div class="abtns">
      <button data-act="menu" class="small" aria-label="Menu">☰</button>
      <button data-act="cancel" aria-label="Back / run">B</button>
      <button data-act="confirm" aria-label="Talk / confirm">A</button>
    </div>`;
  root.appendChild(pad);

  const start = (btn: HTMLElement) => {
    const dir = btn.dataset.dir;
    const act = btn.dataset.act as Action | undefined;
    if (dir) {
      held.add(`touch:${dir}`);
      dispatch(dir as Action);
    } else if (act) {
      if (act === 'cancel') runHeld = true;
      dispatch(act);
    }
    btn.classList.add('down');
  };
  const end = (btn: HTMLElement) => {
    const dir = btn.dataset.dir;
    if (dir) held.delete(`touch:${dir}`);
    if (btn.dataset.act === 'cancel') runHeld = false;
    btn.classList.remove('down');
  };
  pad.querySelectorAll<HTMLElement>('button').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      start(btn);
    });
    btn.addEventListener('pointerup', () => end(btn));
    btn.addEventListener('pointercancel', () => end(btn));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  document.body.classList.toggle('has-touch', coarse);
  window.addEventListener('touchstart', () => document.body.classList.add('has-touch'), { once: true, passive: true });
}
