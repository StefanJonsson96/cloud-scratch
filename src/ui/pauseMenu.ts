// The pause menu: party, items, the Grimorio (dictionary, verbs, grammar,
// bestiary), the travel diary, postcards, quick review practice, settings and
// saving.

import type { Game } from '../game';
import { volumeSliders, showHelp } from './corner';
import { voicesPanel } from './voices';
import { offerTalents, pendingTalents } from './talents';
import { CLASSES, TALENTS, TALENT_EVERY, className, type TalentId } from '../battle/classes';
import { h, clear, menu, appendAll } from './dom';
import { spanish } from './spanish';
import { pushLayer } from '../engine/input';
import { sfx } from '../engine/audio';
import { speak, speechAvailable, voiceName, listeningAvailable } from '../engine/speech';
import { MEMBERS, SKILLS, xpToNext } from '../battle/defs';
import { memberStats } from '../battle/rules';
import { ENEMIES } from '../battle/enemies';
import { ITEMS, ACCESSORIES } from '../data/items';
import { WORDS, withArticle } from '../data/vocab';
import { verbsUpToChapter, tensesUpToChapter, TENSES, TABLE_PERSONS } from '../data/verbs';
import { RULES, TOPIC_CH } from '../data/grammar';
import meta from '../data/generated/meta.json';
import { VOICE_CREDITS } from '../engine/voiceover';
import { MAX_BOX } from '../learn/srs';
import { makeChallenge, type ChallengeStyle } from '../learn/challenges';
import { record } from '../learn/srs';
import { runChallenge } from './challengeView';
import { dayStreak, exportSave, importSave, save, type GameState, type Settings } from '../state';
import { spriteCanvas } from '../engine/sprites';
import { journalView } from './journal';
import { postcardAlbum } from './postcards';

type Tab = 'equipo' | 'objetos' | 'grimorio' | 'diario' | 'postales' | 'repaso' | 'ajustes';

export function openPauseMenu(game: Game, start: Tab = 'equipo'): Promise<void> {
  return new Promise((resolve) => {
    sfx('select');
    const g = game.g;
    const body = h('div', { class: 'pm-body' });
    const tabs = h('div', { class: 'tabs', role: 'tablist' });
    const panel = h(
      'div',
      { class: 'panel' },
      h(
        'div',
        { class: 'row', style: { justifyContent: 'space-between' } },
        h('h2', null, 'Menú', h('small', null, `${g.euros} € · ${minutes(g)} min · 🔥 ${days(dayStreak(g.stats.days))}`)),
        h('button', { class: 'btn', onclick: () => close() }, '✕ Cerrar'),
      ),
      tabs,
      body,
    );
    const ov = h('div', { class: 'overlay' }, panel);
    game.overlayHost.append(ov);
    const TABS: [Tab, string, string][] = [
      ['equipo', 'Equipo', 'Party'],
      ['objetos', 'Objetos', 'Items'],
      ['grimorio', 'Grimorio', 'Dictionary & grammar'],
      ['diario', 'Diario', 'Journal'],
      ['postales', 'Postales', 'Postcards'],
      ['repaso', 'Repaso', 'Practice'],
      ['ajustes', 'Ajustes', 'Settings & save'],
    ];
    let current: Tab = start;
    const show = (t: Tab) => {
      current = t;
      clear(tabs);
      for (const [id, es, en] of TABS) {
        tabs.append(h('button', { class: `tab${id === t ? ' on' : ''}`, role: 'tab', title: en, onclick: () => show(id) }, es, h('small', { class: 'muted' }, ` ${en}`)));
      }
      clear(body);
      ({ equipo, objetos, grimorio, diario, postales, repaso, ajustes })[t](game, body, () => show(current), close);
    };
    let closed = false;
    const pop = pushLayer((a) => {
      if (a === 'cancel' || a === 'menu') close();
      else if (a === 'left' || a === 'right') {
        const i = TABS.findIndex(([id]) => id === current);
        show(TABS[(i + (a === 'left' ? -1 : 1) + TABS.length) % TABS.length][0]);
      }
      return true;
    });
    function close() {
      if (closed) return;
      closed = true;
      pop();
      ov.remove();
      sfx('cancel');
      save(g);
      game.applySettings();
      resolve();
    }
    show(start);
  });
}

function days(n: number) {
  return `${n} ${n === 1 ? 'día' : 'días'}`;
}

function minutes(g: GameState) {
  return Math.round(g.stats.playMs / 60000);
}

type View = (game: Game, el: HTMLElement, rerender: () => void, close: () => void) => void;

// ------------------------------------------------------------------ party
const equipo: View = (game, el, rerender) => {
  const g = game.g;
  const grid = h('div', { class: 'grid2' });
  for (const m of g.party) {
    const def = MEMBERS[m.id];
    const s = memberStats(m);
    const name = m.id === 'hero' ? g.heroName : def.name;
    const cls = m.id === 'hero' ? CLASSES[g.heroClass] : undefined;
    const acc = m.accessory ? ACCESSORIES[m.accessory] : undefined;
    grid.append(
      h(
        'div',
        { class: 'card member-card' },
        spriteCanvas(`${def.sprite}_down_0`, 4),
        h(
          'div',
          null,
          h('h3', null, name, h('small', null, cls ? `${cls.icon} ${className(cls.id, g.gender)} · ${cls.en}` : `${def.role} · ${def.roleEn}`)),
          h('div', { class: 'muted' }, `Nivel ${m.level} · ${m.xp}/${xpToNext(m.level)} PX · Spanish style: ${def.styleEn}`),
          h(
            'div',
            { class: 'stat-grid' },
            h('span', null, 'PV (HP)'),
            h('span', null, `${m.hp}/${s.maxHp}`),
            h('span', null, 'PM (MP)'),
            h('span', null, `${m.mp}/${s.maxMp}`),
            h('span', null, 'Fuerza (ATK)'),
            h('span', null, String(s.atk)),
            h('span', null, 'Magia (MAG)'),
            h('span', null, String(s.mag)),
            h('span', null, 'Defensa (DEF)'),
            h('span', null, String(s.def)),
            h('span', null, 'Velocidad (SPD)'),
            h('span', null, String(s.spd)),
          ),
          h(
            'div',
            { class: 'skill-list' },
            'Habilidades: ',
            SKILLS.filter((x) => x.user === m.id && (!x.cls || x.cls === m.cls))
              .map((x) => (x.level <= m.level ? `${x.name} (${x.en})` : `🔒 Nv ${x.level}`))
              .join(' · '),
          ),
          cls ? h('div', { class: 'skill-list' }, h('b', null, `Pasiva: ${cls.passive.name}`), ` (${cls.passive.en}) — ${cls.passive.desc}`) : null,
          h(
            'div',
            { class: 'row', style: { marginTop: '6px' } },
            h('span', null, `Amuleto: ${acc ? `${acc.icon} ${acc.name}` : '—'}`),
            g.accessories.length
              ? h(
                  'button',
                  {
                    class: 'btn',
                    onclick: async (ev: Event) => {
                      const host = (ev.target as HTMLElement).parentElement!;
                      const owned = g.accessories;
                      const items = [
                        ...owned.map((id) => {
                          const a = ACCESSORIES[id];
                          const wearer = g.party.find((p) => p.accessory === id && p !== m);
                          return { label: `${a.icon} ${a.name}`, sub: `${a.en} — ${a.desc}${wearer ? ` (worn by ${wearer.id === 'hero' ? g.heroName : MEMBERS[wearer.id].name})` : ''}` };
                        }),
                        { label: 'Quitar', sub: 'Remove' },
                      ];
                      const pick = await menu(host, items, { cancel: true });
                      if (pick === null) return rerender();
                      for (const p of g.party) if (p.accessory === owned[pick]) p.accessory = undefined;
                      m.accessory = pick < owned.length ? owned[pick] : undefined;
                      const ns = memberStats(m);
                      m.hp = Math.min(m.hp, ns.maxHp);
                      m.mp = Math.min(m.mp, ns.maxMp);
                      rerender();
                    },
                  },
                  'Cambiar',
                )
              : null,
          ),
        ),
      ),
    );
  }
  el.append(grid);
  const pending = pendingTalents(g);
  appendAll(
    el,
    h('h3', null, 'Talentos', h('small', null, ` · Talents — a new one every ${TALENT_EVERY} levels of ${g.heroName}`)),
    g.talents.length
      ? h(
          'ul',
          { class: 'talent-list' },
          g.talents.map((id) => {
            const t = TALENTS[id as TalentId];
            return t ? h('li', null, `${t.icon} `, h('b', null, t.name), ` (${t.en}) — ${t.desc}`) : null;
          }),
        )
      : h('p', { class: 'muted' }, 'None yet.'),
    pending
      ? h(
          'button',
          {
            class: 'btn primary',
            onclick: async () => {
              await offerTalents(g);
              save(g);
              rerender();
            },
          },
          `✨ Elegir talento (${pending})`,
        )
      : null,
  );
};

// ------------------------------------------------------------------ items
const objetos: View = (game, el, rerender) => {
  const g = game.g;
  const list = Object.entries(g.inventory).filter(([id, n]) => n > 0 && ITEMS[id]);
  if (!list.length) {
    el.append(h('p', { class: 'muted' }, 'No tienes objetos. (You have no items. Buy some at a shop — tienda.)'));
    return;
  }
  const host = h('div');
  el.append(h('p', { class: 'muted' }, 'Elige un objeto para usarlo. (Pick an item to use it.)'), host);
  void (async () => {
    const pick = await menu(
      host,
      list.map(([id, n]) => ({ label: `${ITEMS[id].icon} ${ITEMS[id].name}`, right: `×${n}`, sub: `${ITEMS[id].en} — ${ITEMS[id].desc}` })),
      { cancel: true, columns: 2 },
    );
    if (pick === null) return;
    const item = ITEMS[list[pick][0]];
    if (item.kind === 'haste') {
      game.toast('Café: úsalo en una batalla. (Use it in battle.)');
      return rerender();
    }
    const targets = g.party;
    clear(host);
    host.append(h('p', null, `¿Para quién? · Who for? — ${item.name}`));
    const t = await menu(
      host,
      targets.map((m) => {
        const s = memberStats(m);
        return { label: m.id === 'hero' ? g.heroName : MEMBERS[m.id].name, sub: `PV ${m.hp}/${s.maxHp} · PM ${m.mp}/${s.maxMp}` };
      }),
      { cancel: true },
    );
    if (t === null) return rerender();
    const apply = item.kind === 'healAll' ? targets : [targets[t]];
    for (const m of apply) {
      const s = memberStats(m);
      if (item.kind === 'heal' || item.kind === 'healAll') m.hp = Math.min(s.maxHp, (m.hp || 0) + item.amount);
      if (item.kind === 'mp') m.mp = Math.min(s.maxMp, m.mp + item.amount);
      if (item.kind === 'revive' && m.hp <= 0) m.hp = Math.round(s.maxHp * item.amount);
    }
    g.inventory[item.id]--;
    sfx('heal');
    rerender();
  })();
};

// ------------------------------------------------------------------ grimorio
const grimorio: View = (game, el) => {
  const sub = h('div', { class: 'tabs' });
  const content = h('div');
  el.append(sub, content);
  const pages: [string, string, () => void][] = [
    ['Palabras', 'Words', () => words(game, content)],
    ['Verbos', 'Verb tables', () => verbs(game, content)],
    ['Gramática', 'Grammar notes', () => grammar(game, content)],
    ['Bestiario', 'Bestiary', () => bestiary(game, content)],
    ['Progreso', 'Progress', () => progress(game, content)],
  ];
  const show = (i: number) => {
    clear(sub);
    pages.forEach(([es, en], j) => sub.append(h('button', { class: `tab${i === j ? ' on' : ''}`, onclick: () => show(j) }, es, h('small', { class: 'muted' }, ` ${en}`))));
    clear(content);
    pages[i][2]();
  };
  show(0);
};

function stars(box: number) {
  return '★'.repeat(box) + '☆'.repeat(MAX_BOX - box);
}

function words(game: Game, el: HTMLElement) {
  const g = game.g;
  const search = h('input', { type: 'text', id: 'grimorio-search', placeholder: 'Buscar / search (español o English)…', 'aria-label': 'Search words' }) as HTMLInputElement;
  const list = h('div', { class: 'word-list' });
  const info = h('div', { class: 'muted' });
  const detail = h('div', { class: 'card', hidden: true });
  el.append(
    h('p', { class: 'muted' }, 'Every word you have met, with its translation. Stars show how well you know it. Tap one to hear it.'),
    search,
    info,
    detail,
    list,
  );
  const known = WORDS.filter((w) => w.ch <= g.chapter && (!w.lvl || g.settings.level === 'b1'));
  const render = () => {
    clear(list);
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    let cat = '';
    for (const w of known) {
      if (q && !w.es.toLowerCase().includes(q) && !w.en.toLowerCase().includes(q)) continue;
      if (w.cat !== cat) {
        cat = w.cat;
        list.append(h('div', { style: { gridColumn: '1 / -1', color: 'var(--saffron)', marginTop: '6px', fontFamily: 'var(--font-display)' } }, cat));
      }
      const card = g.srs.cards[`w:${w.id}`];
      const seen = !!card || g.looked.includes(w.id);
      list.append(
        h(
          'button',
          {
            class: `word${seen ? '' : ' unseen'}`,
            onclick: () => {
              speak(w.es.split('|')[0]);
              detail.hidden = false;
              clear(detail);
              appendAll(
                detail,
                h('h3', null, withArticle(w), h('small', null, w.en)),
                w.ex ? h('div', null, spanish(w.ex[0]), h('span', { class: 'log-en' }, w.ex[1])) : null,
                h('div', { class: 'muted' }, card ? `Practised ${card.seen}× · right ${card.right} · wrong ${card.wrong}` : 'Not practised yet.'),
              );
            },
          },
          h('span', { class: 'w-es', lang: 'es' }, `${w.emoji ? w.emoji + ' ' : ''}${withArticle(w)}`),
          h('span', { class: 'w-en' }, w.en),
          h('span', { class: 'w-stars', title: 'Mastery' }, stars(card?.box ?? 0)),
        ),
      );
      shown++;
    }
    const mastered = known.filter((w) => (g.srs.cards[`w:${w.id}`]?.box ?? 0) >= MAX_BOX).length;
    info.textContent = `${shown} shown · ${known.length} words unlocked · ${mastered} mastered ★★★★★`;
  };
  search.addEventListener('input', render);
  render();
}

function verbs(game: Game, el: HTMLElement) {
  const g = game.g;
  const ch = Math.max(2, g.chapter);
  const tenses = tensesUpToChapter(ch, g.settings.level);
  const list = verbsUpToChapter(ch, g.settings.level);
  el.append(
    h('p', { class: 'muted' }, 'Full conjugation tables, Spain style (with vosotros). New tenses unlock as the story goes on.'),
    ...tenses.map((t) => h('div', { class: 'rule' }, h('h4', null, `${TENSES[t].es} — ${TENSES[t].en}`), h('div', null, TENSES[t].rule))),
  );
  const pick = h('select', { id: 'verb-pick', 'aria-label': 'Verb' }) as HTMLSelectElement;
  for (const v of list) pick.append(h('option', { value: v.inf }, `${v.inf} — to ${v.en.base}${v.en.sense ? ` (${v.en.sense})` : ''}`));
  const table = h('div', { class: 'scroll-x' });
  el.append(h('div', { class: 'row' }, h('label', { for: 'verb-pick' }, 'Verbo: '), pick), table);
  const render = () => {
    const v = list.find((x) => x.inf === pick.value)!;
    clear(table);
    table.append(
      h(
        'table',
        { class: 'conj' },
        h('tr', null, h('th', null, ''), ...tenses.map((t) => h('th', null, TENSES[t].es))),
        ...TABLE_PERSONS.map((p, i) => h('tr', null, h('th', null, p), ...tenses.map((t) => h('td', { lang: 'es' }, v.forms[t][i] || '—')))),
      ),
    );
  };
  pick.addEventListener('change', render);
  if (list.length) render();
  if (!g.party.some((m) => m.id === 'lola')) el.prepend(h('p', { class: 'muted' }, '(Lola practises these with you once she joins the party.)'));
}

function grammar(game: Game, el: HTMLElement) {
  const g = game.g;
  const notes: [string, string][] = [
    ['Género · Gender', 'Words ending in -o are usually masculine (el), -a feminine (la). Watch the traps: el día, el mapa, el problema (Greek -ma words), la mano, la foto, la moto. Feminine words starting with a stressed “a” take EL in the singular: el agua fría, el águila. Words in -ción, -dad, -tad, -tud are feminine.'],
    ['Vosotros (Spain)', 'In Spain, “you all” (informal) is VOSOTROS: vosotros habláis, coméis, vivís. “Ustedes” is the formal version. Object pronoun: os (“os quiero”).'],
    [RULES.serIdentity.title, RULES.serIdentity.text],
    [RULES.estarState.title, RULES.estarState.text],
    [RULES.serEvent.title, RULES.serEvent.text],
    [RULES.estarResult.title, RULES.estarResult.text],
    [RULES.meaningChange.title, RULES.meaningChange.text],
  ];
  if (g.chapter >= TOPIC_CH.gustar) notes.push([RULES.gustar.title, RULES.gustar.text]);
  if (g.chapter >= TOPIC_CH.porPara) notes.push([RULES.por.title, RULES.por.text], [RULES.para.title, RULES.para.text]);
  notes.push(['“Ir a” + infinitive', 'The easy future: voy a comer (I’m going to eat). Every enemy uses it to announce its next move: «El cangrejo va a pellizcar a Mateo».']);
  if (g.chapter >= 4) notes.push(['Perfecto vs indefinido (Spain)', 'In Spain, use the perfecto for things that happened today / this week / this year: «Hoy he comido paella». Use the indefinido for finished time: «Ayer comí paella». (Much of Latin America uses the indefinido for both.)']);
  const a2 = g.settings.level === 'a2';
  if (a2 && g.chapter >= 7) notes.push(['El futuro', 'Add the endings to the whole infinitive: hablaré, hablarás, hablará, hablaremos, hablaréis, hablarán. A few verbs change the stem: tendré, haré, diré, podré, saldré, vendré, pondré, querré, sabré.']);
  if (a2 && g.chapter >= 8) {
    notes.push(['El imperativo · Commands', 'Tú: the él form of the present — ¡habla!, ¡come!, ¡escribe! (irregular: di, haz, ven, pon, sal, ten, ve, sé). Vosotros: swap the -r for -d — ¡hablad!, ¡comed!, ¡venid!']);
    notes.push(['El condicional · “would”', 'Infinitive + -ía: hablaría, comerías, viviríamos (same stems as the future: tendría, haría, podría). Perfect for polite requests: ¿Podrías ayudarme? · Me gustaría un café.']);
  }
  if (g.settings.level === 'b1' || (a2 && g.chapter >= 9)) {
    for (const k of ['subjWish', 'subjDoubt', 'subjEmotion', 'subjFuture', 'subjPurpose', 'subjUnknown', 'indicFact']) notes.push([RULES[k].title, RULES[k].text]);
  }
  if (g.settings.level === 'b1') {
    notes.push(['Falsos amigos · False friends', 'embarazada = pregnant (not embarrassed: avergonzado) · constipado = has a cold · éxito = success (exit: salida) · librería = bookshop (library: biblioteca) · carpeta = folder · realizar = carry out (realise: darse cuenta) · asistir = attend.']);
    notes.push(['España vs Latinoamérica', 'Spain says ordenador, móvil, coche, conducir, zumo, patata, billete, piso, vale. Much of Latin America says computadora, celular, carro, manejar, jugo, papa, boleto, departamento.']);
  }
  if (g.chapter >= 5) notes.push(['Indefinido vs imperfecto', 'Indefinido = one finished event (Ayer fui a la playa). Imperfecto = habits and descriptions, “used to” (De pequeño iba a la playa cada verano).']);
  el.append(...notes.map(([t, b]) => h('div', { class: 'rule' }, h('h4', null, t), h('div', null, b))));
}

function bestiary(game: Game, el: HTMLElement) {
  const g = game.g;
  if (!g.bestiary.length) {
    el.append(h('p', { class: 'muted' }, 'No enemies defeated yet.'));
    return;
  }
  const grid = h('div', { class: 'grid2' });
  for (const id of g.bestiary) {
    const e = ENEMIES[id];
    grid.append(
      h(
        'div',
        { class: 'card member-card' },
        spriteCanvas(e.sprite, 2),
        h('div', null, h('h3', null, `${e.art} ${e.name}`, h('small', null, e.en)), h('div', null, spanish(e.desc[0])), h('div', { class: 'muted' }, e.desc[1]), h('div', { class: 'muted' }, `Débil contra: ${e.weak.join(', ') || '—'}`)),
      ),
    );
  }
  el.append(grid);
}

function progress(game: Game, el: HTMLElement) {
  const g = game.g;
  const cards = Object.entries(g.srs.cards);
  const by = (p: string) => cards.filter(([k]) => k.startsWith(p));
  const line = (label: string, p: string) => {
    const list = by(p);
    const m = list.filter(([, c]) => c.box >= MAX_BOX).length;
    return [h('span', null, label), h('span', null, `${list.length} practised · ${m} mastered`)];
  };
  const acc = g.stats.answered ? Math.round((100 * g.stats.right) / g.stats.answered) : 0;
  el.append(
    h(
      'div',
      { class: 'stat-grid' },
      ...line('Palabras (words)', 'w:'),
      ...line('Género (el/la)', 'g:'),
      ...line('Verbos (conjugations)', 'v:'),
      ...line('Gramática (ser/estar, por/para, gustar)', 'gr:'),
      h('span', null, 'Answers'),
      h('span', null, `${g.stats.answered} (${acc}% right)`),
      h('span', null, 'Battles won'),
      h('span', null, `${g.stats.wins}/${g.stats.battles}`),
      h('span', null, 'Day streak'),
      h('span', null, `🔥 ${days(dayStreak(g.stats.days))}`),
      h('span', null, 'Play time'),
      h('span', null, `${minutes(g)} min`),
    ),
  );
}

// ---------------------------------------------------- diario and postales
const diario: View = (game, el) => journalView(game.g, el);

const postales: View = (game, el) => postcardAlbum(game.g, el);

// ------------------------------------------------------------------ repaso
const repaso: View = (game, el) => {
  const g = game.g;
  const styles: [ChallengeStyle, string, string, boolean][] = [
    ['vocab', 'Palabras', 'Vocabulary & expressions', true],
    ['quick', 'Género · ser/estar · por/para', 'Quick decisions (Mateo)', true],
    ['verb', 'Verbos · gustar', 'Conjugation (Lola)', g.party.some((m) => m.id === 'lola')],
  ];
  el.append(
    h('p', null, 'A quick 10-question review of whatever is due, outside battle. Each right answer earns 2 €.'),
    h('p', { class: 'muted' }, 'Spaced repetition decides what comes up: words you struggle with return sooner.'),
  );
  const host = h('div');
  el.append(host);
  void (async () => {
    const opts = [...styles.filter((s) => s[3]).map(([, es, en]) => ({ label: es, sub: en })), { label: 'Mezcla', sub: 'Mixed' }];
    const pick = await menu(host, opts, { cancel: true });
    if (pick === null) return;
    const available = styles.filter((s) => s[3]).map((s) => s[0]);
    const chosen: ChallengeStyle[] = pick < available.length ? [available[pick]] : available;
    let right = 0;
    for (let i = 0; i < 10; i++) {
      const style = chosen[i % chosen.length];
      const ch = makeChallenge(style, {
        srs: g.srs,
        chapter: g.chapter,
        rand: Math.random,
        recent: game.recent,
        preferTyping: g.settings.typingFocus,
        listening: g.settings.voice && listeningAvailable(),
        level: g.settings.level,
      });
      game.recent.push(ch.key);
      if (game.recent.length > 12) game.recent.shift();
      const r = await runChallenge(game.overlayHost, ch, {
        title: `Repaso ${i + 1}/10`,
        voice: g.settings.voice,
        timed: g.settings.speedBonus,
        freeHint: g.talents.includes('memoria'),
        accentsOptional: g.settings.level === 'a1',
        liveCheck: g.settings.liveCheck,
      });
      if (ch.srs) record(g.srs, ch.key, r.grade, Date.now(), ch.maxBox);
      g.stats.answered++;
      if (r.grade === 'fast' || r.grade === 'correct') {
        right++;
        g.stats.right++;
      }
    }
    g.euros += right * 2;
    save(g);
    clear(host);
    host.append(h('h3', null, `¡Muy bien! ${right}/10`), h('p', null, `+${right * 2} € · Come back tomorrow to keep your streak.`));
  })();
};

// ------------------------------------------------------------------ ajustes
const ajustes: View = (game, el, rerender, close) => {
  const g = game.g;
  const s = g.settings;
  const seg = <K extends keyof Settings>(key: K, label: string, help: string, options: [Settings[K], string][]) =>
    h(
      'div',
      { class: 'switch' },
      h('div', null, label, h('small', null, help)),
      h(
        'div',
        { class: 'seg' },
        options.map(([v, l]) =>
          h(
            'button',
            {
              class: s[key] === v ? 'on' : '',
              onclick: () => {
                s[key] = v;
                game.applySettings();
                save(g);
                rerender();
              },
            },
            l,
          ),
        ),
      ),
    );
  el.append(
    seg('translations', 'Traducciones · Translations', 'Show English under every Spanish line, or only when you tap EN (or press T).', [
      ['always', 'Always'],
      ['tap', 'On tap'],
    ]),
    seg('typingFocus', 'Escribir · Typing focus', 'Ask you to type answers sooner. Recalling beats recognising.', [
      [true, 'On'],
      [false, 'Off'],
    ]),
    seg('voice', 'Voz · Spanish voice', `Story dialogue: recorded voices from Spain. Practice words: ${speechAvailable() ? voiceName() : 'no voice in this browser (see Voces below)'}.`, [
      [true, 'On'],
      [false, 'Off'],
    ]),
    seg('autoVoice', 'Leer diálogos · Auto-read dialogue', 'Every line is read aloud as it appears. 🔊 (or R) plays it again.', [
      [true, 'On'],
      [false, 'Off'],
    ]),
    h('div', { class: 'switch' }, h('div', null, 'Volumen · Volume', h('small', null, 'Also in the 🎚️ button in the corner. Saved on this device.')), volumeSliders()),
    voicesPanel(),
    seg('marker', 'Marcador · Objective marker', 'A yellow arrow on the map shows where to go next (or which exit leads there).', [
      [true, 'On'],
      [false, 'Off'],
    ]),
    seg('speedBonus', 'Bonus de rapidez · Speed bonus', 'Off: take all the time you need. On: a timer bar — answer before it runs out for ×1.25 power.', [
      [false, 'Off'],
      [true, 'On'],
    ]),
    seg('liveCheck', 'Comprobar en línea · Online check', 'If you type a word the game doesn’t know (say, a synonym), it asks Wiktionary before marking it wrong. Sends only that word.', [
      [true, 'On'],
      [false, 'Off'],
    ]),
    seg('textSpeed', 'Texto · Text speed', '', [
      ['normal', 'Normal'],
      ['fast', 'Fast'],
      ['instant', 'Instant'],
    ]),
    seg('encounters', 'Encuentros · Random battles', 'How often wild monsters appear.', [
      ['normal', 'Normal'],
      ['low', 'Fewer'],
    ]),
    seg('difficulty', 'Combate · Battle difficulty', 'How tough enemies are. The Spanish stays the same.', [
      ['facil', 'Fácil'],
      ['normal', 'Normal'],
      ['dificil', 'Difícil'],
    ]),
    seg('level', 'Español · Spanish level', 'Which words and grammar you practise, and how often you type.', [
      ['a1', 'A1'],
      ['a2', 'A2'],
      ['b1', 'B1'],
    ]),
  );
  const code = h('textarea', { id: 'save-code', readonly: true, 'aria-label': 'Save code' }) as HTMLTextAreaElement;
  const importBox = h('textarea', { id: 'import-code', placeholder: 'Paste a save code here to load it…', 'aria-label': 'Import save code' }) as HTMLTextAreaElement;
  const msg = h('div', { class: 'muted' });
  el.append(
    h('h3', null, 'Partida · Save'),
    h(
      'div',
      { class: 'row' },
      h(
        'button',
        {
          class: 'btn primary',
          onclick: () => {
            msg.textContent = save(g) ? '✓ Guardado. (Saved in this browser.)' : 'Could not save: browser storage is blocked.';
            sfx('save');
          },
        },
        '💾 Guardar',
      ),
      h(
        'button',
        {
          class: 'btn',
          onclick: async () => {
            code.value = exportSave(g);
            code.select();
            try {
              await navigator.clipboard.writeText(code.value);
              msg.textContent = 'Save code copied. Paste it on another device to continue there.';
            } catch {
              msg.textContent = 'Select the code below and copy it.';
            }
          },
        },
        '📋 Copy save code',
      ),
      h(
        'button',
        {
          class: 'btn',
          onclick: () => {
            const ng = importSave(importBox.value);
            if (!ng) {
              msg.textContent = "That code didn't work — check you pasted all of it.";
              return;
            }
            Object.assign(g, ng);
            save(g);
            close();
            game.world.load(g.map, g.x, g.y, g.dir);
            game.toast('Partida cargada · Save loaded');
          },
        },
        '📥 Load code',
      ),
      h(
        'button',
        {
          class: 'btn',
          onclick: () => {
            save(g);
            close();
            game.onQuit?.();
          },
        },
        '🏠 Título',
      ),
    ),
    msg,
    code,
    importBox,
    h('button', { class: 'btn', onclick: () => void showHelp() }, '❓ Controles · Controls'),
    h('h3', null, 'Créditos · Credits'),
    h(
      'div',
      { class: 'muted credits' },
      h('p', null, 'The Spanish in this game comes from open data, built by ', h('code', null, 'npm run data'), ` from ${meta.source.repo} (${meta.source.date.slice(0, 10)}):`),
      h(
        'ul',
        null,
        Object.entries(meta.licenses).map(([what, license]) => h('li', null, `${what} — ${license}`)),
      ),
      h('p', null, 'Every example sentence keeps its Tatoeba author credit in the game data.'),
      h('p', null, 'Recorded dialogue, made with ', h('code', null, 'npm run voices'), ':'),
      h('ul', null, VOICE_CREDITS.map(([what, license]) => h('li', null, `${what} — ${license}`))),
    ),
  );
};
