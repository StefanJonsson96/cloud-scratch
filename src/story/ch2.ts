// Chapter 2 — "San Sabor". The road east, a silent market, Lola and her
// song, and El Glotón in the bakery cellar.

import { script } from './script';
import { choiceChallenge, conjChallenge, riddle, wordQuest } from './common';

script('ch2_start', async (s) => {
  s.flag('ch2');
  await s.chapter(
    2,
    'San Sabor',
    'The Market Town',
    'This chapter: food words from Spain (zumo, patata, bocadillo, gambas) · numbers and prices · ordering: ¿me pone…?, ¿cuánto es? · gustar · and Lola joins with verbs — the present tense, with vosotros.',
  );
  await s.say('mateo', '¡Tengo hambre! En San Sabor hay un mercado enorme.', "I'm hungry! In San Sabor there's an enormous market.");
  await s.narrate('“Tengo hambre” — literally “I have hunger”. Spanish uses tener for hunger, thirst, cold, heat and fear: tengo sed, tengo frío, tengo miedo.');
});

script('peregrina', async (s) => {
  if (s.has('peregrina_ok')) {
    await s.say('peregrina', '¡Buen Camino! Y recordad: paso a paso se llega lejos.', 'Buen Camino! And remember (you all): step by step you get far.');
    return;
  }
  await s.say('peregrina', '¡Buen Camino! Soy peregrina. Voy a pie hasta Santiago de Compostela.', "Buen Camino! I'm a pilgrim. I'm walking all the way to Santiago de Compostela.");
  await s.narrate('“¡Buen Camino!” is what pilgrims on the Camino de Santiago wish each other. The scallop shell is their symbol.');
  const ok = await s.quiz('peregrina', '¿Y vosotros? ¿Adónde vais?', 'And you (all)? Where are you going?', [
    ['Vamos a San Sabor.', "We're going to San Sabor."],
    ['Sois muy simpáticos.', 'You (all) are very nice.'],
    ['Voy a dormir.', "I'm going to sleep."],
  ], 0);
  if (!ok) {
    await s.say('peregrina', 'Jaja, ¿qué? Te pregunto adónde vais. ¿A qué pueblo?', 'Haha, what? I’m asking where you (all) are going. Which town?');
    return;
  }
  s.flag('peregrina_ok');
  await s.say('peregrina', '¡Qué bien! Allí hay un mercado precioso… pero dicen que está en silencio.', 'How nice! There’s a lovely market there… but they say it has gone silent.');
  await s.narrate('“Vais” is the vosotros form of “ir”: ¿Adónde vais? — Where are you all going? Spain uses vosotros every day.');
  await s.say('peregrina', 'Tomad, para el camino. ¡Un buen café da energía!', 'Here (you all), for the road. A good coffee gives you energy!');
  await s.give('cafe', 2);
});

script('sansabor_enter', async (s) => {
  if (s.has('sansabor_seen')) return;
  s.flag('sansabor_seen');
  await s.say('mateo', '¡Qué raro! Un mercado sin ruido…', 'How strange! A market with no noise…');
  await s.narrate('Somewhere in the square a guitar is playing… but the song has no words.');
});

// ------------------------------------------------------------- the vendors
script('frutera', async (s) => {
  if (s.has('gloton')) {
    await s.say('frutera', '¿Qué os pongo? ¡Las fresas están a dos euros el kilo!', 'What can I get you all? Strawberries are two euros a kilo!');
    await s.narrate('“Estar a” + price is how markets in Spain give today’s price: Las fresas están a dos euros.');
    return;
  }
  await wordQuest(s, 'frutera', 'frutera_word', {
    lost: ['¡Ay! Vendo… vendo… ¡no recuerdo el nombre de mi fruta!', "Oh! I sell… I sell… I can't remember the name of my fruit!"],
    clue: ['Es roja o verde. Es redonda. Los médicos dicen: «una al día».', "It's red or green. It's round. Doctors say: “one a day”."],
    word: 'manzana',
    thanks: ['¡Manzana! ¡Claro! Toma, de regalo.', 'Apple! Of course! Here, on the house.'],
    reward: ['churro', 3],
    after: ['Manzanas, manzanas… ¡qué palabra tan bonita!', 'Apples, apples… what a lovely word!'],
  });
});

script('quesero', async (s) => {
  if (s.has('gloton')) {
    await s.say('quesero', '¿Os gusta el queso? Este es de Asturias. ¡Huele fuerte, pero está riquísimo!', 'Do you (all) like cheese? This one is from Asturias. It smells strong, but it’s delicious!');
    return;
  }
  await wordQuest(s, 'quesero', 'quesero_word', {
    lost: ['Mi puesto… vendo una cosa amarilla… ¿cómo se llama?', 'My stall… I sell a yellow thing… what’s it called?'],
    clue: ['Es amarillo. Se hace con leche. ¡A las ratas les encanta!', "It's yellow. It's made with milk. Rats love it!"],
    word: 'queso',
    thanks: ['¡Queso! ¡Mi vida! Toma, esto es para ti.', 'Cheese! My life! Here, this is for you.'],
    reward: ['empanada', 1],
    after: ['Queso manchego, queso de cabra… ¡Me encanta el queso!', 'Manchego cheese, goat’s cheese… I love cheese!'],
  });
});

script('pescadera', async (s) => {
  if (s.has('gloton')) {
    await s.say('pescadera', '¡Gambas frescas! ¿Cuántas queréis? ¿Una docena?', 'Fresh prawns! How many do you (all) want? A dozen?');
    return;
  }
  await wordQuest(s, 'pescadera', 'pescadera_word', {
    lost: ['Es pequeña… rosa… del mar… ¡no me sale la palabra!', "It's small… pink… from the sea… the word won't come out!"],
    clue: ['Es pequeña y rosa. Vive en el mar. ¡Muy rica a la plancha!', "It's small and pink. It lives in the sea. Delicious grilled!"],
    word: 'gamba',
    thanks: ['¡Gambas! ¡Eso es! Tomad, quince euros por la ayuda.', "Prawns! That's it! Here (you all), fifteen euros for the help."],
    reward: 15,
    after: ['Gambas al ajillo… ¡qué hambre me da!', 'Garlic prawns… that makes me hungry!'],
  });
});

script('tendero', async (s) => {
  if (!s.has('encarna_quiz')) {
    await s.say('tendera', 'No recuerdo los nombres de nada… pero sé los precios. ¡Los números no se olvidan!', "I can't remember what anything is called… but I know the prices. You never forget numbers!");
    const g = await s.challenge(
      choiceChallenge('Números · Prices', 'Esta empanada cuesta cuarenta y cinco euros.', 'How much does the empanada cost?', ['45 €', '54 €', '15 €', '40 €'], 0, ['cuarenta y cinco = 45', 'forty-five']),
      'Doña Encarna',
    );
    s.flag('encarna_quiz');
    if (g !== 'wrong') {
      await s.say('tendera', '¡Muy bien! Toma un churro, invita la casa.', 'Very good! Have a churro, on the house.');
      await s.give('churro');
    } else {
      await s.say('tendera', 'No, no: cuarenta y cinco. ¡Cuarenta, cuarenta y cinco!', 'No, no: forty-five. Forty, forty-five!');
    }
  }
  await s.say('tendera', '¿Qué os pongo?', 'What can I get you (all)?');
  await s.shop('tendera', ['churro', 'bocadillo', 'empanada', 'te', 'cafe', 'horchata', 'pluma']);
});

script('posadera', async (s) => {
  await s.say('posadera', '¡Bienvenidos a la Posada del Sol!', 'Welcome to the Sun Inn!');
  await s.inn('posadera', 10);
});

script('posada', async (s) => {
  await s.inn('posadera', 10);
});

script('bar', async (s) => {
  await s.narrate('A little tapas bar. It smells of tortilla and coffee.', 'Un bar de tapas. Huele a tortilla y a café.');
  const i = await s.ask('camarero', '¡Hola, chicos! ¿Qué os pongo?', 'Hi, guys! What can I get you all?', [
    ['Un zumo de naranja, por favor.', 'An orange juice, please.'],
    ['La cuenta, por favor.', 'The bill, please.'],
    ['Tengo frío.', "I'm cold."],
    ['Nada, gracias.', 'Nothing, thanks.'],
  ]);
  if (i === 1) {
    await s.say('camarero', '¿Ya? ¡Si no habéis tomado nada! Jaja.', "Already? But you (all) haven't had anything! Haha.");
    return;
  }
  if (i === 2) {
    await s.say('camarero', 'Pues cierra la puerta, jaja. ¿Algo caliente? ¿Un café?', 'Well, close the door then, haha. Something hot? A coffee?');
    return;
  }
  if (i === 3) {
    await s.say('camarero', '¡Hasta luego!', 'See you later!');
    return;
  }
  if (s.g.euros < 3) {
    await s.say('camarero', 'Son tres euros… ¿no tenéis? Bueno, otro día.', "It's three euros… you haven't got it? Well, another day.");
    return;
  }
  s.g.euros -= 3;
  await s.say('camarero', '¡Marchando! Y una tapa de tortilla, de regalo. Son tres euros.', "Coming right up! And a tapa of tortilla, on the house. That's three euros.");
  s.heal();
  await s.narrate('Everyone feels better. (In much of Spain a small tapa often comes free with a drink.)');
});

script('guardia_norte', async (s) => {
  await s.say('guardia', 'El bosque está al norte, pero ahora es peligroso. No pasa nadie.', "The forest is to the north, but it's dangerous right now. Nobody gets through.");
});

script('block_norte', async (s) => {
  await s.say('guardia', '¡Alto! No se puede pasar. El Silencio está en el pueblo.', "Stop! You can't go through. The Silence is in the town.");
});

script('nina_sabor', async (s) => {
  if (!s.has('gloton')) {
    await s.say('nina', 'Me… me… me gusta… ¡no recuerdo qué me gusta!', "I… I… I like… I can't remember what I like!");
    return;
  }
  const ok = await s.quiz('nina', '¡Me gustan los churros con chocolate! ¿Y a ti? ¿Te gustan?', 'I like churros with chocolate! And you? Do you like them?', [
    ['Sí, me gustan mucho.', 'Yes, I like them a lot.'],
    ['Sí, me gusta mucho.', 'Yes, I like it a lot.'],
  ], 0);
  if (ok) await s.say('nina', '¡A mí también!', 'Me too!');
  else await s.say('nina', 'Jaja, «me gustan»: ¡los churros son muchos!', 'Haha, “me gustan”: churros are plural!');
  await s.narrate('GUSTAR agrees with the thing you like: me gusta el chocolate (one thing) · me gustan los churros (several).');
});

// ------------------------------------------------------------- Lola
script('lola_plaza', async (s) => {
  await s.narrate('A young woman in a red flamenco dress sits by the fountain, playing guitar. She sings… but only “la la la”.');
  await s.say('lola', 'La la la… ¡Ay, no! Otra vez. No recuerdo la letra de mi canción.', "La la la… oh no! Again. I can't remember the words to my song.");
  await s.say('lola', '¡Hola! Me llamo Lola. Soy música, de Sevilla. ¡Encantada!', "Hi! I'm Lola. I'm a musician, from Seville. Nice to meet you!");
  const i = await s.ask('hero', '', '(Introduce yourself)', [
    [`Me llamo ${s.g.heroName}. ¡Mucho gusto!`, `I'm ${s.g.heroName}. Pleased to meet you!`],
    ['¿Qué es una guitarra?', "What's a guitar?"],
  ]);
  if (i === 1) await s.say('lola', 'Jaja, ¡esto! Una guitarra española. ¡Qué gracia!', 'Haha, this! A Spanish guitar. How funny!');
  await s.say('mateo', 'Hola, soy Mateo. ¡Me encanta tu música!', 'Hi, I’m Mateo. I love your music!');
  await s.say('lola', '¡Gracias, guapo!', 'Thanks, handsome! (In Spain, “guapo/guapa” is a friendly everyday way to address people.)');
  await s.say('lola', 'Mi canción habla del mercado. Pero el Silencio se ha llevado los verbos. ¿Me ayudáis?', "My song is about the market. But the Silence has taken the verbs. Will you (all) help me?");
  await s.narrate('Lola sings a line and stops at the gap. Help her find the missing verb!');
  let right = 0;
  const lines: [string, string, Parameters<typeof conjChallenge>[1], string][] = [
    ['cantar', 'Yo ___ (cantar) en la plaza,', 'yo', 'I sing in the square,'],
    ['bailar', 'vosotros ___ (bailar) conmigo,', 'vosotros', 'you all dance with me,'],
    ['vender', 'y ella ___ (vender) fresas al sol.', 'ella', 'and she sells strawberries in the sun.'],
  ];
  for (const [inf, prompt, person, sub] of lines) {
    const g = await s.challenge(conjChallenge(inf, person, 'presente', prompt, sub), 'La canción de Lola');
    if (g !== 'wrong') right++;
  }
  if (right >= 2) await s.say('lola', '¡Eso es! ¡La canción vuelve! «Yo canto en la plaza, vosotros bailáis conmigo…»', "That's it! The song is coming back! “I sing in the square, you all dance with me…”");
  else await s.say('lola', 'Mmm, casi… ¡pero algo vuelve! Ya lo practicaremos juntos.', "Hmm, almost… but something is coming back! We'll practise it together.");
  await s.say('lola', 'Escuchad: sé quién se come las palabras. Hay un monstruo en la bodega del panadero.', "Listen (you all): I know who's eating the words. There's a monster in the baker's cellar.");
  await s.say('lola', '¡Voy con vosotros!', "I'm coming with you (all)!");
  await s.join('lola');
  s.flag('lola_joined');
  await s.lesson(
    'Nota de Lola: vosotros',
    '<p>In Spain, “you all” (informal) is <b>vosotros</b>. Lola fights with <b>verbs</b>: in battle she sings, and you fill in the right form.</p><p>Present tense endings for vosotros: <b>-áis</b> (hablar → habláis), <b>-éis</b> (comer → coméis), <b>-ís</b> (vivir → vivís).</p>',
    [
      ['Vosotros habláis español.', 'You all speak Spanish.'],
      ['¿Coméis churros?', 'Do you all eat churros?'],
      ['¿Dónde vivís?', 'Where do you all live?'],
    ],
  );
  s.save();
});

script('panadero', async (s) => {
  if (s.has('gloton')) {
    if (!s.has('panadero_gift')) {
      s.flag('panadero_gift');
      await s.say('panadero', '¡Mi pan! ¡Mis palabras! Gracias, de verdad. Tomad, paella para el viaje.', 'My bread! My words! Thank you, really. Here (you all), paella for the journey.');
      await s.give('paella', 2);
      return;
    }
    await s.say('panadero', '¡Pan recién hecho! ¡Calentito!', 'Freshly baked bread! Nice and warm!');
    return;
  }
  if (!s.has('lola_joined')) {
    await s.say('panadero', '¡Hay… un monstruo… en mi bodega! Se come… todo…', "There's… a monster… in my cellar! It eats… everything…");
    return;
  }
  await s.say('panadero', 'Id, por favor. ¡Salvad mi pan!', 'Go (you all), please. Save my bread!');
});

script('block_bodega', async (s) => {
  await s.say('panadero', '¡No entréis! ¡Hay un monstruo! Solo… solo una música puede ayudar…', "Don't go in (you all)! There's a monster! Only… only a musician can help…");
  await s.narrate('“¡No entréis!” — the vosotros “don’t!”. Maybe that guitarist in the square knows something.');
});

// ------------------------------------------------------------- the cellar
script('gate_bodega', async (s) => {
  await s.narrate('A heavy pantry door with a lock made of numbers. A sign says:', 'La puerta de la despensa. Un cartel dice:');
  const g = await s.challenge(
    riddle('Para abrir, escribe el número: ocho más siete.', 'To open it, write the number: eight plus seven.', ['quince'], ['quince', 'fifteen (8 + 7)'], 'q _ _ _ _ _'),
    'La despensa · The pantry',
  );
  if (g === 'wrong') {
    await s.say('lola', 'Ocho más siete… ¡cuenta con los dedos! Diez, once, doce…', 'Eight plus seven… count on your fingers! Ten, eleven, twelve…');
    return;
  }
  s.flag('gate_bodega');
  s.refresh();
  await s.narrate('Click! The pantry door swings open.', '¡Clic! La puerta se abre.');
});

script('boss_gloton', async (s) => {
  if (s.has('gloton')) return;
  await s.say('lola', '¡Ahí está! ¡El Glotón!', "There it is! The Glutton!");
  await s.say('mateo', '¡Se está comiendo las palabras de la comida!', "It's eating the words for food!");
  await s.say('lola', '¡Oye, tú! ¿No tienes bastante?', "Hey, you! Haven't you had enough?");
  await s.say('gloton', '…ÑAM.', '…CHOMP.');
  const out = await s.battle({
    enemies: ['gloton'],
    bg: 'bodega',
    music: 'boss',
    canFlee: false,
    tips: [
      {
        at: 'enemy',
        text: 'When El Glotón <b>«tiene muchísima hambre… se relame»</b> ⚠️, next turn it will <b>eat</b> someone for huge damage. Lola’s <b>Nana</b> puts it to sleep and cancels the attack! It is weak to ❄️ <b>Hielo</b>.',
      },
    ],
  });
  if (out !== 'win') return;
  s.flag('gloton');
  s.refresh();
  await s.say('mateo', '¡Uf! ¡Y ahora tengo hambre yo!', 'Phew! And now I’m the one who’s hungry!');
  await s.say('lola', 'Tú siempre tienes hambre, Mateo. ¡Toca el cristal!', "You're always hungry, Mateo. Touch the crystal!");
});

script('cristal_sabor', async (s) => {
  if (!s.has('gloton')) {
    await s.narrate('El Glotón is guarding the crystal.');
    return;
  }
  s.flag('sabor');
  s.heal();
  await s.narrate('You touch the crystal. Hundreds of words fly out of it: pan, queso, fresas, gambas, aceite, miel…', 'Tocas el cristal. Salen cientos de palabras.');
  await s.warp('san_sabor', 25, 5, 'down');
  await s.narrate('Colour floods back into the market. Voices, laughter, the smell of churros!');
  await s.say('frutera', '¡Fresas, fresas! ¡A dos euros el kilo!', 'Strawberries, strawberries! Two euros a kilo!');
  await s.say('pescadera', '¡Gambas frescas! ¡Mirad qué gambas!', 'Fresh prawns! Look (you all) at these prawns!');
  await s.say('lola', '¡Escuchad! ¡El mercado canta otra vez!', 'Listen (you all)! The market is singing again!');
  await s.say('guardia', 'Gracias. El camino del norte está abierto. Cuidado en el bosque: dicen que hay una loba gris.', "Thank you. The north road is open. Careful in the forest: they say there's a grey she-wolf.");
  s.flag('ch2_done');
  s.save();
});
