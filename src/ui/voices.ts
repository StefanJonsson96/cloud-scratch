// The "Voces" settings: which Spanish voices this device has, which one women
// and men use, and how to install more.

import {
  missingVoiceGenders,
  onVoicesChanged,
  setVoiceChoice,
  spanishVoices,
  speak,
  speechAvailable,
  voiceChoice,
  type VoiceSpec,
} from '../engine/speech';
import { h, clear } from './dom';

const SAMPLES: [string, string, VoiceSpec][] = [
  ['Abuela Rosa', 'Hola, cariño. ¿Has comido?', { id: 'abuela', gender: 'f', pitch: 0.85, rate: 0.86 }],
  ['Lola', '¡Hola! Me llamo Lola. ¡Encantada!', { id: 'lola', gender: 'f', pitch: 1.1, rate: 1.05 }],
  ['Mateo', '¡Venga! Tengo mi remo.', { id: 'mateo', gender: 'm', pitch: 1.1, rate: 1.05 }],
  ['Don Ramón', 'Mi hijo está en el muelle.', { id: 'ramon', gender: 'm', pitch: 0.8, rate: 0.9 }],
];

const HOW_TO = [
  ['Chrome', 'already includes “Google español” (a female voice) — try playing in Chrome.'],
  ['Edge', 'includes natural voices: Elvira (female) and Álvaro (male).'],
  ['Windows', 'Settings → Time & language → Speech → Manage voices → Add voices → Español (España). That adds Helena, Laura (female) and Pablo (male). Restart the browser afterwards.'],
  ['macOS', 'System Settings → Accessibility → Spoken Content → System voice → Manage Voices → Spanish (Spain): Mónica (female), Jorge (male).'],
  ['iPhone / iPad', 'Settings → Accessibility → Spoken Content → Voices → Spanish (Spain).'],
  ['Android', 'Settings → Text-to-speech → Google → install the Spanish (Spain) voice data.'],
];

export function voicesPanel(): HTMLElement {
  const el = h('div', { class: 'voices-panel' });
  const draw = () => {
    clear(el);
    el.append(h('h3', null, 'Voces', h('small', null, ' · Character voices')));
    if (!speechAvailable()) {
      el.append(h('p', { class: 'warn-box' }, 'No Spanish voice was found on this device, so nothing can be read aloud. To add one:'), howTo());
      return;
    }
    const voices = spanishVoices();
    const label = (g: 'f' | 'm' | null) => (g === 'f' ? 'female' : g === 'm' ? 'male' : 'unknown');
    const select = (g: 'f' | 'm', text: string) => {
      const sel = h('select', { 'aria-label': text }) as HTMLSelectElement;
      sel.append(h('option', { value: '' }, 'Automático'));
      for (const { voice, gender } of voices) sel.append(h('option', { value: voice.name }, `${voice.name} (${voice.lang}, ${label(gender)})`));
      sel.value = voiceChoice()[g] ?? '';
      sel.addEventListener('change', () => {
        setVoiceChoice({ [g]: sel.value || undefined });
        draw();
        const sample = SAMPLES.find(([, , v]) => v.gender === g)!;
        speak(sample[1], sample[2]);
      });
      return h('label', { class: 'voice-pick' }, h('span', null, text), sel);
    };
    el.append(
      select('f', 'Mujeres y niñas · Female characters'),
      select('m', 'Hombres y niños · Male characters'),
      h(
        'div',
        { class: 'row voice-tests' },
        SAMPLES.map(([who, line, spec]) => h('button', { class: 'btn', onclick: () => speak(line, spec) }, `▶ ${who}`)),
      ),
    );
    const missing = missingVoiceGenders();
    if (missing.length) {
      const which = missing.map((g) => (g === 'f' ? 'female' : 'male')).join(' or ');
      el.append(
        h(
          'p',
          { class: 'warn-box' },
          `This device has no ${which} Spanish voice, so those characters use a pitch-shifted version of another voice. For real ${which} voices:`,
        ),
        howTo(),
      );
    }
    el.append(
      h('details', null, h('summary', null, `Spanish voices found on this device (${voices.length})`), h('ul', { class: 'voice-list' }, voices.map(({ voice, gender }) => h('li', null, `${voice.name} — ${voice.lang} — ${label(gender)}${voice.localService ? '' : ' (online)'}`)))),
    );
  };
  draw();
  const off = onVoicesChanged(draw);
  const watch = new MutationObserver(() => {
    if (!el.isConnected) {
      off();
      watch.disconnect();
    }
  });
  setTimeout(() => watch.observe(document.body, { childList: true, subtree: true }), 0);
  return el;
}

function howTo(): HTMLElement {
  return h('ul', { class: 'voice-howto' }, HOW_TO.map(([where, what]) => h('li', null, h('b', null, `${where}: `), what)));
}
