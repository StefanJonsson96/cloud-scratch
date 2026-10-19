// Chapter 6 — "Los gigantes de La Mancha". Nobody in Villamolinos dreams any
// more, the windmills have stopped, and old Don Alonso swears they are giants.
// This time he's right. Telling stories: the imperfecto sets the scene, the
// indefinido tells what happened.

import { script, type Script } from './script';
import { choiceChallenge, riddle, wordQuest } from './common';
import { tokenize } from '../data/text';
import type { Challenge } from '../learn/challenges';

script('ch6_start', async (s) => {
  s.flag('ch6');
  await s.chapter(
    6,
    'Los gigantes de La Mancha',
    'The Giants of La Mancha',
    'This chapter: telling a story — the imperfecto paints the scene (era de noche, yo dormía), the indefinido tells what happened (oí un ruido, vi a la dama) · «Érase una vez…» · La Mancha words: molino, trigo, oveja, sueño.',
  );
  await s.narrate('The village is grey and quiet. On the hills, the windmills stand perfectly still.');
  await s.say('sancha', '¡Eh, vosotros! ¿Sois los Palabristas? ¡Por fin!', 'Hey, you lot! Are you the Palabristas? At last!');
  await s.say('sancha', 'Me llamo Sancha. Desde hace una semana, nadie sueña en Villamolinos.', "My name's Sancha. For a week now, nobody in Villamolinos has dreamt.");
  await s.say('sancha', 'La gente duerme, pero se levanta cansada y triste. Y los molinos ya no giran.', 'People sleep, but they get up tired and sad. And the windmills have stopped turning.');
  await s.say('bruno', 'La Dama Gris ha estado aquí. Lo noto en el aire.', 'The Grey Lady has been here. I can feel it in the air.');
  await s.say('sancha', 'Y mi tío, Don Alonso, dice que los molinos son… gigantes.', 'And my uncle, Don Alonso, says the windmills are… giants.');
  await s.say('mateo', '¿Gigantes? Tu tío está como una cabra.', 'Giants? Your uncle is “like a goat” — nuts.');
  await s.say('lola', '¡Mateo!', 'Mateo!');
  await s.say('sancha', 'Ja, ja. Eso dice todo el pueblo. Hablad con él: está en la plaza, delante de su casa.', "Ha ha. That's what the whole village says. Talk to him (you all): he's in the square, in front of his house.");
  await s.narrate('“Estar como una cabra” — to be crazy (literally “to be like a goat”). Affectionate, not rude.');
});

script('sancha', async (s) => {
  if (s.has('mancha_reward')) {
    await s.say('sancha', 'Mi tío está escribiendo su historia. ¡Dice que yo salgo en el capítulo dos!', "My uncle is writing his story. He says I'm in chapter two!");
    return;
  }
  if (s.has('gigante')) {
    await s.say('sancha', '¡Tenía razón! ¡Mi tío tenía razón! Eran gigantes…', 'He was right! My uncle was right! They were giants…');
    return;
  }
  if (s.has('alonso_met')) {
    await s.say('sancha', 'Mi tío dice que soy su escudera. Yo digo que soy su sobrina… y que alguien tiene que cuidarlo.', "My uncle says I'm his squire. I say I'm his niece… and somebody has to look after him.");
    return;
  }
  await s.say('sancha', 'Mi tío está allí, delante de la casa grande. Habla mucho… ¡pero escuchadlo!', "My uncle is over there, in front of the big house. He talks a lot… but listen to him (you all)!");
});

// ------------------------------------------------------------- Don Alonso
function storyGap(prompt: string, sub: string, options: string[], answer: string, note: string): Challenge {
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return choiceChallenge('Help Don Alonso tell his story', prompt, sub, shuffled, shuffled.indexOf(answer), [prompt.replace('___', answer), sub], note);
}

script('alonso', async (s) => {
  if (s.has('mancha_reward')) {
    await s.say('alonso', 'En un lugar de La Mancha, de cuyo nombre no quiero acordarme… ¡Ah, qué buen principio!', "Somewhere in La Mancha, whose name I'd rather not remember… Ah, what a good beginning!");
    await s.narrate('That is the famous first line of Don Quijote (1605) — every Spanish child knows it.');
    return;
  }
  if (s.has('gigante')) return alonsoReward(s);
  if (s.has('alonso_met')) {
    await s.say('alonso', '¡Al cerro, nobles amigos! Está al norte de la llanura. ¡Allí esperan los gigantes!', 'To the ridge, noble friends! It’s north of the plain. The giants await there!');
    return;
  }
  await s.say('alonso', '¡Bienvenidos, nobles caballeros! Soy Don Alonso, caballero andante.', 'Welcome, noble knights! I am Don Alonso, knight errant.');
  await s.say('alonso', 'Escuchad mi historia. Hace una semana, era de noche y yo dormía.', 'Listen (you all) to my story. A week ago, it was night-time and I was sleeping.');
  await s.say('alonso', 'De repente, oí un ruido. Me levanté, miré por la ventana… y vi a una dama gris sobre el cerro.', 'Suddenly, I heard a noise. I got up, looked out of the window… and saw a grey lady on the ridge.');
  await s.say('alonso', 'Llevaba un libro enorme. Lo abrió… y los molinos se movieron. ¡Se convirtieron en gigantes!', 'She was carrying an enormous book. She opened it… and the windmills moved. They turned into giants!');
  await s.say('bruno', 'El Libro del Olvido. Es ella.', 'The Book of Forgetting. It’s her.');
  await s.say('alonso', 'Y desde aquella noche, nadie sueña. Los gigantes se comen los sueños del pueblo.', 'And since that night, nobody dreams. The giants eat the village’s dreams.');
  await s.lesson(
    'Nota de Bruno: contar una historia',
    '<p>Every good story uses <b>both</b> past tenses:</p><p>The <b>imperfecto</b> paints the scene — what was going on, what things were like: <i>era de noche, yo dormía, la dama llevaba un libro</i>.</p><p>The <b>indefinido</b> moves the story forward — what happened, one event after another: <i>oí un ruido, me levanté, vi a una dama</i>.</p><p>A handy test: if you could put “was …-ing” or “used to” in English, it’s probably imperfecto.</p>',
    [
      ['Era de noche y yo dormía.', 'It was night and I was sleeping. (the scene)'],
      ['De repente, oí un ruido.', 'Suddenly, I heard a noise. (what happened)'],
      ['Mientras miraba, los molinos se movieron.', 'While I was watching, the windmills moved.'],
    ],
  );
  s.flag('alonso_met');
  s.refresh();
  const g = await s.challenge(
    storyGap(
      'Yo ___ (dormir) tranquilamente cuando oí el ruido.',
      'I was sleeping peacefully when I heard the noise.',
      ['dormía', 'dormí', 'duermo', 'he dormido'],
      'dormía',
      'He was in the middle of sleeping (the scene) when something happened (the event): dormía … oí.',
    ),
    'La historia de Don Alonso',
  );
  if (g !== 'wrong') {
    await s.say('alonso', '¡Exacto! Tenéis alma de juglares. Tomad, para el camino.', 'Exactly! You (all) have the souls of minstrels. Here, for the road.');
    await s.give('pisto', 1);
  } else {
    await s.say('alonso', 'No, no: yo estaba durmiendo cuando pasó. «Dormía». ¡La escena!', 'No, no: I was sleeping when it happened. “Dormía”. The scene!');
  }
  await s.say('sancha', 'Tío, son molinos…', 'Uncle, they’re windmills…');
  await s.say('alonso', '¡Que no, Sancha! ¡Son gigantes! Están en el cerro, al norte de la llanura.', "They are not, Sancha! They're giants! They're on the ridge, north of the plain.");
  await s.say('lola', 'A lo mejor tiene razón. Esta vez, a lo mejor sí.', 'Maybe he’s right. This time, maybe he is.');
  await s.narrate('“A lo mejor” = maybe, perhaps. Very common in Spain, and it takes the normal indicative: a lo mejor tiene razón.');
});

async function alonsoReward(s: Script) {
  await s.say('alonso', '¡Lo sabía! ¡Gigantes! ¡Y vosotros los vencisteis!', 'I knew it! Giants! And you (all) defeated them!');
  await s.say('hero', 'Sí. Y los sueños han vuelto al pueblo.', 'Yes. And the dreams have come back to the village.');
  await s.say('alonso', 'Anoche soñé con un caballo blanco y una dama hermosa. ¡Qué sueño tan bonito!', 'Last night I dreamt of a white horse and a beautiful lady. What a lovely dream!');
  await s.say('alonso', 'Tomad mi tesoro: el Yelmo de Mambrino. Es de oro puro.', 'Take (you all) my treasure: the Helmet of Mambrino. It is pure gold.');
  await s.say('sancha', 'Es una bacía de barbero, tío.', "It's a barber's basin, uncle.");
  await s.say('alonso', '¡Es un yelmo!', 'It is a helmet!');
  await s.give('yelmo');
  s.flag('mancha_reward');
  await s.say('alonso', 'Y ahora… ¡voy a escribir mi historia! «Érase una vez, en un lugar de La Mancha…»', "And now… I'm going to write my story! “Once upon a time, somewhere in La Mancha…”");
  await s.say('bruno', 'Una Palabra Madre salvada. Quedan cuatro.', 'One Mother Word saved. Four to go.');
  await s.say('mateo', '¿Y la próxima parada?', 'And the next stop?');
  await s.say('bruno', 'Valencia. Allí empiezan las Fallas… pero dicen que el fuego no quiere arder.', "Valencia. The Fallas are starting there… but they say the fire won't burn.");
  await s.say('lola', '¡Una fiesta sin fuego! Eso no puede ser. ¡Al tren!', "A festival without fire! That can't be. To the train!");
  s.save();
}

script('casa_alonso', async (s) => {
  await s.narrate('Don Alonso’s house. Through the window: books about knights, hundreds of them, piled to the ceiling.', 'La casa de Don Alonso. Libros de caballeros por todas partes.');
});

script('block_llanura', async (s) => {
  await s.say('sancha', '¡Esperad! Primero hablad con mi tío. Él sabe dónde están los «gigantes».', 'Wait (you all)! Talk to my uncle first. He knows where the “giants” are.');
});

// ------------------------------------------------------------- the village
script('quesera', async (s) => {
  if (!s.has('quesera_quiz')) {
    await s.say('quesera', '¡Queso manchego, el mejor queso del mundo!', 'Manchego cheese, the best cheese in the world!');
    const ok = await s.quiz('quesera', 'A ver, ¿de qué animal es la leche del queso manchego?', "Let's see: which animal's milk is Manchego cheese made from?", [
      ['De vaca.', 'Cow.'],
      ['De oveja.', 'Sheep.'],
      ['De cabra.', 'Goat.'],
    ], 1);
    s.flag('quesera_quiz');
    if (ok) {
      await s.say('quesera', '¡Muy bien! De oveja manchega. Toma, uno de regalo.', 'Very good! From Manchega sheep. Here, one on the house.');
      await s.give('queso_manchego', 1);
    } else {
      await s.say('quesera', 'No, no: ¡de oveja! Las ovejas de la llanura.', 'No, no: sheep! The sheep from the plain.');
    }
  }
  await s.shop('quesera', ['empanada', 'queso_manchego', 'pisto', 'horchata', 'te', 'cafe', 'pluma']);
});

script('posadero', async (s) => {
  if (!s.has('posadero_met')) {
    s.flag('posadero_met');
    await s.say('posadero', 'Bienvenidos a la venta. Don Alonso dice que es un castillo, ¡ja, ja!', 'Welcome to the inn. Don Alonso says it’s a castle, ha ha!');
    await s.narrate('In Don Quijote, the knight mistakes a roadside inn (una venta) for a castle — and the innkeeper for its lord.');
  }
  await s.inn('posadero', 30);
});

script('posada_mancha', async (s) => {
  await s.narrate('The inn. The innkeeper is standing outside the door.', 'La venta.');
});

script('molinero', async (s) => {
  await wordQuest(s, 'molinero', 'molinero_word', {
    lost: ['Mi molino muele… muele… ¿cómo se llama? ¡No me acuerdo!', "My mill grinds… grinds… what's it called? I can't remember!"],
    clue: ['Es amarillo, crece en la llanura y con él se hace la harina y el pan.', "It's yellow, it grows on the plain, and flour and bread are made from it."],
    word: 'trigo',
    thanks: ['¡El trigo! ¡Claro! Muelo el trigo y hago harina. Toma, por tu ayuda.', 'Wheat! Of course! I grind the wheat and make flour. Here, for your help.'],
    reward: 120,
    after: ['Sin viento, mi molino no muele el trigo. Pero por lo menos recuerdo la palabra.', "Without wind, my mill can't grind the wheat. But at least I remember the word."],
  });
});

script('molino', async (s) => {
  if (s.has('mancha_done')) await s.narrate('The windmill’s sails turn happily in the wind. Creak… creak…', 'Las aspas giran con el viento.');
  else await s.narrate('A windmill. Its sails are grey and still. Not a breath of wind.', 'Un molino. Las aspas no se mueven.');
});

script('pablito', async (s) => {
  if (s.has('cuento_ok')) {
    await s.say('pablito', '¡Esta noche voy a soñar con caballeros! ¿Me cuentas otro mañana?', "Tonight I'm going to dream about knights! Will you tell me another one tomorrow?");
    return;
  }
  await s.say('pablito', '¿Me cuentas un cuento? Mi abuelo ya no se acuerda de ninguno.', "Will you tell me a story? My grandad can't remember any any more.");
  await s.say('lola', 'Los cuentos en español empiezan siempre igual. ¿Lo sabes?', 'Stories in Spanish always begin the same way. Do you know it?');
  const tokens = tokenize('Érase una vez un caballero.');
  const ch: Challenge = {
    key: 'cuento:erase',
    kind: 'order',
    label: 'Start the bedtime story',
    prompt: 'Once upon a time there was a knight.',
    promptLang: 'en',
    hint: '“Once upon a time” = «Érase una vez»',
    tiles: [...tokens, 'había', 'la'].sort(() => Math.random() - 0.5),
    solutions: [tokens],
    reveal: { es: 'Érase una vez un caballero.', en: 'Once upon a time there was a knight.' },
    note: '«Érase» is an old form of «era» (“there was”) — today you only hear it at the start of fairy tales.',
    difficulty: 1,
    maxBox: 0,
    isNew: false,
    fastMs: 25000,
    srs: false,
    speak: 'Érase una vez un caballero.',
  };
  const g = await s.challenge(ch, 'El cuento de Pablito');
  if (g === 'wrong') {
    await s.say('pablito', 'Así no empiezan los cuentos… ¡Otra vez!', "That's not how stories start… Again!");
    return;
  }
  s.flag('cuento_ok');
  s.refresh();
  await s.say('hero', 'Érase una vez un caballero que vivía en La Mancha. Tenía un caballo muy flaco…', 'Once upon a time there was a knight who lived in La Mancha. He had a very skinny horse…');
  await s.narrate('Pablito’s eyes close. His face isn’t grey any more.');
  await s.say('pablito', 'Zzz… Gracias…', 'Zzz… Thank you…');
  await s.give('pluma', 1);
});

// ------------------------------------------------------------- lost sheep
script('pastora', async (s) => {
  if (s.has('ovejas_ok')) {
    await s.say('pastora', 'Mis ovejas están en casa. Esta noche las cuento… ¡y a dormir!', "My sheep are home. Tonight I'll count them… and off to sleep!");
    return;
  }
  const found = ['oveja1', 'oveja2', 'oveja3'].filter((k) => s.has(k)).length;
  if (found === 3) {
    s.flag('ovejas_ok');
    s.refresh();
    await s.say('pastora', 'Una, dos, tres… ¡Están todas! ¡Muchísimas gracias!', "One, two, three… They're all here! Thank you so much!");
    await s.say('pastora', 'Ya sabes: si no puedes dormir, cuenta ovejas.', "You know what they say: if you can't sleep, count sheep.");
    await s.give('queso_manchego', 2);
    return;
  }
  if (s.has('ovejas_quest')) {
    if (found === 0) await s.say('pastora', 'Están en la llanura, al este del pueblo. ¡Hablad con ellas con cariño!', "They're on the plain, east of the village. Talk to them kindly (you all)!");
    else if (found === 1) await s.say('pastora', '¡Una ya está en casa! Faltan dos.', "One's home already! Two to go.");
    else await s.say('pastora', '¡Dos en casa! Solo falta una.', 'Two home! Just one to go.');
    return;
  }
  await s.say('pastora', '¡Ay, mis ovejas! Se han perdido tres en la llanura.', 'Oh, my sheep! Three of them have got lost on the plain.');
  await s.say('pastora', 'Sin sueños, se han olvidado del camino a casa. ¿Me ayudáis?', "Without dreams, they've forgotten the way home. Will you (all) help me?");
  s.flag('ovejas_quest');
  s.refresh();
  await s.narrate('Side quest: find the three lost sheep on the plain (east of the village). Talk to them kindly!');
});

const SHEEP: Record<string, { scene: [string, string]; options: [string, string][]; right: number; ok: string }> = {
  '1': {
    scene: ['Una oveja perdida.', 'A lost sheep looks at you, confused. Baa?'],
    options: [
      ['¡Ven aquí, bonita!', 'Come here, pretty one!'],
      ['¡Vete de aquí!', 'Go away!'],
      ['¡Qué fea eres!', 'You’re so ugly!'],
    ],
    right: 0,
    ok: '“¡Ven!” is the tú command of venir (irregular). The sheep trots off towards the village.',
  },
  '2': {
    scene: ['La oveja duerme.', 'This sheep has fallen asleep in the wheat. Zzz…'],
    options: [
      ['¡Que aproveche!', 'Enjoy your meal!'],
      ['¡Despierta, dormilona!', 'Wake up, sleepyhead!'],
      ['¡Buenas noches!', 'Good night!'],
    ],
    right: 1,
    ok: '“Dormilón / dormilona” = sleepyhead. The sheep yawns and wanders home.',
  },
  '3': {
    scene: ['La oveja tiembla de miedo.', 'The last sheep is trembling. Something grey is hiding in the wheat beside it…'],
    options: [
      ['Tranquila, no pasa nada.', "Easy now, it's all right."],
      ['¡Corre, corre!', 'Run, run!'],
      ['¡Tengo hambre!', "I'm hungry!"],
    ],
    right: 0,
    ok: '“Tranquilo / tranquila” — calm down, easy. The sheep stops shaking and heads home.',
  },
};

script('oveja', async (s) => {
  const n = s.args[0];
  const sh = SHEEP[n];
  await s.narrate(sh.scene[1], sh.scene[0]);
  if (n === '3' && !s.has('oveja3_fight')) {
    await s.narrate('An Eraser leaps out of the wheat!', '¡Un borrador!');
    const out = await s.battle({ enemies: ['borrador', 'polvo'], bg: 'mancha', canFlee: false });
    if (out !== 'win') return;
    s.flag('oveja3_fight');
  }
  const i = await s.ask('', '¿Qué le dices a la oveja?', 'What do you say to the sheep?', sh.options);
  if (i !== sh.right) {
    await s.narrate('The sheep backs away. Baa! Maybe try something kinder.', 'La oveja no quiere venir.');
    return;
  }
  s.flag(`oveja${n}`);
  s.refresh();
  await s.narrate(sh.ok);
});

script('pastor', async (s) => {
  if (s.has('pastor_ok')) {
    await s.say('pastor', 'Cuidado en el cerro. Esa luz gris no me gusta nada.', "Careful on the ridge. I don't like that grey light one bit.");
    return;
  }
  await s.say('pastor', 'Llevo cuarenta años en esta llanura. De vez en cuando, por la noche, veo una luz gris en el cerro.', "I've spent forty years on this plain. From time to time, at night, I see a grey light on the ridge.");
  const ok = await s.quiz('pastor', '¿Qué significa «de vez en cuando»?', 'What does «de vez en cuando» mean?', [
    ['', 'Every night'],
    ['', 'From time to time'],
    ['', 'Never'],
  ], 1);
  s.flag('pastor_ok');
  if (ok) {
    await s.say('pastor', 'Eso es. Ni siempre ni nunca: de vez en cuando. Toma, para el camino.', "That's it. Not always, not never: from time to time. Here, for the road.");
    await s.gain(60);
  } else {
    await s.say('pastor', 'No: «de vez en cuando» es a veces, no siempre.', "No: «de vez en cuando» means sometimes, not always.");
  }
});

// ------------------------------------------------------------- the ridge
script('gate_cerro', async (s) => {
  await s.narrate('An old wooden gate across the path. Words are carved into it:', 'Una puerta de madera con un acertijo.');
  const g = await s.challenge(
    riddle(
      'Tengo cuatro brazos, pero no tengo manos. Giro con el viento y muelo el trigo. ¿Qué soy?',
      "I have four arms but no hands. I turn with the wind and grind the wheat. What am I?",
      ['molino'],
      ['el molino', 'the windmill'],
      'm _ _ _ _ _   (it’s masculine: el …)',
      'el',
    ),
    'La puerta del cerro',
  );
  if (g === 'wrong') {
    await s.say('mateo', '¿Cuatro brazos y viento? Mira a tu alrededor…', 'Four arms and wind? Look around you…');
    return;
  }
  s.flag('gate_cerro');
  s.refresh();
  await s.narrate('The gate creaks open. Behind it, the path climbs towards the biggest windmill of all.');
});

script('alonso_cerro', async (s) => {
  await s.say('alonso', '¡Aquí estoy! ¿Creíais que iba a quedarme en casa?', 'Here I am! Did you (all) think I was going to stay at home?');
  await s.say('alonso', '¡Non fuyades, cobardes y viles criaturas, que un solo caballero es el que os acomete!', 'Flee not, cowards and vile creatures, for it is a single knight who attacks you!');
  await s.narrate('Don Quijote’s battle cry against the windmills, in 400-year-old Spanish. Today: «¡No huyáis!» — don’t run away (you all).');
  await s.say('alonso', 'Yo me quedo aquí, guardando el camino. ¡Adelante, amigos!', "I'll stay here, guarding the path. Onwards, friends!");
});

script('boss_gigante', async (s) => {
  if (s.has('gigante')) return;
  await s.narrate('The biggest windmill shudders. Its sails bend like arms, and two grey eyes open in its tower.');
  await s.narrate('On its front, a grey page glows — a page torn from a book.');
  await s.say('bruno', 'Es una página del Libro del Olvido. Ella le ha dado vida.', "It's a page from the Book of Forgetting. She has brought it to life.");
  await s.say('mateo', 'Vale… Retiro lo de la cabra.', 'OK… I take back the goat thing.');
  const out = await s.battle({
    enemies: ['gigante'],
    bg: 'mancha',
    music: 'boss',
    canFlee: false,
    intro: { es: '¡El Gigante os ataca!', en: 'The Giant attacks you (all)!' },
    tips: [
      {
        at: 'enemy',
        text: 'When the Giant <b>«empieza a girar cada vez más rápido…»</b> ⚠️ its <b>Gran Giro</b> will hit everyone next turn. Defend, shield the party (Bruno’s <b>Escudo</b>!) or interrupt it. Its sails are wood: <b>fire</b> and lightning hurt it, wind only makes it spin.',
      },
    ],
  });
  if (out !== 'win') return;
  s.flag('gigante');
  s.refresh();
  await s.narrate('The Giant creaks, groans… and is just a windmill again. The grey page flutters down and crumbles into dust.');
  await s.narrate('Where it fell, a crystal is glowing softly.');
});

script('cristal_mancha', async (s) => {
  await s.narrate('You touch the crystal. Inside it, a word is curled up asleep: SUEÑO.', 'Dentro del cristal duerme una palabra: SUEÑO.');
  await s.say('bruno', 'La Palabra Madre de La Mancha. Pero cuidado: «sueño» tiene dos caras.', 'The Mother Word of La Mancha. But careful: «sueño» has two faces.');
  const g = await s.challenge(
    choiceChallenge(
      'La Palabra Madre',
      '«Tengo mucho sueño.»',
      'What does it mean?',
      ["I'm very sleepy", 'I have a big dream', "I'm dreaming a lot", 'I have a lot of luck'],
      0,
      ['tener sueño', 'to be sleepy'],
      '«Sueño» is both a dream (un sueño bonito) and sleepiness (tengo sueño = I’m sleepy). The verb soñar is only “to dream”.',
    ),
    'SUEÑO',
  );
  if (g === 'wrong') await s.say('bruno', '«Tengo sueño» es «tengo ganas de dormir». ¡Es lo que tenéis todos aquí!', '«Tengo sueño» means “I want to sleep”. Exactly what everyone here has!');
  s.flag('mancha_word');
  s.flag('mancha_done');
  s.heal();
  s.music('mancha');
  s.refresh();
  await s.narrate('The word rises into the sky. A breeze sweeps across the plain… and one by one, the windmills begin to turn.', 'Los molinos empiezan a girar.');
  await s.narrate('In your bag, the Grimorio grows warm: a blank page fills with ink again.');
  await s.say('lola', '¡Mirad! ¡El color vuelve a la llanura!', 'Look (you all)! The colour is coming back to the plain!');
  await s.say('hero', 'Vamos a contárselo a Don Alonso.', "Let's go and tell Don Alonso.");
  s.save();
});
