// The hero's travel diary: the story so far, one short entry per milestone,
// told the way stories are told in Spanish — the imperfecto sets the scene
// (vivía, estaba), the indefinido says what happened (fui, encontré).
// Entries are listed in story order and appear once their flag is set;
// "{asustado|asustada}" agrees with the hero.

export interface JournalEntry {
  id: string;
  /** The chapter it belongs to (0 = prologue). */
  ch: number;
  title: [es: string, en: string];
  es: string;
  en: string;
  /** The story flag that unlocks it. */
  flag: string;
}

export const JOURNAL: readonly JournalEntry[] = [
  // ------------------------------------------------------------ prologue
  {
    id: 'formacion',
    ch: 0,
    title: ['Un día especial', 'A special day'],
    es: 'Vivía con mi abuela Rosa en Puerto Alegre, un pueblo pequeño junto al mar. Una mañana, la abuela empezó mi formación de Palabrista. Practiqué con un muñeco de paja.',
    en: 'I lived with my grandmother Rosa in Puerto Alegre, a small village by the sea. One morning, Grandma started my training as a Palabrista. I practised on a straw dummy.',
    flag: 'intro_done',
  },
  {
    id: 'niebla',
    ch: 0,
    title: ['La niebla gris', 'The grey fog'],
    es: 'Fui a comprar pan. De repente, llegó una niebla gris. En casa, un hombre con capucha dejó muda a la abuela, pero antes ella me dio su Grimorio. Estaba muy {asustado|asustada}.',
    en: 'I went to buy bread. Suddenly, a grey fog rolled in. At home, a hooded man struck Grandma silent, but first she gave me her Grimorio. I was very scared.',
    flag: 'abuela_silenced',
  },
  // ------------------------------------------------------- 1. La Costa
  {
    id: 'mateo',
    ch: 1,
    title: ['Mateo', 'Mateo'],
    es: 'En el muelle encontré a Mateo, el hijo de Don Ramón. Su padre tampoco podía hablar. Mateo cogió su remo y vino conmigo.',
    en: "On the pier I found Mateo, Don Ramón's son. His father couldn't speak either. Mateo grabbed his oar and came with me.",
    flag: 'mateo_joined',
  },
  {
    id: 'faro',
    ch: 1,
    title: ['La luz del faro', "The lighthouse's light"],
    es: 'El faro estaba apagado. En la cueva, debajo del faro, luchamos contra el Cangrejo Rey. Toqué el cristal y salió una palabra: LUZ. ¡El faro brilló otra vez!',
    en: 'The lighthouse was dark. In the cave below it, we fought the King Crab. I touched the crystal and a word came out: LUZ (light). The lighthouse shone again!',
    flag: 'faro_lit',
  },
  // ------------------------------------------------------- 2. San Sabor
  {
    id: 'lola',
    ch: 2,
    title: ['Lola', 'Lola'],
    es: 'En San Sabor, el mercado estaba en silencio. En la plaza conocimos a Lola, una música de Sevilla. No recordaba la letra de su canción. La ayudamos y vino con nosotros.',
    en: "In San Sabor, the market was silent. In the square we met Lola, a musician from Seville. She couldn't remember the words of her song. We helped her and she came with us.",
    flag: 'lola_joined',
  },
  {
    id: 'gloton',
    ch: 2,
    title: ['El Glotón', 'The Glutton'],
    es: 'En la bodega del panadero vivía el Glotón, un monstruo que se comía las palabras de la comida. Lo vencimos, y el mercado recuperó sus voces y sus olores.',
    en: "In the baker's cellar lived the Glutton, a monster that was eating the words for food. We beat it, and the market got its voices and smells back.",
    flag: 'sabor',
  },
  // ----------------------------------------------- 3. El Bosque Susurrante
  {
    id: 'flores',
    ch: 3,
    title: ['Las flores grises', 'The grey flowers'],
    es: 'El Bosque Susurrante no tenía color. Devolvimos el color a tres flores grises y las espinas se abrieron. En el claro nos esperaba una loba gris, muy triste y muy enfadada.',
    en: 'The Whispering Forest had no colour. We gave the colour back to three grey flowers, and the thorns opened. In the glade a grey she-wolf was waiting for us, very sad and very angry.',
    flag: 'loba',
  },
  {
    id: 'color',
    ch: 3,
    title: ['¡Color!', 'Colour!'],
    es: 'La loba no era mala: el Silencio tenía a sus lobeznos. Después de la batalla, los lobeznos volvieron con su madre. Toqué el cristal y todos los colores volvieron al bosque.',
    en: "The she-wolf wasn't bad: the Silence had her cubs. After the battle, the cubs came back to their mother. I touched the crystal and every colour came back to the forest.",
    flag: 'color',
  },
  // ------------------------------------------------------ 4. El Monte Eco
  {
    id: 'tomas',
    ch: 4,
    title: ['El secreto del templo', "The temple's secret"],
    es: 'Subimos al Monte Eco. Hacía mucho frío y estábamos hechos polvo. En el templo, el hermano Tomás nos contó un secreto: El Callado era Bruno, el hermano pequeño de la abuela.',
    en: "We climbed Mount Echo. It was freezing and we were exhausted. In the temple, Brother Tomás told us a secret: El Callado was Bruno, Grandma's little brother.",
    flag: 'tomas_story',
  },
  {
    id: 'voz',
    ch: 4,
    title: ['Los gestos de los monjes', "The monks' gestures"],
    es: 'Los monjes no hablaban, pero nos ayudaron con gestos. Detrás de la puerta interior luchamos contra el Gólem. En el cristal dormía otra palabra: VOZ.',
    en: "The monks didn't speak, but they helped us with gestures. Behind the inner gate we fought the Golem. Another word was sleeping in the crystal: VOZ (voice).",
    flag: 'voz',
  },
  // ----------------------------------------------------- 5. La Torre Muda
  {
    id: 'recuerdos',
    ch: 5,
    title: ['Los recuerdos de Bruno', "Bruno's memories"],
    es: 'En la Torre Muda vimos los recuerdos de Bruno. De niño, siempre cantaba. Una noche de tormenta, salvó a Rosa con una palabra de poder… y nunca más pudo hablar.',
    en: "In the Mute Tower we saw Bruno's memories. As a boy, he was always singing. One stormy night he saved Rosa with a word of power… and could never speak again.",
    flag: 'gate_torre1',
  },
  {
    id: 'fin',
    ch: 5,
    title: ['No estás solo', "You're not alone"],
    es: 'En la cima, le dije a Bruno: «No estás solo». Entonces, Bruno habló por primera vez en cuarenta años. Esa noche, toda la costa celebró una gran fiesta en Puerto Alegre.',
    en: 'At the top, I told Bruno: “You’re not alone.” Then Bruno spoke for the first time in forty years. That night, the whole coast held a big party in Puerto Alegre.',
    flag: 'fin',
  },
  // ------------------------------------- 6. Los gigantes de La Mancha
  {
    id: 'dama',
    ch: 6,
    title: ['La Dama Gris', 'The Grey Lady'],
    es: 'Unos días después, el Grimorio empezó a quedarse en blanco. Bruno nos habló de la Dama Gris: quería todas las palabras de España para su libro. Bruno vino con nosotros.',
    en: 'A few days later, the Grimorio started to go blank. Bruno told us about the Grey Lady: she wanted every word in Spain for her book. Bruno came with us.',
    flag: 'act2',
  },
  {
    id: 'alonso',
    ch: 6,
    title: ['Don Alonso', 'Don Alonso'],
    es: 'Tomamos el tren a La Mancha. En Villamolinos nadie soñaba y los molinos no giraban. Don Alonso, un caballero muy mayor, decía que los molinos eran gigantes.',
    en: "We took the train to La Mancha. In Villamolinos nobody was dreaming and the windmills weren't turning. Don Alonso, a very old knight, said the windmills were giants.",
    flag: 'alonso_met',
  },
  {
    id: 'sueno',
    ch: 6,
    title: ['Sueño', 'Dreams'],
    es: '¡Esta vez tenía razón! En el cerro luchamos contra un gigante de verdad. Encontramos la Palabra Madre de La Mancha, SUEÑO, y los molinos giraron otra vez.',
    en: 'This time he was right! On the ridge we fought a real giant. We found the Mother Word of La Mancha, SUEÑO (dream, sleepiness), and the windmills turned again.',
    flag: 'mancha_done',
  },
  // -------------------------------------- 7–10: still being written
  {
    id: 'valencia',
    ch: 7,
    title: ['El fuego de Valencia', 'The fire of Valencia'],
    es: 'En Valencia empezaban las Fallas, pero el fuego no quería arder. Al final salvamos otra Palabra Madre, y la noche se llenó de luz y de música.',
    en: 'In Valencia the Fallas were starting, but the fire refused to burn. In the end we saved another Mother Word, and the night filled with light and music.',
    flag: 'valencia_done',
  },
  {
    id: 'sevilla',
    ch: 8,
    title: ['La ciudad de Lola', "Lola's city"],
    es: 'Por fin llegamos a Sevilla, la ciudad de Lola. Hacía muchísimo calor. Allí salvamos la Palabra Madre del sur.',
    en: "At last we reached Seville, Lola's city. It was incredibly hot. There we saved the Mother Word of the south.",
    flag: 'sevilla_done',
  },
  {
    id: 'granada',
    ch: 8,
    title: ['Granada', 'Granada'],
    es: 'También visitamos Granada. La Alhambra era un palacio precioso, lleno de patios, fuentes y flores.',
    en: 'We also visited Granada. The Alhambra was a beautiful palace, full of courtyards, fountains and flowers.',
    flag: 'granada_done',
  },
  {
    id: 'santiago',
    ch: 9,
    title: ['El final del Camino', 'The end of the Camino'],
    es: 'En Santiago de Compostela llovía, claro. Allí terminaba el Camino de los peregrinos, y allí salvamos otra Palabra Madre.',
    en: "In Santiago de Compostela it was raining, of course. That's where the pilgrims' Camino ended, and there we saved another Mother Word.",
    flag: 'santiago_done',
  },
  {
    id: 'salamanca',
    ch: 10,
    title: ['Donde empezó todo', 'Where it all began'],
    es: 'En Salamanca, Bruno volvió a la vieja biblioteca. Allí, hace cuarenta años, encontró el libro gris. Y allí terminó nuestro gran viaje por España.',
    en: 'In Salamanca, Bruno went back to the old library. There, forty years ago, he found the grey book. And there our great journey across Spain came to an end.',
    flag: 'salamanca_done',
  },
];

/** The entries the player has lived through, in story order. */
export function journalEntries(flags: Readonly<Record<string, unknown>>): JournalEntry[] {
  return JOURNAL.filter((e) => !!flags[e.flag]);
}
