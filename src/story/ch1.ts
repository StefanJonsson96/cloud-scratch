// Prologue and Chapter 1 — "La Costa".
// Abuela Rosa trains you, the Silence arrives, and you and Mateo bring the
// light back to the lighthouse.

import { script } from './script';
import { riddle, wordQuest } from './common';

// ------------------------------------------------------------------ prologue
script('intro', async (s) => {
  s.setRest('casa_abuela', 8, 3);
  await s.narrate('Puerto Alegre, a small fishing village on the Spanish coast. The sun is coming up over the sea…');
  s.face('left');
  await s.say('abuela', '¡Buenos días, {name}! ¿Qué tal has dormido?'.replace('{name}', s.g.heroName), `Good morning, ${s.g.heroName}! How did you sleep?`);
  const i = await s.ask('hero', '', '(Answer Abuela)', [
    ['¡Muy bien, gracias!', 'Very well, thanks!'],
    ['Mal… tengo sueño.', 'Badly… I’m sleepy.'],
  ]);
  if (i === 0) await s.say('abuela', '¡Me alegro! Hoy es un día especial.', "I'm glad! Today is a special day.");
  else await s.say('abuela', 'Jaja, ¡venga, arriba! Hoy es un día especial.', 'Haha, come on, up you get! Today is a special day.');
  await s.say('abuela', 'Hoy empieza tu formación de Palabrista.', 'Today your training as a Palabrista begins.');
  await s.say('abuela', 'Un Palabrista usa las palabras como magia. Cada palabra tiene poder.', 'A Palabrista uses words as magic. Every word has power.');
  await s.say(
    'abuela',
    'Si no entiendes algo, toca las palabras. O pulsa EN.',
    "If you don't understand something, tap the words. Or press EN (or the T key) for the whole sentence.",
  );
  await s.say('abuela', '¿Ves el muñeco de paja? Vamos a practicar tres cosas.', "See the straw dummy? Let's practise three things.");
  await s.battle({
    enemies: ['muneco'],
    hp: { muneco: 999 },
    bg: 'casa',
    canFlee: false,
    noGameOver: true,
    intro: { es: '¡A practicar con el muñeco!', en: 'Practice time with the dummy!' },
    tutorial: [
      { cmd: 'attack', es: 'Ataca: ⚔️ Atacar', en: 'Attack: choose ⚔️ Atacar, then the dummy' },
      { cmd: 'skill', es: 'Usa una palabra: ✨ Palabras', en: 'Cast a spell: ✨ Palabras → Fuego, then answer the question' },
      { cmd: 'defend', es: 'Defiéndete: 🛡️ Defender', en: 'Defend: choose 🛡️ Defender' },
    ],
    tips: [
      {
        at: 'start',
        text: '<b>¡Tu turno!</b> Try the three moves on the <b>Práctica</b> list (top of the screen) — in any order. When all three are ticked, the practice is over. The bar at the top left shows who acts next.',
      },
      {
        at: 'challenge',
        text: '<b>Spells need Spanish.</b> Answer the question: right = full power, wrong = a weak spell (and you see the answer). Stuck? <b>💡 Hint</b> helps, but then the answer counts as “almost”. Take your time — there is no rush.',
      },
      {
        at: 'enemy',
        text: '<b>Read the speech bubble.</b> Every enemy says what it is going to do next, in Spanish: <b>«va a…»</b> means “is going to…”. Tap a word, or the bubble, for English. (This dummy is going to do… nothing.)',
      },
      {
        at: 'racha',
        text: '<b>¡Racha llena!</b> Right answers fill the 🔥 Racha. Now you can use your <b>Palabra Final</b>: build a Spanish sentence to unleash it.',
      },
    ],
  });
  s.heal();
  await s.say('abuela', '¡Muy bien! Tienes talento.', 'Very good! You have talent.');
  await s.say('abuela', 'Puedes practicar con el muñeco cuando quieras.', 'You can practise with the dummy whenever you like.');
  await s.say('abuela', 'Y ahora… tengo hambre. ¿Puedes ir a la tienda de Doña Carmen? Necesito pan.', "And now… I'm hungry. Can you go to Doña Carmen's shop? I need bread.");
  await s.say('abuela', 'Su puesto está al lado de la plaza. ¡Hasta luego!', 'Her stall is next to the square. See you later!');
  s.flag('intro_done');
  s.flag('bread_quest');
  s.save();
});

script('block_house', async (s) => {
  await s.say('abuela', '¡Eh! ¿Adónde vas? Primero, a practicar con el muñeco.', 'Hey! Where are you going? Practise with the straw dummy first: walk up to it and press Enter (or A).');
});

script('abuela', async (s) => {
  if (s.has('abuela_silenced')) {
    await s.narrate("Abuela can't speak. Her eyes go to the Grimorio in your hands… then to the window, to the north.");
    return;
  }
  if (s.has('has_bread')) {
    await s.say('abuela', '¿Ya tienes el pan? ¡Qué rápido! Ven, ven.', 'You already have the bread? That was quick! Come, come.');
    return;
  }
  await s.say('abuela', 'La tienda de Doña Carmen está al lado de la plaza. Compra pan, por favor.', "Doña Carmen's shop is next to the square. Buy bread, please.");
});

script('estante', async (s) => {
  await s.narrate(
    "Grandma's books: “The Lost Words”, “Valencian Cooking”, “The Art of the Palabrista”…",
    'Libros de la abuela: «Las palabras perdidas», «Cocina valenciana», «El arte del Palabrista»…',
  );
});

script('mesa', async (s) => {
  await s.narrate('There is a note on the table: “Buy bread. — R.”', 'Hay una nota en la mesa: «Comprar pan. — R.»');
});

// The shop — and the bread
script('carmen', async (s) => {
  if (s.has('fog') && !s.has('faro_lit')) {
    await s.say('carmen', 'Puedo vender… pero no recuerdo los nombres de nada.', "I can sell… but I can't remember what anything is called.");
    await s.shop('carmen', ['churro', 'te']);
    return;
  }
  if (s.has('bread_quest') && !s.has('has_bread')) {
    await s.say('carmen', '¡Buenos días, cariño! ¿Qué te pongo?', 'Good morning, dear! What can I get you? (“¿Qué te pongo?” is how shopkeepers in Spain say it.)');
    for (;;) {
      const i = await s.ask('hero', '', '(What do you ask for?)', [
        ['Una barra de pan, por favor.', 'A loaf of bread, please.'],
        ['Un pez grande, por favor.', 'A big fish, please.'],
        ['Tengo sueño.', "I'm sleepy."],
      ]);
      if (i === 0) break;
      if (i === 1) await s.say('carmen', '¿Un pez? Esto no es una pescadería, jaja. ¿Pan, quizás?', 'A fish? This is not a fishmonger’s, haha. Bread, maybe?');
      else await s.say('carmen', 'Pues… ¡a dormir! Jaja. ¿Qué quieres comprar?', 'Well… off to bed then! Haha. What do you want to buy?');
    }
    await s.say('carmen', 'Aquí tienes. Son dos euros.', "Here you go. That's two euros.");
    s.g.euros = Math.max(0, s.g.euros - 2);
    s.flag('has_bread');
    await s.narrate('You buy a loaf of bread (una barra de pan). Time to take it home.', 'Compras una barra de pan.');
    await s.say('carmen', '¡Gracias! Saludos a tu abuela.', 'Thanks! Say hello to your grandma.');
    return;
  }
  await s.say('carmen', '¡Hola, cariño! ¿Qué te pongo hoy?', 'Hello, dear! What can I get you today?');
  await s.shop('carmen', ['churro', 'bocadillo', 'te', 'horchata']);
});

// Villagers before and after the Silence
script('pepe', async (s) => {
  if (s.has('fog') && !s.has('faro_lit')) {
    await wordQuest(s, 'pepe', 'pepe_word', {
      lost: ['Tengo… tengo sed. Quiero… ¡ay! No recuerdo la palabra.', "I'm… I'm thirsty. I want… oh! I can't remember the word."],
      clue: ['Algo para beber. Es transparente. Está en el mar y en el río.', "Something to drink. It's clear. It's in the sea and in the river."],
      word: 'agua',
      thanks: ['¡Agua! ¡Eso es! Gracias. Toma, para el camino.', "Water! That's it! Thanks. Here, for the road."],
      reward: ['churro', 2],
      after: ['Agua, agua… no quiero olvidarla otra vez.', "Water, water… I don't want to forget it again."],
    });
    return;
  }
  if (s.has('faro_lit')) {
    await s.say('pepe', '¡Gracias por el faro! Todo el pueblo habla otra vez.', 'Thanks for the lighthouse! The whole village is talking again.');
    return;
  }
  if (s.has('pepe_hello')) {
    await s.say('pepe', '¡Qué día tan bonito!', 'What a lovely day!');
    return;
  }
  const ok = await s.quiz('pepe', `¡Hola, ${s.g.heroName}! ¿Qué tal?`, `Hi, ${s.g.heroName}! How's it going?`, [
    ['¡Bien! ¿Y tú?', 'Good! And you?'],
    ['Me llamo Pepe.', 'My name is Pepe.'],
    ['Adiós.', 'Goodbye.'],
  ], 0);
  if (ok) {
    s.flag('pepe_hello');
    await s.say('pepe', '¡Muy bien también, gracias!', 'Very well too, thanks!');
    await s.narrate('“¿Qué tal?” is the everyday “How’s it going?” in Spain. Answer with “bien”, “muy bien” or “fatal” (awful).');
  } else {
    await s.say('pepe', 'Eh… no, yo me llamo Pepe. ¡Tú no! Jaja.', "Er… no, I'm Pepe. Not you! Haha.");
  }
});

script('lucia', async (s) => {
  if (s.has('fog') && !s.has('faro_lit')) {
    await wordQuest(s, 'lucia', 'lucia_word', {
      lost: ['De noche… en el cielo… hay una cosa blanca y redonda. ¿Cómo se llama?', "At night… in the sky… there's a white, round thing. What's it called?"],
      clue: ['Sale de noche. Es blanca y redonda. No es el sol.', "It comes out at night. It's white and round. It's not the sun."],
      word: 'luna',
      thanks: ['¡La luna! ¡Qué bonita palabra! Toma esto, por favor.', 'The moon! What a lovely word! Take this, please.'],
      reward: ['te', 2],
      after: ['Esta noche voy a mirar la luna. ¡Gracias!', "Tonight I'm going to look at the moon. Thanks!"],
    });
    return;
  }
  if (s.has('faro_lit')) {
    await s.say('lucia', 'Dicen que el Silencio viene de la Torre Muda, al norte.', 'They say the Silence comes from the Mute Tower, to the north.');
    return;
  }
  await s.say('lucia', 'Buenos días. ¡Qué sol tan bonito hoy!', 'Good morning. What lovely sunshine today!');
  await s.narrate('“¡Qué + noun + tan + adjective!” is how Spaniards gush: ¡Qué día tan bonito! (What a lovely day!)');
});

script('dani', async (s) => {
  if (s.has('fog') && !s.has('faro_lit')) {
    await wordQuest(s, 'nino', 'dani_word', {
      lost: ['Mi… mi animal favorito… ¡no recuerdo cómo se llama!', "My… my favourite animal… I can't remember what it's called!"],
      clue: ['Es pequeño y rojo. Vive en la playa. Camina de lado.', "It's small and red. It lives on the beach. It walks sideways."],
      word: 'cangrejo',
      thanks: ['¡Cangrejo! ¡Mola! Toma, mis ahorros.', "Crab! Cool! Here, my savings."],
      reward: 10,
      after: ['¡Los cangrejos caminan de lado! ¡Como yo!', 'Crabs walk sideways! Like me!'],
    });
    return;
  }
  if (s.has('faro_lit')) {
    await s.say('nino', '¡El faro brilla otra vez! ¡Sois mis héroes!', 'The lighthouse is shining again! You (all) are my heroes!');
    return;
  }
  await s.say('nino', '¿Sabes? El faro brilla toda la noche. ¡Mola mucho!', 'You know what? The lighthouse shines all night. It’s really cool!');
});

script('ramon', async (s) => {
  if (s.has('faro_lit')) {
    if (!s.has('ramon_gift')) {
      s.flag('ramon_gift');
      await s.say('ramon', `¡${s.g.heroName}! Mateo me lo ha contado todo. ¡Gracias!`, `${s.g.heroName}! Mateo has told me everything. Thank you!`);
      await s.say('ramon', 'Toma. Esta concha era de mi abuelo. Protege a los viajeros.', 'Take this. This shell was my grandfather’s. It protects travellers.');
      await s.give('concha');
      await s.say('ramon', 'El Silencio viene del norte. Id por el camino del este, a San Sabor.', 'The Silence comes from the north. Go (you all) along the east road, to San Sabor.');
      await s.narrate('“Id” is the vosotros command of “ir”: “Go, you all!” You will hear vosotros everywhere in Spain.');
      return;
    }
    await s.say('ramon', 'Cuida de mi hijo, ¿vale? Come mucho, pero es muy valiente.', "Look after my son, okay? He eats a lot, but he's very brave.");
    return;
  }
  if (s.has('fog')) {
    await s.narrate("Don Ramón stares at the dark lighthouse, grey and silent. He doesn't answer.");
    return;
  }
  await s.say('ramon', '¡Hola! Mi hijo Mateo está en el muelle, con la barca.', 'Hi! My son Mateo is on the pier, with the boat.');
});

script('barca', async (s) => {
  await s.narrate('Don Ramón’s boat. It’s called “La Gaviota”.', 'La barca de Don Ramón. Se llama «La Gaviota».');
});

script('mateo_muelle', async (s) => {
  if (!s.has('fog')) {
    await s.say('mateo', `¡Eh, ${s.g.heroName}! Hoy el mar está muy tranquilo.`, `Hey, ${s.g.heroName}! The sea is very calm today.`);
    await s.say('mateo', 'Luego vamos a pescar, ¿vale?', "Later we're going fishing, okay?");
    return;
  }
  await s.say('mateo', `¡${s.g.heroName}! ¿Estás bien? ¡Mi padre no habla! Está gris, como una piedra.`, `${s.g.heroName}! Are you okay? My dad isn't talking! He's grey, like a stone.`);
  const a = await s.ask('hero', '', '(Answer Mateo)', [
    ['Mi abuela también.', 'My grandma too.'],
    ['¿Qué es una piedra?', "What's a stone?"],
  ]);
  if (a === 1) await s.say('mateo', '¿En serio? Una piedra… una roca. ¡Pues eso!', "Seriously? A stone… a rock. That!");
  else await s.say('mateo', '¿Tu abuela también? ¡Madre mía!', 'Your grandma too? Oh my goodness!');
  await s.say('mateo', 'Mira el faro. Está apagado. Nunca está apagado.', "Look at the lighthouse. It's off. It's never off.");
  await s.say('mateo', 'Creo que el Silencio se ha llevado la luz del faro.', "I think the Silence has taken the lighthouse's light.");
  await s.narrate('“Se ha llevado” — has taken. In Spain, things that just happened use the perfecto (haber + participle).');
  const b = await s.ask('hero', '', '(What do you say?)', [
    ['¡Vamos al faro!', "Let's go to the lighthouse!"],
    ['Tengo miedo…', "I'm scared…"],
  ]);
  if (b === 1) await s.say('mateo', 'Yo también. Pero vamos juntos, ¿vale?', "Me too. But we'll go together, okay?");
  await s.say('mateo', '¡Venga! Voy contigo. Tengo mi remo.', "Come on! I'm coming with you. I've got my oar.");
  await s.narrate('Grey seagulls dive at the pier, silent, with empty eyes!');
  await s.join('mateo');
  s.flag('mateo_joined');
  await s.battle({
    enemies: ['gaviota', 'gaviota'],
    bg: 'playa',
    canFlee: false,
    tips: [
      {
        at: 'start',
        text: '<b>Mateo</b> fights with quick decisions: <b>el or la</b>, <b>ser or estar</b>… His <b>Proteger</b> takes hits for an ally — perfect when a bubble says an enemy <b>«va a…»</b> attack someone.',
      },
    ],
  });
  await s.say('mateo', '¡Somos un buen equipo!', "We're a good team!");
  await s.say('mateo', 'El faro está al oeste, por la playa. Hay una cueva debajo.', "The lighthouse is to the west, along the beach. There's a cave underneath.");
  s.save();
});

script('block_west', async (s) => {
  if (!s.has('fog')) await s.say('abuela', '¡{name}! ¡El pan!'.replace('{name}', s.g.heroName), `${s.g.heroName}! The bread!`);
  else await s.narrate("The beach path is thick with fog. You shouldn't go alone. Mateo was down on the pier…");
});

script('block_east', async (s) => {
  await s.narrate('A wall of grey fog blocks the road east. Nothing can get through while the lighthouse is dark.', 'Una niebla gris bloquea el camino.');
});

// The Silence arrives
script('niebla_llega', async (s) => {
  s.flag('fog');
  s.refresh();
  s.music('dungeon');
  await s.narrate('Suddenly the sky goes dark. A cold grey fog rolls in from the sea…');
  await s.say('lucia', '¿Qué… qué pasa? No… no recuerdo… ¿cómo se dice…?', "What… what's happening? I don't… I don't remember… how do you say…?");
  await s.narrate('Lucía turns grey and goes quiet. Two wisps of mist drift towards you!');
  await s.battle({
    enemies: ['niebla', 'niebla'],
    bg: 'pueblo',
    canFlee: false,
    intro: { es: '¡Han aparecido dos nieblas!', en: 'Two mists have appeared!' },
    tips: [{ at: 'start', text: 'Mist is weak to <b>🔥 Fuego</b>. Check an enemy’s weaknesses by hovering or long-pressing it.' }],
  });
  await s.narrate('A crash comes from Grandma’s house! Then… silence.');
  await s.warp('casa_abuela', 5, 6, 'up');
});

script('casa_enter', async (s) => {
  if (!s.has('fog') || s.has('abuela_silenced')) return;
  await s.say('abuela', `¡${s.g.heroName}! ¡Cuidado! ¡No te acerques!`, `${s.g.heroName}! Careful! Don't come any closer!`);
  await s.say('callado', '……', '(The hooded figure says nothing. Not a sound. Only cold silence.)');
  await s.say('abuela', 'Tú… Te conozco. ¿Por qué haces esto?', 'You… I know you. Why are you doing this?');
  await s.say('callado', '……', '(He raises a hand. The words in the room start to fade, like ink in water.)');
  await s.say('abuela', `${s.g.heroName}, ¡toma mi Grimorio! ¡Rápido!`, `${s.g.heroName}, take my Grimorio! Quick!`);
  await s.narrate('Abuela throws you an old book: the Grimorio. Its pages glow with words. (Open it any time from the menu: M or ☰.)');
  await s.say('abuela', 'Las palabras son poder… Recupéralas… La Torre Muda… al norte…', 'Words are power… Get them back… The Mute Tower… to the north…');
  s.flag('abuela_silenced');
  s.refresh();
  await s.narrate('The figure touches Abuela’s shoulder. Her colour drains away; her voice is gone. Then the shadow melts into fog and slips out of the window, heading north.');
  s.flag('callado_seen');
  s.refresh();
  await s.narrate('Abuela stands frozen and grey, mouth open as if mid-word.');
  await s.chapter(
    1,
    'La Costa',
    'The Coast',
    'This chapter: sea and weather words · el or la (and the traps: el agua, el día, la mano, el problema) · ser vs estar · Spain expressions like ¡venga!, ¡vaya! and ¡ojo!',
  );
  s.setRest('casa_abuela', 8, 3);
  s.heal();
  await s.narrate('Maybe someone in the village knows what happened. Mateo was down at the pier…');
  s.music('town');
  s.save();
});

// ------------------------------------------------------------------ the beach
script('paco', async (s) => {
  if (s.has('faro_lit')) {
    await s.say('Paco', '¡Hoy pesco mucho! Gracias a vosotros.', "Today I'm catching loads! Thanks to you all.");
    return;
  }
  await wordQuest(s, 'Paco', 'paco_word', {
    lost: ['Mi… mi… flota en el agua. Tiene una vela. ¿Cómo se llama?', "My… my… it floats on the water. It has a sail. What's it called?"],
    clue: ['Flota en el agua. Tiene una vela. Los pescadores lo usan.', 'It floats on the water. It has a sail. Fishermen use it.'],
    word: 'barco',
    thanks: ['¡Mi barco! ¡Claro! Toma, un regalo del mar.', 'My boat! Of course! Here, a gift from the sea.'],
    reward: ['horchata', 1],
    after: ['Mi barco es pequeño, pero es mío.', "My boat is small, but it's mine."],
  });
});

script('faro_view', async (s) => {
  s.flag('faro_seen');
  await s.say('mateo', 'Allí está el faro. ¡Qué oscuro está!', "There's the lighthouse. How dark it is!");
  await s.say('mateo', 'La entrada de la cueva está debajo. ¿Vamos? Yo estoy preparado.', "The cave entrance is underneath. Shall we? I'm ready.");
  await s.narrate('“Preparado” agrees with Mateo, a boy. Lola would say “preparada”: adjectives match the person they describe.');
});

// ------------------------------------------------------------------ the cave
script('gate_cueva', async (s) => {
  await s.narrate('An old stone gate. Words are carved into it:', 'Una puerta antigua de piedra. Tiene palabras grabadas:');
  await s.narrate(
    '“I am white and yellow. I live in the lighthouse. Without me, ships get lost at night. Who am I?”',
    '«Soy blanca y amarilla. Vivo en el faro. Sin mí, los barcos se pierden de noche. ¿Quién soy?»',
  );
  const g = await s.challenge(
    riddle('¿Quién soy? Vivo en el faro…', 'Write the answer in Spanish.', ['luz'], ['la luz', 'light'], 'l _ _   (it’s feminine: la …)', 'la'),
    'La puerta · The gate',
  );
  if (g === 'wrong') {
    await s.say('mateo', 'Mmm… ¿Qué hay en un faro? ¡Algo que brilla!', "Hmm… What's in a lighthouse? Something that shines!");
    return;
  }
  s.flag('gate_cueva');
  s.refresh();
  await s.narrate('The word glows and the gate grinds open.', '¡La puerta se abre!');
  await s.say('mateo', '¡Genial! ¡Vamos!', "Brilliant! Let's go!");
});

script('boss_rey', async (s) => {
  if (s.has('boss_rey')) return;
  await s.say('mateo', '¡Mira! ¡Es el Cangrejo Rey! ¡Y tiene la luz del faro!', "Look! It's the King Crab! And it has the lighthouse's light!");
  await s.narrate('The giant crab raises its claws. It has no voice left — only a dry clack-clack.');
  const out = await s.battle({
    enemies: ['cangrejo_rey'],
    bg: 'cueva',
    music: 'boss',
    canFlee: false,
    tips: [
      { at: 'start', text: '<b>Combo:</b> 💧 <b>Agua</b> makes an enemy WET — then ⚡ <b>Rayo</b> does <b>double damage</b>. The King Crab is weak to lightning!' },
      {
        at: 'enemy',
        text: '<b>Watch its bubble.</b> When it <b>«levanta sus pinzas»</b> (raises its claws) ⚠️, its next move is a huge crush. Defend 🛡️, let Mateo <b>Proteger</b> the target, or heal first.',
      },
    ],
  });
  if (out !== 'win') return;
  s.flag('boss_rey');
  s.refresh();
  await s.say('mateo', '¡Lo hemos conseguido! ¡Toca el cristal!', "We've done it! Touch the crystal!");
});

script('cristal_luz', async (s) => {
  if (!s.has('boss_rey')) {
    await s.narrate('The King Crab guards the crystal.');
    return;
  }
  await s.narrate('You touch the crystal. A word rises out of it, warm and bright: LUZ.', 'Tocas el cristal. Sale una palabra: LUZ.');
  s.flag('faro_lit');
  s.heal();
  await s.warp('playa', 3, 5, 'down');
  await s.narrate('The lighthouse blazes back to life. Its beam sweeps across the sea… and the fog over Puerto Alegre melts away.');
  await s.say('mateo', '¡Mira! ¡El faro brilla otra vez!', 'Look! The lighthouse is shining again!');
  await s.say('mateo', 'Vamos al pueblo. ¡Quiero ver a mi padre!', "Let's go to the village. I want to see my dad!");
  s.save();
});
