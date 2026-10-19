// Grammar drills for the classic stumbling blocks that apps rarely explain:
// ser vs estar, por vs para, the "backwards" verb gustar and the subjunctive.
// The drills are real Tatoeba sentences picked by `npm run data`
// (src/data/generated/drills.json); the rules of thumb below are ours.

import type { DrillTopic, GenDrill } from './types';
import drills from './generated/drills.json';

export type GrammarTopic = DrillTopic;
export type GrammarItem = GenDrill;

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
  subjWish: {
    title: 'Wishes take the SUBJUNCTIVE',
    text: 'When one person wants, asks or hopes that ANOTHER does something: «Quiero que vengas», «Espero que estéis bien», «Ojalá haga sol». (Same person? Use the infinitive: «Quiero venir».)',
  },
  subjDoubt: {
    title: 'Doubt takes the SUBJUNCTIVE',
    text: '«No creo que…», «No pienso que…», «Dudo que…», «Es posible que…» → subjunctive: «No creo que sea verdad». But «Creo que…» and «Pienso que…» state a belief → indicative: «Creo que es verdad».',
  },
  subjEmotion: {
    title: 'Feelings take the SUBJUNCTIVE',
    text: 'Reacting with an emotion to what someone else does: «Me alegro de que estés aquí», «Me molesta que llegues tarde», «Es una pena que no vengas».',
  },
  subjFuture: {
    title: 'CUANDO + future → SUBJUNCTIVE',
    text: 'When it hasn’t happened yet: «Cuando llegues, llámame». For habits or facts, use the indicative: «Siempre te llamo cuando llego».',
  },
  subjPurpose: {
    title: 'PARA QUE → SUBJUNCTIVE',
    text: '«Para que» (so that) is always followed by the subjunctive: «Te lo explico para que lo entiendas».',
  },
  subjUnknown: {
    title: 'Something you’re looking for → SUBJUNCTIVE',
    text: 'If it may not exist yet: «Busco un piso que tenga terraza». If it exists: «Tengo un piso que tiene terraza».',
  },
  indicFact: {
    title: 'Facts and beliefs → INDICATIVE',
    text: '«Sé que…», «Es verdad que…», «Creo que…», «Está claro que…» present something as true, so they take the normal indicative: «Sé que tienes razón».',
  },
  gustar: {
    title: 'GUSTAR works backwards',
    text: 'The thing liked is the subject: «Me gusta el chocolate» (chocolate pleases me). Use GUSTA with one thing or a verb, GUSTAN with plural things. The pronoun says who likes it: me, te, le, nos, os, les.',
  },
};

const ITEMS = drills as GrammarItem[];

export const GRAMMAR: readonly GrammarItem[] = ITEMS;

export function grammarUpToChapter(ch: number, topic?: GrammarTopic): GrammarItem[] {
  return ITEMS.filter((g) => g.ch <= ch && (!topic || g.topic === topic));
}

/** Chapter in which each topic first appears. */
export const TOPIC_CH: Record<GrammarTopic, number> = { serEstar: 1, gustar: 2, porPara: 3, subjuntivo: 1 };
