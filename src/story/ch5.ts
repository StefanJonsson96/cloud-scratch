// Chapter 5 — "La Torre Muda". Bruno's memories, the last doors, the final
// battle — and the words that end it.

import { script, type Script } from './script';
import { choiceChallenge } from './common';
import { tokenize } from '../data/text';
import type { Challenge } from '../learn/challenges';
import { h, wait, waitConfirm } from '../ui/dom';
import { dayStreak } from '../state';
import { MAX_BOX } from '../learn/srs';

script('ch5_start', async (s) => {
  s.flag('ch5');
  await s.chapter(
    5,
    'La Torre Muda',
    'The Mute Tower',
    'This chapter: telling stories in the past — indefinido (ayer fui) vs imperfecto (de pequeño iba) · feelings · Spanish proverbs about silence and words.',
  );
  await s.say('lola', 'Aquí no se oye nada. Ni mis pasos.', "You can't hear anything here. Not even my footsteps.");
  await s.say('mateo', 'Me da miedo… pero vamos juntos.', 'It scares me… but we go together.');
  await s.narrate('“Me da miedo” — it gives me fear. Like gustar, the thing that scares you is the subject.');
});

// Bruno's memories: little stories in the past tenses.
script('recuerdo1', async (s) => {
  await s.narrate('A floating crystal holds a memory. You see two children on a beach…', 'Un recuerdo.');
  await s.say('voz', 'Rosa y Bruno eran hermanos. Vivían en Puerto Alegre. Bruno siempre cantaba.', 'Rosa and Bruno were brother and sister. They lived in Puerto Alegre. Bruno was always singing.');
  await s.narrate('Imperfecto (eran, vivían, cantaba): the background, what things were like, what used to happen.');
});

script('recuerdo2', async (s) => {
  await s.narrate('Another memory: a black sky, huge waves…', 'Otro recuerdo.');
  await s.say('voz', 'Una noche hubo una tormenta. Rosa cayó al mar. Bruno gritó una palabra de poder… y la salvó.', 'One night there was a storm. Rosa fell into the sea. Bruno shouted a word of power… and saved her.');
  await s.narrate('Indefinido (hubo, cayó, gritó, salvó): single, finished events that move the story forward.');
});

script('recuerdo3', async (s) => {
  await s.narrate('The last memory: a young man alone at a window.', 'El último recuerdo.');
  await s.say('voz', 'Después de aquella noche, Bruno no pudo hablar nunca más. Nadie lo entendía. Se sentía muy solo.', 'After that night, Bruno could never speak again. Nobody understood him. He felt very alone.');
  await s.say('lola', 'Pobre Bruno…', 'Poor Bruno…');
});

function pastGate(prompt: string, sub: string, options: string[], answer: string, note: string): Challenge {
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return choiceChallenge('The door asks for the right past tense', prompt, sub, shuffled, shuffled.indexOf(answer), [prompt.replace('___', answer), sub], note);
}

script('gate_torre1', async (s) => {
  await s.narrate('A black door with silver letters. It will only open to the right word:', 'Una puerta negra con letras de plata.');
  const g = await s.challenge(
    pastGate(
      'El año pasado, nosotros ___ (ir) a la playa.',
      'Last year, we went to the beach.',
      ['fuimos', 'vamos', 'íbamos', 'hemos ido'],
      'fuimos',
      '“El año pasado” is a finished time, so Spain uses the indefinido: fuimos. (Hoy → hemos ido · De pequeños → íbamos)',
    ),
    'La puerta negra',
  );
  if (g === 'wrong') {
    await s.say('lola', 'Piensa: ¿el año pasado está terminado? Entonces…', 'Think: is “last year” finished? Then…');
    return;
  }
  s.flag('gate_torre1');
  s.refresh();
  await s.narrate('The silver letters glow and the door opens without a sound.');
});

script('gate_torre2', async (s) => {
  await s.narrate('A second door. This one shows two children playing on the sand:', 'Otra puerta.');
  const g = await s.challenge(
    pastGate(
      'De pequeños, Rosa y Bruno ___ (jugar) en la playa todos los días.',
      'As children, Rosa and Bruno used to play on the beach every day.',
      ['jugaban', 'jugaron', 'juegan', 'han jugado'],
      'jugaban',
      'A habit in the past (“todos los días”, “de pequeños”) takes the imperfecto: jugaban.',
    ),
    'La segunda puerta',
  );
  if (g === 'wrong') {
    await s.say('mateo', '«Todos los días»… eso es una costumbre, ¿no?', '“Every day”… that’s a habit, right?');
    return;
  }
  s.flag('gate_torre2');
  s.refresh();
  await s.narrate('The door melts into shadow. Stairs lead up to the summit.');
});

// ------------------------------------------------------------- the finale
script('final', async (s) => {
  if (s.has('final')) return;
  s.music('boss');
  await s.narrate('At the very top of the tower, the hooded figure is waiting. Around him float thousands of stolen words, grey and quiet.');
  await s.say('hero', 'Sabemos quién eres. Eres Bruno, el hermano de Rosa.', "We know who you are. You're Bruno, Rosa's brother.");
  await s.say('callado', '……', '(His hands tremble. Words appear in the air, written in shadow.)');
  await s.say('callado', '«NADIE ME ESCUCHA. ENTONCES, QUE NADIE HABLE.»', '“NOBODY LISTENS TO ME. SO LET NOBODY SPEAK.”');
  await s.narrate('“Que nadie hable” — a wish or command in the subjunctive: let nobody speak.');
  await s.say('lola', '¡No! ¡Las palabras son de todos!', 'No! Words belong to everyone!');
  await s.say('mateo', '¡Vamos a luchar juntos!', "We're going to fight together!");
  const out = await s.battle({
    enemies: ['callado'],
    bg: 'cima',
    music: 'boss',
    canFlee: false,
    intro: { es: '¡El Callado os ataca!', en: 'El Callado attacks you (all)!' },
    tips: [
      {
        at: 'enemy',
        text: 'The final battle! When he <b>«cierra los ojos… todo se queda en silencio»</b> ⚠️ the <b>Gran Silencio</b> is coming for everyone. Defend, shield, heal — or interrupt him. If he <b>silences</b> someone (🤐), a Manzanilla tea cures it. Light is his weakness.',
      },
    ],
  });
  if (out !== 'win') return;
  s.music('dungeon');
  await s.narrate('Bruno falls to one knee. The shadows around him flicker… but they will not let go of him.');
  await s.narrate('Then the Grimorio in your hands grows warm. A voice speaks from its pages — Abuela’s voice.');
  await s.say('abuela', 'Bruno… hermano… escucha.', 'Bruno… brother… listen.');
  await s.say('lola', '¡Díselo! ¡Dile lo que necesita oír!', 'Tell him! Tell him what he needs to hear!');
  // The last challenge: build the sentence that breaks the Silence.
  const tokens = tokenize('No estás solo.');
  const ch: Challenge = {
    key: 'final',
    kind: 'order',
    label: 'The words that break the Silence',
    prompt: "You're not alone.",
    promptLang: 'en',
    hint: 'Negation goes first: “No …”',
    tiles: [...tokens, 'miedo', 'eres'].sort(() => Math.random() - 0.5),
    solutions: [tokens],
    reveal: { es: 'No estás solo.', en: "You're not alone." },
    difficulty: 1,
    maxBox: 0,
    isNew: false,
    fastMs: 30000,
    srs: false,
    speak: 'No estás solo.',
  };
  for (;;) {
    const g = await s.challenge(ch, 'Palabra Final');
    if (g !== 'wrong') break;
    await s.say('lola', '¡Otra vez! ¡Con el corazón!', 'Again! From the heart!');
  }
  await s.say('hero', 'No estás solo.', "You're not alone.");
  s.flag('final');
  s.refresh();
  await s.narrate('The shadows go still. The hood falls back. Underneath is an old man with Abuela’s eyes.');
  await s.narrate('He opens his mouth. For the first time in forty years, there is a sound.');
  await s.say('bruno', 'Yo… yo… puedo… hablar.', 'I… I… can… speak.');
  await s.say('bruno', 'Lo siento. Lo siento mucho.', "I'm sorry. I'm so sorry.");
  await s.narrate('The stolen words rise into the sky like a flock of birds — and fly home, to every village on the coast.');
  await s.say('mateo', '¡Lo hemos conseguido!', "We've done it!");
  await s.say('lola', 'Y ahora… ¡a casa! ¡Esto hay que celebrarlo!', "And now… home! This calls for a celebration!");
  await s.warp('puerto', 15, 11, 'up');
  s.music('town');
  s.flag('fin');
  s.refresh();
  await s.narrate('Puerto Alegre, that evening. Lanterns, guitars, the smell of paella. The whole coast has come to celebrate.');
  await s.say('abuela', `¡${s.g.heroName}! Lo has conseguido. Estoy muy orgullosa de ti.`, `${s.g.heroName}! You did it. I'm so proud of you.`);
  await s.say('abuela', 'Ahora eres {un Palabrista de verdad|una Palabrista de verdad}.', "Now you're a real Palabrista."); 
  await s.say('bruno', 'Rosa… te he echado mucho de menos.', "Rosa… I've missed you so much.");
  await s.say('abuela', 'Y yo a ti, hermano. Bienvenido a casa.', 'And I you, brother. Welcome home.');
  await s.say('lola', '¡Venga! ¡Una canción para todos!', 'Come on! A song for everyone!');
  await s.say('mateo', '¿Y la paella? ¡Tengo hambre!', 'And the paella? I’m hungry!');
  await s.say('lola', 'Tú siempre tienes hambre, Mateo.', "You're always hungry, Mateo.");
  await credits(s);
  s.save();
});

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
    h('div', { class: 'ch-num' }, 'Fin del Acto I'),
    h('div', { class: 'ch-title' }, '¡Continuará!'),
    h('div', { class: 'ch-en' }, 'End of Act I — the story continues. Talk to Abuela when you are ready.'),
    h(
      'div',
      { class: 'ch-learn' },
      `${words} words practised · ${mastered} things mastered · ${g.stats.answered} answers (${acc}% right) · ${Math.round(g.stats.playMs / 60000)} minutes · 🔥 ${dayStreak(g.stats.days)}-day streak`,
    ),
    h('div', { class: 'ch-learn' }, 'The coast is yours to explore. Keep your Spanish sharp with the Repaso in the menu, the practice dummy at Abuela’s house, and the monsters that still roam the wild.'),
    h('div', { class: 'cc-continue' }, 'Enter / tap ▶'),
  );
  document.body.append(panel);
  await wait(600);
  await waitConfirm(panel);
  panel.remove();
}

script('abuela_fin', async (s) => {
  if (!s.has('act2')) {
    await s.run('act2_start');
    return;
  }
  await s.say('abuela', '¿Sabes? Las palabras son poder… pero son más poderosas cuando se comparten.', 'You know what? Words are power… but they are most powerful when they are shared.');
  await s.say('abuela', 'Sigue practicando, ¿vale? ¡Un Palabrista nunca deja de aprender!', 'Keep practising, okay? A Palabrista never stops learning!');
});

script('bruno_fin', async (s) => {
  await s.say('bruno', 'Cuarenta años sin hablar… y ahora no puedo parar. ¡Jaja!', "Forty years without speaking… and now I can't stop. Haha!");
  await s.say('bruno', 'Gracias por no rendirte conmigo.', 'Thank you for not giving up on me.');
});

script('mateo_fin', async (s) => {
  await s.say('mateo', '¡Esta paella está buenísima! ¿Quieres un poco?', 'This paella is amazing! Want some?');
});

script('lola_fin', async (s) => {
  await s.say('lola', 'Mañana vuelvo a Sevilla… pero antes, ¡una canción más!', "Tomorrow I'm going back to Seville… but first, one more song!");
});
