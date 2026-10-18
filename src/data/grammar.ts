// Grammar drills for the classic stumbling blocks that apps rarely explain:
// ser vs estar, por vs para, and the "backwards" verb gustar.
// Every item carries an English translation and a rule of thumb.

export type GrammarTopic = 'serEstar' | 'porPara' | 'gustar';

export interface GrammarItem {
  id: string;
  topic: GrammarTopic;
  ch: number;
  /** Sentence with "___" where the answer goes. */
  es: string;
  en: string;
  answer: string;
  wrong: string[];
  rule: string;
}

export const RULES: Record<string, { title: string; text: string }> = {
  serIdentity: {
    title: 'SER — what something is',
    text: 'Identity, job, origin, nationality, personality and permanent traits, time and dates. «Es pescador», «Soy de Sevilla», «Son las tres».',
  },
  estarState: {
    title: 'ESTAR — how / where something is',
    text: 'Temporary states, feelings, moods and conditions, and location. «Está cansado», «La sopa está fría», «Está en casa».',
  },
  serEvent: {
    title: 'SER for events',
    text: 'Where an EVENT takes place uses ser, not estar: «La fiesta es en la playa». (But objects and people: «La guitarra está en la playa».)',
  },
  estarResult: {
    title: 'ESTAR for results',
    text: 'The result of an action is a state, so it takes estar: «La puerta está abierta», «La tienda está cerrada».',
  },
  meaningChange: {
    title: 'Adjectives that change meaning',
    text: 'ser listo = clever · estar listo = ready · ser aburrido = boring · estar aburrido = bored · ser malo = bad · estar malo = ill.',
  },
  por: {
    title: 'POR — the cause, the route, the exchange',
    text: 'Reason/cause (gracias por…), through/along (por la playa), exchange/price (por diez euros), means (por teléfono), frequency (dos veces por semana), parts of the day (por la mañana), on behalf of (lucho por mi pueblo).',
  },
  para: {
    title: 'PARA — the goal',
    text: 'Purpose (para aprender), recipient (para ti), destination (sale para Madrid), deadline (para el lunes), opinion (para mí…).',
  },
  gustar: {
    title: 'GUSTAR works backwards',
    text: 'The thing liked is the subject: «Me gusta el chocolate» (chocolate pleases me). Use GUSTA with one thing or a verb, GUSTAN with plural things. The pronoun says who likes it: me, te, le, nos, os, les.',
  },
};

const ITEMS: GrammarItem[] = [];
let n = 0;
function se(ch: number, es: string, en: string, answer: string, wrong: string, rule: keyof typeof RULES) {
  ITEMS.push({ id: `se${n++}`, topic: 'serEstar', ch, es, en, answer, wrong: [wrong], rule });
}
function pp(ch: number, es: string, en: string, answer: 'por' | 'para') {
  const cap = es.startsWith('___');
  const a = cap ? answer[0].toUpperCase() + answer.slice(1) : answer;
  const other = answer === 'por' ? 'para' : 'por';
  const w = cap ? other[0].toUpperCase() + other.slice(1) : other;
  ITEMS.push({ id: `pp${n++}`, topic: 'porPara', ch, es, en, answer: a, wrong: [w], rule: answer });
}

// ---- ser / estar
se(1, 'Mateo ___ pescador.', 'Mateo is a fisherman.', 'es', 'está', 'serIdentity');
se(1, 'La abuela ___ en casa.', 'Grandma is at home.', 'está', 'es', 'estarState');
se(1, 'El agua ___ muy fría hoy.', 'The water is very cold today.', 'está', 'es', 'estarState');
se(1, 'Yo ___ de Puerto Alegre.', "I'm from Puerto Alegre.", 'soy', 'estoy', 'serIdentity');
se(1, '¿Dónde ___ el faro?', 'Where is the lighthouse?', 'está', 'es', 'estarState');
se(1, 'Nosotros ___ amigos.', 'We are friends.', 'somos', 'estamos', 'serIdentity');
se(1, 'Mateo ___ cansado.', 'Mateo is tired.', 'está', 'es', 'estarState');
se(1, 'El mar ___ enorme.', 'The sea is huge.', 'es', 'está', 'serIdentity');
se(1, 'Vosotros ___ muy valientes.', 'You (all) are very brave.', 'sois', 'estáis', 'serIdentity');
se(1, '___ las ocho de la mañana.', "It's eight in the morning.", 'Son', 'Están', 'serIdentity');
se(1, '¿Vosotros ___ bien?', 'Are you (all) okay?', 'estáis', 'sois', 'estarState');
se(2, 'La sopa ___ fría. ¡Qué asco!', 'The soup is cold. Yuck!', 'está', 'es', 'estarState');
se(2, 'Este queso ___ de Asturias.', 'This cheese is from Asturias.', 'es', 'está', 'serIdentity');
se(2, 'La tienda ___ cerrada.', 'The shop is closed.', 'está', 'es', 'estarResult');
se(2, 'Lola ___ música.', 'Lola is a musician.', 'es', 'está', 'serIdentity');
se(2, 'Hoy ___ lunes.', 'Today is Monday.', 'es', 'está', 'serIdentity');
se(2, 'Lola ___ muy contenta hoy.', 'Lola is very happy today.', 'está', 'es', 'estarState');
se(2, 'Los churros ___ en la mesa.', 'The churros are on the table.', 'están', 'son', 'estarState');
se(3, 'La fiesta ___ en la plaza.', 'The party is in the square.', 'es', 'está', 'serEvent');
se(3, 'El concierto ___ en el bosque.', 'The concert is in the forest.', 'es', 'está', 'serEvent');
se(3, 'El lobo ___ triste.', 'The wolf is sad.', 'está', 'es', 'estarState');
se(3, 'La puerta ___ abierta.', 'The door is open.', 'está', 'es', 'estarResult');
se(3, '¿___ listos? ¡Vamos!', 'Are you (all) ready? Let’s go!', 'Estáis', 'Sois', 'meaningChange');
se(3, 'El zorro ___ muy listo.', 'The fox is very clever.', 'es', 'está', 'meaningChange');
se(3, 'Este libro ___ aburrido.', 'This book is boring.', 'es', 'está', 'meaningChange');
se(3, 'Mateo ___ aburrido: no hay nada que hacer.', "Mateo is bored: there's nothing to do.", 'está', 'es', 'meaningChange');
se(4, 'Mi tío ___ médico.', 'My uncle is a doctor.', 'es', 'está', 'serIdentity');
se(4, 'Tú ___ muy alto.', 'You are very tall.', 'eres', 'estás', 'serIdentity');
se(4, 'Mis padres ___ en la montaña.', 'My parents are on the mountain.', 'están', 'son', 'estarState');
se(4, 'El monje ___ malo: tiene fiebre.', 'The monk is ill: he has a fever.', 'está', 'es', 'meaningChange');
se(4, '¿Qué hora ___?', 'What time is it?', 'es', 'está', 'serIdentity');
se(5, 'El rey ___ solo en la torre.', 'The king is alone in the tower.', 'está', 'es', 'estarState');
se(5, 'La verdad ___ importante.', 'The truth is important.', 'es', 'está', 'serIdentity');

// ---- por / para
pp(3, 'Este churro es ___ ti.', 'This churro is for you.', 'para');
pp(3, 'Gracias ___ la ayuda.', 'Thanks for the help.', 'por');
pp(3, 'Caminamos ___ la playa.', 'We walk along the beach.', 'por');
pp(3, 'Mañana salimos ___ la montaña.', 'Tomorrow we leave for the mountain.', 'para');
pp(3, 'Estudio ___ aprender.', 'I study (in order) to learn.', 'para');
pp(3, 'Lo compré ___ diez euros.', 'I bought it for ten euros.', 'por');
pp(3, 'Hablo con mi madre ___ teléfono.', 'I talk to my mother on the phone.', 'por');
pp(3, 'Necesito la poción ___ el lunes.', 'I need the potion by Monday.', 'para');
pp(3, 'Entrenamos dos veces ___ semana.', 'We train twice a week.', 'por');
pp(3, '___ mí, el queso es lo mejor.', 'For me, cheese is the best.', 'para');
pp(4, 'Lucho ___ mi pueblo.', 'I fight for (the sake of) my village.', 'por');
pp(4, 'Pasamos ___ el bosque.', 'We go through the forest.', 'por');
pp(4, 'Te cambio mi churro ___ tu café.', "I'll swap my churro for your coffee.", 'por');
pp(4, 'Salimos ___ la mañana.', 'We leave in the morning.', 'por');
pp(4, 'La guitarra es ___ tocar flamenco.', 'The guitar is for playing flamenco.', 'para');
pp(4, 'El tren ___ Sevilla sale a las tres.', 'The train to Seville leaves at three.', 'para');
pp(5, 'Gracias ___ todo, abuela.', 'Thanks for everything, grandma.', 'por');
pp(5, 'Esta llave es ___ la puerta de la torre.', 'This key is for the tower door.', 'para');

// ---- gustar (generated): who likes what
const LIKERS: { es: string; pron: string; en: string; en3: boolean }[] = [
  { es: 'A mí', pron: 'me', en: 'I like', en3: false },
  { es: 'A ti', pron: 'te', en: 'You like', en3: false },
  { es: 'A Mateo', pron: 'le', en: 'Mateo likes', en3: true },
  { es: 'A Lola', pron: 'le', en: 'Lola likes', en3: true },
  { es: 'A nosotros', pron: 'nos', en: 'We like', en3: false },
  { es: 'A vosotros', pron: 'os', en: 'You (all) like', en3: false },
  { es: 'A los monjes', pron: 'les', en: 'The monks like', en3: false },
];
const LIKED: { es: string; en: string; plural: boolean; ch: number }[] = [
  { es: 'el chocolate', en: 'chocolate', plural: false, ch: 2 },
  { es: 'los churros', en: 'churros', plural: true, ch: 2 },
  { es: 'bailar', en: 'dancing', plural: false, ch: 2 },
  { es: 'las tapas', en: 'tapas', plural: true, ch: 2 },
  { es: 'la música', en: 'music', plural: false, ch: 2 },
  { es: 'las fresas', en: 'strawberries', plural: true, ch: 2 },
  { es: 'el mar', en: 'the sea', plural: false, ch: 3 },
  { es: 'cantar', en: 'singing', plural: false, ch: 3 },
  { es: 'los gatos', en: 'cats', plural: true, ch: 3 },
  { es: 'las montañas', en: 'mountains', plural: true, ch: 4 },
];
const PRONS = ['me', 'te', 'le', 'nos', 'os', 'les'];
LIKERS.forEach((who, i) => {
  LIKED.forEach((what, j) => {
    // Keep the pool varied but not huge: a deterministic subset of combinations.
    if ((i + j) % 3 !== 0) return;
    const verb = what.plural ? 'gustan' : 'gusta';
    const other = what.plural ? 'gusta' : 'gustan';
    const otherPron = PRONS[(PRONS.indexOf(who.pron) + 2) % PRONS.length];
    ITEMS.push({
      id: `gu${i}-${j}`,
      topic: 'gustar',
      ch: what.ch,
      es: `${who.es} ___ ${what.es}.`,
      en: `${who.en} ${what.en}.`,
      answer: `${who.pron} ${verb}`,
      wrong: [`${who.pron} ${other}`, `${otherPron} ${verb}`, `${otherPron} ${other}`],
      rule: 'gustar',
    });
  });
});

export const GRAMMAR: readonly GrammarItem[] = ITEMS;

export function grammarUpToChapter(ch: number, topic?: GrammarTopic): GrammarItem[] {
  return ITEMS.filter((g) => g.ch <= ch && (!topic || g.topic === topic));
}

/** Chapter in which each topic first appears. */
export const TOPIC_CH: Record<GrammarTopic, number> = { serEstar: 1, gustar: 2, porPara: 3 };
