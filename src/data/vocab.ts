// Vocabulary for the whole game, grouped by the chapter that introduces it.
//
// Row format: [spanish, english, emoji?, exampleEs?, exampleEn?]
//  - Nouns are written with their article ("el mar", "la playa"); the article
//    decides the gender. Feminine nouns that take "el" (el agua) are marked
//    with a trailing " (f)".
//  - Words with gendered forms list both separated by "|" ("pequeño|pequeña").
//    The first form is the one shown; every form is accepted when typing.

export type POS = 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'num';
export type Gender = 'm' | 'f' | 'both';

export interface Word {
  id: string;
  /** Display form, with article for nouns: "el mar". */
  es: string;
  /** Bare form without article: "mar". */
  bare: string;
  /** Every accepted Spanish answer (bare forms). */
  forms: string[];
  en: string;
  pos: POS;
  gender?: Gender;
  article?: 'el' | 'la';
  cat: string;
  ch: number;
  emoji?: string;
  ex?: [string, string];
}

type Row = [string, string, string?, string?, string?];

const ALL: Word[] = [];

function block(ch: number, cat: string, pos: POS, rows: Row[]) {
  for (const [rawEs, en, emoji, exEs, exEn] of rows) {
    let es = rawEs;
    let forcedF = false;
    if (es.endsWith(' (f)')) {
      forcedF = true;
      es = es.slice(0, -4);
    }
    const variants = es.split('|');
    let wordPos: POS = pos;
    let gender: Gender | undefined;
    let article: 'el' | 'la' | undefined;
    const bareForms: string[] = [];
    const genders = new Set<string>();
    for (const v of variants) {
      const m = pos === 'noun' ? /^(el|la) (.+)$/.exec(v) : null;
      if (m) {
        wordPos = 'noun';
        genders.add(m[1]);
        article ??= m[1] as 'el' | 'la';
        bareForms.push(m[2]);
      } else {
        bareForms.push(v);
      }
    }
    if (wordPos === 'noun') {
      if (genders.size > 1) gender = 'both';
      else gender = forcedF || article === 'la' ? 'f' : 'm';
    }
    const display = variants[0];
    const bare = bareForms[0];
    let id = slug(bare);
    // "¡ojo!" (watch out) vs "el ojo" (eye): keep ids unique.
    if (ALL.some((w) => w.id === id)) id += '-' + wordPos;
    ALL.push({
      id,
      es: display,
      bare,
      forms: bareForms,
      en,
      pos: wordPos,
      gender,
      article,
      cat,
      ch,
      emoji: emoji || undefined,
      ex: exEs && exEn ? [exEs, exEn] : undefined,
    });
  }
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------- Prólogo (0)
block(0, 'saludos', 'phrase', [
  ['hola', 'hello', '', '¡Hola, Mateo!', 'Hello, Mateo!'],
  ['adiós', 'goodbye', '', 'Adiós, abuela.', 'Goodbye, grandma.'],
  ['gracias', 'thank you', '', 'Gracias por la sopa.', 'Thanks for the soup.'],
  ['por favor', 'please', '', 'Agua, por favor.', 'Water, please.'],
  ['buenos días', 'good morning', '🌅', 'Buenos días, señora.', "Good morning, ma'am."],
  ['buenas tardes', 'good afternoon', '', 'Buenas tardes, amigo.', 'Good afternoon, friend.'],
  ['buenas noches', 'good night', '', 'Buenas noches, abuela.', 'Good night, grandma.'],
  ['¿cómo estás?', 'how are you?', '', '¡Hola! ¿Cómo estás?', 'Hi! How are you?'],
  ['lo siento', "I'm sorry", '', 'Lo siento mucho.', "I'm very sorry."],
  ['de nada', "you're welcome", '', '—Gracias. —De nada.', "—Thanks. —You're welcome."],
  ['me llamo', 'my name is', '', 'Me llamo Rosa.', 'My name is Rosa.'],
  ['perdón', 'excuse me', '', 'Perdón, ¿dónde está el faro?', 'Excuse me, where is the lighthouse?'],
  ['vale', 'okay', '', '—¿Vamos? —¡Vale!', '—Shall we go? —Okay!'],
  ['¿qué tal?', "how's it going?", '', '¡Hola, Mateo! ¿Qué tal?', "Hi, Mateo! How's it going?"],
  ['hasta luego', 'see you later', '', '¡Hasta luego, abuela!', 'See you later, grandma!'],
  ['encantado|encantada', 'nice to meet you', '', 'Me llamo Lola. ¡Encantada!', "I'm Lola. Nice to meet you!"],
]);
block(0, 'saludos', 'adv', [
  ['sí', 'yes', '', 'Sí, quiero ir.', 'Yes, I want to go.'],
  ['bien', 'well / fine', '', 'Estoy bien, gracias.', "I'm fine, thanks."],
  ['mal', 'badly / unwell', '', 'Hoy estoy mal.', 'Today I feel bad.'],
  ['aquí', 'here', '', 'Mi casa está aquí.', 'My house is here.'],
]);
block(0, 'básico', 'noun', [
  ['la abuela', 'grandmother', '👵', 'Mi abuela es muy sabia.', 'My grandmother is very wise.'],
  ['el amigo|la amiga', 'friend', '🤝', 'Mateo es mi amigo.', 'Mateo is my friend.'],
  ['la palabra', 'word', '💬', 'Cada palabra tiene poder.', 'Every word has power.'],
  ['el libro', 'book', '📖', 'El libro es viejo.', 'The book is old.'],
  ['la magia', 'magic', '✨', 'La magia está en las palabras.', 'The magic is in the words.'],
  ['el pueblo', 'village', '🏘️', 'Mi pueblo está cerca del mar.', 'My village is near the sea.'],
  ['la puerta', 'door', '🚪', 'Abre la puerta, por favor.', 'Open the door, please.'],
  ['la casa', 'house', '🏠', 'La casa de la abuela es azul.', "Grandma's house is blue."],
]);

// ------------------------------------------------------------- La Costa (1)
block(1, 'la costa', 'noun', [
  ['el mar', 'sea', '🌊', 'El mar está tranquilo hoy.', 'The sea is calm today.'],
  ['la playa', 'beach', '🏖️', 'Vamos a la playa.', "Let's go to the beach."],
  ['el agua (f)', 'water', '💧', 'El agua está fría.', 'The water is cold.'],
  ['el sol', 'sun', '☀️', 'El sol es muy fuerte.', 'The sun is very strong.'],
  ['la arena', 'sand', '', 'La arena está caliente.', 'The sand is hot.'],
  ['el pez', 'fish (animal)', '🐟', 'Hay un pez en el agua.', 'There is a fish in the water.'],
  ['el barco', 'boat', '⛵', 'Mi padre tiene un barco.', 'My father has a boat.'],
  ['el cielo', 'sky', '', 'El cielo está gris.', 'The sky is grey.'],
  ['la nube', 'cloud', '☁️', 'Hay una nube negra.', 'There is a black cloud.'],
  ['el viento', 'wind', '🌬️', 'El viento es frío.', 'The wind is cold.'],
  ['la luna', 'moon', '🌙', 'La luna sale de noche.', 'The moon comes out at night.'],
  ['la estrella', 'star', '⭐', 'Una estrella brilla en el cielo.', 'A star shines in the sky.'],
  ['la ola', 'wave', '', 'La ola es enorme.', 'The wave is huge.'],
  ['el faro', 'lighthouse', '', 'La luz del faro está apagada.', "The lighthouse's light is out."],
  ['la isla', 'island', '🏝️', 'Vivimos en una isla.', 'We live on an island.'],
  ['la piedra', 'stone', '🪨', 'La piedra es dura.', 'The stone is hard.'],
  ['el cangrejo', 'crab', '🦀', 'El cangrejo camina de lado.', 'The crab walks sideways.'],
  ['la gaviota', 'seagull', '', 'La gaviota roba mi pan.', 'The seagull steals my bread.'],
  ['la medusa', 'jellyfish', '🪼', 'La medusa pica.', 'The jellyfish stings.'],
  ['el fuego', 'fire', '🔥', 'El fuego es caliente.', 'Fire is hot.'],
  ['la luz', 'light', '💡', 'Necesitamos luz.', 'We need light.'],
  ['el hielo', 'ice', '🧊', 'El hielo es frío.', 'Ice is cold.'],
  ['el rayo', 'lightning bolt', '⚡', '¡Cuidado con el rayo!', 'Watch out for the lightning!'],
  ['la tierra', 'earth / land', '', 'La tierra está seca.', 'The land is dry.'],
  ['el día', 'day', '', 'Hoy es un buen día.', 'Today is a good day.'],
  ['la noche', 'night', '🌃', 'La noche es oscura.', 'The night is dark.'],
  ['el padre', 'father', '👨', 'Mi padre es pescador.', 'My father is a fisherman.'],
  ['la madre', 'mother', '👩', 'Mi madre canta.', 'My mother sings.'],
  ['el hijo', 'son', '👦', 'Mateo es el hijo del pescador.', "Mateo is the fisherman's son."],
  ['la hija', 'daughter', '👧', 'Tengo una hija.', 'I have a daughter.'],
  ['la cueva', 'cave', '', 'La cueva es oscura.', 'The cave is dark.'],
  ['el pescador', 'fisherman', '🎣', 'El pescador tiene un barco.', 'The fisherman has a boat.'],
]);
block(1, 'género difícil', 'noun', [
  ['el mapa', 'map', '🗺️', 'El mapa está en la mesa.', 'The map is on the table.'],
  ['el problema', 'problem', '', 'No hay ningún problema.', "There's no problem at all."],
  ['el planeta', 'planet', '🪐', 'El planeta es azul.', 'The planet is blue.'],
  ['la foto', 'photo', '📷', 'Mira esta foto del faro.', 'Look at this photo of the lighthouse.'],
  ['el viaje', 'trip / journey', '🧳', 'El viaje es largo.', 'The journey is long.'],
  ['el puente', 'bridge', '🌉', 'Cruzamos el puente.', 'We cross the bridge.'],
  ['la calle', 'street', '', 'La calle está vacía.', 'The street is empty.'],
]);
block(1, 'expresiones', 'phrase', [
  ['¡venga!', 'come on!', '', '¡Venga, vamos a la playa!', "Come on, let's go to the beach!"],
  ['¡vaya!', 'wow! / oh dear!', '', '¡Vaya! El faro está apagado.', 'Oh dear! The lighthouse is out.'],
  ['¡ojo!', 'watch out!', '', '¡Ojo con el cangrejo!', 'Watch out for the crab!'],
  ['no pasa nada', 'no worries', '', 'Tranquilo, no pasa nada.', "Relax, no worries."],
  ['¡madre mía!', 'oh my goodness!', '', '¡Madre mía, qué ola!', 'Oh my goodness, what a wave!'],
]);
block(1, 'la costa', 'adj', [
  ['grande', 'big', '', 'El barco es grande.', 'The boat is big.'],
  ['pequeño|pequeña', 'small', '', 'El cangrejo es pequeño.', 'The crab is small.'],
  ['frío|fría', 'cold', '', 'El agua está fría.', 'The water is cold.'],
  ['caliente', 'hot', '', 'El sol está caliente.', 'The sun is hot.'],
]);

// ------------------------------------------------------- San Sabor (2)
block(2, 'la comida', 'noun', [
  ['el pan', 'bread', '🍞', 'Quiero pan, por favor.', 'I want bread, please.'],
  ['el queso', 'cheese', '🧀', 'Este queso es delicioso.', 'This cheese is delicious.'],
  ['la manzana', 'apple', '🍎', 'La manzana es roja.', 'The apple is red.'],
  ['la naranja', 'orange (fruit)', '🍊', 'Una naranja, por favor.', 'An orange, please.'],
  ['el tomate', 'tomato', '🍅', 'El tomate está furioso.', 'The tomato is furious.'],
  ['la leche', 'milk', '🥛', 'Bebo leche por la mañana.', 'I drink milk in the morning.'],
  ['el huevo', 'egg', '🥚', 'Quiero dos huevos.', 'I want two eggs.'],
  ['el pollo', 'chicken', '🍗', 'El pollo está caliente.', 'The chicken is hot.'],
  ['el pescado', 'fish (food)', '', 'Me gusta el pescado.', 'I like fish.'],
  ['el arroz', 'rice', '🍚', 'La paella tiene arroz.', 'Paella has rice.'],
  ['la sopa', 'soup', '🥣', 'La sopa está muy caliente.', 'The soup is very hot.'],
  ['la fruta', 'fruit', '', 'Como fruta todos los días.', 'I eat fruit every day.'],
  ['el café', 'coffee', '☕', 'Un café, por favor.', 'A coffee, please.'],
  ['la carne', 'meat', '🥩', 'No como carne.', "I don't eat meat."],
  ['el plátano', 'banana', '🍌', 'El mono come un plátano.', 'The monkey eats a banana.'],
  ['la fresa', 'strawberry', '🍓', 'Me gustan las fresas.', 'I like strawberries.'],
  ['el azúcar', 'sugar', '', 'El café sin azúcar, por favor.', 'Coffee without sugar, please.'],
  ['la sal', 'salt', '🧂', 'La sopa necesita sal.', 'The soup needs salt.'],
  ['la comida', 'food', '', 'La comida está lista.', 'The food is ready.'],
  ['el desayuno', 'breakfast', '', 'El desayuno es a las ocho.', 'Breakfast is at eight.'],
  ['la cena', 'dinner', '', 'La cena está deliciosa.', 'Dinner is delicious.'],
  ['la uva', 'grape', '🍇', 'Las uvas son moradas.', 'The grapes are purple.'],
  ['el limón', 'lemon', '🍋', 'El limón es amarillo.', 'The lemon is yellow.'],
  ['la patata', 'potato', '🥔', 'Me encanta la tortilla de patatas.', 'I love potato omelette.'],
  ['el zumo', 'juice', '🧃', 'Un zumo de naranja, por favor.', 'An orange juice, please.'],
  ['el bocadillo', 'baguette sandwich', '🥖', 'Quiero un bocadillo de jamón.', 'I want a ham sandwich.'],
  ['la tortilla', 'Spanish omelette', '🍳', 'La tortilla de la abuela es la mejor.', "Grandma's omelette is the best."],
  ['la gamba', 'prawn', '🦐', 'Las gambas están muy ricas.', 'The prawns are really tasty.'],
  ['el jamón', 'ham', '', 'El jamón es muy caro.', 'Ham is very expensive.'],
  ['el aceite', 'oil', '🫒', 'Pan con aceite de oliva.', 'Bread with olive oil.'],
  ['el melocotón', 'peach', '🍑', 'El melocotón es dulce.', 'The peach is sweet.'],
  ['el chocolate', 'chocolate', '🍫', 'Churros con chocolate, ¡qué rico!', 'Churros with chocolate, so tasty!'],
  ['la miel', 'honey', '🍯', 'La miel es dulce.', 'Honey is sweet.'],
  ['la tapa', 'tapa (small dish)', '', 'Vamos de tapas esta noche.', "Let's go out for tapas tonight."],
  ['el euro', 'euro', '💶', 'Son tres euros con cincuenta.', "That's three euros fifty."],
  ['el mercado', 'market', '', 'El mercado está cerrado.', 'The market is closed.'],
  ['la tienda', 'shop', '🏪', 'La tienda abre a las nueve.', 'The shop opens at nine.'],
  ['la cocina', 'kitchen', '', 'Lola está en la cocina.', 'Lola is in the kitchen.'],
  ['la guitarra', 'guitar', '🎸', 'Lola toca la guitarra.', 'Lola plays the guitar.'],
  ['la canción', 'song', '🎵', 'Es una canción bonita.', "It's a pretty song."],
]);
block(2, 'los números', 'num', [
  ['uno', 'one', '1️⃣'],
  ['dos', 'two', '2️⃣'],
  ['tres', 'three', '3️⃣'],
  ['cuatro', 'four', '4️⃣'],
  ['cinco', 'five', '5️⃣'],
  ['seis', 'six', '6️⃣'],
  ['siete', 'seven', '7️⃣'],
  ['ocho', 'eight', '8️⃣'],
  ['nueve', 'nine', '9️⃣'],
  ['diez', 'ten', '🔟'],
  ['once', 'eleven'],
  ['doce', 'twelve'],
  ['quince', 'fifteen'],
  ['veinte', 'twenty'],
  ['cien', 'one hundred', '💯'],
]);
block(2, 'las compras', 'adj', [
  ['barato|barata', 'cheap', '', 'El pan es barato.', 'Bread is cheap.'],
  ['caro|cara', 'expensive', '', 'El queso es muy caro.', 'The cheese is very expensive.'],
  ['delicioso|deliciosa', 'delicious', '😋', 'La sopa está deliciosa.', 'The soup is delicious.'],
  ['dulce', 'sweet', '', 'La miel es muy dulce.', 'Honey is very sweet.'],
]);
block(2, 'las compras', 'verb', [
  ['coger', 'to take / grab', '', 'Coge una manzana.', 'Grab an apple.'],
  ['comprar', 'to buy', '', 'Quiero comprar pan.', 'I want to buy bread.'],
  ['vender', 'to sell', '', 'Ella vende fruta.', 'She sells fruit.'],
  ['comer', 'to eat', '', 'Vamos a comer.', "Let's eat."],
  ['beber', 'to drink', '', 'Quiero beber agua.', 'I want to drink water.'],
  ['cocinar', 'to cook', '', 'Mi madre cocina muy bien.', 'My mother cooks very well.'],
  ['cantar', 'to sing', '', 'Lola canta en la plaza.', 'Lola sings in the square.'],
  ['bailar', 'to dance', '💃', '¡Vamos a bailar!', "Let's dance!"],
]);
block(2, 'las compras', 'phrase', [
  ['¿cuánto cuesta?', 'how much does it cost?', '', '¿Cuánto cuesta el queso?', 'How much is the cheese?'],
  ['tengo hambre', "I'm hungry", '', 'Tengo hambre. ¿Comemos?', "I'm hungry. Shall we eat?"],
  ['tengo sed', "I'm thirsty", '', 'Tengo sed. Agua, por favor.', "I'm thirsty. Water, please."],
  ['quiero', 'I want', '', 'Quiero una manzana.', 'I want an apple.'],
  ['me gusta', 'I like', '', 'Me gusta la música.', 'I like music.'],
  ['la cuenta, por favor', 'the bill, please', '', 'Gracias. La cuenta, por favor.', 'Thanks. The bill, please.'],
  ['¿me pone…?', 'could I have…? (ordering)', '', '¿Me pone un café con leche?', 'Could I have a white coffee?'],
  ['¿cuánto es?', 'how much is it?', '', '¿Cuánto es todo?', 'How much is everything?'],
  ['me apetece', 'I feel like (having)', '', 'Me apetece un helado.', 'I feel like an ice cream.'],
  ['me encanta', 'I love (it)', '', 'Me encanta la música.', 'I love music.'],
  ['¡qué rico!', 'how tasty!', '', '¡Mmm, qué rico!', 'Mmm, how tasty!'],
  ['¡qué guay!', 'how cool!', '', '¡Qué guay tu guitarra!', 'Your guitar is so cool!'],
]);

// ------------------------------------------------- El Bosque Susurrante (3)
block(3, 'los animales', 'noun', [
  ['el perro', 'dog', '🐕', 'El perro es mi amigo.', 'The dog is my friend.'],
  ['el gato', 'cat', '🐈', 'El gato duerme.', 'The cat sleeps.'],
  ['el lobo', 'wolf', '🐺', 'El lobo aúlla a la luna.', 'The wolf howls at the moon.'],
  ['el oso', 'bear', '🐻', 'El oso es muy fuerte.', 'The bear is very strong.'],
  ['el pájaro', 'bird', '🐦', 'El pájaro canta.', 'The bird sings.'],
  ['el búho', 'owl', '🦉', 'El búho vive en el árbol.', 'The owl lives in the tree.'],
  ['la araña', 'spider', '🕷️', 'La araña es negra.', 'The spider is black.'],
  ['la serpiente', 'snake', '🐍', 'La serpiente es verde.', 'The snake is green.'],
  ['el conejo', 'rabbit', '🐇', 'El conejo es rápido.', 'The rabbit is fast.'],
  ['el ratón', 'mouse', '🐁', 'El ratón es pequeño.', 'The mouse is small.'],
  ['el caballo', 'horse', '🐎', 'El caballo corre.', 'The horse runs.'],
  ['la rana', 'frog', '🐸', 'La rana salta.', 'The frog jumps.'],
  ['el zorro', 'fox', '🦊', 'El zorro es listo.', 'The fox is clever.'],
  ['el ciervo', 'deer', '🦌', 'El ciervo bebe agua.', 'The deer drinks water.'],
  ['la abeja', 'bee', '🐝', 'La abeja vuela.', 'The bee flies.'],
  ['la mariposa', 'butterfly', '🦋', 'La mariposa es azul.', 'The butterfly is blue.'],
  ['el árbol', 'tree', '🌳', 'El árbol es muy viejo.', 'The tree is very old.'],
  ['la flor', 'flower', '🌸', 'La flor es bonita.', 'The flower is pretty.'],
  ['la hoja', 'leaf', '🍃', 'La hoja es verde.', 'The leaf is green.'],
  ['el bosque', 'forest', '🌲', 'El bosque es oscuro.', 'The forest is dark.'],
  ['el río', 'river', '', 'El río es largo.', 'The river is long.'],
  ['la seta', 'mushroom', '🍄', '¡No comas esa seta!', "Don't eat that mushroom!"],
  ['el camino', 'path', '', 'El camino es largo.', 'The path is long.'],
  ['el color', 'color', '🎨', '¿De qué color es?', 'What color is it?'],
]);
block(3, 'género difícil', 'noun', [
  ['la gente', 'people', '👥', 'La gente del bosque es amable.', 'The people of the forest are kind.'],
  ['la ciudad', 'city', '🏙️', 'La ciudad está lejos.', 'The city is far away.'],
  ['el idioma', 'language', '', 'El español es un idioma bonito.', 'Spanish is a beautiful language.'],
  ['la moto', 'motorbike', '🏍️', 'Mi tía tiene una moto roja.', 'My aunt has a red motorbike.'],
  ['la radio', 'radio', '📻', 'La radio no funciona.', "The radio doesn't work."],
  ['el tema', 'topic', '', 'Cambiamos de tema.', "Let's change the subject."],
  ['la piel', 'skin', '', 'La serpiente cambia de piel.', 'The snake changes its skin.'],
]);
block(3, 'expresiones', 'phrase', [
  ['mola', "it's cool", '', '¡Tu espada mola mucho!', 'Your sword is really cool!'],
  ['¡qué rollo!', 'what a drag!', '', 'Otra vez a caminar… ¡qué rollo!', 'Walking again… what a drag!'],
  ['estar en las nubes', 'to be daydreaming', '☁️', 'Mateo siempre está en las nubes.', 'Mateo is always daydreaming.'],
  ['meter la pata', 'to put your foot in it', '', '¡Uy! He metido la pata.', "Oops! I've put my foot in it."],
]);
block(3, 'expresiones', 'verb', [
  ['quedar', 'to meet up', '', '¿Quedamos mañana en la plaza?', 'Shall we meet up tomorrow in the square?'],
]);
block(3, 'los colores', 'adj', [
  ['rojo|roja', 'red', '🟥', 'La manzana es roja.', 'The apple is red.'],
  ['azul', 'blue', '🟦', 'El cielo es azul.', 'The sky is blue.'],
  ['verde', 'green', '🟩', 'La hoja es verde.', 'The leaf is green.'],
  ['amarillo|amarilla', 'yellow', '🟨', 'El sol es amarillo.', 'The sun is yellow.'],
  ['negro|negra', 'black', '⬛', 'El gato es negro.', 'The cat is black.'],
  ['blanco|blanca', 'white', '⬜', 'La nube es blanca.', 'The cloud is white.'],
  ['gris', 'grey', '', 'El lobo es gris.', 'The wolf is grey.'],
  ['morado|morada', 'purple', '🟪', 'La uva es morada.', 'The grape is purple.'],
  ['rosa', 'pink', '', 'La flor es rosa.', 'The flower is pink.'],
  ['marrón', 'brown', '🟫', 'El oso es marrón.', 'The bear is brown.'],
]);
block(3, 'los adjetivos', 'adj', [
  ['rápido|rápida', 'fast', '', 'El conejo es rápido.', 'The rabbit is fast.'],
  ['lento|lenta', 'slow', '🐌', 'El caracol es lento.', 'The snail is slow.'],
  ['fuerte', 'strong', '💪', 'Mateo es muy fuerte.', 'Mateo is very strong.'],
  ['débil', 'weak', '', 'El lobo está débil.', 'The wolf is weak.'],
  ['bonito|bonita', 'pretty', '', 'Es un bosque bonito.', "It's a pretty forest."],
  ['feo|fea', 'ugly', '', 'Ese monstruo es feo.', 'That monster is ugly.'],
  ['viejo|vieja', 'old', '', 'El árbol es muy viejo.', 'The tree is very old.'],
  ['joven', 'young', '', 'Lola es joven.', 'Lola is young.'],
  ['nuevo|nueva', 'new', '', 'Tengo una guitarra nueva.', 'I have a new guitar.'],
  ['bueno|buena', 'good', '', 'Es un perro bueno.', "He's a good dog."],
  ['malo|mala', 'bad', '', 'El Silencio es malo.', 'The Silence is bad.'],
  ['feliz', 'happy', '😊', 'Hoy estoy feliz.', 'Today I am happy.'],
  ['triste', 'sad', '😢', 'La loba está triste.', 'The she-wolf is sad.'],
  ['oscuro|oscura', 'dark', '', 'La cueva es oscura.', 'The cave is dark.'],
]);

// ------------------------------------------------------ La Montaña (4)
block(4, 'el cuerpo', 'noun', [
  ['la cabeza', 'head', '', 'Me duele la cabeza.', 'My head hurts.'],
  ['la mano', 'hand', '✋', 'Dame la mano.', 'Give me your hand.'],
  ['el pie', 'foot', '🦶', 'Me duele el pie.', 'My foot hurts.'],
  ['el ojo', 'eye', '👁️', 'El búho tiene ojos grandes.', 'The owl has big eyes.'],
  ['la boca', 'mouth', '👄', 'Abre la boca.', 'Open your mouth.'],
  ['el corazón', 'heart', '❤️', 'Tienes un buen corazón.', 'You have a good heart.'],
  ['el brazo', 'arm', '', 'Mateo tiene brazos fuertes.', 'Mateo has strong arms.'],
  ['la pierna', 'leg', '🦵', 'La araña tiene ocho piernas.', 'The spider has eight legs.'],
  ['el pelo', 'hair', '', 'Lola tiene el pelo rojo.', 'Lola has red hair.'],
  ['la nariz', 'nose', '👃', 'El perro tiene buena nariz.', 'The dog has a good nose.'],
  ['la oreja', 'ear', '👂', 'El conejo tiene orejas largas.', 'The rabbit has long ears.'],
]);
block(4, 'la familia', 'noun', [
  ['el hermano', 'brother', '', 'Mi hermano es alto.', 'My brother is tall.'],
  ['la hermana', 'sister', '', 'Mi hermana canta.', 'My sister sings.'],
  ['el abuelo', 'grandfather', '👴', 'Mi abuelo es pescador.', 'My grandfather is a fisherman.'],
  ['el tío', 'uncle', '', 'Mi tío vive en la montaña.', 'My uncle lives on the mountain.'],
  ['la tía', 'aunt', '', 'Mi tía cocina muy bien.', 'My aunt cooks very well.'],
  ['la familia', 'family', '👪', 'Mi familia es grande.', 'My family is big.'],
  ['el maestro|la maestra', 'teacher', '🧑‍🏫', 'La abuela es mi maestra.', 'Grandma is my teacher.'],
]);
block(4, 'la montaña', 'noun', [
  ['la montaña', 'mountain', '⛰️', 'La montaña es muy alta.', 'The mountain is very tall.'],
  ['la nieve', 'snow', '❄️', 'Hay nieve en la montaña.', 'There is snow on the mountain.'],
  ['el templo', 'temple', '', 'El templo está en silencio.', 'The temple is silent.'],
  ['el monje', 'monk', '', 'El monje no habla.', "The monk doesn't speak."],
]);
block(4, 'el tiempo', 'adv', [
  ['hoy', 'today', '', 'Hoy hace sol.', "Today it's sunny."],
  ['mañana', 'tomorrow', '', 'Mañana vamos a la montaña.', 'Tomorrow we go to the mountain.'],
  ['ayer', 'yesterday', '', 'Ayer comí paella.', 'Yesterday I ate paella.'],
  ['siempre', 'always', '', 'Mateo siempre tiene hambre.', 'Mateo is always hungry.'],
  ['nunca', 'never', '', 'Nunca estás solo.', 'You are never alone.'],
  ['ahora', 'now', '', '¡Ahora, ataca!', 'Now, attack!'],
  ['también', 'also / too', '', 'Yo también quiero ir.', 'I want to go too.'],
]);
block(4, 'expresiones', 'phrase', [
  ['echar una mano', 'to lend a hand', '🤝', '¿Me echas una mano?', 'Can you give me a hand?'],
  ['estar hecho polvo', 'to be exhausted', '', 'Después de subir, estoy hecho polvo.', "After the climb, I'm exhausted."],
  ['ponerse las pilas', 'to get your act together', '🔋', '¡Ponte las pilas, Mateo!', 'Get your act together, Mateo!'],
  ['ser pan comido', 'to be a piece of cake', '', 'Este puzle es pan comido.', 'This puzzle is a piece of cake.'],
  ['costar un ojo de la cara', 'to cost an arm and a leg', '', 'Esta poción cuesta un ojo de la cara.', 'This potion costs an arm and a leg.'],
  ['tomar el pelo', "to pull someone's leg", '', '¿Me estás tomando el pelo?', 'Are you pulling my leg?'],
]);
block(4, 'los verbos', 'verb', [
  ['madrugar', 'to get up early', '⏰', 'Los monjes madrugan mucho.', 'The monks get up very early.'],
  ['ser', 'to be (permanent)', '', 'Quiero ser valiente.', 'I want to be brave.'],
  ['estar', 'to be (state / place)', '', '¿Dónde está la abuela?', 'Where is grandma?'],
  ['tener', 'to have', '', 'Tengo una idea.', 'I have an idea.'],
  ['ir', 'to go', '', 'Vamos a ir a la torre.', "We're going to go to the tower."],
  ['hacer', 'to do / make', '', '¿Qué vas a hacer?', 'What are you going to do?'],
  ['poder', 'to be able to', '', 'Puedo ayudar.', 'I can help.'],
  ['saber', 'to know (facts)', '', 'No sé la palabra.', "I don't know the word."],
  ['ver', 'to see', '', 'No puedo ver nada.', "I can't see anything."],
  ['hablar', 'to speak', '🗣️', '¿Hablas español?', 'Do you speak Spanish?'],
  ['vivir', 'to live', '', 'Vivo en un pueblo.', 'I live in a village.'],
  ['dormir', 'to sleep', '😴', 'El gato duerme mucho.', 'The cat sleeps a lot.'],
  ['correr', 'to run', '🏃', '¡Corre, Mateo!', 'Run, Mateo!'],
  ['caminar', 'to walk', '🚶', 'Caminamos por el bosque.', 'We walk through the forest.'],
  ['escuchar', 'to listen', '', 'Escucha la canción.', 'Listen to the song.'],
  ['subir', 'to go up / climb', '', 'Vamos a subir la montaña.', "We're going to climb the mountain."],
  ['abrir', 'to open', '', 'No puedo abrir la puerta.', "I can't open the door."],
]);

// ---------------------------------------------------- La Torre Muda (5)
block(5, 'el corazón', 'noun', [
  ['el miedo', 'fear', '😨', 'No tengo miedo.', "I'm not afraid."],
  ['la esperanza', 'hope', '', 'Todavía hay esperanza.', 'There is still hope.'],
  ['el amor', 'love', '💕', 'El amor es fuerte.', 'Love is strong.'],
  ['la voz', 'voice', '', 'Tu voz es bonita.', 'Your voice is pretty.'],
  ['el silencio', 'silence', '🤫', 'El silencio es frío.', 'The silence is cold.'],
  ['la verdad', 'truth', '', 'Dime la verdad.', 'Tell me the truth.'],
  ['la mentira', 'lie', '', 'Eso es una mentira.', "That's a lie."],
  ['el recuerdo', 'memory', '', 'Es un recuerdo bonito.', "It's a lovely memory."],
  ['la torre', 'tower', '🗼', 'La torre es muy alta.', 'The tower is very tall.'],
  ['la llave', 'key', '🔑', 'Necesito la llave.', 'I need the key.'],
  ['la sombra', 'shadow', '', 'Una sombra se mueve.', 'A shadow moves.'],
  ['el rey', 'king', '🤴', 'El rey está solo.', 'The king is alone.'],
  ['el mundo', 'world', '🌍', 'El mundo necesita palabras.', 'The world needs words.'],
]);
block(5, 'el corazón', 'adj', [
  ['solo|sola', 'alone', '', 'No estás solo.', "You're not alone."],
  ['juntos|juntas', 'together', '', 'Estamos juntos.', 'We are together.'],
  ['valiente', 'brave', '', 'Eres muy valiente.', 'You are very brave.'],
  ['enfadado|enfadada', 'angry', '😠', 'El rey está enfadado.', 'The king is angry.'],
  ['cansado|cansada', 'tired', '', 'Estoy muy cansado.', "I'm very tired."],
  ['contento|contenta', 'glad', '', 'Estoy contento de verte.', "I'm glad to see you."],
  ['perdido|perdida', 'lost', '', 'Estamos perdidos.', "We're lost."],
]);
block(5, 'el corazón', 'verb', [
  ['recordar', 'to remember', '', 'Recuerdo tu voz.', 'I remember your voice.'],
  ['olvidar', 'to forget', '', 'No quiero olvidar.', "I don't want to forget."],
  ['perdonar', 'to forgive', '', 'Te perdono.', 'I forgive you.'],
  ['ayudar', 'to help', '', '¿Puedo ayudar?', 'Can I help?'],
  ['luchar', 'to fight', '⚔️', 'Vamos a luchar juntos.', "We're going to fight together."],
  ['volver', 'to return', '', 'Quiero volver a casa.', 'I want to return home.'],
  ['creer', 'to believe', '', 'Creo en ti.', 'I believe in you.'],
]);
block(5, 'el corazón', 'phrase', [
  ['te quiero', 'I love you', '', 'Te quiero, abuela.', 'I love you, grandma.'],
  ['no estás solo', "you're not alone", '', 'Escucha: no estás solo.', "Listen: you're not alone."],
  ['te echo de menos', 'I miss you', '', 'Abuela, te echo de menos.', 'Grandma, I miss you.'],
  ['¡ten cuidado!', 'be careful!', '', '¡Ten cuidado con la sombra!', 'Be careful with the shadow!'],
]);
block(5, 'refranes', 'phrase', [
  ['quien calla, otorga', 'silence means consent', '', 'No dices nada… quien calla, otorga.', "You say nothing… silence means consent."],
  ['en boca cerrada no entran moscas', 'a closed mouth catches no flies', '', 'Calla, Mateo. En boca cerrada no entran moscas.', 'Hush, Mateo. A closed mouth catches no flies.'],
  ['más vale tarde que nunca', 'better late than never', '', '¡Por fin llegas! Más vale tarde que nunca.', "You're finally here! Better late than never."],
  ['a buen entendedor, pocas palabras bastan', 'a word to the wise is enough', '', 'No digo más: a buen entendedor, pocas palabras bastan.', "I'll say no more: a word to the wise is enough."],
  ['ir al grano', 'to get to the point', '', 'Vamos al grano: ¿dónde está la llave?', "Let's get to the point: where is the key?"],
  ['dar la lata', 'to pester', '', '¡Deja de dar la lata!', 'Stop pestering!'],
]);

export const WORDS: readonly Word[] = ALL;
export const WORD_BY_ID: ReadonlyMap<string, Word> = new Map(ALL.map((w) => [w.id, w]));

export function wordsUpToChapter(ch: number): Word[] {
  return ALL.filter((w) => w.ch <= ch);
}

export function getWord(id: string): Word {
  const w = WORD_BY_ID.get(id);
  if (!w) throw new Error(`Unknown word: ${id}`);
  return w;
}

/** "el mar" / "la playa" / "el amigo / la amiga" for display with article. */
export function withArticle(w: Word): string {
  return w.es.includes('|') ? w.es.split('|').join(' / ') : w.es;
}

/** Nouns whose gender trips learners up; Mateo's el/la drills favour these. */
export const TRICKY_GENDER: ReadonlySet<string> = new Set([
  'agua', 'dia', 'mano', 'mapa', 'problema', 'planeta', 'foto', 'viaje', 'puente', 'calle', 'miel', 'leche',
  'sal', 'noche', 'luz', 'flor', 'gente', 'ciudad', 'idioma', 'moto', 'radio', 'tema', 'piel', 'arbol',
  'corazon', 'cancion', 'verdad', 'nube', 'aceite', 'chocolate', 'carne', 'nieve', 'voz', 'llave', 'color',
  'amor', 'tomate', 'cafe', 'pez', 'arroz', 'limon', 'melocoton', 'nariz', 'pie', 'templo', 'torre',
]);

/** A short rule of thumb explaining a noun's gender, shown after el/la drills. */
export function genderRule(w: Word): string {
  const b = stripMarks(w.bare);
  if (w.gender === 'f' && w.article === 'el') {
    return `Feminine — but it starts with a stressed “a”, so the singular takes EL: el ${w.bare}, las ${w.bare}s. Adjectives stay feminine: el agua fría.`;
  }
  if (['foto', 'moto', 'radio'].includes(b)) return `Feminine: “${w.bare}” is short for a feminine word (la fotografía, la motocicleta, la radiodifusión).`;
  if (b === 'mano') return 'An exception: “mano” ends in -o but is feminine — la mano.';
  if (b === 'dia' || b === 'mapa' || b === 'planeta' || b === 'sofa') return `An exception: ends in -a but is masculine — el ${w.bare}.`;
  if (b.endsWith('ma') && w.gender === 'm') return `Many words ending in -ma come from Greek and are masculine: el problema, el idioma, el tema.`;
  if (/(cion|sion|dad|tad|tud)$/.test(b)) return 'Words ending in -ción, -sión, -dad, -tad and -tud are always feminine: la canción, la ciudad, la verdad.';
  if (b === 'flor') return 'Most -or words are masculine (el amor, el color), but la flor is feminine.';
  if (b.endsWith('or') && w.gender === 'm') return 'Words ending in -or are usually masculine: el amor, el color (exception: la flor).';
  if (b.endsWith('o') && w.gender === 'm') return 'Words ending in -o are usually masculine.';
  if (b.endsWith('a') && w.gender === 'f') return 'Words ending in -a are usually feminine.';
  if (b === 'gente') return '“La gente” is feminine and singular: la gente es amable (not “son”).';
  return `No reliable rule for -${b.slice(-1)} / consonant endings: memorise it with its article — ${w.article} ${w.bare}.`;
}

function stripMarks(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
