// Character creation: who you are, how you fight, and how hard it should be.

import { h, clear } from './dom';
import { spriteCanvas } from '../engine/sprites';
import { sfx } from '../engine/audio';
import { pushLayer } from '../engine/input';
import { defineHero, HAIR_COLOURS, HAIR_STYLES, OUTFITS, SKIN_TONES } from '../art/characters';
import { CLASSES, type ClassId } from '../battle/classes';
import { SKILL_BY_ID } from '../battle/defs';
import { PALETTE } from '../engine/sprites';
import { DEFAULT_LOOK, type Difficulty, type Look, type NewGameOptions, type Settings, type SpanishLevel } from '../state';

const DIFFICULTIES: [Difficulty, string, string][] = [
  ['facil', 'Fácil', 'Enemies hit softer and have less HP. For enjoying the story and the Spanish.'],
  ['normal', 'Normal', 'Fights you win by reading the enemy and answering well.'],
  ['dificil', 'Difícil', 'Tougher, harder-hitting enemies. Every answer counts.'],
];

const LEVELS: [SpanishLevel, string, string][] = [
  ['a1', 'Principiante · A1', 'New to Spanish: core words and the present tense. Mostly multiple choice, and a missing accent still counts.'],
  ['a2', 'Intermedio · A2', 'Duolingo regular: past tenses, ser/estar, por/para, gustar. You type words once you know them.'],
  ['b1', 'Avanzado · B1', 'Everything from the start, plus the subjunctive, commands, the conditional, false friends and slang. Lots of typing.'],
];

export function characterCreation(host: HTMLElement, overwrite: boolean): Promise<NewGameOptions | null> {
  return new Promise((resolve) => {
    let name = 'Alex';
    let gender: 'm' | 'f' = 'm';
    const look: Look = { ...DEFAULT_LOOK };
    let heroClass: ClassId = 'hechicero';
    const settings: Partial<Settings> = { difficulty: 'normal', level: 'a2', translations: 'tap' };
    let step = 0;

    const panel = h('div', { class: 'panel creation' });
    host.append(panel);

    const seg = <T extends string | boolean>(opts: [T, string][], get: () => T, set: (v: T) => void, cls = '') => {
      const wrap = h('div', { class: `seg ${cls}` });
      const draw = () => {
        clear(wrap);
        for (const [v, l] of opts)
          wrap.append(
            h(
              'button',
              {
                class: get() === v ? 'on' : '',
                'aria-pressed': String(get() === v),
                onclick: () => {
                  set(v);
                  sfx('blip');
                  render();
                },
              },
              l,
            ),
          );
      };
      draw();
      return wrap;
    };

    const swatches = (opts: [string, string][], get: () => string, set: (v: string) => void) => {
      const wrap = h('div', { class: 'swatches' });
      for (const [key, label] of opts)
        wrap.append(
          h('button', {
            class: `swatch${get() === key ? ' on' : ''}`,
            title: label,
            'aria-label': label,
            'aria-pressed': String(get() === key),
            style: { background: PALETTE[key] },
            onclick: () => {
              set(key);
              sfx('blip');
              render();
            },
          }),
        );
      return wrap;
    };

    const row = (label: string, en: string, control: HTMLElement) =>
      h('div', { class: 'cr-row' }, h('div', { class: 'cr-label' }, label, h('small', null, en)), control);

    const preview = () => {
      defineHero(look);
      return h(
        'div',
        { class: 'cr-preview', 'aria-hidden': 'true' },
        spriteCanvas('hero_down_0', 6),
        spriteCanvas('hero_left_1', 6),
        spriteCanvas('hero_up_0', 6),
      );
    };

    const steps = [
      // 1. Who are you?
      () => {
        const input = h('input', { type: 'text', id: 'hero-name', maxlength: '12', value: name, 'aria-label': 'Your name', autocomplete: 'off' }) as HTMLInputElement;
        input.addEventListener('input', () => (name = input.value));
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') next();
        });
        return [
          h('div', { class: 'field' }, h('label', { for: 'hero-name' }, '¿Cómo te llamas? · What is your name?'), input),
          row(
            '¿Cómo te hablan?',
            'Spanish adjectives agree with you: this changes how people talk to you, and your voice.',
            seg(
              [
                ['m', '«¿Estás cansado?»'],
                ['f', '«¿Estás cansada?»'],
              ],
              () => gender,
              (v) => (gender = v),
            ),
          ),
          preview(),
          row('Piel', 'Skin', swatches(SKIN_TONES, () => look.skin, (v) => (look.skin = v))),
          row('Pelo', 'Hair', swatches(HAIR_COLOURS.map(([k, , l]) => [k, l] as [string, string]), () => look.hair, (v) => (look.hair = v))),
          row('Peinado', 'Hairstyle', seg(HAIR_STYLES, () => look.style, (v) => (look.style = v))),
          row('Ropa', 'Clothes', swatches(OUTFITS.map(([k, , l]) => [k, l] as [string, string]), () => look.outfit, (v) => (look.outfit = v))),
          row(
            'Pantalón o falda',
            'Trousers or skirt',
            seg(
              [
                ['pantalon', 'Pantalón'],
                ['falda', 'Falda'],
              ],
              () => (look.skirt ? 'falda' : 'pantalon'),
              (v) => (look.skirt = v === 'falda'),
            ),
          ),
        ];
      },
      // 2. Class
      () => [
        h('p', { class: 'muted cr-intro' }, 'Every class casts the same word magic (Fuego, Agua, Luz…). Your class adds a signature skill and a passive, and changes how you grow.'),
        h(
          'div',
          { class: 'class-cards' },
          (Object.keys(CLASSES) as ClassId[]).map((id) => {
            const c = CLASSES[id];
            const skill = SKILL_BY_ID.get(c.skill)!;
            return h(
              'button',
              {
                class: `class-card${heroClass === id ? ' on' : ''}`,
                'aria-pressed': String(heroClass === id),
                onclick: () => {
                  heroClass = id;
                  sfx('blip');
                  render();
                },
              },
              h('div', { class: 'cc-icon' }, c.icon),
              h('div', { class: 'cc-name' }, c.name[gender], h('small', null, ` · ${c.en}`)),
              h('div', { class: 'cc-pitch' }, c.pitch),
              h('div', { class: 'cc-perk' }, h('b', null, `${skill.name}`), h('small', null, ` (${skill.en}, level ${skill.level})`), ': ', skill.desc),
              h('div', { class: 'cc-perk' }, h('b', null, c.passive.name), h('small', null, ` (${c.passive.en})`), ': ', c.passive.desc),
            );
          }),
        ),
        h('p', { class: 'muted cr-intro' }, '✨ Every 3 levels you also pick a talent: a perk for the whole party.'),
      ],
      // 3. Difficulty
      () => [
        h('h3', null, 'Combate', h('small', null, ' · Battles')),
        h(
          'div',
          { class: 'level-cards' },
          DIFFICULTIES.map(([id, label, desc]) =>
            h(
              'button',
              {
                class: `level-card${settings.difficulty === id ? ' on' : ''}`,
                'aria-pressed': String(settings.difficulty === id),
                onclick: () => {
                  settings.difficulty = id;
                  sfx('blip');
                  render();
                },
              },
              h('b', null, label),
              h('small', null, desc),
            ),
          ),
        ),
        h('h3', null, 'Español', h('small', null, ' · How hard the Spanish is')),
        h(
          'div',
          { class: 'level-cards' },
          LEVELS.map(([id, label, desc]) =>
            h(
              'button',
              {
                class: `level-card${settings.level === id ? ' on' : ''}`,
                'aria-pressed': String(settings.level === id),
                onclick: () => {
                  settings.level = id;
                  sfx('blip');
                  render();
                },
              },
              h('b', null, label),
              h('small', null, desc),
            ),
          ),
        ),
        row(
          'Traducciones',
          'English under every line, or only when you tap EN.',
          seg(
            [
              ['always', 'Always'],
              ['tap', 'On tap'],
            ],
            () => settings.translations!,
            (v) => (settings.translations = v),
          ),
        ),
        h('p', { class: 'muted' }, 'You can change all of this later in Menú → Ajustes.'),
        overwrite ? h('p', { class: 'muted warn' }, 'Starting a new game replaces your current save.') : null,
      ],
    ];
    const TITLES = [
      ['¿Quién eres?', 'Who are you?'],
      ['Tu clase', 'Your class'],
      ['Dificultad', 'Difficulty'],
    ];

    function render() {
      clear(panel);
      const [es, en] = TITLES[step];
      const back = h('button', { class: 'btn' }, step === 0 ? '↩ Volver · Back' : '◀ Atrás · Back');
      const fwd = h('button', { class: 'btn primary' }, step === steps.length - 1 ? '¡Empezar! · Start' : 'Siguiente ▶ · Next');
      back.addEventListener('click', prev);
      fwd.addEventListener('click', next);
      panel.append(
        h('div', { class: 'cr-head' }, h('h2', null, es, h('small', null, ` · ${en}`)), h('span', { class: 'cr-step' }, `${step + 1} / ${steps.length}`)),
        ...(steps[step]().filter(Boolean) as HTMLElement[]),
        h('div', { class: 'cr-nav' }, back, fwd),
      );
      const focus = panel.querySelector<HTMLInputElement>('#hero-name');
      if (focus && document.activeElement?.id !== 'hero-name') setTimeout(() => focus.focus(), 30);
    }

    function prev() {
      sfx('cancel');
      if (step === 0) return done(null);
      step--;
      render();
    }

    function next() {
      sfx('select');
      if (step < steps.length - 1) {
        step++;
        render();
        return;
      }
      done({ name: name.trim() || 'Alex', gender, look: { ...look }, heroClass, settings });
    }

    const pop = pushLayer((a) => {
      if (a === 'confirm') next();
      else if (a === 'cancel') prev();
      return true;
    });

    function done(r: NewGameOptions | null) {
      pop();
      panel.remove();
      resolve(r);
    }

    render();
  });
}
