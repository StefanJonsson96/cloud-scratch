// Chapter 4 — "El Monte Eco". A snowy climb, the silent monks and their
// gestures, the truth about El Callado, and the stone guardian.

import { script, type Script } from './script';
import { choiceChallenge } from './common';
import { getWord, genderRule } from '../data/vocab';
import type { Challenge } from '../learn/challenges';

script('ch4_start', async (s) => {
  s.flag('ch4');
  await s.chapter(
    4,
    'El Monte Eco',
    'Mount Echo',
    'This chapter: the body, the family and time words · the Spain way to talk about today: «Hoy he comido…» (pretérito perfecto) with Lola · everyday idioms: estar hecho polvo, echar una mano, ser pan comido.',
  );
  await s.say('mateo', '¡Qué frío! Tengo los pies congelados.', "It's so cold! My feet are frozen.");
  await s.say('lola', 'Hoy hemos caminado muchísimo. ¡Y todavía falta la montaña!', "Today we've walked loads. And there's still the mountain to go!");
  await s.lesson(
    'Nota de Lola: el pretérito perfecto',
    '<p>In Spain, for anything that happened <b>today, this week, this year</b> — or just now — people use <b>haber + participle</b>:</p><p><b>he, has, ha, hemos, habéis, han</b> + <b>-ado</b> (hablar → hablado) / <b>-ido</b> (comer → comido).</p><p>Watch the irregular participles: hecho (hacer), dicho (decir), visto (ver), escrito (escribir), vuelto (volver), puesto (poner), abierto (abrir).</p><p>Much of Latin America would say <i>hoy comí</i>. In Spain: <b>hoy he comido</b>.</p>',
    [
      ['Hoy hemos caminado mucho.', 'Today we have walked a lot.'],
      ['¿Habéis visto la nieve?', 'Have you all seen the snow?'],
      ['Esta mañana he hecho una tortilla.', 'This morning I made (have made) an omelette.'],
    ],
  );
});

script('alpinista', async (s) => {
  if (s.has('alpinista_ok')) {
    await s.say('Alpinista', '¡Ánimo! El templo está arriba. Ya queda poco.', 'Keep going! The temple is up top. Not much left now.');
    return;
  }
  await s.say('Alpinista', '¡Uf! He subido desde el pueblo. Estoy hecho polvo.', "Phew! I've climbed up from the village. I'm “made of dust”.");
  const g = await s.challenge(
    choiceChallenge(
      'Expresiones',
      '«Estoy hecho polvo.»',
      'What does he mean?',
      ["I'm exhausted", "I'm covered in dust", "I'm angry", "I'm hungry"],
      0,
      ['estar hecho polvo', 'to be exhausted (literally: “made into dust”)'],
      'A very common Spain idiom. A woman would say “estoy hecha polvo”.',
    ),
    'El alpinista',
  );
  s.flag('alpinista_ok');
  if (g !== 'wrong') {
    await s.say('Alpinista', '¡Exacto! Tomad, dos cafés. Yo ya no puedo más.', "Exactly! Here (you all), two coffees. I can't take any more.");
    await s.give('cafe', 2);
  } else {
    await s.say('Alpinista', 'Jaja, no: significa que estoy muy, muy cansado.', "Haha, no: it means I'm very, very tired.");
  }
});

// ------------------------------------------------------------- the temple
script('tomas', async (s) => {
  if (s.has('voz')) {
    await s.say('monje', 'La puerta de la torre está abierta. Bruno os espera arriba.', 'The tower door is open. Bruno is waiting for you (all) at the top.');
    await s.inn('monje', 0);
    return;
  }
  if (s.has('tomas_story')) {
    await s.say('monje', 'Escuchad los gestos de mis hermanos. Ellos os abrirán la puerta.', "Listen (you all) to my brothers' gestures. They will open the door for you.");
    await s.inn('monje', 0);
    return;
  }
  s.flag('tomas_story');
  await s.say('monje', 'Bienvenidos. Soy el hermano Tomás. Hoy habéis subido la montaña. ¡Qué valientes!', "Welcome. I'm Brother Tomás. Today you have climbed the mountain. How brave!");
  await s.say('monje', 'Yo hablo poco. Mis hermanos no hablan nada. Hacen voto de silencio.', "I speak little. My brothers don't speak at all. They take a vow of silence.");
  await s.say('mateo', '¿Sabe algo del Callado?', 'Do you know anything about El Callado? (“¿Sabe?” — Mateo uses usted, the polite form, with the old monk.)');
  await s.say('monje', 'Hace muchos años, un joven Palabrista vino a este templo. Se llamaba Bruno.', 'Many years ago, a young Palabrista came to this temple. His name was Bruno.');
  await s.say('monje', 'Era el hermano pequeño de Rosa.', "He was Rosa's little brother.");
  await s.say('mateo', '¿¡El hermano de tu abuela!?', "Your grandma's brother?!");
  await s.say('monje', 'Una noche hubo una tormenta terrible. Rosa cayó al mar.', 'One night there was a terrible storm. Rosa fell into the sea.');
  await s.say('monje', 'Bruno gritó una palabra de poder para salvarla… y nunca más pudo hablar.', 'Bruno shouted a word of power to save her… and he could never speak again.');
  await s.say('lola', 'Qué triste…', 'How sad…');
  await s.say('monje', 'Vino aquí para aprender el silencio. Pero el silencio no le dio paz. Le dio rabia.', "He came here to learn silence. But silence didn't give him peace. It gave him rage.");
  await s.say('monje', 'Un día se llevó las Palabras Antiguas y se fue a la torre. Desde entonces, lo llaman El Callado.', 'One day he took the Ancient Words and went to the tower. Since then, they call him The Silent One.');
  await s.narrate('Notice the story tenses: one-off events use the indefinido (vino, hubo, gritó, se fue); descriptions use the imperfecto (se llamaba, era).');
  await s.say('monje', 'Ahora el Gólem del templo le obedece. Bloquea la puerta de la torre.', 'Now the temple Golem obeys him. It blocks the door to the tower.');
  await s.say('monje', 'Mis hermanos no hablan… pero quieren ayudaros. Escuchad sus gestos.', "My brothers don't speak… but they want to help you (all). Listen to their gestures.");
  s.setRest('templo', 11, 12);
  await s.inn('monje', 0);
});

function gesture(word: string, emoji: string, mime: string): Challenge {
  const w = getWord(word);
  return {
    key: `w:${w.id}`,
    kind: 'type',
    label: 'The monk mimes a word — write it in Spanish',
    prompt: emoji,
    promptLang: 'es',
    sub: mime,
    hint: `${w.article} ${w.bare[0]}${' _'.repeat(w.bare.length - 1)}`,
    accepted: w.forms,
    article: w.article,
    reveal: { es: `${w.article} ${w.bare}`, en: w.en },
    example: w.ex,
    note: genderRule(w),
    difficulty: 1,
    maxBox: 5,
    isNew: false,
    fastMs: 15000,
    srs: true,
    speak: `${w.article} ${w.bare}`,
  };
}

async function monk(s: Script, flag: string, ch: Challenge) {
  if (s.has(flag)) {
    await s.narrate('The monk smiles and bows. He has nothing more to say — he never does.');
    return;
  }
  await s.narrate('The monk says nothing. He points, very seriously, at…');
  const g = await s.challenge(ch, 'El monje · Charades');
  if (g === 'wrong') {
    await s.narrate('The monk shakes his head slowly. Try again.');
    return;
  }
  s.flag(flag);
  s.refresh();
  await s.narrate('The monk nods and rings a little bell. Ding!');
  const n = ['monje_mano', 'monje_oreja', 'monje_corazon'].filter((k) => s.has(k)).length;
  if (n >= 3) await s.narrate('With the third bell, the inner gate swings open.', 'La puerta interior se abre.');
}

script('monje_mano', (s) => monk(s, 'monje_mano', gesture('mano', '✋', 'He holds up his palm and wiggles his fingers. (Careful with the article!)')));
script('monje_oreja', (s) => monk(s, 'monje_oreja', gesture('oreja', '👂', 'He cups a hand behind his ear, listening.')));
script('monje_corazon', (s) => monk(s, 'monje_corazon', gesture('corazon', '❤️', 'He places both hands on his chest. Thump-thump.')));

script('gate_templo', async (s) => {
  await s.narrate('A heavy gate. Three little bells hang above it, silent.', 'Una puerta pesada con tres campanas.');
  await s.say('lola', 'Quizás los monjes pueden ayudarnos…', 'Maybe the monks can help us…');
});

script('estante_templo', async (s) => {
  await s.narrate('Old books. One is open at a page: “A buen entendedor, pocas palabras bastan.”', 'Libros viejos.');
});

script('boss_golem', async (s) => {
  if (s.has('golem')) return;
  await s.narrate('The stone guardian’s eyes light up. It steps in front of the tower door.');
  await s.say('mateo', '¡Es enorme! ¡Ese gólem es pan comido! …Bueno, quizás no.', "It's huge! That golem is a piece of cake! …Well, maybe not.");
  await s.narrate('“Ser pan comido” = to be a piece of cake (literally “to be eaten bread”).');
  const out = await s.battle({
    enemies: ['golem'],
    bg: 'templo',
    music: 'boss',
    canFlee: false,
    tips: [
      {
        at: 'enemy',
        text: 'When the Gólem <b>«está cargando energía… el suelo tiembla»</b> ⚠️ it will shake the earth and hit <b>everyone</b>. Defend, use Escudo, or interrupt it — Mateo’s <b>Ancla</b> and the hero’s <b>Viento</b> break its concentration. Water and lightning crack stone.',
      },
    ],
  });
  if (out !== 'win') return;
  s.flag('golem');
  s.refresh();
  await s.narrate('The golem crumbles into a pile of quiet stones. Behind it, a crystal glows.');
});

script('cristal_voz', async (s) => {
  s.flag('voz');
  s.heal();
  s.refresh();
  await s.narrate('You touch the crystal. A single word rises from it, warm as breath: VOZ.', 'Tocas el cristal: VOZ.');
  await s.narrate('All the bells of the temple ring at once. The monks smile — they still choose silence, but now it is their choice.');
  await s.say('monje', 'Gracias. La puerta de la torre está abierta. Bruno os espera.', 'Thank you. The tower door is open. Bruno is waiting for you (all).');
  await s.say('monje', 'Una cosa más: Bruno no es malo. Está solo. Recordadlo.', "One more thing: Bruno isn't evil. He's alone. Remember that (you all).");
  s.save();
});

script('block_templo', async (s) => {
  await s.narrate('The golem blocks the door to the tower.');
});
