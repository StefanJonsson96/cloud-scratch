// Act II characters, built on the same body as everyone else (see characters.ts).

import { defineCharacter } from './characters';

const SKIN = { S: 'j', E: '0' };
const SKIN_DARK = { S: 'h', E: '0' };

// The train conductor: navy uniform and cap.
defineCharacter('revisor', {
  map: { ...SKIN, H: '8', h: '0', C: '8', c: '9', A: '4', P: '8', B: '0' },
  over: { down: ['', '....HHHHHHHH....', '...HHHHHHHHHH...'], left: ['', '....HHHHHHHH....', '...HHHHHHHHHH...'], up: ['', '....HHHHHHHH....', '...HHHHHHHHHH...'] },
});

// ------------------------------------------------------------- La Mancha
// Don Alonso: a thin old knight in armour, grey beard, and a barber's basin for a helmet.
defineCharacter('alonso', {
  map: { ...SKIN, H: 'd', h: 'e', C: 'u', c: 'd', A: '4', P: 'e', B: 'i', Y: 'n', D: 'u' },
  over: {
    down: ['', '....YYYYYYYY....', '...YYYYYYYYYY...', '', '', '', '', '', '....DDDDDDDD....', '.....DDDDDD.....'],
    up: ['', '....YYYYYYYY....', '...YYYYYYYYYY...'],
    left: ['', '....YYYYYYYY....', '...YYYYYYYYYY...', '', '', '', '', '', '...DDDDD........'],
  },
});
// Sancha, his squire: a girl in a brown tunic with a long braid.
defineCharacter('sancha', {
  map: { ...SKIN, H: 'g', h: 'i', C: 'r', c: 'g', A: 'n', P: 'i', B: '0' },
  over: { up: ['', '', '', '', '', '', '', '', '', '.......hh.......', '.......hh.......'] },
});
defineCharacter('pastora', {
  skirt: true,
  map: { ...SKIN_DARK, H: 'i', h: 't', C: '6', c: 'q', A: 'c', B: 'i', K: '2' },
  over: { down: ['', '....KKKKKKKK....', '...KKKKKKKKKK...'], left: ['', '....KKKKKKKK....', '...KKKKKKKKKK...'], up: ['', '....KKKKKKKK....', '...KKKKKKKKKK...'] },
});
defineCharacter('molinero', {
  map: { ...SKIN, H: 'h', h: 'g', C: 'c', c: 'u', A: 'd', P: 'u', B: 'i', K: 'c' },
  over: { down: ['', '.....KKKKKK.....', '....KKKKKKKK....'], left: ['', '.....KKKKKK.....', '....KKKKKKKK....'], up: ['', '.....KKKKKK.....', '....KKKKKKKK....'] },
});
defineCharacter('quesera', {
  skirt: true,
  map: { ...SKIN, H: 'g', h: 'i', C: '9', c: '8', A: 'c', B: 'i', K: 'c' },
  over: { down: ['', '', '', '', '', '', '', '', '', '.....KKKKKK.....', '.....KKKKKK.....'] },
});
defineCharacter('pablito', { map: { ...SKIN, H: 'i', h: 't', C: '9', c: 'a', A: '4', P: 'i', B: '0' } });
defineCharacter('posadero', {
  map: { ...SKIN_DARK, H: 'f', h: '0', C: '2', c: 'l', A: '4', P: 'f', B: 'i' },
});
defineCharacter('pastor', {
  map: { ...SKIN_DARK, H: 'u', h: 'd', C: 'r', c: 'g', A: 'n', P: 'g', B: 'i', K: 'i' },
  over: { down: ['', '..KKKKKKKKKKKK..', '....KKKKKKKK....'], left: ['', '..KKKKKKKKKKKK..', '....KKKKKKKK....'], up: ['', '..KKKKKKKKKKKK..', '....KKKKKKKK....'] },
});
