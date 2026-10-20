// Chapter 9 — "La Santa Compaña". Santiago in the rain: the pilgrims have
// lost their wishes. A meiga, a queimada, a spell made of wishes (the
// presente de subjuntivo) — and the Grey Lady herself, who takes Bruno.

import { script, type Script } from './script';
import { choiceChallenge } from './common';
import { tokenize } from '../data/text';
import type { Challenge } from '../learn/challenges';

function wishGap(label: string, prompt: string, sub: string, options: string[], answer: string, note: string): Challenge {
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return choiceChallenge(label, prompt, sub, shuffled, shuffled.indexOf(answer), [prompt.replace('___', answer), sub], note);
}

script('ch9_start', async (s) => {
  s.flag('ch9');
  await s.chapter(
    9,
    'La Santa Compaña',
    'The Holy Company',
    'This chapter: wishes and hopes — ojalá que…, quiero que…, espero que… (presente de subjuntivo) · ¡que…! to wish something on someone · Galician words: meiga, morriña, hórreo, gaita.',
  );
  await s.narrate('The rain falls softly on the old stones, as it has for a thousand years. Pilgrims cross the square… but nobody is smiling.');
  await s.say('mateo', 'Llueve. ¡Qué sorpresa!', "It's raining. What a surprise!");
  await s.say('lola', 'En Galicia llueve mucho, Mateo. Es parte de su encanto.', 'It rains a lot in Galicia, Mateo. It’s part of its charm.');
  await s.say('bruno', 'La Dama está cerca. La siento como un frío en los huesos.', 'The Lady is close. I can feel her like a chill in my bones.');
});

// ------------------------------------------------------------- Santiago
script('peregrina_santiago', async (s) => {
  if (s.has('santiago_reward')) {
    await s.say('peregrina', '¡Ojalá que encontréis a Bruno! Y que el Camino os lleve a casa.', 'I hope you find Bruno! And may the Camino take you home.');
    return;
  }
  if (s.has('bruno_taken')) return pilgrimReward(s);
  if (s.has('maruxa_hint')) {
    await s.say('peregrina', 'Las meigas saben de deseos. Dicen que hay una en la fraga, al este.', "Meigas know about wishes. They say there's one in the woods, to the east.");
    return;
  }
  await s.say('peregrina', '¡Vosotros! ¡Del camino de San Sabor! ¿Os acordáis de mí?', 'You! From the road to San Sabor! Do you remember me?');
  await s.say('hero', '¡La peregrina! ¡Has llegado a Santiago!', "The pilgrim! You've made it to Santiago!");
  await s.say('peregrina', 'Sí… Caminé ochocientos kilómetros. Llegué ayer. Pero ahora no recuerdo por qué vine.', "Yes… I walked eight hundred kilometres. I arrived yesterday. But now I can't remember why I came.");
  await s.say('peregrina', 'Tenía un deseo. Todos los peregrinos tienen uno. Y lo he perdido.', "I had a wish. Every pilgrim has one. And I've lost it.");
  await s.say('bruno', 'Sin deseos no hay subjuntivo… y sin subjuntivo, nadie puede desear nada.', "Without wishes there's no subjunctive… and without the subjunctive, nobody can wish for anything.");
  await s.lesson(
    'Nota de Bruno: el subjuntivo',
    '<p>To <b>wish</b>, to <b>hope</b>, or to <b>want someone else</b> to do something, Spanish switches to the <b>presente de subjuntivo</b>.</p><p>Take the yo form of the present, drop the -o, and swap the vowel: <b>-ar → -e</b> (hablo → habl<b>e</b>), <b>-er/-ir → -a</b> (como → com<b>a</b>, vivo → viv<b>a</b>). So tengo → teng<b>a</b>, hago → hag<b>a</b>, vengo → veng<b>a</b>.</p><p>A few are special: <b>ser → sea</b>, <b>ir → vaya</b>, <b>haber → haya</b>, <b>estar → esté</b>, <b>saber → sepa</b>, <b>dar → dé</b>.</p><p>It comes after <b>ojalá (que)</b>, <b>quiero que</b>, <b>espero que</b> — and on its own after <b>¡que…!</b>: <i>¡Que tengas suerte!</i> (good luck!)</p>',
    [
      ['Ojalá que deje de llover.', 'I hope it stops raining.'],
      ['Quiero que vengáis conmigo.', 'I want you (all) to come with me.'],
      ['¡Que te vaya bien!', 'All the best!'],
    ],
  );
  await s.say('peregrina', 'Dicen que las meigas saben de deseos. Hay una en la fraga, el bosque del este.', "They say the meigas know about wishes. There's one in the fraga, the woods to the east.");
  await s.narrate('“Meiga” is Galician for a witch — usually a wise woman, not a wicked one. «Yo no creo en las meigas, pero haberlas, haylas»: I don’t believe in witches… but they exist, they do.');
  s.flag('maruxa_hint');
  s.refresh();
});

async function pilgrimReward(s: Script) {
  await s.say('peregrina', '¡Mi deseo! ¡Ya lo recuerdo! Quería volver a ver a mi hermano. Hace años que no hablamos.', "My wish! I remember it now! I wanted to see my brother again. We haven't spoken for years.");
  await s.say('peregrina', 'Pero… ¿y Bruno? ¿Dónde está?', 'But… what about Bruno? Where is he?');
  await s.say('lola', 'Se lo ha llevado la Dama Gris. A Salamanca.', 'The Grey Lady has taken him. To Salamanca.');
  await s.say('peregrina', 'Entonces tomad mi bordón. Me ha traído hasta aquí. Ojalá que os lleve hasta Bruno.', 'Then take my staff. It has brought me all the way here. I hope it takes you to Bruno.');
  await s.give('bordon');
  s.flag('santiago_reward');
  await s.say('peregrina', '¡Que tengáis buen camino!', 'Have a good journey (you all)!');
  s.save();
}

script('block_fraga', async (s) => {
  await s.say('lola', 'Primero, hablemos con la gente. Mira, ¡la peregrina del camino!', "First, let's talk to people. Look, the pilgrim from the road!");
});

script('catedral_santiago', async (s) => {
  await s.narrate('The Cathedral of Santiago, the end of the Camino. Inside hangs the Botafumeiro: a silver incense burner as big as a person, swung across the church by eight men.', 'La catedral de Santiago.');
});

script('hostal_santiago', async (s) => {
  await s.say('hostalera', 'Entrad, que os vais a mojar. ¡Aquí dentro no llueve!', "Come in (you all), you'll get soaked. It doesn't rain in here!");
  await s.inn('hostalera', 45);
});

script('pulpeira', async (s) => {
  if (s.has('maruxa_met') && !s.has('tengo_orujo')) {
    await s.say('pulpeira', '¿Orujo para una queimada? Te lo doy… si sabes cómo se sirve mi pulpo.', "Orujo for a queimada? I'll give it to you… if you know how my octopus is served.");
    const ok = await s.quiz('pulpeira', '¿Cómo se sirve el pulpo a la gallega?', 'How is Galician-style octopus served?', [
      ['Con chocolate y nata.', 'With chocolate and cream.'],
      ['Con pimentón, aceite y sal, en un plato de madera.', 'With paprika, olive oil and salt, on a wooden plate.'],
      ['Frito, con kétchup.', 'Fried, with ketchup.'],
    ], 1);
    if (!ok) {
      await s.say('pulpeira', '¡Ay, no! ¡Qué horror! Piénsalo otra vez.', 'Oh, no! How awful! Think again.');
      return;
    }
    s.flag('tengo_orujo');
    s.refresh();
    await s.say('pulpeira', '¡Eso es! Toma el orujo. Espero que os salga una buena queimada.', "That's it! Take the orujo. I hope your queimada turns out well.");
    await s.narrate('You got the orujo. (Ingredients: see the objective.)');
    return;
  }
  await s.say('pulpeira', '¡Pulpo a la gallega! ¡Calentito para la lluvia!', 'Galician octopus! Nice and warm for the rain!');
  await s.shop('pulpeira', ['pulpo', 'tarta', 'jamon', 'gazpacho', 'te', 'cafe', 'pluma']);
});

script('uxia', async (s) => {
  if (s.has('tengo_limón')) {
    await s.say('uxia', '¡Ojalá que pare de llover! …Bueno, no. ¡Me gusta la lluvia!', "I hope it stops raining! …Well, no. I like the rain!");
    return;
  }
  if (!s.has('maruxa_met')) {
    await s.say('uxia', 'Me llamo Uxía. ¿Sabes qué es la morriña? Mi abuelo dice que es echar de menos tu tierra.', "My name's Uxía. Do you know what morriña is? My grandad says it's missing your homeland.");
    return;
  }
  await s.say('uxia', '¿Un limón? Mi abuela tiene un limonero. Te doy uno… si me ayudas con mi deseo.', "A lemon? My granny has a lemon tree. I'll give you one… if you help me with my wish.");
  const g = await s.challenge(
    wishGap(
      'Help Uxía make a wish',
      'Ojalá que mañana ___ (hacer) sol.',
      'I hope it’s sunny tomorrow.',
      ['haga', 'hace', 'hizo', 'hará'],
      'haga',
      'After «ojalá» comes the subjunctive: hago → haga.',
    ),
    'El deseo de Uxía',
  );
  if (g === 'wrong') {
    await s.say('uxia', 'Así no se pide un deseo… ¡Con «ojalá» es diferente!', "That's not how you make a wish… With «ojalá» it's different!");
    return;
  }
  s.flag('tengo_limón');
  s.refresh();
  await s.say('uxia', '¡Eso! «Ojalá que haga sol». Toma, un limón de mi abuela.', "That's it! «I hope it's sunny». Here, one of my granny's lemons.");
  await s.narrate('You got a lemon.');
});

script('gaitero', async (s) => {
  if (s.has('tengo_café')) {
    await s.say('gaitero', '¡Ahora sí suena la gaita! ¡Que viva Galicia!', 'Now the bagpipes sound right! Long live Galicia!');
    return;
  }
  if (!s.has('maruxa_met')) {
    await s.say('gaitero', 'Soy gaitero. Pero mi gaita está triste… como yo.', "I'm a piper. But my bagpipes are sad… like me.");
    return;
  }
  await s.say('gaitero', '¿Café? Siempre llevo para el frío. Pero antes… quiero que alguien me pida una canción.', "Coffee? I always carry some for the cold. But first… I want someone to ask me for a song.");
  const g = await s.challenge(
    wishGap(
      'Ask the piper for a song',
      'Quiero que ___ (tocar, tú) una muiñeira.',
      'I want you to play a muiñeira.',
      ['toques', 'tocas', 'tocaste', 'tocarás'],
      'toques',
      'Wanting someone else to do something → «quiero que» + subjunctive. tocar → toque → toques (c becomes qu to keep the hard sound).',
    ),
    'El gaitero',
  );
  if (g === 'wrong') {
    await s.say('gaitero', 'Mmm… mi gaita no se mueve. Pídemelo bien.', "Hmm… my bagpipes won't budge. Ask me properly.");
    return;
  }
  s.flag('tengo_café');
  s.refresh();
  s.music('galicia');
  await s.narrate('The gaita fills with air and starts to play a muiñeira, the fast dance of Galicia. People in the square start tapping their feet.');
  await s.say('gaitero', '¡Gracias! Toma el café. ¡Que os vaya bien!', 'Thank you! Take the coffee. All the best!');
  await s.narrate('You got a handful of coffee beans.');
});

// ------------------------------------------------------------- the fraga
script('maruxa', async (s) => {
  if (s.has('santiago_done')) {
    await s.say('maruxa', 'La morriña pasará. Y Bruno volverá, ya verás.', "The longing will pass. And Bruno will come back, you'll see.");
    return;
  }
  if (s.has('queimada')) {
    await s.say('maruxa', 'Es medianoche. Id al cruceiro, al este. ¡Y no salgáis de la luz de la queimada!', "It's midnight. Go to the stone cross, to the east (you all). And don't leave the light of the queimada!");
    return;
  }
  if (s.has('maruxa_met')) {
    if (s.has('tengo_orujo') && s.has('tengo_limón') && s.has('tengo_café')) return conxuro(s);
    await s.say('maruxa', 'Tráeme orujo, un limón y café. Buscad en Santiago: alguien os ayudará.', 'Bring me orujo, a lemon and coffee. Look in Santiago (you all): someone will help you.');
    return;
  }
  await s.narrate('An old woman in a black shawl is stirring a clay pot. She doesn’t look up.');
  await s.say('maruxa', 'Os esperaba. Las meigas sabemos estas cosas.', 'I was expecting you. We meigas know these things.');
  await s.say('maruxa', 'Venís por los deseos perdidos, ¿verdad? Es cosa de la Santa Compaña.', "You've come about the lost wishes, haven't you? It's the work of the Santa Compaña.");
  await s.say('mateo', '¿La Santa qué?', 'The Santa what?');
  await s.say('maruxa', 'La Santa Compaña: una procesión de almas que camina de noche por el bosque, con velas. Quien la ve… pierde algo.', 'The Santa Compaña: a procession of souls that walks through the woods at night, with candles. Whoever sees it… loses something.');
  await s.say('maruxa', 'Esta vez la guía la Dama Gris. Y se lleva los deseos de todos.', "This time the Grey Lady is leading it. And it's taking everyone's wishes.");
  await s.say('bruno', 'Entonces la esperaremos en el bosque.', "Then we'll wait for it in the woods.");
  await s.say('maruxa', 'Para pararla necesitamos una queimada y un conxuro. Quiero que me traigáis tres cosas: orujo, un limón y café.', 'To stop it we need a queimada and a spell. I want you to bring me three things: orujo, a lemon and coffee.');
  await s.narrate('A queimada is a Galician fire drink: orujo (a strong spirit), sugar, lemon peel and coffee beans, set alight in a clay pot while someone recites a spell — the conxuro — to chase away evil spirits.');
  await s.narrate('“Quiero que me traigáis…” — I want you (all) to bring me: wanting someone else to do something takes the subjunctive.');
  s.flag('maruxa_met');
  s.refresh();
  await s.say('maruxa', 'Buscad en Santiago. Alguien tendrá lo que necesito.', 'Look in Santiago (you all). Someone will have what I need.');
});

const SPELL: [string, string][] = [
  ['¡Que se vaya la niebla!', 'May the fog go away!'],
  ['¡Que vuelvan los deseos!', 'May the wishes come back!'],
];

async function conxuro(s: Script) {
  await s.say('maruxa', '¡Lo tenéis todo! Ahora, el conxuro. Repetid conmigo… en español, para que lo entendáis.', 'You have everything! Now, the spell. Repeat after me (you all)… in Spanish, so that you understand it.');
  for (const [es, en] of SPELL) {
    const tokens = tokenize(es);
    const ch: Challenge = {
      key: `conxuro:${es}`,
      kind: 'order',
      label: 'Say the spell',
      prompt: en,
      promptLang: 'en',
      hint: '«¡Que…!» + subjunctive = may…!',
      tiles: [...tokens, 'va', 'vuelven'].sort(() => Math.random() - 0.5),
      solutions: [tokens],
      reveal: { es, en },
      note: 'A wish on its own starts with «que» and takes the subjunctive: ¡Que se vaya! ¡Que vuelvan!',
      difficulty: 1,
      maxBox: 0,
      isNew: false,
      fastMs: 25000,
      srs: false,
      speak: es,
    };
    for (;;) {
      const g = await s.challenge(ch, 'El conxuro');
      if (g !== 'wrong') break;
      await s.say('maruxa', 'No, no… Despacio. Con el subjuntivo.', 'No, no… Slowly. With the subjunctive.');
    }
    await s.say('hero', es, en);
  }
  s.flag('queimada');
  s.refresh();
  await s.narrate('Maruxa lights the queimada. Blue flames dance over the pot — and night falls over the fraga.', 'Las llamas azules bailan.');
  await s.say('maruxa', 'Ya es medianoche. Llevaré la queimada al cruceiro. ¡Venid!', "It's midnight now. I'll take the queimada to the stone cross. Come!");
  await s.narrate('The cruceiro stands in a clearing in the east of the woods. Wait there for the procession.');
  s.save();
}

script('casa_maruxa', async (s) => {
  await s.narrate('Maruxa’s house. Bunches of herbs hang drying from the windows.', 'La casa de Maruxa.');
});

script('horreo', async (s) => {
  await s.narrate('A hórreo: a granary on stone legs that keeps the corn safe from the rain and the mice. Galicia has thousands of them.', 'Un hórreo.');
});

script('cruceiro', async (s) => {
  await s.narrate('A cruceiro: a stone cross at a crossroads. In Galicia they say the Santa Compaña passes by them at night.', 'Un cruceiro.');
});

script('queimada', async (s) => {
  await s.narrate('Blue flames dance over the clay pot. It smells of coffee and lemon.', 'La queimada.');
});

// ------------------------------------------------------------- the procession
script('boss_compana', async (s) => {
  if (s.has('compana')) return;
  await s.narrate('Midnight. The rain has stopped. Between the trees, a line of candles moves slowly towards the cross.');
  await s.say('maruxa', '¡Ahí está! ¡La Santa Compaña! ¡Que nadie salga del círculo!', "There it is! The Santa Compaña! Let nobody leave the circle!");
  await s.narrate('Hooded figures, each carrying a candle. Where their faces should be, there is only grey.');
  await s.say('bruno', 'Esas almas… son los deseos que la Dama ha robado.', 'Those souls… they are the wishes the Lady has stolen.');
  const out = await s.battle({
    enemies: ['santa_compana'],
    bg: 'fraga',
    music: 'boss',
    canFlee: false,
    intro: { es: '¡La Santa Compaña os ataca!', en: 'The Santa Compaña attacks you (all)!' },
    tips: [
      {
        at: 'enemy',
        text: 'When the Santa Compaña <b>«se detiene… las velas tiemblan»</b> ⚠️ its Procession passes through everyone next turn: shield, defend or interrupt it. It keeps lighting more candles. <b>Light</b> and <b>fire</b> scatter the souls; shadow only feeds them.',
      },
    ],
  });
  if (out !== 'win') return;
  s.flag('compana');
  s.refresh();
  await s.narrate('The candles go out one by one. The hooded figures fade into the mist… and out of it, hundreds of little lights fly back towards Santiago: the wishes, going home.');
  await s.narrate('At the foot of the cross, a crystal is glowing.');
});

script('cristal_santiago', async (s) => {
  await s.narrate('Inside the crystal, a word is calling softly, like someone far from home: MORRIÑA.', 'Dentro del cristal llama una palabra: MORRIÑA.');
  await s.say('bruno', 'La Palabra Madre de Galicia…', "Galicia's Mother Word…");
  const g = await s.challenge(
    choiceChallenge(
      'La Palabra Madre',
      '«Tengo morriña.»',
      'What does it mean?',
      ['I miss home (a deep, sweet sadness)', 'I have a cold', 'I am very happy', 'I am hungry'],
      0,
      ['tener morriña', 'to be homesick, to long for home'],
      '«Morriña» is a Galician word now used all over Spain: homesickness, a sweet, sad longing for your land and your people — close to the Portuguese «saudade».',
    ),
    'MORRIÑA',
  );
  if (g === 'wrong') await s.say('maruxa', 'La morriña es echar de menos tu tierra. Duele… pero es un dolor dulce.', 'Morriña is missing your homeland. It hurts… but it’s a sweet pain.');
  s.flag('santiago_word');
  s.flag('santiago_done');
  s.heal();
  s.music('galicia');
  s.refresh();
  await s.narrate('The word rises like a sigh. All over Galicia, the grey lifts.', 'El gris desaparece.');
  // The Lady comes for Bruno.
  await s.narrate('Then the air turns cold. Footsteps on the wet moss. A woman made of grey pages steps out from behind the cross.');
  s.flag('dama_here');
  s.refresh();
  await s.say('dama', 'Hola, Bruno. Cuánto tiempo.', "Hello, Bruno. It's been a long time.");
  await s.say('bruno', 'Dama…', 'Lady…');
  await s.say('dama', '¿No tienes morriña? ¿De Salamanca? ¿De nuestras noches en la biblioteca? Yo sí.', "Don't you feel any morriña? For Salamanca? For our nights in the library? I do.");
  await s.say('bruno', 'No. Ya no. Ahora tengo amigos. Tengo palabras.', 'No. Not any more. Now I have friends. I have words.');
  await s.say('dama', 'Las palabras se olvidan, Bruno. Todas. Por eso las guardo en mi libro: para que nadie las pierda nunca.', "Words get forgotten, Bruno. All of them. That's why I keep them in my book: so that nobody ever loses them.");
  await s.say('lola', '¡Las palabras son para usarlas, no para guardarlas!', 'Words are for using, not for keeping!');
  await s.say('dama', 'Qué niña tan valiente. Pero Bruno viene conmigo. Me ayudará a terminar mi libro… quiera o no.', "What a brave girl. But Bruno is coming with me. He'll help me finish my book… whether he wants to or not.");
  await s.narrate('Grey pages swirl around Bruno like a storm. When they settle, he and the Lady are gone.');
  s.leave('bruno');
  s.flag('bruno_taken');
  s.refresh();
  await s.narrate('Her voice echoes through the trees:');
  await s.say('dama', 'Os espero en Salamanca, en mi biblioteca. Si os atrevéis.', "I'll be waiting for you in Salamanca, in my library. If you dare.");
  await s.say('mateo', '¡Bruno! ¡BRUNO!', 'Bruno! BRUNO!');
  await s.say('maruxa', 'Tranquilos. Ella quiere que vayáis. Pues id… pero id juntos.', 'Easy now. She wants you to go. So go (you all)… but go together.');
  await s.say('hero', 'Vamos a Salamanca. Y volveremos con Bruno.', "We're going to Salamanca. And we'll come back with Bruno.");
  s.save();
});
