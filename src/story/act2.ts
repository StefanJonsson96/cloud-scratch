// Act II — "La Gran Ruta". A few days after the festival, Abuela's Grimorio
// starts going blank: the Grey Lady wants every word in Spain for her book.
// The party — Bruno too, now — takes the train across the country to save
// each region's Mother Word.

import { script } from './script';

script('act2_start', async (s) => {
  await s.narrate('A few days after the festival…', 'Unos días después de la fiesta…');
  await s.say('abuela', '¡Ay! ¡Mirad mi Grimorio!', 'Oh! Look (you all) at my Grimorio!');
  await s.narrate('Abuela opens the old book. Whole pages are fading to white as you watch.', 'Las páginas se quedan en blanco.');
  await s.say('abuela', 'Las palabras se borran. Primero una, luego otra…', 'The words are being erased. First one, then another…');
  await s.say('mateo', '¿Otra vez el Silencio?', 'The Silence again?');
  await s.say('bruno', 'No. Esto es peor. Esto es el Olvido.', 'No. This is worse. This is Forgetting.');
  await s.say('bruno', 'Hace cuarenta años, yo estudiaba en Salamanca.', 'Forty years ago, I was studying in Salamanca.');
  await s.say('bruno', 'Una noche, en la vieja biblioteca, encontré un libro gris.', 'One night, in the old library, I found a grey book.');
  await s.say('bruno', 'Dentro vivía una mujer hecha de palabras olvidadas: la Dama Gris.', 'Inside lived a woman made of forgotten words: the Grey Lady.');
  await s.say('bruno', 'Ella me enseñó el Silencio. Yo estaba triste y solo… y acepté.', 'She taught me the Silence. I was sad and lonely… and I said yes.');
  await s.say('lola', '¿Y qué quiere ahora?', 'And what does she want now?');
  await s.say('bruno', 'Todas las palabras de España. Para su libro. Para siempre.', 'All the words of Spain. For her book. Forever.');
  await s.say('abuela', 'Cada tierra tiene una Palabra Madre: la palabra de su corazón.', 'Every land has a Mother Word: the word at its heart.');
  await s.say('abuela', 'Si la Dama se lleva las Palabras Madre, España se quedará muda.', 'If the Lady takes the Mother Words, Spain will fall silent.');
  await s.narrate('Abuela turns on the old radio. A voice crackles through the static:', 'La radio dice:');
  await s.narrate(
    'News from La Mancha: the windmills have stopped turning, and nobody can remember their dreams.',
    'Noticias de La Mancha: los molinos no giran y nadie recuerda sus sueños.',
  );
  await s.say('mateo', '¡Pues vamos a La Mancha! ¿A qué esperamos?', "Then let's go to La Mancha! What are we waiting for?");
  await s.say('lola', 'Y después… ¡a Sevilla! Mi familia está allí.', 'And afterwards… to Seville! My family is there.');
  await s.say('bruno', 'Voy con vosotros. Os debo cuarenta años de palabras.', "I'm coming with you (all). I owe you forty years of words.");
  await s.join('bruno');
  await s.lesson(
    'Bruno: escuchar',
    '<p>Bruno spent forty years listening without speaking. In battle he trains your <b>ear</b>: you hear a real sentence (a woman or a man reads it) and pick what it means — and later, you build it from the words you heard.</p><p>His story also shows the two past tenses working together: the <b>imperfecto</b> sets the scene (<i>yo estudiaba</i>, <i>estaba triste</i>), the <b>indefinido</b> tells what happened (<i>encontré un libro</i>, <i>acepté</i>).</p>',
    [
      ['Yo estudiaba en Salamanca.', 'I was studying in Salamanca. (background)'],
      ['Una noche encontré un libro.', 'One night I found a book. (event)'],
      ['Estaba triste y acepté.', 'I was sad, and I said yes.'],
    ],
  );
  await s.say('abuela', 'Tomad, billetes de tren para todos. La estación está en el norte del pueblo.', 'Here (you all): train tickets for everyone. The station is in the north of the village.');
  await s.say('abuela', '¡Y llamadme todos los días!', 'And call me every day (you all)!');
  s.flag('act2');
  s.refresh();
  s.save();
});

// ------------------------------------------------------------- the trains
const ARRIVALS: Record<string, [string, string]> = {
  puerto: ['Puerto Alegre. Huele a mar y a casa.', 'Puerto Alegre. It smells of the sea, and of home.'],
  mancha: ['La Mancha. Llanuras de trigo hasta el horizonte… y molinos quietos.', 'La Mancha. Plains of wheat to the horizon… and windmills standing still.'],
  valencia: ['Valencia. Huele a pólvora y a azahar.', 'Valencia. It smells of gunpowder and orange blossom.'],
  sevilla: ['Sevilla. Hace un calor de mil demonios.', "Seville. It's devilishly hot."],
  granada: ['Granada. La Alhambra brilla en la colina, roja como el atardecer.', 'Granada. The Alhambra glows on its hill, red as the sunset.'],
  santiago: ['Santiago de Compostela. Llueve, claro.', "Santiago de Compostela. It's raining, of course."],
  salamanca: ['Salamanca. Las piedras doradas brillan al sol.', 'Salamanca. The golden stones shine in the sun.'],
};

script('tren', async (s) => {
  const stop = await s.travel(s.args[0]);
  if (!stop) return;
  const [es, en] = ARRIVALS[stop.id];
  await s.narrate(en, es);
  s.save();
  // Stepping off the train onto a story trigger (a new chapter) starts it straight away.
  const here = s.game.world.triggerHere();
  if (here) await s.run(here);
});

script('revisor', async (s) => {
  await s.say('revisor', '¡Buenos días! Para subir al tren, hablad con el tren. ¡Es muy fácil!', 'Good morning! To get on the train, talk to the train (you all). Very easy!');
  await s.narrate('The train goes everywhere you have unlocked. The 🎯 objective marks the station you need.');
});

script('viajera_estacion', async (s) => {
  await s.say('viajera', 'Voy a Madrid. Todos los trenes pasan por Madrid, ¿sabes?', "I'm going to Madrid. All the trains go through Madrid, you know?");
  await s.narrate('Spain’s high-speed lines (the AVE) mostly radiate out from Madrid, like spokes of a wheel.');
});

script('banco', async (s) => {
  await s.narrate('A wooden bench. Someone has left a newspaper: «Misterio: las palabras desaparecen».', 'Un banco de madera.');
});
