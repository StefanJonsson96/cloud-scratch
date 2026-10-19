// Shared scripts: chests, signs, beds, doors, and helpers for word puzzles.

import { script, SCRIPTS, type Script } from './script';
import { getWord, withArticle } from '../data/vocab';
import { VERB_BY_INF, conjugate, TABLE_PERSONS, TENSES, slot, type Person, type Tense } from '../data/verbs';
import { distractors, verbKey, type Challenge } from '../learn/challenges';

const SIGNS: Record<string, [string, string]> = {
  puerto: ['Puerto Alegre. Población: 52 personas y un gato.', 'Happy Harbour. Population: 52 people and one cat.'],
  estacion: ['Estación de tren. Trenes a toda España.', 'Train station. Trains to all of Spain.'],
  playa: ['Al oeste: el faro. ¡Ojo con las medusas!', 'West: the lighthouse. Watch out for the jellyfish!'],
  camino: ['Este: San Sabor, el pueblo del mercado. Oeste: Puerto Alegre.', 'East: San Sabor, the market town. West: Puerto Alegre.'],
  sansabor: ['San Sabor. ¡El mejor mercado de la costa!', 'San Sabor. The best market on the coast!'],
  bosque: ['El Bosque Susurrante. No salgas del camino.', "The Whispering Forest. Don't leave the path."],
  montana: ['Monte Eco. El templo está arriba. ¡Abrígate!', 'Mount Echo. The temple is up top. Wrap up warm!'],
  torre: ['La Torre Muda. Aquí no se habla.', 'The Mute Tower. No talking here.'],
  villamolinos: ['Villamolinos. Aquí se hace el mejor queso de La Mancha.', 'Windmill Town. The best cheese in La Mancha is made here.'],
  estacion_mancha: ['Estación de Villamolinos. Trenes a Madrid y a toda España.', 'Villamolinos station. Trains to Madrid and all of Spain.'],
  llanura: ['Norte: el cerro de los molinos. Oeste: Villamolinos.', 'North: the windmill ridge. West: Villamolinos.'],
};

script('sign', async (s) => {
  const [es, en] = SIGNS[s.args[0]] ?? ['…', '…'];
  await s.narrate(en, es);
});

script('chest', async (s) => {
  const key = `chest:${s.g.map}:${s.at?.x}:${s.at?.y}`;
  if (s.has(key)) {
    await s.narrate('The chest is empty.', 'El cofre está vacío.');
    return;
  }
  s.flag(key);
  const [item, n] = s.args;
  await s.give(item, Number(n ?? 1));
});

script('locked_door', async (s) => {
  await s.narrate('The door is locked.', 'La puerta está cerrada.');
});

script('nada', async (s) => {
  await s.say('callado', '……', '(Not a word. Only a cold silence.)');
});

script('cama', async (s) => {
  await s.inn('', 0);
});

script('muneco', async (s) => {
  // The tutorial isn't finished yet: talking to the dummy starts it.
  if (!s.has('intro_done')) return SCRIPTS.intro(s);
  const i = await s.ask(
    '',
    'El muñeco de práctica. ¿Quieres practicar?',
    "The practice dummy. Want to practise? (It never fights back. Choose 🏃 Huir to stop.)",
    [
      ['Sí, ¡vamos!', "Yes, let's go!"],
      ['No, gracias.', 'No, thanks.'],
    ],
  );
  if (i === 0) await s.battle({ enemies: ['muneco'], bg: 'casa', canFlee: true, noGameOver: true, intro: { es: '¡A practicar!', en: "Let's practise!" } });
});

script('gato', async (s) => {
  await s.narrate('The cat is asleep. Zzz… What a life!', 'El gato duerme. Zzz… ¡Qué vida!');
});

script('fuente', async (s) => {
  if (s.g.euros < 1) {
    await s.narrate('A pretty fountain. The water sparkles.', 'Una fuente bonita. El agua brilla.');
    return;
  }
  const i = await s.ask('', '¿Quieres tirar una moneda y pedir un deseo?', 'Throw in a coin (1 €) and make a wish?', [
    ['Sí.', 'Yes.'],
    ['No.', 'No.'],
  ]);
  if (i !== 0) return;
  s.g.euros -= 1;
  const wishes: [string, string][] = [
    ['Ojalá hable español muy bien.', 'I hope I speak Spanish really well.'],
    ['Ojalá la abuela vuelva a hablar.', 'I hope grandma speaks again.'],
    ['Ojalá haya churros para cenar.', "I hope there are churros for dinner."],
  ];
  const [es, en] = wishes[Math.floor(Math.random() * wishes.length)];
  await s.say('hero', es, `${en} (“Ojalá…” = “I hope…” — it takes the subjunctive!)`);
});

/** A multiple-choice "help them remember the word" puzzle built from a vocabulary entry. */
export function rememberChallenge(wordId: string, clue: string, clueEn: string, chapter: number): Challenge {
  const w = getWord(wordId);
  const ds = distractors(w, 3, Math.random, chapter);
  const options = [withArticle(w), ...ds.map(withArticle)].sort(() => Math.random() - 0.5);
  return {
    key: `w:${w.id}`,
    kind: 'choice',
    label: 'Help them remember the word',
    prompt: clue,
    promptLang: 'es',
    sub: clueEn,
    hint: `${withArticle(w)} = ${w.en}`,
    options,
    answer: options.indexOf(withArticle(w)),
    reveal: { es: withArticle(w), en: w.en },
    example: w.ex,
    difficulty: 1,
    maxBox: 3,
    isNew: false,
    fastMs: 6000,
    srs: true,
    speak: w.es.split('|')[0],
  };
}

/** A typed riddle: the answer must be written in Spanish. */
export function riddle(prompt: string, sub: string, accepted: string[], reveal: [string, string], hint: string, article?: 'el' | 'la'): Challenge {
  return {
    key: `riddle:${accepted[0]}`,
    kind: 'type',
    label: 'Riddle — write the answer in Spanish',
    prompt,
    promptLang: 'es',
    sub,
    hint,
    accepted,
    article,
    reveal: { es: reveal[0], en: reveal[1] },
    difficulty: 1,
    maxBox: 0,
    isNew: false,
    fastMs: 20000,
    srs: false,
    speak: reveal[0],
  };
}

/** Villagers touched by the Silence have lost a word. Give it back to them. */
export async function wordQuest(
  s: Script,
  who: string,
  flag: string,
  lines: { lost: [string, string]; clue: [string, string]; word: string; thanks: [string, string]; reward?: [string, number] | number; after: [string, string] },
) {
  if (s.has(flag)) {
    await s.say(who, lines.after[0], lines.after[1]);
    return;
  }
  await s.say(who, lines.lost[0], lines.lost[1]);
  const grade = await s.challenge(rememberChallenge(lines.word, lines.clue[0], lines.clue[1], s.g.chapter), 'Recuerda la palabra · Restore the word');
  if (grade === 'wrong') {
    await s.say(who, 'No… no es esa. Lo siento.', "No… that's not it. Sorry. (Try again any time.)");
    return;
  }
  s.flag(flag);
  await s.say(who, lines.thanks[0], lines.thanks[1]);
  if (typeof lines.reward === 'number') await s.gain(lines.reward);
  else if (lines.reward) await s.give(lines.reward[0], lines.reward[1]);
}

/** A verb gap in a song or sentence: "Yo ___ (cantar) en la plaza." */
export function conjChallenge(inf: string, person: Person, tense: Tense, prompt: string, sub: string): Challenge {
  const v = VERB_BY_INF.get(inf)!;
  const form = conjugate(v, person, tense);
  const others = Array.from(new Set(v.forms[tense].filter((x) => x !== form)))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [form, ...others].sort(() => Math.random() - 0.5);
  const full = prompt.replace('___', form).replace(` (${inf})`, '');
  return {
    key: verbKey(v, tense),
    kind: 'choice',
    label: `Fill in the song · ${TENSES[tense].es}`,
    prompt,
    promptLang: 'es',
    sub,
    hint: `${person} → ${TABLE_PERSONS[slot(person)]} form`,
    options,
    answer: options.indexOf(form),
    reveal: { es: full, en: sub },
    table: { title: `${inf} — ${TENSES[tense].es.toLowerCase()}`, rows: v.forms[tense].map((f, i) => [TABLE_PERSONS[i], f] as [string, string]), highlight: slot(person) },
    note: person === 'vosotros' ? 'Vosotros = “you all” (informal), used all over Spain.' : undefined,
    difficulty: 1,
    maxBox: 3,
    isNew: false,
    fastMs: 6000,
    srs: true,
    speak: full,
  };
}

/** A plain multiple-choice question with Spanish options. */
export function choiceChallenge(label: string, prompt: string, sub: string, options: string[], answer: number, reveal: [string, string], note?: string): Challenge {
  return {
    key: `quiz:${prompt}`,
    kind: 'choice',
    label,
    prompt,
    promptLang: 'es',
    sub,
    options,
    answer,
    reveal: { es: reveal[0], en: reveal[1] },
    note,
    difficulty: 1,
    maxBox: 0,
    isNew: false,
    fastMs: 8000,
    srs: false,
    speak: prompt,
  };
}
