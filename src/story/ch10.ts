// Chapter 10 — "La biblioteca del olvido". Salamanca: Bruno's old university,
// a frog on a façade, doubts and feelings (the subjunctive again), the inside
// of the Book of Forgetting — and who the Grey Lady really is.

import { script, type Script } from './script';
import { choiceChallenge } from './common';
import { tokenize } from '../data/text';
import type { Challenge } from '../learn/challenges';
import { h, wait, waitConfirm } from '../ui/dom';
import { dayStreak } from '../state';
import { MAX_BOX } from '../learn/srs';

function doubtGap(label: string, prompt: string, sub: string, options: string[], answer: string, note: string): Challenge {
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return choiceChallenge(label, prompt, sub, shuffled, shuffled.indexOf(answer), [prompt.replace('___', answer), sub], note);
}

/** Build a sentence from its words (plus two that don't belong), until it's right. */
async function buildSentence(s: Script, es: string, en: string, extra: string[], label: string, title: string, hint: string, retry: [string, string, string]) {
  const tokens = tokenize(es);
  const ch: Challenge = {
    key: `frase:${es}`,
    kind: 'order',
    label,
    prompt: en,
    promptLang: 'en',
    hint,
    tiles: [...tokens, ...extra].sort(() => Math.random() - 0.5),
    solutions: [tokens],
    reveal: { es, en },
    difficulty: 1,
    maxBox: 0,
    isNew: false,
    fastMs: 30000,
    srs: false,
    speak: es,
  };
  for (;;) {
    const g = await s.challenge(ch, title);
    if (g !== 'wrong') break;
    await s.say(retry[0], retry[1], retry[2]);
  }
  await s.say('hero', es, en);
}

script('ch10_start', async (s) => {
  s.flag('ch10');
  await s.chapter(
    10,
    'La biblioteca del olvido',
    'The Library of Forgetting',
    'This chapter: doubts and feelings — no creo que…, dudo que…, me alegra que… (subjunctive) vs creo que… (indicative) · everything you have learnt, together · Salamanca words: universidad, biblioteca, estudiante, profesor.',
  );
  await s.narrate('The golden stone of Salamanca glows in the evening sun… but the streets are full of students who have forgotten what they came here to study.');
  await s.say('lola', 'Aquí estudió Bruno hace cuarenta años.', 'Bruno studied here forty years ago.');
  await s.say('mateo', 'Sin Bruno no somos el mismo grupo.', "Without Bruno we're not the same group.");
  await s.say('hero', 'Lo encontraremos. No creo que la Dama nos lo ponga fácil… pero lo encontraremos.', "We'll find him. I don't think the Lady will make it easy for us… but we'll find him.");
  await s.lesson(
    'Nota del Grimorio, con la letra de la abuela',
    '<p>When you <b>doubt</b> something, or say how something makes you <b>feel</b>, the next verb goes into the <b>subjuntivo</b>:</p><p><b>No creo que</b> sea fácil. · <b>Dudo que</b> venga. · <b>Es posible que</b> llueva. · <b>Me alegra que</b> estés aquí. · <b>Me da miedo que</b> se vaya.</p><p>But when you believe it, it’s a plain fact, in the indicative: <b>Creo que</b> es fácil. <b>Estoy seguro de que</b> viene.</p><p>Rule of thumb: doubts, wishes and feelings → subjuntivo. Facts and beliefs → indicativo.</p>',
    [
      ['No creo que la Dama sea mala.', "I don't think the Lady is evil."],
      ['Creo que Bruno está en la biblioteca.', 'I think Bruno is in the library.'],
      ['Me alegra que estéis aquí.', "I'm glad you (all) are here."],
    ],
  );
  await s.narrate('The Grimorio grows warm. In Abuela’s handwriting, a new line appears: «Buscad a la profesora Inés, delante de la universidad.»', 'Buscad a la profesora Inés.');
});

// ------------------------------------------------------------- the city
script('ines', async (s) => {
  if (s.has('salamanca_done')) {
    await s.say('ines', 'Como decíamos ayer… Así empezaba sus clases Fray Luis de León. Y así empiezo yo hoy.', 'As we were saying yesterday… That is how Fray Luis de León began his classes. And that is how I begin today.');
    await s.narrate('Legend says that in 1577, after almost five years in prison, the poet Fray Luis de León returned to his classroom in Salamanca and began: «Decíamos ayer…» — as if he had never been away.');
    return;
  }
  if (s.has('llave')) {
    await s.say('ines', 'La biblioteca está detrás de esa puerta. ¡Que tengáis suerte!', 'The library is behind that door. Good luck (you all)!');
    return;
  }
  if (s.has('ines_met')) {
    await s.say('ines', 'Busca la rana en la fachada. Mira bien… es muy pequeña.', "Look for the frog on the façade. Look carefully… it's very small.");
    return;
  }
  await s.say('ines', 'Bienvenidos a la Universidad de Salamanca. Soy la profesora Inés.', "Welcome to the University of Salamanca. I'm Professor Inés.");
  await s.say('ines', 'Hace cuarenta años tuve un alumno brillante. Se llamaba Bruno.', 'Forty years ago I had a brilliant student. His name was Bruno.');
  await s.say('lola', '¡Es nuestro amigo! La Dama Gris se lo ha llevado.', "He's our friend! The Grey Lady has taken him.");
  await s.say('ines', 'Lo sé. Anoche lo vi entrar en la biblioteca con una mujer gris. Dudo que salga solo.', "I know. Last night I saw him go into the library with a grey woman. I doubt he'll come out on his own.");
  await s.say('ines', 'Os daré la llave… pero antes, una tradición. Todos los estudiantes buscan la rana de la fachada. Quien la encuentra, aprueba.', "I'll give you the key… but first, a tradition. Every student looks for the frog on the façade. Whoever finds it passes their exams.");
  s.flag('ines_met');
  s.refresh();
});

script('fachada', async (s) => {
  await s.narrate('The façade of the University: stone carved like lace, full of tiny figures — kings, saints, monsters… Somewhere among them hides a frog.', 'La fachada de la universidad.');
  if (!s.has('ines_met') || s.has('rana_ok')) return;
  const options = ['Sobre una calavera.', 'Sobre un león.', 'En la mano de un rey.', 'Encima de la puerta.'].sort(() => Math.random() - 0.5);
  const g = await s.challenge(
    choiceChallenge(
      'Find the frog',
      '¿Dónde está la rana?',
      'Where is the frog?',
      options,
      options.indexOf('Sobre una calavera.'),
      ['La rana está sobre una calavera.', 'The frog is sitting on a skull.'],
      'The famous frog sits on a skull on the right-hand pillar. Students say that finding it brings luck in exams.',
    ),
    'La rana',
  );
  if (g === 'wrong') {
    await s.narrate('You look and look… but that’s not the frog. Try again.');
    return;
  }
  s.flag('rana_ok');
  await s.narrate('There it is! A little stone frog, sitting on a skull.');
  await s.say('ines', '¡Me alegra que la hayáis encontrado! Tomad la llave de la biblioteca. Y traed a Bruno de vuelta.', "I'm so glad you found it! Take the library key. And bring Bruno back.");
  s.flag('llave');
  s.refresh();
  await s.narrate('You got the library key. The door is on the right of the University.');
  s.save();
});

script('puerta_biblioteca', async (s) => {
  await s.narrate('The library door is locked. Through the keyhole you can hear pages turning by themselves.', 'La puerta está cerrada.');
  await s.say('lola', 'Necesitamos la llave. Hablemos con la profesora.', "We need the key. Let's talk to the professor.");
});

script('plaza_mayor', async (s) => {
  await s.narrate('The Plaza Mayor of Salamanca, built in the 1700s. Many people say it is the most beautiful square in Spain.', 'La Plaza Mayor.');
});

script('hostal_salamanca', async (s) => {
  await s.say('hostalera', 'Aquí duermen muchos estudiantes… ¡y estudian poco!', 'Lots of students sleep here… and study very little!');
  await s.inn('hostalera', 50);
});

script('tuno', async (s) => {
  if (s.has('tuno_ok')) {
    await s.say('tuno', '¡Tralarí, tralará! ¡La tuna vuelve a cantar!', 'Tra-la-ri, tra-la-ra! The tuna is singing again!');
    return;
  }
  await s.say('tuno', '¡Hola! Soy de la tuna. Cantamos por las calles con nuestras capas.', "Hi! I'm in the tuna. We sing in the streets in our capes.");
  await s.narrate('A “tuna” is a band of student minstrels — a tradition since the Middle Ages. The ribbons on their capes are gifts from their fans.');
  await s.say('tuno', 'Pero ahora nadie quiere escucharnos. Dudo que alguien nos dé ni una moneda…', "But nobody wants to listen to us now. I doubt anyone will give us a single coin…");
  await buildSentence(s, 'Me encanta que cantéis.', 'I love that you (all) sing.', ['cantáis', 'odio'], 'Cheer the tuno up', 'La tuna', 'me encanta que + subjunctive: cantar → cantéis', [
    'tuno',
    'Mmm… dímelo otra vez, con alegría.',
    'Hmm… say it to me again, cheerfully.',
  ]);
  s.flag('tuno_ok');
  s.refresh();
  await s.say('tuno', '¿De verdad? ¡Gracias! ¡Tralarí, tralará!', 'Really? Thank you! Tra-la-ri, tra-la-ra!');
  await s.gain(150);
});

script('librera', async (s) => {
  if (!s.has('librera_quiz')) {
    await s.say('librera', '¡Libros viejos, libros nuevos! ¿Sabéis cuántos años tiene esta universidad?', 'Old books, new books! Do you (all) know how old this university is?');
    const ok = await s.quiz('librera', '¿Cuántos años tiene la Universidad de Salamanca?', 'How old is the University of Salamanca?', [
      ['Unos cincuenta.', 'About fifty.'],
      ['Unos cien.', 'About a hundred.'],
      ['Más de ochocientos.', 'More than eight hundred.'],
    ], 2);
    s.flag('librera_quiz');
    if (ok) {
      await s.say('librera', '¡Exacto! Nació en el año mil doscientos dieciocho. Tomad, un regalo.', 'Exactly! It was founded in 1218. Here, a present.');
      await s.give('tarta', 1);
    } else {
      await s.say('librera', 'No: ¡más de ochocientos! Nació en el año mil doscientos dieciocho.', 'No: more than eight hundred! It was founded in 1218.');
    }
  }
  await s.shop('librera', ['pulpo', 'tarta', 'jamon', 'gazpacho', 'farton', 'te', 'cafe', 'pluma']);
});

// ------------------------------------------------------------- the library
script('biblioteca_enter', async (s) => {
  if (s.has('biblioteca_seen')) return;
  s.flag('biblioteca_seen');
  await s.narrate('The old library. Shelves up to the ceiling, ladders, globes… and silence. Somewhere above, a page turns.');
  await s.say('mateo', 'Me da miedo que los libros nos miren.', 'It scares me that the books are looking at us.');
  await s.narrate('“Me da miedo que…” — a feeling, so the next verb is subjunctive: miren.');
});

const DOUBTS: Record<string, { gap: [string, string]; options: string[]; answer: string; note: string }> = {
  '1': {
    gap: ['No creo que la Dama ___ (ser) mala.', "I don't think the Lady is evil."],
    options: ['sea', 'es', 'fue', 'era'],
    answer: 'sea',
    note: '«No creo que» is a doubt → subjunctive: ser → sea. (But «Creo que es…» is a belief → indicative.)',
  },
  '2': {
    gap: ['Me alegra que ___ (estar, vosotros) aquí.', "I'm glad you (all) are here."],
    options: ['estéis', 'estáis', 'estuvisteis', 'estabais'],
    answer: 'estéis',
    note: 'A feeling about something («me alegra que») → subjunctive: estar → estéis.',
  },
};

script('puerta_duda', async (s) => {
  const n = s.args[0];
  const d = DOUBTS[n];
  await s.narrate('A door of dark wood. Carved in it, a sentence with one word missing:', 'Una puerta con una frase.');
  const g = await s.challenge(doubtGap('Complete the sentence on the door', d.gap[0], d.gap[1], d.options, d.answer, d.note), 'La puerta');
  if (g === 'wrong') {
    await s.say('lola', '¿Es un hecho… o una duda? ¿Un sentimiento?', 'Is it a fact… or a doubt? A feeling?');
    return;
  }
  s.flag(`duda${n}`);
  s.refresh();
  await s.narrate('The letters glow, and the door opens without a sound.');
});

script('estudiante', async (s) => {
  if (s.has('salamanca_done')) {
    await s.say('estudiante', '¡Ya me acuerdo de todo! Mañana tengo examen… ¡Qué miedo!', "I remember everything now! I've got an exam tomorrow… How scary!");
    return;
  }
  await s.say('estudiante', 'Llevo tres días estudiando aquí… y no recuerdo nada. ¿Queréis descansar un poco? Hay sitio.', "I've been studying here for three days… and I can't remember a thing. Do you (all) want to rest a bit? There's room.");
  await s.inn('estudiante', 0);
});

script('guardian_biblioteca', async (s) => {
  if (s.has('guardian')) return;
  await s.narrate('At the foot of the stairs, a huge eraser blocks the way. It is rubbing out the steps one by one!');
  const out = await s.battle({ enemies: ['pagina', 'borrador_mayor', 'pagina'], bg: 'biblioteca', canFlee: false });
  if (out !== 'win') return;
  s.flag('guardian');
  s.refresh();
  await s.narrate('The stairs are whole again. They lead up… into the pages of a book.');
});

// ------------------------------------------------------------- inside the Book
script('libro_enter', async (s) => {
  if (s.has('libro_seen')) return;
  s.flag('libro_seen');
  await s.narrate('You climb the stairs… and step into the Book of Forgetting. Grey paper floats in a grey sky. Words drift past, half rubbed out.');
  await s.say('lola', '¡Mirad! ¡Allí, en el centro! ¡Es Bruno!', "Look (you all)! There, in the middle! It's Bruno!");
});

const FORGOTTEN: Record<string, [string, string]> = {
  '1': ['zascandil', 'Zascandil: a restless busybody who pokes into everything. Hardly anyone says it any more.'],
  '2': ['cuchipanda', 'Cuchipanda: a feast with friends, a good blow-out. Your great-grandparents loved this word.'],
  '3': ['gaznápiro', 'Gaznápiro: a bit of a dimwit. An old, funny insult.'],
  '4': ['mequetrefe', 'Mequetrefe: a meddlesome good-for-nothing. Still in the dictionary, waiting for someone to use it.'],
};

script('pagina_olvidada', async (s) => {
  const [es, en] = FORGOTTEN[s.args[0]];
  await s.narrate(`A page floating in the grey. On it, a single forgotten word: «${es}».`);
  await s.narrate(en, es);
  await s.narrate('You read it out loud. The word glows for a moment, as if it were glad someone remembered it.');
});

script('rescate', async (s) => {
  await s.narrate('Bruno sits in the middle of the island, wrapped in grey pages. His lips move, but no sound comes out.');
  await s.say('lola', '¡Bruno! ¡Despierta!', 'Bruno! Wake up!');
  await s.narrate('The Lady has taken his voice again. Only the right words will bring him back.');
  await buildSentence(s, 'No queremos que te calles nunca más.', "We don't want you to ever go quiet again.", ['callas', 'quiero'], 'Bring Bruno back', 'Bruno', 'querer que + subjunctive: callarse → te calles', [
    'mateo',
    '¡Otra vez! ¡Más fuerte!',
    'Again! Louder!',
  ]);
  await s.narrate('The grey pages around Bruno tear and fly away like startled birds.');
  await s.say('bruno', 'Gracias. Os he oído. Os he oído todo el tiempo.', 'Thank you. I heard you. I heard you the whole time.');
  await s.rejoin('bruno');
  s.flag('bruno_back');
  s.refresh();
  await s.say('bruno', 'Ella está arriba. Y no es mala… está sola. Como yo lo estaba.', "She's up there. And she isn't evil… she's alone. Like I was.");
  s.save();
});

script('boss_dama', async (s) => {
  if (s.has('dama')) return;
  if (!s.has('bruno_back')) {
    await s.narrate('High above, a grey figure is writing in an enormous book. First, Bruno.');
    return;
  }
  await s.narrate('At the top of the Book, the Grey Lady is writing. Every word she writes disappears from the world below.');
  await s.say('dama', '¿Habéis venido a quitarme mis palabras?', 'Have you come to take my words away from me?');
  await s.say('hero', 'No son tuyas. Son de todos.', "They aren't yours. They belong to everyone.");
  await s.say('dama', 'Las palabras se olvidan. La gente las usa, las rompe, las pierde. Yo las guardo para siempre.', 'Words get forgotten. People use them, break them, lose them. I keep them forever.');
  await s.say('bruno', 'Una palabra guardada es una palabra muerta. Yo lo sé: guardé las mías cuarenta años.', 'A word kept is a dead word. I know: I kept mine for forty years.');
  await s.say('dama', 'Entonces… ¡os guardaré a vosotros también!', 'Then… I will keep you too!');
  const out = await s.battle({
    enemies: ['dama_gris'],
    bg: 'libro',
    music: 'boss',
    canFlee: false,
    intro: { es: '¡La Dama Gris os ataca!', en: 'The Grey Lady attacks you (all)!' },
    tips: [
      {
        at: 'enemy',
        text: 'The last battle! When the Lady <b>«abre su libro y empieza a escribir vuestros nombres…»</b> ⚠️ she will close the Book on everyone next turn: shield, defend, or interrupt her (Bruno’s <b>Silencio</b>, Lola’s <b>Saeta</b>, Mateo’s <b>Ancla</b>). If she silences someone (🤐), Bruno’s <b>Recuerdo</b> or a Manzanilla cures it. <b>Light</b> is her weakness.',
      },
    ],
  });
  if (out !== 'win') return;
  s.music('dungeon');
  await s.narrate('The Lady falls to her knees. The Book slips from her hands and falls open at its very first page.');
  await s.narrate('It is blank — except for one word, written very small: OLVIDO.');
  await s.say('bruno', 'Ese es tu nombre, ¿verdad? Eres el Olvido.', "That's your name, isn't it? You are Forgetting.");
  await s.say('dama', 'Nadie me recuerda. Nadie dice mi nombre. Por eso quería todas las palabras… para no estar sola.', 'Nobody remembers me. Nobody says my name. That is why I wanted all the words… so as not to be alone.');
  await s.say('lola', 'Entonces… ¿y si compartimos las palabras contigo?', 'Then… what if we share the words with you?');
  await buildSentence(s, 'Las palabras viven cuando las compartimos.', 'Words live when we share them.', ['guardamos', 'mueren'], 'The words that set the Book free', 'Palabra Final', 'compartir = to share', [
    'bruno',
    '¡Otra vez! ¡Juntos!',
    'Again! Together!',
  ]);
  s.flag('dama');
  s.refresh();
  await s.narrate('The Book bursts open. Thousands of words fly out like birds — sueño, fiesta, duende, morriña — and every one of them flies home.');
  await s.narrate('The Lady’s grey dress fills with colour, like ink spreading through water.');
  await s.say('dama', 'Gracias… Ahora sé quién soy. No soy el Olvido. Soy… la Memoria.', 'Thank you… Now I know who I am. I am not Forgetting. I am… Memory.');
  await s.narrate('Beside her, the last crystal is glowing.');
});

script('memoria', async (s) => {
  if (s.has('salamanca_word')) {
    await s.say('memoria', 'Cuidaré de las palabras viejas. Pero dejaré volar a todas.', 'I will look after the old words. But I will let them all fly.');
    return;
  }
  await s.say('memoria', 'Tocad el cristal. Es la última Palabra Madre.', "Touch the crystal (you all). It's the last Mother Word.");
});

script('cristal_salamanca', async (s) => {
  await s.narrate('Inside the crystal, the last Mother Word is waiting, clear and simple: PALABRA.', 'Dentro del cristal espera la última palabra: PALABRA.');
  const g = await s.challenge(
    choiceChallenge(
      'La Palabra Madre',
      '«Te doy mi palabra.»',
      'What does it mean?',
      ['I promise you', 'I give you a word', "I'm telling you a secret", 'I give you my book'],
      0,
      ['dar tu palabra', 'to give your word, to promise'],
      '«Palabra» is a word — but «dar tu palabra» is to promise, and «tener palabra» is to keep your promises. A Palabrista needs to have «palabra».',
    ),
    'PALABRA',
  );
  if (g === 'wrong') await s.say('bruno', '«Te doy mi palabra» es una promesa. Y yo os doy la mía.', '«Te doy mi palabra» is a promise. And I give you mine.');
  s.flag('salamanca_word');
  s.flag('salamanca_done');
  s.heal();
  s.refresh();
  await s.say('bruno', 'Os doy mi palabra: no volveré a callar nunca.', 'I give you my word: I will never go quiet again.');
  await s.narrate('The fifth Mother Word rises — and the whole Grimorio fills with ink, from the first page to the last.');
  await s.say('mateo', '¡Lo hemos conseguido! ¡Las cinco Palabras Madre!', "We've done it! All five Mother Words!");
  await s.say('lola', '¡A casa! ¡Esto hay que celebrarlo con todo el mundo!', 'Home! This calls for a celebration with everyone!');
  await ending(s);
});

// ------------------------------------------------------------- the ending
async function ending(s: Script) {
  await s.warp('puerto', 15, 11, 'up');
  s.music('town');
  s.flag('fin2');
  s.refresh();
  await s.narrate('Puerto Alegre, a week later. Lanterns, guitars, the smell of paella… and guests from all over Spain.');
  await s.say('abuela', `¡${s.g.heroName}! Mira mi Grimorio: ¡no le falta ni una palabra!`, "Look at my Grimorio: there isn't a single word missing!");
  await s.say('abuela', 'Has viajado por toda España. Ahora hablas como una persona de aquí.', "You've travelled all over Spain. Now you speak like someone from here.");
  await s.say('bruno', 'Rosa, te presento a una amiga. Se llama Memoria.', "Rosa, let me introduce a friend. Her name is Memory.");
  await s.say('abuela', 'Bienvenida, Memoria. En esta casa, las palabras se comparten.', 'Welcome, Memory. In this house, words are shared.');
  await s.say('lola', '¡Venga! ¡Una canción para todos!', 'Come on! A song for everyone!');
  await s.say('mateo', '¿Y la paella? ¡Tengo hambre!', "And the paella? I'm hungry!");
  await s.say('lola', 'Tú siempre tienes hambre, Mateo.', "You're always hungry, Mateo.");
  await credits(s);
  s.save();
}

async function credits(s: Script) {
  s.end();
  const g = s.g;
  const cards = Object.entries(g.srs.cards);
  const words = cards.filter(([k]) => k.startsWith('w:')).length;
  const mastered = cards.filter(([, c]) => c.box >= MAX_BOX).length;
  const acc = g.stats.answered ? Math.round((100 * g.stats.right) / g.stats.answered) : 0;
  const panel = h(
    'div',
    { class: 'chapter-card' },
    h('div', { class: 'ch-num' }, 'Fin'),
    h('div', { class: 'ch-title' }, '¡Gracias por jugar!'),
    h('div', { class: 'ch-en' }, 'The End — thank you for playing Palabrista.'),
    h(
      'div',
      { class: 'ch-learn' },
      `${words} words practised · ${mastered} things mastered · ${g.stats.answered} answers (${acc}% right) · ${Math.round(g.stats.playMs / 60000)} minutes · 🔥 ${dayStreak(g.stats.days)}-day streak`,
    ),
    h('div', { class: 'ch-learn' }, 'Spain is yours: the trains run everywhere. Your friends from every region are at the festival. Keep your Spanish sharp with El Rosco at the station, the Repaso in the menu, and the monsters that still roam the wild.'),
    h('div', { class: 'cc-continue' }, 'Enter / tap ▶'),
  );
  document.body.append(panel);
  await wait(600);
  await waitConfirm(panel);
  panel.remove();
}

// Guests at the final festival.
const GUESTS: Record<string, [string, string, string][]> = {
  alonso: [['alonso', '¡He escrito mi historia! Se llama «El ingenioso caballero de Villamolinos».', "I've written my story! It's called “The Ingenious Knight of Villamolinos”."]],
  sancha: [['sancha', 'Mi tío quiere ser vuestro caballero para siempre. ¡Cuidado!', 'My uncle wants to be your knight forever. Watch out!']],
  vicenta: [['vicenta', 'El año que viene, ¡todos a las Fallas! Os guardo un sitio en el balcón.', "Next year, everyone to the Fallas! I'll save you a place on the balcony."]],
  rocio: [['rocio', 'Lola, hija, baila con tu madre una vez más.', 'Lola, my girl, dance with your mother one more time.']],
  manolo: [['manolo', 'Esta guitarra ha visto muchas cosas… pero nunca una fiesta como esta. ¡Olé!', 'This guitar has seen a lot of things… but never a party like this one. Olé!']],
  maruxa: [['maruxa', 'Yo no creo en las meigas… pero haberlas, haylas. ¡Ja, ja!', "I don't believe in witches… but they exist, they do. Ha ha!"]],
  peregrina: [['peregrina', '¡He hablado con mi hermano! Ojalá que vosotros también volváis a casa pronto.', "I've talked to my brother! I hope you all get home soon too."]],
  memoria: [['memoria', 'Aquí nadie olvida a nadie. Me gusta este pueblo.', 'Here nobody forgets anybody. I like this village.']],
  bruno: [['bruno', '¿Sabes qué es lo mejor de hablar? Que alguien te contesta.', "Do you know the best thing about talking? That someone answers you."]],
  mateo: [['mateo', '¡Esta es la mejor paella de España! Bueno… después de la de Tío Vicent.', "This is the best paella in Spain! Well… after Tío Vicent's."]],
  lola: [['lola', 'Mi madre y mi abuelo han venido desde Sevilla. ¡Mi familia y mis amigos, juntos!', 'My mum and my grandad have come all the way from Seville. My family and my friends, together!']],
};

script('invitado', async (s) => {
  for (const [who, es, en] of GUESTS[s.args[0]] ?? []) await s.say(who, es, en);
});
