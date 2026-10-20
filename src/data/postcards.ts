// Postales: one collectible postcard per place, each with a short note about
// Spain. A postcard unlocks when its story flag is set, so regions still being
// written simply keep theirs locked until their flags exist.

export interface Postcard {
  id: string;
  /** Which train region it belongs to (world/stops.ts); Act I's coast is 'puerto'. */
  region: string;
  /** Where it is found: shown on the locked card as a hint. */
  place: string;
  icon: string;
  es: string;
  en: string;
  /** Two or three sentences of simple Spanish, and their English. */
  note: [es: string, en: string];
  /** The story flag that unlocks it. */
  flag: string;
}

export const POSTCARDS: readonly Postcard[] = [
  // ---------------------------------------------------------------- Act I
  {
    id: 'asturias',
    region: 'puerto',
    place: 'Puerto Alegre',
    icon: '⚓',
    es: 'La costa de Asturias',
    en: 'The Asturian coast',
    note: [
      'Puerto Alegre está en Asturias, en el norte de España. Aquí llueve mucho y todo es muy verde. La bebida típica es la sidra: el camarero la echa desde muy alto.',
      'Puerto Alegre is in Asturias, in the north of Spain. It rains a lot here and everything is very green. The typical drink is cider: the waiter pours it from high up.',
    ],
    flag: 'faro_lit',
  },
  {
    id: 'camino',
    region: 'puerto',
    place: 'El camino a San Sabor',
    icon: '🐚',
    es: 'El Camino de Santiago',
    en: 'The Way of St James',
    note: [
      'Cada año, cientos de miles de peregrinos caminan hasta Santiago de Compostela. Su símbolo es la concha. El Camino del Norte pasa junto al mar, por Asturias.',
      'Every year, hundreds of thousands of pilgrims walk to Santiago de Compostela. Their symbol is the scallop shell. The Northern Way runs along the sea, through Asturias.',
    ],
    flag: 'peregrina_ok',
  },
  {
    id: 'mercado',
    region: 'puerto',
    place: 'San Sabor',
    icon: '🧺',
    es: 'El mercado',
    en: 'The market',
    note: [
      'En el mercado se compra fruta, pescado y queso fresco. Después, la gente toma unas tapas en el bar. ¡Ojo! En España se come tarde, a las dos o a las tres, y se cena a las nueve o a las diez.',
      'At the market people buy fruit, fish and fresh cheese. Afterwards they have some tapas at the bar. Careful! In Spain lunch is late, at two or three, and dinner is at nine or ten.',
    ],
    flag: 'sabor',
  },
  {
    id: 'osos',
    region: 'puerto',
    place: 'El Bosque Susurrante',
    icon: '🐻',
    es: 'Lobos y osos',
    en: 'Wolves and bears',
    note: [
      'En los bosques del norte de España todavía viven lobos y osos pardos. Hace treinta años quedaban muy pocos osos; hoy hay más de trescientos. El oso pardo es un animal protegido.',
      'Wolves and brown bears still live in the forests of northern Spain. Thirty years ago very few bears were left; today there are more than three hundred. The brown bear is a protected animal.',
    ],
    flag: 'color',
  },
  {
    id: 'picos',
    region: 'puerto',
    place: 'El Monte Eco',
    icon: '🏔️',
    es: 'Los Picos de Europa',
    en: 'The Picos de Europa',
    note: [
      'Los Picos de Europa son unas montañas muy altas entre Asturias, Cantabria y León. En invierno tienen mucha nieve. Aquí está el parque nacional más antiguo de España, de 1918.',
      "The Picos de Europa are very high mountains between Asturias, Cantabria and León. In winter they have lots of snow. Spain's oldest national park is here, from 1918.",
    ],
    flag: 'voz',
  },
  {
    id: 'idioma',
    region: 'puerto',
    place: 'La Torre Muda',
    icon: '💬',
    es: 'Las palabras del español',
    en: 'The words of Spanish',
    note: [
      'Casi seiscientos millones de personas hablan español en el mundo. Muchas palabras vienen del latín, pero unas cuatro mil vienen del árabe: aceite, azúcar, almohada…',
      'Almost six hundred million people speak Spanish around the world. Many words come from Latin, but about four thousand come from Arabic: aceite (oil), azúcar (sugar), almohada (pillow)…',
    ],
    flag: 'fin',
  },
  {
    id: 'ave',
    region: 'puerto',
    place: 'La estación',
    icon: '🚄',
    es: 'El AVE',
    en: 'The AVE',
    note: [
      'El AVE (Alta Velocidad Española) es el tren rápido de España. El primero unió Madrid y Sevilla en 1992. Hoy, España tiene la red de alta velocidad más grande de Europa.',
      "The AVE (Spanish High Speed) is Spain's fast train. The first one joined Madrid and Seville in 1992. Today Spain has the biggest high-speed rail network in Europe.",
    ],
    flag: 'act2',
  },
  // ------------------------------------------------------------ La Mancha
  {
    id: 'molinos',
    region: 'mancha',
    place: 'Villamolinos',
    icon: '🌾',
    es: 'Los molinos de viento',
    en: 'The windmills',
    note: [
      'En La Mancha hay molinos de viento blancos en lo alto de los cerros, por ejemplo en Consuegra y en Campo de Criptana. Antes molían el trigo para hacer harina. Hoy son el símbolo de la región.',
      'In La Mancha there are white windmills on top of the hills, for example in Consuegra and Campo de Criptana. They used to grind wheat into flour. Today they are the symbol of the region.',
    ],
    flag: 'mancha_done',
  },
  {
    id: 'manchego',
    region: 'mancha',
    place: 'Villamolinos',
    icon: '🧀',
    es: 'El queso manchego',
    en: 'Manchego cheese',
    note: [
      'El queso manchego se hace con leche de ovejas manchegas. Cuanto más tiempo pasa, más fuerte es: semicurado, curado, viejo. Se come con pan y, a veces, con membrillo.',
      'Manchego cheese is made with milk from Manchega sheep. The longer it ages, the stronger it gets: semicurado, curado, viejo. It is eaten with bread and sometimes with quince paste.',
    ],
    flag: 'quesera_quiz',
  },
  {
    id: 'quijote',
    region: 'mancha',
    place: 'Villamolinos',
    icon: '📖',
    es: 'Don Quijote de la Mancha',
    en: 'Don Quixote',
    note: [
      'Miguel de Cervantes escribió Don Quijote de la Mancha. La primera parte salió en 1605. Don Quijote leía tantos libros de caballeros que salió a buscar aventuras con Sancho Panza… ¡y luchó contra unos molinos!',
      'Miguel de Cervantes wrote Don Quixote. The first part came out in 1605. Don Quixote read so many books about knights that he set off in search of adventures with Sancho Panza… and fought some windmills!',
    ],
    flag: 'mancha_reward',
  },
  // ------------------------------------------------------------- Valencia
  {
    id: 'fallas',
    region: 'valencia',
    place: 'Valencia',
    icon: '🔥',
    es: 'Las Fallas',
    en: 'Las Fallas',
    note: [
      'Cada año, en marzo, Valencia celebra las Fallas. Los artistas hacen enormes figuras de cartón y madera. La noche del 19 de marzo las queman todas: es una gran noche de fuego.',
      'Every year in March, Valencia celebrates Las Fallas. Artists build enormous figures out of cardboard and wood. On the night of 19 March they burn them all: a great night of fire.',
    ],
    flag: 'valencia_done',
  },
  {
    id: 'paella',
    region: 'valencia',
    place: 'Valencia',
    icon: '🥘',
    es: 'La paella',
    en: 'Paella',
    note: [
      'La paella nació en los campos de arroz de Valencia. La paella valenciana lleva arroz, pollo, conejo, judías verdes y azafrán. ¡No lleva chorizo!',
      'Paella was born in the rice fields of Valencia. Paella valenciana has rice, chicken, rabbit, green beans and saffron. It does not have chorizo!',
    ],
    flag: 'valencia_done',
  },
  {
    id: 'horchata',
    region: 'valencia',
    place: 'Valencia',
    icon: '🥛',
    es: 'La horchata',
    en: 'Horchata',
    note: [
      'La horchata es una bebida blanca, dulce y muy fría. En Valencia se hace con chufa, agua y azúcar. Se toma con fartons, unos bollos largos y dulces.',
      'Horchata is a white, sweet, ice-cold drink. In Valencia it is made from tiger nuts (chufa), water and sugar. You have it with fartons, long sweet buns.',
    ],
    flag: 'valencia_done',
  },
  // ------------------------------------------------------------ Andalucía
  {
    id: 'giralda',
    region: 'sevilla',
    place: 'Sevilla',
    icon: '🔔',
    es: 'La Giralda',
    en: 'La Giralda',
    note: [
      'La Giralda es la torre de la catedral de Sevilla. Antes era el alminar de una mezquita; después, los cristianos la convirtieron en campanario. Por dentro tiene rampas en vez de escaleras: dicen que así se podía subir a caballo.',
      'La Giralda is the tower of Seville Cathedral. It used to be the minaret of a mosque; later the Christians turned it into a bell tower. Inside it has ramps instead of stairs: they say that way you could ride up on horseback.',
    ],
    flag: 'sevilla_done',
  },
  {
    id: 'flamenco',
    region: 'sevilla',
    place: 'Sevilla',
    icon: '💃',
    es: 'El flamenco',
    en: 'Flamenco',
    note: [
      'El flamenco nació en Andalucía. Tiene tres partes: el cante (la voz), el toque (la guitarra) y el baile. Desde 2010 es Patrimonio de la Humanidad.',
      'Flamenco was born in Andalusia. It has three parts: cante (singing), toque (guitar) and baile (dance). Since 2010 it has been on UNESCO’s list of the Intangible Cultural Heritage of Humanity.',
    ],
    flag: 'sevilla_done',
  },
  {
    id: 'alhambra',
    region: 'sevilla',
    place: 'Granada',
    icon: '🏰',
    es: 'La Alhambra',
    en: 'The Alhambra',
    note: [
      'La Alhambra es un palacio y una fortaleza en Granada. La construyeron los reyes nazaríes, sobre todo en los siglos XIII y XIV. En sus paredes hay poemas escritos en árabe.',
      'The Alhambra is a palace and fortress in Granada. The Nasrid kings built it, mostly in the 13th and 14th centuries. On its walls there are poems written in Arabic.',
    ],
    flag: 'granada_done',
  },
  // -------------------------------------------------------------- Galicia
  {
    id: 'botafumeiro',
    region: 'santiago',
    place: 'Santiago de Compostela',
    icon: '⛪',
    es: 'La Catedral de Santiago',
    en: 'Santiago Cathedral',
    note: [
      'Al final del Camino está la Catedral de Santiago de Compostela. Allí, el botafumeiro vuela de un lado a otro de la iglesia. Es un incensario enorme: pesa unos cincuenta kilos.',
      'At the end of the Camino stands the Cathedral of Santiago de Compostela. There, the botafumeiro swings from one side of the church to the other. It is an enormous incense burner: it weighs about fifty kilos.',
    ],
    flag: 'santiago_done',
  },
  {
    id: 'pulpo',
    region: 'santiago',
    place: 'Santiago de Compostela',
    icon: '🐙',
    es: 'El pulpo a la gallega',
    en: 'Galician-style octopus',
    note: [
      'Uno de los platos más famosos de Galicia es el pulpo a la gallega: pulpo cocido con aceite de oliva, sal y pimentón. Se sirve en un plato de madera.',
      'One of the most famous dishes in Galicia is pulpo a la gallega: boiled octopus with olive oil, salt and paprika. It is served on a wooden plate.',
    ],
    flag: 'santiago_done',
  },
  // ------------------------------------------------------------ Salamanca
  {
    id: 'rana',
    region: 'salamanca',
    place: 'Salamanca',
    icon: '🐸',
    es: 'La Universidad de Salamanca',
    en: 'The University of Salamanca',
    note: [
      'La Universidad de Salamanca es de 1218: es la más antigua de España. En su fachada hay una pequeña rana sobre una calavera. Dicen que, si la encuentras sin ayuda, aprobarás tus exámenes.',
      "The University of Salamanca dates from 1218: it is the oldest in Spain. On its façade there is a little frog sitting on a skull. They say that if you find it without help, you'll pass your exams.",
    ],
    flag: 'salamanca_done',
  },
  {
    id: 'plaza_mayor',
    region: 'salamanca',
    place: 'Salamanca',
    icon: '🕰️',
    es: 'La Plaza Mayor',
    en: 'The Plaza Mayor',
    note: [
      'La Plaza Mayor de Salamanca es del siglo XVIII. Por la tarde, el sol hace brillar sus piedras doradas. La gente de Salamanca queda allí con sus amigos, «debajo del reloj».',
      "Salamanca's Plaza Mayor dates from the 18th century. In the evening the sun makes its golden stones glow. People in Salamanca meet their friends there, «under the clock».",
    ],
    flag: 'salamanca_done',
  },
];

/** Region headings for the album; a region missing here falls back to its station's name. */
export const POSTCARD_REGIONS: Readonly<Record<string, [es: string, en: string]>> = {
  puerto: ['Asturias', 'the north coast'],
  mancha: ['La Mancha', 'windmills and wheat'],
  valencia: ['Valencia', 'rice, oranges and fire'],
  sevilla: ['Andalucía', 'the south'],
  santiago: ['Galicia', 'the green north-west'],
  salamanca: ['Salamanca', 'the old university town'],
};

type Flags = Readonly<Record<string, unknown>>;

const seenKey = (p: Postcard) => `postal:${p.id}`;

export function unlockedPostcards(flags: Flags): Postcard[] {
  return POSTCARDS.filter((p) => !!flags[p.flag]);
}

/** Postcards unlocked since the player was last told about them. */
export function newPostcards(flags: Flags): Postcard[] {
  return unlockedPostcards(flags).filter((p) => !flags[seenKey(p)]);
}

/** Remember that the player has been told about these. */
export function markPostcardsSeen(flags: Record<string, number | boolean | string>, cards: readonly Postcard[]) {
  for (const p of cards) flags[seenKey(p)] = true;
}
