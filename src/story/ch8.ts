// Chapter 8 — "El duende perdido". Seville in the heat: Lola's family sits
// still, waiting for someone to tell them what to do (the imperativo). The
// duende has been taken to the Alhambra, where everyone asks politely and
// imagines what they would do (the condicional).

import { script, type Script } from './script';
import { choiceChallenge } from './common';
import type { Challenge } from '../learn/challenges';

function pick(label: string, prompt: string, sub: string, options: string[], answer: string, reveal: [string, string], note: string): Challenge {
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return choiceChallenge(label, prompt, sub, shuffled, shuffled.indexOf(answer), reveal, note);
}

const gap = (label: string, prompt: string, sub: string, options: string[], answer: string, note: string) =>
  pick(label, prompt, sub, options, answer, [prompt.replace('___', answer), sub], note);

script('ch8_start', async (s) => {
  s.flag('ch8');
  await s.chapter(
    8,
    'El duende perdido',
    'The Lost Duende',
    'This chapter: telling people what to do — ¡baila!, ¡venid!, ¡dímelo! (imperativo) · asking nicely and imagining — ¿podrías…?, me gustaría…, yo iría… (condicional) · Andalusian words: patio, azulejo, abanico, feria.',
  );
  await s.narrate('The streets of Seville are empty. The orange trees are grey, and not a single guitar is playing.');
  await s.say('mateo', '¡Uf! No hay nadie en la calle.', "Phew! There's nobody in the street.");
  await s.say('lola', 'En verano, a la hora de la siesta, es normal. Pero ahora… es otra cosa.', "In summer, at siesta time, that's normal. But now… it's something else.");
  await s.say('lola', 'Mi casa está en Triana, al otro lado del río. ¡Vamos, rápido!', 'My house is in Triana, on the other side of the river. Come on, quick!');
});

script('casa_lola', async (s) => {
  s.flag('lola_home');
  await s.say('lola', '¡Mamá! ¡Abuelo! ¡Ya estoy en casa!', "Mum! Grandad! I'm home!");
  await s.narrate('In the tiled patio, among the flowerpots, Lola’s mother sits perfectly still. Her grandfather’s hands rest, empty, on his knees.');
  await s.say('rocio', 'Lola… hija… Qué alegría.', 'Lola… my girl… how lovely.');
  await s.say('rocio', 'Pero no sé qué hacer. Me levanto, me siento… y espero. Nadie me dice qué hacer.', "But I don't know what to do. I get up, I sit down… and I wait. Nobody tells me what to do.");
  await s.say('manolo', 'Me han robado la guitarra. Y sin guitarra, este viejo no sabe ni hablar.', "They've stolen my guitar. And without a guitar, this old man can't even talk.");
  await s.say('bruno', 'La Dama se ha llevado el duende. Sin duende, la gente no tiene ganas de nada.', "The Lady has taken the duende. Without duende, people don't feel like doing anything.");
  await s.say('mateo', '¿El duende? ¿Qué es eso?', "The duende? What's that?");
  await s.say('lola', 'Es difícil de explicar. Es lo que sientes cuando el flamenco te pone la piel de gallina.', "It's hard to explain. It's what you feel when flamenco gives you goosebumps.");
  await s.narrate('“Duende” is famous for being untranslatable: the dark, magical soul you feel in a great performance. The poet Federico García Lorca gave a whole lecture about it.');
  await s.say('lola', 'Mamá necesita órdenes. ¡Pues se las daremos!', "Mum needs orders. Well, we'll give them to her!");
  await s.lesson(
    'Nota de Lola: el imperativo',
    '<p>To tell someone what to do, use the <b>imperativo</b>.</p><p><b>tú</b>: take the él/ella form of the present: baila, come, escribe. <b>vosotros</b>: swap the final -r of the infinitive for <b>-d</b>: bailad, comed, escribid.</p><p>Eight very common verbs have a short irregular tú form: <b>ven</b> (venir), <b>di</b> (decir), <b>haz</b> (hacer), <b>pon</b> (poner), <b>sal</b> (salir), <b>sé</b> (ser), <b>ten</b> (tener), <b>ve</b> (ir).</p><p>Pronouns stick on the end: <i>levántate</i>, <i>dímelo</i> — that’s why an accent appears.</p>',
    [
      ['¡Baila, mamá!', 'Dance, Mum!'],
      ['¡Venid aquí, chicos!', 'Come here, you lot!'],
      ['Ven y escucha.', 'Come and listen.'],
    ],
  );
  s.refresh();
});

// ------------------------------------------------------------- Lola's family
const DANCE: { emoji: string; en: string; options: string[]; answer: string; done: string; note: string }[] = [
  {
    emoji: '🙌',
    en: 'Tell her: raise your arms!',
    options: ['¡Levanta los brazos!', '¡Levantas los brazos!', '¡Levantad los brazos!', '¡Levantó los brazos!'],
    answer: '¡Levanta los brazos!',
    done: 'Rocío raises her arms, slowly, like a flower opening.',
    note: 'One person, tú: levantar → ¡levanta! (levantad is for vosotros).',
  },
  {
    emoji: '👣',
    en: 'Tell her: come here!',
    options: ['¡Ven aquí!', '¡Vienes aquí!', '¡Venid aquí!', '¡Viniste aquí!'],
    answer: '¡Ven aquí!',
    done: 'Rocío steps into the middle of the patio.',
    note: 'Venir has a short irregular tú command: ¡ven!',
  },
  {
    emoji: '🔄',
    en: 'Tell her: turn around!',
    options: ['¡Da una vuelta!', '¡Das una vuelta!', '¡Dad una vuelta!', '¡Diste una vuelta!'],
    answer: '¡Da una vuelta!',
    done: 'Rocío turns, and her red dress spins around her.',
    note: 'dar → ¡da! (dar una vuelta = to turn around, to go for a stroll).',
  },
  {
    emoji: '💃',
    en: 'Tell her: dance!',
    options: ['¡Baila!', '¡Bailas!', '¡Bailad!', '¡Bailó!'],
    answer: '¡Baila!',
    done: 'Rocío dances a few steps of sevillanas.',
    note: 'bailar → ¡baila! Exclamation marks help: in Spanish a command usually gets ¡…!',
  },
];

script('rocio', async (s) => {
  if (s.has('sevilla_reward')) {
    await s.say('rocio', `Gracias, ${s.g.heroName}. Esta casa es vuestra casa.`, 'Thank you. This house is your house (all of you).');
    return;
  }
  if (s.has('sevilla_done')) return rocioReward(s);
  if (s.has('rocio_ok')) {
    if (s.has('guitarra')) await s.say('rocio', 'Mi padre tiene su guitarra. ¡Hablad con él!', 'My father has his guitar. Talk to him (you all)!');
    else await s.say('rocio', 'La guitarra está en los jardines del Alcázar, cerca de la catedral. ¡Id con cuidado!', 'The guitar is in the Alcázar gardens, near the cathedral. Be careful (you all)!');
    return;
  }
  await s.say('rocio', '¿Qué hago, hija? Dímelo tú.', 'What do I do, love? You tell me.');
  for (const step of DANCE) {
    for (;;) {
      const g = await s.challenge(
        pick('Tell Rocío what to do', step.emoji, step.en, step.options, step.answer, [step.answer, step.en.replace('Tell her: ', '')], step.note),
        'La madre de Lola',
      );
      if (g !== 'wrong') break;
      await s.say('lola', 'No, no… Mamá es una persona, y quiero que lo haga ahora.', 'No, no… Mum is one person, and I want her to do it now.');
    }
    await s.narrate(step.done);
  }
  await s.say('rocio', 'Bailo… pero sin duende. Me falta algo aquí dentro.', "I'm dancing… but without duende. Something is missing in here.");
  await s.say('rocio', 'Ahora recuerdo una cosa: anoche, en los jardines del Alcázar, vi a una mujer gris. Llevaba la guitarra de tu abuelo.', "Now I remember something: last night, in the Alcázar gardens, I saw a grey woman. She was carrying your grandad's guitar.");
  s.flag('rocio_ok');
  s.refresh();
  await s.say('lola', '¡Vamos al Alcázar! Está cerca de la catedral, al otro lado del río.', "Let's go to the Alcázar! It's near the cathedral, on the other side of the river.");
});

async function rocioReward(s: Script) {
  await s.narrate('The whole neighbourhood has gathered in the tiled patio. Abuelo Manolo plays, Rocío dances… and this time, everyone feels it.');
  await s.say('manolo', '¡Olé! ¡Eso es duende!', "Olé! That's duende!");
  await s.say('rocio', 'Lola, hija… baila conmigo.', 'Lola, my girl… dance with me.');
  await s.narrate('Lola and her mother dance sevillanas together. Mateo tries to clap along and gets it all wrong. Bruno smiles — a real smile.');
  await s.say('rocio', 'Toma, un clavel de nuestro patio. Así te acordarás de Triana.', "Here, a carnation from our patio. That way you'll remember Triana.");
  await s.give('clavel');
  s.flag('sevilla_reward');
  await s.say('lola', 'Mamá… tengo que irme otra vez. Quedan dos Palabras Madre.', 'Mum… I have to go again. There are two Mother Words left.');
  await s.say('rocio', 'Lo sé. Id con cuidado. Y llamadme, ¿eh? ¡Todos los días!', 'I know. Go carefully (you all). And call me, OK? Every day!');
  await s.say('mateo', 'Eso dice también la abuela Rosa.', "That's what Grandma Rosa says too.");
  await s.say('bruno', 'Ahora, al norte: a Santiago de Compostela. Creo que allí la Dama me espera a mí.', "Now north, to Santiago de Compostela. I think the Lady is waiting there — for me.");
  s.save();
}

script('manolo', async (s) => {
  if (s.has('sevilla_reward')) {
    await s.say('manolo', 'Toca, toca… ¡olé! Esta guitarra no se calla nunca más.', "Play, play… olé! This guitar will never go quiet again.");
    return;
  }
  if (s.has('granada_open')) {
    await s.say('manolo', 'La Alhambra está en lo alto de la colina, en Granada. ¡Suerte, chiquillos!', 'The Alhambra is at the top of the hill, in Granada. Good luck, kids!');
    return;
  }
  if (!s.has('guitarra')) {
    await s.say('manolo', 'Mi guitarra… sin ella no sé quién soy.', "My guitar… without it I don't know who I am.");
    return;
  }
  await s.say('manolo', '¡Mi guitarra! Gracias, chiquillos.', 'My guitar! Thank you, kids.');
  await s.narrate('He plays a few notes. The sound is beautiful… but sad, and grey.');
  await s.say('manolo', 'Sin duende, ni la guitarra suena bien. Escuchad una historia.', "Without duende, not even the guitar sounds right. Listen to a story (you all).");
  await s.say('manolo', 'Cuando yo era joven, toqué una noche en Granada, en la Alhambra, en el Patio de los Leones.', 'When I was young, I played one night in Granada, in the Alhambra, in the Court of the Lions.');
  await s.say('manolo', 'Allí, el agua de la fuente cantaba. Allí vive el duende de Andalucía.', "There, the water in the fountain used to sing. That's where the duende of Andalusia lives.");
  await s.say('bruno', 'Entonces la Dama ha llevado el duende a la Alhambra.', 'Then the Lady has taken the duende to the Alhambra.');
  await s.say('manolo', 'Id a Granada en el tren. Y… ¿me haríais un favor?', 'Go to Granada on the train (you all). And… would you do me a favour?');
  await s.say('manolo', 'Traedme el duende. Me gustaría tocar con duende una vez más.', "Bring me back the duende. I'd love to play with duende one more time.");
  await s.narrate('“¿Me haríais un favor?”, “me gustaría…” — the condicional, the polite way to ask. You’ll hear a lot of it in Granada.');
  s.flag('granada_open');
  s.refresh();
  s.save();
});

script('gate_alcazar', async (s) => {
  await s.narrate('The gate to the Alcázar gardens is shut. A sign hangs on it: «Cerrado por calor».', 'Cerrado por calor.');
  await s.say('lola', 'Primero, a mi casa. Está en Triana, al otro lado del puente.', "First, my house. It's in Triana, across the bridge.");
});

script('guitarra', async (s) => {
  if (!s.has('alcazar_fight')) {
    await s.narrate('In the pavilion, an old guitar lies on the tiles. Two Erasers are rubbing out its strings!');
    const out = await s.battle({ enemies: ['borrador', 'castanuela', 'borrador'], bg: 'alcazar', canFlee: false });
    if (out !== 'win') return;
    s.flag('alcazar_fight');
  }
  s.flag('guitarra');
  s.refresh();
  await s.narrate('You pick up Abuelo Manolo’s guitar. Its strings are grey… but they still hum when you touch them.', 'La guitarra del abuelo.');
  await s.say('lola', '¡La guitarra del abuelo! ¡Vamos a casa!', "Grandad's guitar! Let's go home!");
});

script('carmela', async (s) => {
  if (!s.has('carmela_quiz')) {
    await s.say('carmela', '¡Bienvenidos al bar! Con este calor, ¿qué os pongo?', 'Welcome to the bar! In this heat, what can I get you?');
    const ok = await s.quiz('carmela', 'En Granada, si pides una bebida, ¿qué te dan gratis?', 'In Granada, if you order a drink, what do they give you for free?', [
      ['Una tapa.', 'A tapa (a little plate of food).'],
      ['Un postre.', 'A dessert.'],
      ['Una flor.', 'A flower.'],
    ], 0);
    s.flag('carmela_quiz');
    if (ok) {
      await s.say('carmela', '¡Eso es! Una tapa con cada caña. Y aquí, en mi bar, también. Toma.', "That's it! A tapa with every beer. And here, in my bar, too. Here you go.");
      await s.give('jamon', 1);
    } else {
      await s.say('carmela', 'No: ¡una tapa! En Granada, cada bebida lleva su tapa.', 'No: a tapa! In Granada, every drink comes with its tapa.');
    }
  }
  await s.shop('carmela', ['gazpacho', 'jamon', 'queso_manchego', 'horchata', 'farton', 'te', 'cafe', 'pluma']);
});

script('curro', async (s) => {
  if (s.has('curro_ok')) {
    await s.say('curro', '¡Ya estamos todos! ¡Viva el Betis!', "We're all here now! Up with Betis!");
    return;
  }
  await s.say('curro', 'Quiero jugar al fútbol, pero mis amigos no salen de casa. ¿Cómo los llamo?', "I want to play football, but my friends won't come out of their houses. How do I call them?");
  const g = await s.challenge(
    pick(
      'Help Curro call his friends',
      '👦👧👦 → ⚽',
      'Call all your friends out to play.',
      ['¡Salid a jugar!', '¡Sal a jugar!', '¡Salís a jugar!', '¡Salieron a jugar!'],
      '¡Salid a jugar!',
      ['¡Salid a jugar!', 'Come out and play! (you all)'],
      'Several friends → vosotros: salir → ¡salid! (¡sal! is for just one friend).',
    ),
    'Curro',
  );
  if (g === 'wrong') {
    await s.say('curro', 'Mmm, no salen. ¡Son muchos amigos, no uno!', "Hmm, they're not coming out. It's lots of friends, not just one!");
    return;
  }
  s.flag('curro_ok');
  s.refresh();
  await s.narrate('Doors open all along the street. Children pour out with a ball.');
  await s.say('curro', '¡Gracias! Toma, mi paga de la semana.', "Thanks! Here, my pocket money for the week.");
  await s.gain(100);
});

script('giralda', async (s) => {
  await s.narrate('La Giralda, the bell tower of Seville Cathedral. It began as a minaret over 800 years ago. Inside there are no stairs but 35 ramps, wide enough for a horse.', 'La Giralda.');
});

script('catedral_sevilla', async (s) => {
  await s.narrate('Seville Cathedral, one of the biggest churches in the world. Closed at this hour.', 'La catedral está cerrada.');
});

script('hostal_sevilla', async (s) => {
  await s.say('hostalera', '¡Pasad, pasad! Aquí dentro hace fresquito.', "Come in, come in! It's nice and cool in here.");
  await s.inn('hostalera', 40);
});

// ------------------------------------------------------------- Granada
script('granada_start', async (s) => {
  s.flag('granada_seen');
  await s.narrate('Above the white houses of the Albaicín, the Alhambra glows red on its hill… but tonight its lights are grey.');
  await s.say('bruno', 'Hace cuarenta años, vine aquí con la Dama. Ella buscaba algo… y yo la ayudé.', 'Forty years ago, I came here with the Lady. She was looking for something… and I helped her.');
  await s.say('lola', 'Bruno… ¿tú la ayudaste?', 'Bruno… you helped her?');
  await s.say('bruno', 'Sí. Y me arrepentiré toda la vida. Por eso tengo que arreglarlo.', "Yes. And I'll regret it all my life. That's why I have to put it right.");
  await s.lesson(
    'Nota de Bruno: el condicional',
    '<p>The <b>condicional</b> is “would”: what you <i>would</i> do. Same stems as the future, with the endings <b>-ía, -ías, -ía, -íamos, -íais, -ían</b>.</p><p>hablar → hablar<b>ía</b> · hacer → <b>har</b>ía · poder → <b>podr</b>ía · tener → <b>tendr</b>ía · decir → <b>dir</b>ía · querer → <b>querr</b>ía</p><p>Spaniards use it all the time to be polite — <b>¿Podrías…?</b> (could you…?), <b>Me gustaría…</b> (I would like…) — and to give advice: <b>Yo en tu lugar, iría…</b> (if I were you, I would go…).</p>',
    [
      ['¿Podrías abrir la puerta?', 'Could you open the door?'],
      ['Me gustaría ver la Alhambra.', "I'd like to see the Alhambra."],
      ['Yo en tu lugar, no iría solo.', "If I were you, I wouldn't go alone."],
    ],
  );
  await s.say('mateo', 'La Alhambra está arriba, en la colina. ¡Vamos!', "The Alhambra is up there, on the hill. Let's go!");
});

script('guia', async (s) => {
  if (s.has('entradas')) {
    await s.say('guia', 'Disfrutad de la visita. ¡Y cuidado con el león!', 'Enjoy (you all) the visit. And watch out for the lion!');
    return;
  }
  await s.say('guia', 'Lo siento, la Alhambra está cerrada. Hay… un problema con un león.', "Sorry, the Alhambra is closed. There's… a problem with a lion.");
  const ok = await s.quiz('guia', '¿Qué queréis?', 'What do you (all) want?', [
    ['¡Déjanos entrar ahora!', 'Let us in now!'],
    ['¿Podríamos entrar, por favor? Nos gustaría ayudar.', 'Could we come in, please? We would like to help.'],
    ['¿Pudimos entrar ayer?', 'Were we able to come in yesterday?'],
  ], 1);
  if (!ok) {
    await s.say('guia', '¡Uy, qué maneras! Así no se pide. Probad otra vez, con más educación.', "Whoa, what manners! That's not how you ask. Try again (you all), more politely.");
    return;
  }
  s.flag('entradas');
  s.refresh();
  await s.say('guia', 'Qué educados… Está bien: aquí tenéis las entradas. Pero si veis al león, ¡corred!', "How polite… All right: here are your tickets. But if you see the lion, run!");
});

script('jardinero', async (s) => {
  if (s.has('jardinero_ok')) {
    await s.say('jardinero', 'Riego mis rosales todos los días. ¡Gracias por la idea!', 'I water my roses every day. Thanks for the idea!');
    return;
  }
  await s.say('jardinero', 'Soy el jardinero del Generalife. Mis rosales están grises y no sé qué hacer.', "I'm the gardener of the Generalife. My rose bushes have gone grey and I don't know what to do.");
  const ok = await s.quiz('jardinero', '¿Qué harías tú en mi lugar?', 'What would you do in my place?', [
    ['Yo los regué ayer.', 'I watered them yesterday.'],
    ['Yo los regaría con el agua de la Alhambra.', 'I would water them with the Alhambra’s water.'],
    ['Yo los riego.', 'I water them.'],
  ], 1);
  if (!ok) {
    await s.say('jardinero', 'No, no: te pregunto qué harías tú. Piensa en «haría», «iría»…', "No, no: I'm asking what you would do. Think of “haría”, “iría”…");
    return;
  }
  s.flag('jardinero_ok');
  s.refresh();
  await s.say('jardinero', '¡Buena idea! Lo haré ahora mismo. Toma, para el calor.', "Good idea! I'll do it right now. Here, for the heat.");
  await s.give('gazpacho', 1);
});

script('mirador', async (s) => {
  await s.narrate('The Mirador de San Nicolás. Across the valley, the Alhambra fills the sky, with the snowy Sierra Nevada behind it.', 'El mirador de San Nicolás.');
});

// ------------------------------------------------------------- the Alhambra
script('fantasma', async (s) => {
  if (s.has('sevilla_word')) {
    await s.say('fantasma', 'Mis versos vivirán en estas paredes mil años más. Gracias.', 'My verses will live on these walls for a thousand more years. Thank you.');
    return;
  }
  if (s.has('puerta2')) {
    await s.say('fantasma', 'El león os espera. Yo, en vuestro lugar, iría con mucho cuidado.', "The lion is waiting for you. If I were you, I would go very carefully.");
    return;
  }
  if (s.has('puerta1')) {
    await s.say('fantasma', 'Una puerta más. Después, el Patio de los Leones.', 'One more door. After it, the Court of the Lions.');
    return;
  }
  await s.say('fantasma', 'No tengáis miedo. Soy un poeta. Hace seiscientos años, escribí versos en estas paredes.', "Don't be afraid. I am a poet. Six hundred years ago, I wrote verses on these walls.");
  await s.say('fantasma', 'La Dama borró mis versos, y sin ellos las puertas no se abren. ¿Me ayudaríais a recordarlos?', "The Lady erased my verses, and without them the doors won't open. Would you help me remember them?");
  await s.narrate('The walls of the Alhambra really are covered in poems, carved into the plaster six centuries ago.');
});

const VERSES: Record<string, { gap: [string, string]; options: string[]; answer: string; note: string }> = {
  '1': {
    gap: ['Yo, en tu lugar, ___ (mirar) el agua en silencio.', 'If I were you, I would look at the water in silence.'],
    options: ['miraría', 'miro', 'miré', 'miraba'],
    answer: 'miraría',
    note: 'Advice with “yo en tu lugar” takes the condicional: mirar + -ía = miraría.',
  },
  '2': {
    gap: ['Aquí, el tiempo no ___ (tener) fin.', 'Here, time would have no end.'],
    options: ['tendría', 'tenía', 'tiene', 'tuvo'],
    answer: 'tendría',
    note: 'Tener is irregular, like in the future: tendré → tendría.',
  },
};

script('puerta_alhambra', async (s) => {
  const n = s.args[0];
  const v = VERSES[n];
  await s.narrate('Above the arch, a line of the poem has been rubbed out. Only a few words are left:', 'Un verso borrado.');
  const g = await s.challenge(gap('Restore the poet’s verse', v.gap[0], v.gap[1], v.options, v.answer, v.note), 'El verso');
  if (g === 'wrong') {
    await s.say('fantasma', 'No… así no era mi verso. Pensad: ¿qué pasaría?', 'No… my verse wasn’t like that. Think (you all): what would happen?');
    return;
  }
  s.flag(`puerta${n}`);
  s.refresh();
  await s.narrate('The verse glows in golden letters across the arch, and the door swings open.');
});

script('fuente_leones', async (s) => {
  if (s.has('leon')) await s.narrate('Twelve stone lions hold up the basin again, and the water sings.', 'La fuente canta.');
  else await s.narrate('The Fountain of the Lions: stone lions holding up a basin. One of them is missing…', 'Falta un león.');
});

script('boss_leon', async (s) => {
  if (s.has('leon')) return;
  await s.narrate('In the Court of the Lions, the water has stopped. One of the lions has climbed down from the fountain.');
  await s.say('bruno', 'La página gris está en su lomo. Como en Valencia.', "The grey page is on its back. Like in Valencia.");
  await s.say('lola', 'Ese duende es de mi familia. ¡Devuélvemelo!', 'That duende belongs to my family. Give it back to me!');
  await s.narrate('“¡Devuélvemelo!” = give it back to me: devuelve + me + lo. Pronouns stick to the end of a command.');
  const out = await s.battle({
    enemies: ['leon_piedra'],
    bg: 'alhambra',
    music: 'boss',
    canFlee: false,
    intro: { es: '¡El León de Piedra os ataca!', en: 'The Stone Lion attacks you (all)!' },
    tips: [
      {
        at: 'enemy',
        text: 'When the Lion <b>«se agazapa»</b> ⚠️ its Great Pounce hits everyone next turn: shield, defend or interrupt it (Bruno’s <b>Silencio</b>, Lola’s <b>Saeta</b>, Mateo’s <b>Ancla</b>). It’s stone: <b>water</b> and <b>lightning</b> crack it; fire and fists barely scratch it.',
      },
    ],
  });
  if (out !== 'win') return;
  s.flag('leon');
  s.refresh();
  await s.narrate('The lion freezes mid-roar, climbs back onto the fountain and turns to stone once more. The grey page drifts into the water and dissolves.');
  await s.narrate('The fountain begins to sing again. Beside it, a crystal is glowing.');
});

script('cristal_granada', async (s) => {
  await s.narrate('Inside the crystal, a word flickers like a candle in the wind: DUENDE.', 'Dentro del cristal tiembla una palabra: DUENDE.');
  await s.say('bruno', 'La Palabra Madre de Andalucía. Ten cuidado: tiene dos caras.', "Andalusia's Mother Word. Careful: it has two faces.");
  const g = await s.challenge(
    choiceChallenge(
      'La Palabra Madre',
      '«Esa cantaora tiene duende.»',
      'What does it mean?',
      ['That singer has a magical, moving soul', 'That singer has a goblin', 'That singer has a cold', 'That singer has a lot of money'],
      0,
      ['tener duende', 'to have that magical, moving soul'],
      'In fairy tales, a «duende» is a goblin or an elf. But in flamenco, «tener duende» is the highest praise: a mysterious power that moves everyone who hears it.',
    ),
    'DUENDE',
  );
  if (g === 'wrong') await s.say('lola', 'Un duende de cuento es un monstruito. Pero tener duende… eso es otra cosa. Es magia.', "A fairy-tale duende is a little goblin. But having duende… that's something else. It's magic.");
  s.flag('sevilla_word');
  s.flag('sevilla_done');
  s.heal();
  s.music('alhambra');
  s.refresh();
  await s.narrate('The word rises into the night. Far away, in Seville, a guitar starts to play — and this time, it has duende.', 'En Sevilla suena una guitarra.');
  await s.narrate('In your bag, the Grimorio grows warm: another page fills with ink.');
  await s.say('lola', '¡Vamos a casa! ¡Mi familia nos espera!', "Let's go home! My family is waiting for us!");
  s.save();
});
