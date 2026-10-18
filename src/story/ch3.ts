// Chapter 3 — "El Bosque Susurrante". Bring the colours back to three magic
// flowers, then face (and calm) the grey she-wolf.

import { script, type Script } from './script';
import { choiceChallenge } from './common';

script('ch3_start', async (s) => {
  s.flag('ch3');
  await s.chapter(
    3,
    'El Bosque Susurrante',
    'The Whispering Forest',
    'This chapter: animals and colours · adjectives that agree (el lobo negro, la loba negra, las flores rojas) · POR vs PARA with Mateo · irregular verbs with Lola: ser, estar, tener, ir, hacer…',
  );
  await s.say('lola', '¡Qué bosque tan oscuro! ¿Dónde están los colores?', 'What a dark forest! Where are the colours?');
  await s.say('mateo', 'Shh… ¿Oís eso? Los árboles susurran.', 'Shh… Do you (all) hear that? The trees are whispering.');
  await s.narrate('The trees whisper: “…sin color… sin color…” (without colour… without colour…)');
});

async function flower(s: Script, flag: string, clue: [string, string], answer: string, options: string[], note: string, done: [string, string]) {
  if (s.has(flag)) {
    await s.narrate(done[1], done[0]);
    return;
  }
  await s.narrate('A grey flower. It whispers:', 'Una flor gris. Susurra:');
  await s.say('voz', `¿De qué color soy? ${clue[0]}`, `What colour am I? ${clue[1]}`);
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const g = await s.challenge(
    choiceChallenge('Colores · agreement', 'Soy una flor ___.', `I am a ___ flower. (${clue[1]})`, shuffled, shuffled.indexOf(answer), [`una flor ${answer}`, `a ${done[1].split(' ')[1]} flower`], note),
    'La flor gris',
  );
  if (g === 'wrong') {
    await s.say('lola', 'Mmm… “flor” es femenina. ¿Y es una o son muchas?', 'Hmm… “flor” is feminine. And is it one, or many?');
    return;
  }
  s.flag(flag);
  s.refresh();
  await s.narrate('The flower bursts into colour!', '¡La flor recupera su color!');
  const n = ['flor_roja', 'flor_azul', 'flor_amarilla'].filter((k) => s.has(k)).length;
  if (n >= 3) {
    await s.narrate('To the north, the wall of thorns rustles… and pulls back.', 'Al norte, las espinas se abren.');
    await s.say('mateo', '¡El camino del norte está abierto!', 'The north path is open!');
  } else {
    await s.say('lola', `¡Muy bien! Quedan ${n === 1 ? 'dos flores' : 'una flor'}.`, `Very good! ${n === 1 ? 'Two flowers' : 'One flower'} left.`);
  }
}

script('flor_roja', (s) =>
  flower(
    s,
    'flor_roja',
    ['Soy del color de las fresas y de los tomates.', "I'm the colour of strawberries and tomatoes."],
    'roja',
    ['roja', 'rojo', 'rojas', 'rojos'],
    '“Flor” is feminine and singular, so the adjective is too: una flor roja. (el tomate rojo · las fresas rojas)',
    ['Una flor roja. Huele muy bien.', 'A red flower. It smells lovely.'],
  ),
);

script('flor_azul', (s) =>
  flower(
    s,
    'flor_azul',
    ['Soy del color del cielo y del mar.', "I'm the colour of the sky and the sea."],
    'azul',
    ['azul', 'azula', 'azules', 'azulo'],
    'Colours ending in -e or a consonant (azul, verde, gris) don’t change for gender: el cielo azul, la flor azul. Only the plural changes: azules.',
    ['Una flor azul. Brilla como el mar.', 'A blue flower. It shines like the sea.'],
  ),
);

script('flor_amarilla', (s) =>
  flower(
    s,
    'flor_amarilla',
    ['Soy del color del sol y de los limones.', "I'm the colour of the sun and of lemons."],
    'amarilla',
    ['amarilla', 'amarillo', 'amarillas', 'amarillos'],
    '-o adjectives change to -a for feminine nouns: el limón amarillo → la flor amarilla.',
    ['Una flor amarilla. Parece un pequeño sol.', 'A yellow flower. It looks like a little sun.'],
  ),
);

script('thorns', async (s) => {
  await s.narrate('A wall of grey thorns blocks the path north. They whisper: “three flowers… three colours…”', 'Espinas grises. Susurran: «tres flores… tres colores…»');
  await s.say('lola', 'Quizás las flores grises del bosque…', 'Maybe the grey flowers in the forest…');
});

script('lenador', async (s) => {
  await s.say('Leñador', 'Hola, jóvenes. Soy leñador. Vivo aquí desde hace treinta años.', "Hello, young people. I'm a woodcutter. I've lived here for thirty years.");
  await s.narrate('“Desde hace” + time = for (and still going): vivo aquí desde hace treinta años — I have lived here for thirty years.');
  if (!s.has('lenador_info')) {
    s.flag('lenador_info');
    await s.say('Leñador', 'La loba gris era la guardiana del bosque. Pero el Silencio se llevó a sus lobeznos.', 'The grey she-wolf was the guardian of the forest. But the Silence took her cubs.');
    await s.say('Leñador', 'Ahora está triste… y muy enfadada. No es mala, ¿eh?', "Now she's sad… and very angry. She isn't bad, you know?");
    const g = await s.challenge(
      choiceChallenge(
        '¿Por o para?',
        'Corto esta leña ___ el invierno.',
        'I’m cutting this firewood for the winter.',
        ['para', 'por'],
        0,
        ['Corto esta leña para el invierno.', 'I’m cutting this firewood for the winter.'],
        'PARA = goal, purpose, deadline: para el invierno (for the winter, so it is ready then).',
      ),
      'El leñador',
    );
    if (g !== 'wrong') {
      await s.say('Leñador', '¡Eso es! Tomad, una cosa para el camino.', "That's it! Here (you all), something for the road.");
      await s.give('pluma');
    }
  }
  await s.inn('Leñador', 0);
});

script('boss_loba', async (s) => {
  if (s.has('loba')) return;
  await s.narrate('In the middle of the glade stands a huge grey she-wolf. She growls — but no sound comes out. Her eyes are sad.');
  await s.say('lola', 'No es mala. Está triste.', "She isn't bad. She's sad.");
  await s.say('mateo', '¿Y ahora qué hacemos?', 'So what do we do now?');
  const approach = await s.ask('hero', '', '(What do you do?)', [
    ['Hablar con ella con calma.', 'Talk to her calmly.'],
    ['¡Atacar primero!', 'Attack first!'],
  ]);
  let start: Parameters<Script['battle']>[0]['start'];
  if (approach === 0) {
    const i = await s.ask('hero', '', '(What do you say to the wolf?)', [
      ['Tranquila. No queremos hacerte daño.', "Easy. We don't want to hurt you."],
      ['¡Eres muy fea!', "You're very ugly!"],
      ['¿Tienes hambre?', 'Are you hungry?'],
    ]);
    if (i === 0) {
      await s.narrate('The wolf hesitates. Her ears drop. The Silence still holds her — but she won’t fight at full strength. (She starts WEAKENED.)');
      start = { enemies: [['debil', 4]] };
    } else {
      if (i === 2) await s.say('mateo', '¡No le preguntes eso!', "Don't ask her that!");
      else await s.say('lola', '¡Pero qué dices!', 'What are you saying?!');
      await s.narrate("Her fur bristles. Bad idea! (She starts STRONG.)");
      start = { enemies: [['fuerte', 3]] };
    }
  } else {
    await s.narrate('You strike first! (Your party starts FAST.)');
    start = { party: [['rapido', 2]] };
  }
  const out = await s.battle({
    enemies: ['loba'],
    bg: 'bosque',
    music: 'boss',
    canFlee: false,
    start,
    tips: [
      {
        at: 'enemy',
        text: 'When she <b>«se agacha… se prepara para saltar»</b> ⚠️ she is about to pounce on one of you. Read <b>who</b> — then Proteger, Defend or sing her to sleep. Fire and light hurt her most.',
      },
    ],
  });
  if (out !== 'win') return;
  s.flag('loba');
  s.refresh();
  await s.narrate('The she-wolf lies down, exhausted. The grey starts to fade from her fur… and two little cubs tumble out of the bushes!');
  await s.say('lola', '¡Mirad! ¡Sus lobeznos!', 'Look (you all)! Her cubs!');
  await s.say('mateo', 'Ay… qué bonitos.', 'Aww… how cute.');
});

script('cristal_color', async (s) => {
  s.flag('color');
  s.heal();
  s.refresh();
  await s.narrate('You touch the crystal. COLOR! Every colour comes back at once: green, gold, red, blue.', 'Tocas el cristal. ¡COLOR!');
  await s.narrate('The she-wolf throws back her head and howls at the moon. This time, there is sound.', '¡Auuuuu!');
  await s.narrate('She drops something at your feet.');
  await s.give('corazon');
  await s.say('lola', 'El Callado está en la Torre Muda, detrás de la montaña.', 'El Callado is in the Mute Tower, beyond the mountain.');
  await s.say('lola', 'En el Monte Eco hay un templo. Dicen que los monjes saben muchas cosas.', 'On Mount Echo there is a temple. They say the monks know many things.');
  await s.say('mateo', '¿Monjes? ¿Esos que no hablan nunca? ¡Qué divertido!', "Monks? The ones who never talk? What fun!");
  s.save();
});

script('loba_calma', async (s) => {
  await s.narrate('The she-wolf nuzzles your hand. Her cubs play around her.', 'La loba está tranquila. Sus lobeznos juegan.');
});

script('lobezno', async (s) => {
  await s.narrate('The cub yips happily and wags its tail.', '¡Auu! ¡Auu!');
});

script('block_claro', async (s) => {
  await s.narrate('The path north is still grey and silent.', 'El camino está gris y en silencio.');
});
