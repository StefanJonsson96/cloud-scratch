// The few glosses the dictionary build overrides. Wiktionary's export has no
// entry for the preposition "a", and describes the most common little words in
// ways that don't help a learner tapping them ("masculine singular definite
// article", "apocopic form of mucho"). Everything else comes from Wiktionary —
// keep this list to words like these.

export const CORRECTIONS: Record<string, string> = {
  a: 'to / at',
  al: 'to the (a + el)',
  del: 'of the (de + el)',
  el: 'the',
  la: 'the / her, it',
  los: 'the / them',
  las: 'the / them',
  un: 'a, an',
  una: 'a, an',
  unos: 'some',
  unas: 'some',
  lo: 'it / him',
  hay: 'there is / there are',
  muy: 'very',
  mi: 'my',
  mis: 'my',
  tu: 'your',
  tus: 'your',
  su: 'his / her / their / your',
  sus: 'his / her / their / your',
  yo: 'I',
  // Spain's "you all", which Wiktionary glosses as plain "you".
  vosotros: 'you all (Spain)',
  vosotras: 'you all (Spain, f)',
  os: 'you all / yourselves (Spain)',
  vuestro: 'your (you all)',
  vuestra: 'your (you all)',
  vuestros: 'your (you all)',
  vuestras: 'your (you all)',
  // "haber" as the helper verb of the perfecto ("he visto"), not "behold".
  he: 'I have (+ done)',
  has: 'you have (+ done)',
  ha: 'he / she has (+ done)',
  hemos: 'we have (+ done)',
  habéis: 'you all have (+ done)',
  han: 'they have (+ done)',
};
