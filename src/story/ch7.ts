// Chapter 7 — "Las Fallas sin fuego". Valencia on the night of the cremà:
// the fire won't light, the firecrackers won't bang, and nobody can talk
// about tomorrow. Giving the city back its future: the futuro simple.

import { script, type Script } from './script';
import { choiceChallenge } from './common';
import { tokenize } from '../data/text';
import type { Challenge } from '../learn/challenges';

function futureGap(label: string, prompt: string, sub: string, options: string[], answer: string, note: string): Challenge {
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return choiceChallenge(label, prompt, sub, shuffled, shuffled.indexOf(answer), [prompt.replace('___', answer), sub], note);
}

script('ch7_start', async (s) => {
  s.flag('ch7');
  await s.chapter(
    7,
    'Las Fallas sin fuego',
    'The Fallas Without Fire',
    'This chapter: talking about the future — mañana quemaremos la falla (futuro simple) · irregular futures: haré, tendré, podré, sabré · Fallas words: falla, ninot, petardo, humo, ceniza.',
  );
  await s.narrate('The station is dressed up for the Fallas: paper flowers, flags, posters of giant ninots. But the colours are grey, and nobody is laughing.');
  await s.say('vicenta', '¡Hola! ¿Sois los Palabristas? Soy Vicenta, la fallera mayor.', "Hi! Are you the Palabristas? I'm Vicenta, the fallera mayor — the queen of the Fallas.");
  await s.say('vicenta', 'Bienvenidos a las Fallas más tristes de la historia.', 'Welcome to the saddest Fallas in history.');
  await s.say('lola', '¿Qué ha pasado?', 'What has happened?');
  await s.say('vicenta', 'Esta noche es la cremà: la noche en que quemamos las fallas. Pero los petardos no explotan y el fuego no prende.', "Tonight is the cremà: the night we burn the fallas. But the firecrackers won't go off and the fire won't light.");
  await s.say('vicenta', 'Y hay algo peor: nadie sabe hablar del mañana. Pregunto «¿qué haréis mañana?» y la gente solo dice «hoy, hoy, hoy».', 'And there\'s something worse: nobody can talk about tomorrow. I ask “what will you do tomorrow?” and people just say “today, today, today”.');
  await s.say('bruno', 'La Dama se ha llevado la Palabra Madre de Valencia. Sin ella, no hay fiesta… ni futuro.', "The Lady has taken Valencia's Mother Word. Without it, there's no festival… and no future.");
  await s.say('mateo', 'Pues nosotros devolveremos el futuro. ¡Lo haremos!', "Well, we'll bring the future back. We'll do it!");
  await s.lesson(
    'Nota de Vicenta: el futuro',
    '<p>To say what <b>will</b> happen, Spanish adds endings to the whole infinitive: <b>-é, -ás, -á, -emos, -éis, -án</b> — the same for -ar, -er and -ir verbs.</p><p>quemar → quemar<b>é</b>, quemar<b>ás</b>, quemar<b>á</b>, quemar<b>emos</b>, quemar<b>éis</b>, quemar<b>án</b></p><p>A few verbs change their stem: hacer → <b>har</b>é, tener → <b>tendr</b>é, poder → <b>podr</b>é, salir → <b>saldr</b>é, decir → <b>dir</b>é, saber → <b>sabr</b>é, venir → <b>vendr</b>é, haber → <b>habr</b>á.</p><p>In everyday talk, <i>ir a + infinitive</i> (vamos a quemar) is just as common. The futuro sounds more certain — or more solemn.</p>',
    [
      ['Mañana quemaremos la falla.', 'Tomorrow we will burn the falla.'],
      ['¿Qué haréis esta noche?', 'What will you (all) do tonight?'],
      ['Habrá fuegos artificiales.', 'There will be fireworks.'],
    ],
  );
  await s.say('vicenta', 'Pepet, el pirotécnico, está en la plaza, junto a la mascletà. Él sabrá qué hacer.', "Pepet, the fireworks master, is in the square, by the mascletà. He'll know what to do.");
  await s.narrate('“Sabrá” — he will know. Saber is irregular in the future: sabré, sabrás, sabrá…');
});

script('vicenta', async (s) => {
  if (s.has('valencia_reward')) {
    await s.say('vicenta', 'El año que viene volveréis a las Fallas, ¿verdad? ¡Os esperaremos!', "Next year you'll come back to the Fallas, won't you? We'll be waiting for you!");
    return;
  }
  if (s.has('valencia_word')) return vicentaReward(s);
  if (s.has('gran_falla')) {
    await s.say('vicenta', 'Mirad, ¡allí, entre las cenizas! Algo brilla.', 'Look (you all), there, in the ashes! Something is shining.');
    return;
  }
  if (s.has('chispa')) {
    await s.say('vicenta', 'Ha llegado la noche. Acercaos a la falla con la Chispa.', 'Night has come. Go up to the falla (you all) with the Spark.');
    return;
  }
  if (s.has('pepet_met')) {
    await s.say('vicenta', 'Ximo vive en la huerta, al este de la ciudad. ¡Daos prisa! La cremà es esta noche.', 'Ximo lives in the huerta, east of the city. Hurry (you all)! The cremà is tonight.');
    return;
  }
  await s.say('vicenta', 'Pepet está junto a la mascletà, en la plaza. Él os dirá qué hacer.', "Pepet is by the mascletà, in the square. He'll tell you (all) what to do.");
});

async function vicentaReward(s: Script) {
  await s.say('vicenta', '¡Lo habéis conseguido! En Valencia, cuando hay fiesta, tiramos la casa por la ventana. ¡Y hoy hay fiesta!', "You've done it! In Valencia, when there's a festival, we “throw the house out of the window”. And today there's a festival!");
  await s.narrate('“Tirar la casa por la ventana” = to go all out, to spare no expense.');
  await s.say('vicenta', 'Tomad mi mantón de Manila, de parte de todas las falleras.', 'Take (you all) my Manila shawl, from all the falleras.');
  await s.give('manton');
  s.flag('valencia_reward');
  await s.say('lola', 'Voy a llamar a mi madre… ¿Mamá? ¿Mamá? …No contesta.', "I'm going to call my mum… Mum? Mum? …She isn't answering.");
  await s.say('bruno', 'Sevilla. La Dama ya está allí, estoy seguro.', "Seville. The Lady is already there, I'm sure.");
  await s.say('lola', '¡Al tren! ¡Ahora mismo!', 'To the train! Right now!');
  s.save();
}

// ------------------------------------------------------------- the square
script('pepet', async (s) => {
  if (s.has('gran_falla')) {
    await s.say('pepet', '¡Qué pasada de cremà! Treinta años de pirotécnico y nunca he visto nada igual.', "What an amazing cremà! Thirty years as a fireworks master and I've never seen anything like it.");
    return;
  }
  if (s.has('chispa')) {
    await s.say('pepet', '¿Tenéis la Chispa? ¡Pues a la falla! Pero con cuidado…', 'You (all) have the Spark? Then to the falla! But carefully…');
    return;
  }
  if (s.has('pepet_met')) {
    await s.say('pepet', 'El taller de Ximo está en la huerta, al este. ¡Traed la Chispa!', "Ximo's workshop is in the huerta, to the east. Bring (you all) the Spark!");
    return;
  }
  await s.say('pepet', '¡Quietos! Más vale prevenir que curar: no os acerquéis a la pólvora.', "Stop right there! Better safe than sorry: don't get close (you all) to the gunpowder.");
  await s.narrate('“Más vale prevenir que curar” — literally “better to prevent than to cure”: better safe than sorry.');
  await s.say('pepet', 'Llevo treinta años haciendo mascletàs. Y hoy, nada. La pólvora está gris.', "I've been making mascletàs for thirty years. And today, nothing. The gunpowder has gone grey.");
  await s.say('pepet', 'Cada año, la primera chispa de las Fallas sale del taller de Ximo, el artista fallero. La llamamos «la Chispa».', 'Every year, the first spark of the Fallas comes from the workshop of Ximo, the falla artist. We call it “the Spark”.');
  await s.say('pepet', 'Pero Ximo no sale de su taller desde hace dos días. Está en la huerta, al este de la ciudad.', "But Ximo hasn't come out of his workshop for two days. It's in the huerta, east of the city.");
  const ok = await s.quiz('pepet', '¿Iréis a buscarlo?', 'Will you (all) go and find him?', [
    ['Sí, fuimos ayer.', 'Yes, we went yesterday.'],
    ['Sí, iremos ahora mismo.', "Yes, we'll go right now."],
    ['Sí, íbamos.', 'Yes, we were going.'],
  ], 1);
  if (ok) await s.say('pepet', '«Iremos»… ¡Qué bonito suena el futuro! Hacía días que no lo oía.', "“We'll go”… How lovely the future sounds! I hadn't heard it for days.");
  else await s.say('pepet', '¿Ayer? No, no: hablo de mañana… de ahora. «Iremos».', "Yesterday? No, no: I'm talking about tomorrow… about now. “Iremos”.");
  s.flag('pepet_met');
  s.refresh();
  await s.say('pepet', 'Tomad. Y si veis petardos vivos, ¡agua! Es lo único que les da miedo.', "Here (you all). And if you see living firecrackers: water! It's the only thing they're afraid of.");
  await s.give('cafe', 2);
});

script('block_huerta', async (s) => {
  await s.say('vicenta', 'Esperad: primero hablad con Pepet, en la plaza. Él os dirá adónde ir.', "Wait (you all): talk to Pepet first, in the square. He'll tell you where to go.");
});

script('mascleta', async (s) => {
  if (s.has('valencia_done')) {
    await s.narrate('Every day at two o’clock, the mascletà shakes the whole square: not fireworks to look at, but thunder you feel in your chest.', 'La mascletà.');
    return;
  }
  await s.narrate('Strings of firecrackers hang from a rope, grey and silent.', 'Los petardos no explotan.');
});

script('ayuntamiento', async (s) => {
  await s.narrate('Valencia’s City Hall. From its balcony, the fallera mayor gives the order for the mascletà every day at two.', 'El Ayuntamiento de Valencia.');
});

script('hostal', async (s) => {
  await s.say('hostalera', '¡Bienvenidos! Con las Fallas, la ciudad está a tope… pero os queda una habitación.', "Welcome! With the Fallas, the city is packed… but there's one room left for you.");
  await s.narrate('“Estar a tope” = to be packed, full on, flat out.');
  await s.inn('hostalera', 35);
});

script('horchatera', async (s) => {
  if (!s.has('horchatera_quiz')) {
    await s.say('horchatera', '¡Horchata fresquita! ¿Sabéis de qué se hace?', 'Ice-cold horchata! Do you (all) know what it’s made from?');
    const ok = await s.quiz('horchatera', '¿De qué se hace la horchata?', 'What is horchata made from?', [
      ['De arroz.', 'Rice.'],
      ['De almendras.', 'Almonds.'],
      ['De chufa.', 'Tiger nuts.'],
    ], 2);
    s.flag('horchatera_quiz');
    if (ok) {
      await s.say('horchatera', '¡Eso es! De chufa, que crece aquí, en la huerta. Tomad, unos fartons para mojar.', "That's it! Tiger nuts, which grow right here in the huerta. Here, some fartons to dip.");
      await s.give('farton', 2);
    } else {
      await s.say('horchatera', 'No: la de aquí es de chufa, un tubérculo pequeñito de la huerta.', 'No: ours is made from tiger nuts, a tiny tuber from the huerta.');
    }
  }
  await s.shop('horchatera', ['horchata', 'farton', 'bunuelos', 'paella', 'pisto', 'te', 'cafe', 'pluma']);
});

script('adivina', async (s) => {
  if (s.has('adivina_ok')) {
    await s.say('adivina', 'Las cartas no mienten, cariño. Nos veremos… en una biblioteca muy antigua.', "The cards don't lie, love. We'll meet again… in a very old library.");
    return;
  }
  await s.say('adivina', 'Acércate, acércate. Te leeré el futuro.', "Come closer, come closer. I'll read your future.");
  await s.say('adivina', 'Veo un tren. Viajarás al sur, a una ciudad con mucho calor.', "I see a train. You'll travel south, to a very hot city.");
  await s.say('adivina', 'Veo un león de piedra… y una dama gris en una biblioteca.', 'I see a stone lion… and a grey lady in a library.');
  await s.say('adivina', 'Y veo que tú…', 'And I see that you…');
  const g = await s.challenge(
    futureGap(
      'Finish the prophecy',
      'Tú ___ (encontrar) a la Dama Gris.',
      'You will find the Grey Lady.',
      ['encontrarás', 'encontraste', 'encuentras', 'encontrabas'],
      'encontrarás',
      'A prophecy is pure future: encontrar → encontrarás.',
    ),
    'La adivina',
  );
  s.flag('adivina_ok');
  if (g !== 'wrong') {
    await s.say('adivina', 'Exacto: «encontrarás». El futuro no se puede borrar… si lo dices en voz alta.', "Exactly: “you will find”. The future can't be erased… if you say it out loud.");
    await s.gain(80);
  } else {
    await s.say('adivina', 'No, no… el futuro, cariño: «encontrarás».', 'No, no… the future, love: “encontrarás”.');
  }
});

script('director', async (s) => {
  if (s.has('banda_ok')) {
    await s.say('director', '¡La banda ya recuerda las canciones! ¡Tararí, tararí!', 'The band remembers the songs again! Ta-ra-ri, ta-ra-ri!');
    return;
  }
  await s.say('director', 'Soy el director de la banda. Sin la Palabra Madre, mis músicos no recuerdan qué tocarán esta noche.', "I'm the band leader. Without the Mother Word, my musicians can't remember what they'll play tonight.");
  await s.say('director', 'Una banda de música sin música… ¡qué tristeza!', 'A band with no music… how sad!');
  const tokens = tokenize('Esta noche tocaremos un pasodoble.');
  const ch: Challenge = {
    key: 'banda:pasodoble',
    kind: 'order',
    label: 'Remind the band what they will play',
    prompt: 'Tonight we will play a pasodoble.',
    promptLang: 'en',
    hint: 'tocar → tocaremos (we will play)',
    tiles: [...tokens, 'tocamos', 'ayer'].sort(() => Math.random() - 0.5),
    solutions: [tokens],
    reveal: { es: 'Esta noche tocaremos un pasodoble.', en: 'Tonight we will play a pasodoble.' },
    note: 'The pasodoble is the brass-band march of every Spanish fiesta.',
    difficulty: 1,
    maxBox: 0,
    isNew: false,
    fastMs: 25000,
    srs: false,
    speak: 'Esta noche tocaremos un pasodoble.',
  };
  const g = await s.challenge(ch, 'La banda');
  if (g === 'wrong') {
    await s.say('director', 'Mmm… no. Mis músicos se miran sin entender nada.', "Hmm… no. My musicians look at each other, completely lost.");
    return;
  }
  s.flag('banda_ok');
  s.refresh();
  s.music('valencia');
  await s.say('director', '¡Eso es! ¡Esta noche tocaremos! ¡Tararí, tararí!', "That's it! Tonight we'll play! Ta-ra-ri, ta-ra-ri!");
  await s.gain(150);
});

// ------------------------------------------------------------- the huerta
script('barraca', async (s) => {
  await s.narrate('A barraca: the traditional farmhouse of the huerta, with white walls and a steep thatched roof.', 'Una barraca.');
});

script('tio_vicent', async (s) => {
  if (s.has('paella_ok')) {
    if (s.has('valencia_done')) await s.say('tio_vicent', '¡El fuego ha vuelto! Esta paella estará buenísima.', "The fire is back! This paella will be delicious.");
    else await s.say('tio_vicent', 'Cuando vuelva el fuego, haré la mejor paella de la huerta.', "When the fire comes back, I'll make the best paella in the huerta.");
    return;
  }
  await s.say('tio_vicent', 'Soy Vicent. Llevo sesenta años haciendo paella… y hoy el fuego no prende.', "I'm Vicent. I've been making paella for sixty years… and today the fire won't light.");
  await s.say('tio_vicent', 'Por lo menos recuerdo la receta. ¿O no? A ver, ayudadme.', "At least I remember the recipe. Or do I? Come on, help me (you all).");
  const options = ['chorizo', 'pollo', 'conejo', 'judías verdes'].sort(() => Math.random() - 0.5);
  const g = await s.challenge(
    choiceChallenge(
      'La receta de Tío Vicent',
      '¿Qué ingrediente NO lleva la paella valenciana?',
      'Which ingredient does NOT go in a Valencian paella?',
      options,
      options.indexOf('chorizo'),
      ['el chorizo', 'chorizo (spicy sausage)'],
      'The real recipe: rice, chicken, rabbit, green beans, garrofó (big white beans), tomato, olive oil and saffron. Chorizo in a paella is a famous joke — and Valencians take it very seriously!',
    ),
    'La receta',
  );
  if (g === 'wrong') {
    await s.say('tio_vicent', '¿¡Cómo!? ¡Eso sí lleva! Piensa otra vez…', "What?! That one does go in! Think again…");
    return;
  }
  s.flag('paella_ok');
  s.refresh();
  await s.say('tio_vicent', '¡Chorizo! ¡Nunca! Eso es arroz con cosas, no una paella. Ja, ja.', "Chorizo! Never! That's rice with stuff, not a paella. Ha ha.");
  await s.say('tio_vicent', 'Y una cosa más: en valenciano, «paella» significa «sartén». La paella es la sartén.', 'And one more thing: in Valencian, “paella” means “frying pan”. The paella is the pan.');
  await s.give('paella', 2);
});

script('gate_taller', async (s) => {
  await s.narrate('A big workshop with a locked door. Inside, something is moving.', 'El taller de Ximo.');
  await s.say('ximo', '¿Quién es? ¡No abro a nadie! Los ninots… están vivos.', "Who is it? I'm not opening for anyone! The ninots… they're alive.");
  await s.say('bruno', 'Somos amigos. Venimos a ayudarte.', "We're friends. We've come to help you.");
  await s.say('ximo', 'Si sois amigos, decidme: ¿qué haremos mañana por la noche?', "If you're friends, tell me (you all): what will we do tomorrow night?");
  const g = await s.challenge(
    futureGap(
      'Answer through the door',
      'Mañana por la noche, nosotros ___ (quemar) la falla.',
      'Tomorrow night, we will burn the falla.',
      ['quemaremos', 'quemamos', 'quemábamos', 'hemos quemado'],
      'quemaremos',
      'Tomorrow → future: quemar + -emos = quemaremos.',
    ),
    'La puerta del taller',
  );
  if (g === 'wrong') {
    await s.say('ximo', '¡No! ¡Eso es lo que diría un ninot! Hablad del mañana.', "No! That's what a ninot would say! Talk about tomorrow.");
    return;
  }
  s.flag('gate_taller');
  s.refresh();
  await s.narrate('Click. The door opens a crack… and you hear Ximo running back inside.');
});

// ------------------------------------------------------------- the workshop
const NINOT_PUZZLES: Record<string, { past: [string, string]; gap: [string, string]; options: string[]; answer: string; note: string }> = {
  cocinera: {
    past: ['«Ayer cociné una paella enorme… ayer… ayer…»', '“Yesterday I cooked a huge paella… yesterday… yesterday…”'],
    gap: ['Mañana, la cocinera ___ (preparar) otra paella.', 'Tomorrow, the cook will make another paella.'],
    options: ['preparará', 'preparó', 'preparaba', 'prepara'],
    answer: 'preparará',
    note: 'preparar → preparará (she will prepare).',
  },
  musico: {
    past: ['«Ayer toqué en la banda… ayer… ayer…»', '“Yesterday I played in the band… yesterday… yesterday…”'],
    gap: ['Mañana, el músico ___ (llevar) su trompeta a la plaza.', 'Tomorrow, the musician will take his trumpet to the square.'],
    options: ['llevará', 'llevó', 'llevaba', 'lleva'],
    answer: 'llevará',
    note: 'llevar → llevará (he will take).',
  },
  pintor: {
    past: ['«Ayer terminé mi cuadro… ayer… ayer…»', '“Yesterday I finished my painting… yesterday… yesterday…”'],
    gap: ['Mañana, el pintor ___ (hacer) un cuadro nuevo.', 'Tomorrow, the painter will make a new painting.'],
    options: ['hará', 'hizo', 'hacía', 'hace'],
    answer: 'hará',
    note: 'Hacer is irregular in the future: haré, harás, hará, haremos, haréis, harán.',
  },
};

script('ninot', async (s) => {
  const id = s.args[0];
  const flag = `ninot_${id}`;
  if (s.has(flag)) {
    await s.narrate('The ninot winks at you and strikes a proud pose.');
    return;
  }
  const p = NINOT_PUZZLES[id];
  await s.narrate('A giant ninot, grey and frozen. It mutters to itself, stuck in the past:');
  await s.say('ninot', p.past[0], p.past[1]);
  await s.narrate('Tell it what it will do tomorrow.');
  const g = await s.challenge(futureGap('Wake the ninot with the future', p.gap[0], p.gap[1], p.options, p.answer, p.note), 'El ninot');
  if (g === 'wrong') {
    await s.narrate('The ninot shakes its cardboard head. It’s still stuck in yesterday.');
    return;
  }
  s.flag(flag);
  s.refresh();
  await s.narrate('The ninot blinks, smiles, and steps aside. Colour floods back into its paint.');
  if (['ninot_cocinera', 'ninot_musico', 'ninot_pintor'].every((k) => s.has(k))) await s.narrate('With a creak, the gate at the back of the workshop swings open.', 'La puerta se abre.');
});

script('gate_ninots', async (s) => {
  await s.narrate('A gate of painted wood. Behind it, someone is hiding among the paint pots.', 'Una puerta de madera pintada.');
  await s.say('ximo', '¡Despertad a los tres ninots grandes! Son los guardianes de mi taller.', 'Wake up (you all) the three big ninots! They are the guardians of my workshop.');
});

script('ximo', async (s) => {
  if (s.has('chispa')) {
    await s.say('ximo', 'Id a la plaza. ¡Esta noche será la mejor cremà de la historia!', "Go to the square (you all). Tonight will be the best cremà in history!");
    return;
  }
  await s.say('ximo', 'Gracias, gracias… Llevo dos días aquí escondido.', "Thank you, thank you… I've been hiding here for two days.");
  await s.say('ximo', 'Una noche, una dama gris entró en mi taller. Puso una página de su libro dentro de mi falla, la del rey.', 'One night, a grey lady came into my workshop. She put a page from her book inside my falla — the king.');
  await s.say('ximo', 'Los ninots se despertaron… y mi falla se fue andando a la plaza.', 'The ninots woke up… and my falla walked off to the square.');
  await s.say('mateo', '¿Andando? ¿Una falla de diez metros?', 'Walked? A ten-metre falla?');
  await s.say('ximo', 'Mañana es el concurso de fallas. Mi falla ganará el primer premio… si no destruye la ciudad antes.', "Tomorrow is the falla competition. My falla will win first prize… if it doesn't destroy the city first.");
  await s.say('ximo', 'Tomad la Chispa. Con ella, el fuego volverá. Pero solo funcionará en la cremà, delante de la falla.', "Take (you all) the Spark. With it, the fire will come back. But it will only work at the cremà, in front of the falla.");
  await s.narrate('Ximo hands you the Chispa: a tiny flame in a glass jar that never goes out.', 'Tienes la Chispa.');
  s.flag('chispa');
  s.refresh();
  await s.say('ximo', 'Dentro de poco empieza la cremà. ¡Corred!', 'The cremà starts soon. Run!');
  await s.narrate('“Dentro de poco” = soon, in a little while.');
  s.save();
});

// ------------------------------------------------------------- the cremà
script('boss_falla', async (s) => {
  if (s.has('gran_falla')) return;
  if (!s.has('chispa')) {
    await s.narrate('The Great Falla: a cardboard king ten metres tall, on a painted pedestal. Was he always facing this way?', 'La Gran Falla.');
    return;
  }
  await s.narrate('Night has fallen over the square. The whole city is waiting for the cremà, in silence.');
  await s.say('vicenta', 'Es medianoche. ¡Es la hora de la cremà!', "It's midnight. It's time for the cremà!");
  await s.narrate('You lift the Chispa towards the falla… and the cardboard king opens his eyes.');
  await s.say('mateo', '¡Se mueve! ¡El rey se mueve!', "It's moving! The king is moving!");
  await s.say('bruno', 'La página gris le da vida. ¡Hay que arrancársela!', 'The grey page is what keeps it alive. We have to tear it out!');
  const out = await s.battle({
    enemies: ['gran_falla'],
    bg: 'valencia',
    music: 'boss',
    canFlee: false,
    intro: { es: '¡La Gran Falla os ataca!', en: 'The Great Falla attacks you (all)!' },
    tips: [
      {
        at: 'enemy',
        text: 'When the Great Falla <b>«se llena de pólvora»</b> ⚠️ it fires a <b>mascletà</b> at everyone on its next turn. Defend, shield or interrupt it. It’s cardboard and wood: <b>fire</b> is its weakness — with the Chispa, your fire finally works. Physical blows barely dent it.',
      },
    ],
  });
  if (out !== 'win') return;
  s.flag('gran_falla');
  s.refresh();
  await s.narrate('The grey page tears free and crumbles. The Chispa leaps from its jar onto the falla…', '¡La cremà!');
  await s.narrate('The Great Falla burns — not angry now, but bright and golden, the way a falla should. Smoke rises into the night; ash falls like warm snow.', 'El humo sube al cielo. La ceniza cae como nieve.');
  await s.say('lola', '¡Qué pasada!', 'How amazing!');
  await s.narrate('“¡Qué pasada!” — Spain slang for “that’s amazing!”');
});

script('cenizas', async (s) => {
  await s.narrate('All that is left of the Great Falla: ash, smoke and a few glowing embers.', 'Ceniza y humo.');
});

script('cristal_valencia', async (s) => {
  await s.narrate('Among the embers, a crystal is glowing. Inside it, a word is dancing: FIESTA.', 'Dentro del cristal baila una palabra: FIESTA.');
  await s.say('bruno', 'La Palabra Madre de Valencia. Cuidado, que «fiesta» no es solo una fiesta.', "Valencia's Mother Word. Careful: «fiesta» isn't just a party.");
  const g = await s.challenge(
    choiceChallenge(
      'La Palabra Madre',
      '«El lunes es fiesta.»',
      'What does it mean?',
      ['Monday is a public holiday', "There's a party on Monday", "Monday is someone's birthday", 'Monday is market day'],
      0,
      ['ser fiesta', 'to be a public holiday'],
      '«Fiesta» is a party or a festival (las Fallas son una fiesta), but «es fiesta» or «un día de fiesta» means a public holiday: no work, no school.',
    ),
    'FIESTA',
  );
  if (g === 'wrong') await s.say('bruno', '«Es fiesta» quiere decir que nadie trabaja: es un día libre para todos.', '«Es fiesta» means nobody works: a day off for everyone.');
  s.flag('valencia_word');
  s.flag('valencia_done');
  s.heal();
  s.music('valencia');
  s.refresh();
  await s.narrate('The word bursts into the sky like a firework. All over the city, firecrackers bang, bands strike up and people start to laugh.', '¡Empieza la fiesta!');
  await s.narrate('In your bag, the Grimorio grows warm: another page fills with ink.');
  await s.say('vicenta', '¡Lo habéis conseguido! Venid, venid, ¡tenemos que celebrarlo!', "You've done it! Come, come, we have to celebrate!");
  s.save();
});
