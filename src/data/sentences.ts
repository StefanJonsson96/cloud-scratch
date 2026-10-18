// Sentences for word-order challenges (the "Palabra Final" ultimates) and
// fill-in-the-blank prompts. Keep them short, with one natural word order.

export interface Sentence {
  es: string;
  en: string;
  ch: number;
  /** Other accepted orders, written like `es`. */
  alt?: string[];
  /** Advanced sentences only used at the B1 level. */
  lvl?: 'b1';
}

const S: Sentence[] = [];
function add(ch: number, rows: [string, string, string[]?][]) {
  for (const [es, en, alt] of rows) S.push({ es, en, ch, alt });
}

add(1, [
  ['Hola, me llamo Rosa.', 'Hello, my name is Rosa.'],
  ['El mar es grande.', 'The sea is big.'],
  ['El agua está fría.', 'The water is cold.'],
  ['Mi padre tiene un barco.', 'My father has a boat.'],
  ['El cangrejo es pequeño.', 'The crab is small.'],
  ['Gracias, mi amigo.', 'Thanks, my friend.'],
  ['La noche es fría.', 'The night is cold.'],
  ['Buenos días, abuela.', 'Good morning, grandma.'],
  ['El sol está caliente.', 'The sun is hot.'],
  ['La luna está en el cielo.', 'The moon is in the sky.'],
  ['Hay una estrella en el cielo.', 'There is a star in the sky.'],
  ['La cueva es muy grande.', 'The cave is very big.'],
]);
add(2, [
  ['Quiero comprar pan.', 'I want to buy bread.'],
  ['¿Cuánto cuesta el queso?', 'How much does the cheese cost?'],
  ['Tengo mucha hambre.', "I'm very hungry."],
  ['Me gusta la sopa.', 'I like the soup.'],
  ['La fruta es barata.', 'The fruit is cheap.'],
  ['El café está caliente.', 'The coffee is hot.'],
  ['Lola canta una canción.', 'Lola sings a song.'],
  ['Quiero dos huevos, por favor.', 'I want two eggs, please.'],
  ['El queso es muy caro.', 'The cheese is very expensive.'],
  ['La cena está deliciosa.', 'Dinner is delicious.'],
  ['Mateo come mucho pan.', 'Mateo eats a lot of bread.'],
]);
add(3, [
  ['El lobo es gris.', 'The wolf is grey.'],
  ['El perro es mi amigo.', 'The dog is my friend.'],
  ['La flor es muy bonita.', 'The flower is very pretty.'],
  ['El conejo es muy rápido.', 'The rabbit is very fast.'],
  ['El bosque es oscuro.', 'The forest is dark.'],
  ['La loba está triste.', 'The she-wolf is sad.'],
  ['El gato negro duerme.', 'The black cat sleeps.'],
  ['Hay una araña en el árbol.', 'There is a spider in the tree.'],
  ['Las hojas son verdes.', 'The leaves are green.'],
  ['El oso come fruta.', 'The bear eats fruit.'],
]);
add(4, [
  ['Me duele la cabeza.', 'My head hurts.'],
  ['Mi hermana canta muy bien.', 'My sister sings very well.'],
  ['Vamos a subir la montaña.', "We're going to climb the mountain."],
  ['No puedo ver nada.', "I can't see anything."],
  ['¿Dónde está el templo?', 'Where is the temple?'],
  ['Mi familia vive en el pueblo.', 'My family lives in the village.'],
  ['Mañana vamos a la torre.', 'Tomorrow we go to the tower.', ['Vamos a la torre mañana.']],
  ['El monje no habla.', "The monk doesn't speak."],
  ['Tengo los pies cansados.', 'My feet are tired.'],
  ['Hoy hace mucho frío.', "It's very cold today.", ['Hace mucho frío hoy.']],
]);
add(5, [
  ['No estás solo.', "You're not alone."],
  ['No tengo miedo.', "I'm not afraid."],
  ['Todavía hay esperanza.', 'There is still hope.', ['Hay esperanza todavía.']],
  ['Vamos a luchar juntos.', "We're going to fight together."],
  ['Recuerdo tu voz.', 'I remember your voice.'],
  ['Te perdono, hermano.', 'I forgive you, brother.'],
  ['Creo en ti.', 'I believe in you.'],
  ['Quiero volver a casa.', 'I want to return home.'],
  ['Las palabras son poder.', 'Words are power.'],
  ['Eres muy valiente.', 'You are very brave.'],
]);

// Advanced (B1): subjunctive, future, conditional, commands.
for (const [es, en, alt] of [
  ['Espero que tengáis un buen viaje.', 'I hope you all have a good trip.'],
  ['Ojalá haga sol mañana.', "I hope it's sunny tomorrow."],
  ['Cuando llegues, llámame.', 'When you arrive, call me.'],
  ['No creo que sea verdad.', "I don't think it's true."],
  ['Mañana iremos a la playa.', "Tomorrow we'll go to the beach.", ['Iremos a la playa mañana.']],
  ['Me gustaría un café con leche.', "I'd like a white coffee."],
  ['¿Podrías ayudarme, por favor?', 'Could you help me, please?'],
  ['Venid a mi casa esta noche.', 'Come (you all) to my house tonight.', ['Esta noche venid a mi casa.']],
  ['Quiero que me digas la verdad.', 'I want you to tell me the truth.'],
  ['Si tengo tiempo, te llamaré.', "If I have time, I'll call you.", ['Te llamaré si tengo tiempo.']],
  ['Es importante que practiques cada día.', "It's important that you practise every day."],
  ['¡No me tomes el pelo!', "Don't pull my leg!"],
] as [string, string, string[]?][]) S.push({ es, en, ch: 1, alt, lvl: 'b1' });

export const SENTENCES: readonly Sentence[] = S;

export function sentencesUpToChapter(ch: number, level: 'a1' | 'a2' | 'b1' = 'a2'): Sentence[] {
  const pool = S.filter((s) => s.ch <= Math.max(1, ch) && (level === 'b1' || !s.lvl));
  if (level !== 'a1') return pool;
  // Beginners build short sentences.
  const short = pool.filter((s) => tokenize(s.es).length <= 6);
  return short.length >= 3 ? short : pool;
}

const PROPER = new Set(['rosa', 'mateo', 'lola']);

/** Split a sentence into lowercase word tiles, dropping punctuation. */
export function tokenize(es: string): string[] {
  return es
    .replace(/[¿?¡!.,;:—"«»]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (PROPER.has(t.toLowerCase()) ? t[0].toUpperCase() + t.slice(1).toLowerCase() : t.toLowerCase()));
}
