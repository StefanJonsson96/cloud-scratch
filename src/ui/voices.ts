// The "Voces" settings. Story dialogue is recorded (real female and male
// voices from Spain); the browser's own Spanish voices read everything else,
// so this also shows which ones this device has and how to install more.

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
import { CAST_VOICES } from '../story/voices';
import { h, clear } from './dom';

// Real lines from the story, so the recorded voices can be heard here.
const SAMPLES: [string, string, VoiceSpec][] = [
  ['Abuela Rosa', '¡Me alegro! Hoy es un día especial.', CAST_VOICES.abuela],
  ['Lola', '¡Hola! Me llamo Lola. Soy música, de Sevilla. ¡Encantada!', CAST_VOICES.lola],
  ['Mateo', 'Luego vamos a pescar, ¿vale?', CAST_VOICES.mateo],
  ['Don Ramón', 'Cuida de mi hijo, ¿vale? Come mucho, pero es muy valiente.', CAST_VOICES.ramon],
  ['Dani', '¿Sabes? El faro brilla toda la noche. ¡Mola mucho!', CAST_VOICES.nino],
];

// Not in the story, so these always use the browser's voice.
const BROWSER_TEST = { f: 'Hola. Así suena la voz de las mujeres.', m: 'Hola. Así suena la voz de los hombres.' };

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
    const recorded = voiceChoice().recorded !== false;
    el.append(
      h('h3', null, 'Voces', h('small', null, ' · Character voices')),
      h(
        'div',
        { class: 'switch' },
        h(
          'div',
          null,
          'Diálogos · Story dialogue',
          h('small', null, recorded ? 'Recorded voices from Spain: women and men sound right on every device.' : "Read by this browser's own Spanish voices."),
        ),
        h(
          'div',
          { class: 'seg' },
          ([true, false] as const).map((on) =>
            h(
              'button',
              {
                class: `btn${recorded === on ? ' on' : ''}`,
                'aria-pressed': String(recorded === on),
                onclick: () => {
                  setVoiceChoice({ recorded: on });
                  draw();
                  speak(SAMPLES[0][1], SAMPLES[0][2]);
                },
              },
              on ? 'Grabadas' : 'Navegador',
            ),
          ),
        ),
      ),
      h(
        'div',
        { class: 'row voice-tests' },
        SAMPLES.map(([who, line, spec]) => h('button', { class: 'btn', onclick: () => speak(line, spec) }, `▶ ${who}`)),
      ),
      h('h4', null, 'Voz del navegador', h('small', null, ' · for practice words, battles and anything not recorded')),
    );
    if (!speechAvailable()) {
      el.append(h('p', { class: 'warn-box' }, 'No Spanish voice was found in this browser, so practice words are silent (story dialogue still plays). To add one:'), howTo());
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
        speak(BROWSER_TEST[g], { gender: g });
      });
      return h('label', { class: 'voice-pick' }, h('span', null, text), sel);
    };
    el.append(
      select('f', 'Mujeres y niñas · Female characters'),
      select('m', 'Hombres y niños · Male characters'),
      h(
        'div',
        { class: 'row voice-tests' },
        (['f', 'm'] as const).map((g) => h('button', { class: 'btn', onclick: () => speak(BROWSER_TEST[g], { gender: g }) }, g === 'f' ? '▶ Mujer' : '▶ Hombre')),
      ),
    );
    const missing = missingVoiceGenders();
    if (missing.length) {
      const which = missing.map((g) => (g === 'f' ? 'female' : 'male')).join(' or ');
      el.append(
        h(
          'p',
          { class: 'warn-box' },
          `This browser has no ${which} Spanish voice, so practice words and battle lines use a pitch-shifted version of another voice (story dialogue is recorded, so it isn't affected). For real ${which} voices:`,
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
