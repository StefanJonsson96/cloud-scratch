// The little buttons in the corner of every screen: mute, volume and help.

import { audioPrefs, onAudioPrefs, setAudioPrefs, sfx, type AudioPrefs } from '../engine/audio';
import { speak, stopSpeaking } from '../engine/speech';
import { CAST_VOICES } from '../story/voices';
import { modal, pushLayer } from '../engine/input';
import { h, waitConfirm } from './dom';

const SLIDERS: [keyof Omit<AudioPrefs, 'muted'>, string, string][] = [
  ['music', '🎵 Música', 'Music'],
  ['sfx', '🔔 Efectos', 'Sound effects'],
  ['voice', '🗣️ Voces', 'Spanish voices'],
];

/** Volume sliders for music, effects and voices (also used in the settings menu). */
export function volumeSliders(): HTMLElement {
  const wrap = h('div', { class: 'vol-sliders' });
  for (const [key, label, en] of SLIDERS) {
    const input = h('input', {
      type: 'range',
      min: '0',
      max: '100',
      step: '5',
      value: String(Math.round(audioPrefs()[key] * 100)),
      'aria-label': `${en} volume`,
    }) as HTMLInputElement;
    const val = h('span', { class: 'vol-val' }, `${input.value}%`);
    input.addEventListener('input', () => {
      val.textContent = `${input.value}%`;
      setAudioPrefs({ [key]: Number(input.value) / 100, muted: false });
    });
    input.addEventListener('change', () => {
      if (key === 'sfx') sfx('blip');
      if (key === 'voice') speak('¡Me alegro! Hoy es un día especial.', CAST_VOICES.abuela);
    });
    wrap.append(h('label', { class: 'vol-row' }, h('span', { class: 'vol-label' }, label, h('small', null, en)), input, val));
  }
  return wrap;
}

let popover: { el: HTMLElement; close: () => void } | null = null;

function openVolume(anchor: HTMLElement) {
  if (popover) {
    popover.close();
    return;
  }
  const mute = h('button', { class: 'btn vol-mute' });
  const drawMute = () => (mute.textContent = audioPrefs().muted ? '🔇 Sonido apagado · Unmute' : '🔊 Silenciar todo · Mute all');
  drawMute();
  mute.addEventListener('click', () => {
    setAudioPrefs({ muted: !audioPrefs().muted });
    if (audioPrefs().muted) stopSpeaking();
    drawMute();
  });
  const el = h(
    'div',
    { class: 'vol-pop panel', role: 'dialog', 'aria-label': 'Volume' },
    h('div', { class: 'vol-title' }, 'Volumen', h('small', null, ' · Volume')),
    volumeSliders(),
    mute,
  );
  document.body.append(el);
  const r = anchor.getBoundingClientRect();
  el.style.top = `${Math.round(r.bottom + 6)}px`;
  el.style.right = `${Math.max(8, Math.round(window.innerWidth - r.right))}px`;
  const onDown = (e: PointerEvent) => {
    if (!el.contains(e.target as Node) && !anchor.contains(e.target as Node)) close();
  };
  const pop = pushLayer((a) => {
    if (a === 'cancel') {
      close();
      return true;
    }
    return false;
  });
  const close = () => {
    el.remove();
    pop();
    document.removeEventListener('pointerdown', onDown, true);
    popover = null;
  };
  setTimeout(() => document.addEventListener('pointerdown', onDown, true), 0);
  popover = { el, close };
}

const KEYS: [string, string, string][] = [
  ['Move', 'Arrows / WASD', 'D-pad'],
  ['Run', 'hold Shift', 'hold B'],
  ['Talk · confirm', 'Enter / Space / Z', 'A'],
  ['Back · cancel', 'Esc / X', 'B'],
  ['Menu', 'M / Tab', '☰'],
  ['English for a line', 'T', 'EN'],
  ['Hear it again', 'R', '🔊'],
  ['Hint in a challenge', 'H', '💡'],
  ['Pick answer 1–4', '1 2 3 4', 'tap it'],
  ['This help', 'F1 / ?', '❓'],
];

let helpOpen = false;

/** The controls and the basics, available from every screen. */
export async function showHelp() {
  if (helpOpen) return;
  helpOpen = true;
  const touch = document.body.classList.contains('has-touch');
  const panel = h(
    'div',
    { class: 'panel help-panel', style: { maxWidth: '620px' } },
    h('h2', null, 'Controles', h('small', null, 'Controls')),
    h(
      'table',
      { class: 'keys' },
      h('tr', null, h('th', null, ''), h('th', null, 'Keyboard'), h('th', null, 'Touch')),
      KEYS.map(([what, key, tap]) => h('tr', { class: touch ? 'touch' : '' }, h('td', null, what), h('td', null, h('kbd', null, key)), h('td', null, tap))),
    ),
    h('h3', null, 'Lo básico', h('small', null, ' · The basics')),
    h(
      'ul',
      { class: 'help-list' },
      h('li', null, '🎯 The ', h('b', null, 'objective'), ' in the top-left corner always says what to do next.'),
      h('li', null, '🇬🇧 Tap any ', h('b', null, 'underlined word'), ' for its meaning, or press ', h('b', null, 'EN'), ' for the whole line.'),
      h('li', null, '⚔️ In battle, enemies say their next move in Spanish (', h('i', null, '«va a…»'), ' = is going to…). Read it and react.'),
      h('li', null, '✨ Special moves ask a Spanish question. Right = full power. Take your time: there is no clock unless you turn on the speed bonus.'),
      h('li', null, '📖 The ', h('b', null, 'Menú'), ' has your Grimorio (dictionary, verbs, grammar), items, settings and saving.'),
    ),
    h('div', { class: 'cc-continue' }, 'Enter / Esc / tap ▶'),
  );
  const ov = h('div', { class: 'overlay help-overlay' }, panel);
  document.body.append(ov);
  await modal(() => waitConfirm(ov));
  ov.remove();
  helpOpen = false;
}

/** Mute, volume and help buttons. */
export function cornerButtons(): HTMLElement {
  const muteBtn = h('button', { class: 'hud-btn icon', title: 'Mute / unmute', 'aria-label': 'Mute' });
  const draw = (p: AudioPrefs) => {
    muteBtn.textContent = p.muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-pressed', String(p.muted));
  };
  draw(audioPrefs());
  const off = onAudioPrefs(draw);
  muteBtn.addEventListener('click', () => {
    setAudioPrefs({ muted: !audioPrefs().muted });
    if (audioPrefs().muted) stopSpeaking();
  });
  const volBtn = h('button', { class: 'hud-btn icon', title: 'Volume', 'aria-label': 'Volume' }, '🎚️');
  volBtn.addEventListener('click', () => openVolume(volBtn));
  const helpBtn = h('button', { class: 'hud-btn icon', title: 'Controls & help (F1 or ?)', 'aria-label': 'Help' }, '❓');
  helpBtn.addEventListener('click', () => void showHelp());
  const el = h('div', { class: 'corner-btns' }, muteBtn, volBtn, helpBtn);
  // Stop listening once the buttons leave the page.
  const watch = new MutationObserver(() => {
    if (!el.isConnected) {
      off();
      watch.disconnect();
    }
  });
  setTimeout(() => watch.observe(document.body, { childList: true, subtree: true }), 0);
  return el;
}
