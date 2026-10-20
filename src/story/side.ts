// Side activities, off the main story path, that any map can place.
//
// La Torre de los Ecos (after the story) is at the end of this file.
//
// El Rosco: a word quiz after the Spanish TV show Pasapalabra, hosted by a
// presenter. One word for every letter, from words the player has met.

import { script, numberWords } from './script';
import { buildRosco, knownWords, roscoReward, MIN_LETTERS } from '../learn/rosco';
import { record } from '../learn/srs';
import { playRosco } from '../ui/rosco';
import { memberStats } from '../battle/rules';
import { TOWER_FLOORS, TOWER_REVIEW } from '../data/tower';

const PLAY: [string, string][] = [
  ['¡Sí, vamos!', "Yes, let's go!"],
  ['Ahora no, gracias.', 'Not now, thanks.'],
];

script('rosco', async (s) => {
  if (!s.has('rosco_met')) {
    s.flag('rosco_met');
    await s.say('presentador', '¡Hola, hola! ¡Bienvenidos al Rosco, el concurso de las palabras!', 'Hi there! Welcome, all of you, to El Rosco, the word quiz show!');
    await s.say('presentador', 'Hay una palabra para cada letra. Si no sabes una, di «pasapalabra» y sigue. Luego vuelves a ella.', "There's a word for every letter. If you don't know one, say «pasapalabra» and move on. You come back to it later.");
    await s.narrate('El Rosco is based on Pasapalabra, a famous Spanish TV quiz. Type one word for each letter as you go round the ring. Only words you have already met come up.');
  }
  const qs = buildRosco(knownWords(s.g.chapter, s.g.srs, s.g.settings.level));
  if (qs.length < MIN_LETTERS) {
    await s.say('presentador', '¡Uy! Todavía no conoces muchas palabras. ¡Vuelve más tarde!', "Oops! You don't know many words yet. Come back later!");
    return;
  }
  const best = s.num('rosco_best');
  const pick = best
    ? await s.ask('presentador', `¿Jugamos otra vez? Tu mejor rosco: ${numberWords(best)} letras.`, `Shall we play again? Your best ring: ${best} letters.`, PLAY)
    : await s.ask('presentador', '¿Jugamos?', 'Shall we play?', PLAY);
  if (pick !== 0) {
    await s.say('presentador', '¡Hasta luego! Aquí estaré.', "See you later! I'll be here.");
    return;
  }
  s.end();
  const grades = await playRosco(s.game.overlayHost, qs, {
    timed: s.g.settings.speedBonus,
    accentsOptional: s.g.settings.level === 'a1',
    voice: s.g.settings.voice,
    freeHint: s.g.talents.includes('memoria'),
  });
  // Every answered letter counts as practice, like any other challenge.
  const now = Date.now();
  qs.forEach((q, i) => {
    const grade = grades[i];
    if (!grade) return;
    record(s.g.srs, `w:${q.word.id}`, grade, now);
    s.g.stats.answered++;
    if (grade === 'correct') s.g.stats.right++;
  });
  const right = grades.filter((g) => g && g !== 'wrong').length;
  if (right === qs.length) {
    await s.say('presentador', '¡Todas las letras! ¡Genial, genial!', 'Every single letter! Brilliant, brilliant!');
    await s.narrate('A full ring wins the jackpot — «el bote» — on the TV show. Here it is worth 50 € extra.');
  } else if (right >= qs.length * 0.7) await s.say('presentador', '¡Muy bien! ¡Sabes muchas palabras!', 'Very good! You know lots of words!');
  else if (right >= qs.length * 0.4) await s.say('presentador', '¡No está mal! Hay que seguir practicando.', 'Not bad! Keep practising.');
  else await s.say('presentador', '¡Ánimo! La próxima vez, mejor.', 'Chin up! Better luck next time.');
  if (right > best) {
    if (best) await s.say('presentador', '¡Nunca lo has hecho tan bien!', "You've never done so well!");
    s.flag('rosco_best', right);
  }
  const euros = roscoReward(right, qs.length);
  if (euros) await s.gain(euros);
  await s.say('presentador', '¡Vuelve cuando quieras!', 'Come back whenever you like!');
  s.save();
});

// La Torre de los Ecos: after the story, Memoria keeps the echoes of every
// fight in a tower of ten floors. No rest between floors — only a quick
// review question, which restores some strength if you get it right.

script('torre_ecos', async (s) => {
  const best = s.num('torre_best');
  const intro = best
    ? await s.ask('memoria', `¿Subimos otra vez a la Torre de los Ecos? Tu mejor piso: el ${numberWords(best)}.`, `Shall we climb the Tower of Echoes again? Your best floor: ${best}.`, PLAY)
    : await s.ask('memoria', 'Guardo los ecos de todas vuestras batallas en una torre de diez pisos. ¿Queréis subir?', 'I keep the echoes of all your battles in a tower of ten floors. Do you want to climb it?', PLAY);
  if (intro !== 0) {
    await s.say('memoria', 'Aquí estaré. Los ecos no se van a ninguna parte.', "I'll be here. Echoes don't go anywhere.");
    return;
  }
  if (!best) await s.narrate('Ten fights in a row, with no rest in between. After each floor, one review question: get it right and the party recovers some strength. You can run away at any time — your best floor is kept.');
  s.heal();
  let floor = 0;
  for (const enemies of TOWER_FLOORS) {
    const out = await s.battle({ enemies, bg: 'torre', music: floor % 3 === 2 ? 'boss' : 'battle', canFlee: true, intro: { es: `Piso ${numberWords(floor + 1)}`, en: `Floor ${floor + 1}` } });
    if (out !== 'win') break;
    floor++;
    if (floor > best) s.flag('torre_best', floor);
    if (floor === TOWER_FLOORS.length) break;
    const g = await s.challenge(TOWER_REVIEW[floor % TOWER_REVIEW.length], `Piso ${floor} · Floor ${floor}`);
    if (g !== 'wrong') {
      // A right answer brings back a third of everyone's strength (the fallen too).
      for (const m of s.g.party) {
        const max = memberStats(m);
        m.hp = Math.min(max.maxHp, m.hp + Math.round(max.maxHp / 3));
        m.mp = Math.min(max.maxMp, m.mp + Math.round(max.maxMp / 3));
      }
      await s.narrate('Right! The echoes fall quiet for a moment, and everyone gets their breath back.', '¡Bien! Recuperáis fuerzas.');
    }
  }
  s.heal();
  if (floor === TOWER_FLOORS.length) {
    await s.say('memoria', '¡Los diez pisos! Ningún eco puede con vosotros.', 'All ten floors! No echo can beat you.');
    if (!s.has('torre_done')) {
      s.flag('torre_done');
      await s.give('eco_dorado');
    }
  } else if (floor) {
    await s.say('memoria', `Habéis llegado al piso ${numberWords(floor)}. ¡Volved cuando queráis!`, `You reached floor ${floor}. Come back whenever you like!`);
  } else {
    await s.say('memoria', 'Los ecos son fuertes… Descansad y volved.', 'The echoes are strong… Rest and come back.');
  }
  await s.gain(floor * 40);
  s.save();
});
