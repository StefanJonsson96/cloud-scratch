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

// ------------------------------------------------------------- Valencia
// Vicenta, the fallera mayor: silk brocade dress, hair in side buns, a gold comb.
defineCharacter('vicenta', {
  skirt: true,
  map: { ...SKIN, H: 'i', h: 't', C: 'v', c: 'n', A: '2', B: 'i', K: 'n', M: 'i', L: 'c' },
  over: {
    down: ['......KKKK......', '', '', '', '.MM..........MM.', '.MM..........MM.', '', '', '', '...LLLLLLLLLL...'],
    up: ['......KKKK......', '', '', '', '.MM..........MM.', '.MM..........MM.', '', '.....MMMMMM.....', '......MMMM......'],
    left: ['......KKKK......', '', '', '', '............MM..', '............MM..'],
  },
});
// Pepet, the pyrotechnician: work overalls, red neckerchief, cap.
defineCharacter('pepet', {
  map: { ...SKIN_DARK, H: 'f', h: '0', C: '9', c: '8', A: '2', P: '8', B: '0', Y: '2' },
  over: { down: ['', '....YYYYYYYY....', '...YYYYYYYYYYY..'], left: ['', '....YYYYYYYY....', '..YYYYYYYYYYY...'], up: ['', '....YYYYYYYY....', '...YYYYYYYYYY...'] },
});
defineCharacter('horchatera', {
  skirt: true,
  map: { ...SKIN, H: 'f', h: '0', C: 'c', c: 'd', A: '9', B: 'i', K: '9' },
  over: { down: ['', '', '', '', '', '', '', '', '', '', '.....KKKKKK.....'] },
});
// Tío Vicent, a huertano: black blouse and a red scarf tied on his head.
defineCharacter('tio_vicent', {
  map: { ...SKIN_DARK, H: 'd', h: 'e', C: 'f', c: '0', A: 'c', P: 'e', B: 'i', K: '2', k: 'l' },
  over: {
    down: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KkKkKkKkKk...'],
    left: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KkKkKkKkKKK..', '............KK..'],
    up: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KkKkKkKkKk...', '......KKKK......'],
  },
});
// The fortune teller: a purple dress and a headscarf hung with gold coins.
defineCharacter('adivina', {
  skirt: true,
  map: { ...SKIN_DARK, H: 'f', h: '0', C: 'o', c: 'w', A: '4', B: '0', K: '1', G: '4' },
  over: {
    down: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '...KGKGKKGKGK...'],
    left: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '...GKGKKKKKKK...'],
    up: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '...KKKKKKKKKK...'],
  },
});
// Ximo, the falla artist: black beret, a smock covered in paint.
defineCharacter('ximo', {
  map: { ...SKIN, H: 'i', h: 't', C: 'u', c: 'd', A: '2', P: '9', B: 'i', W: 'f', R: '2', U: '9', Y: '4' },
  over: {
    down: ['', '....WWWWWWW.....', '...WWWWWWWWWW...', '', '', '', '', '', '', '....R..U...Y....', '......Y....R....'],
    left: ['', '....WWWWWWW.....', '...WWWWWWWWWW...', '', '', '', '', '', '', '......R..U......'],
    up: ['', '....WWWWWWW.....', '...WWWWWWWWWW...', '', '', '', '', '', '', '....U...R.......'],
  },
});
// The band leader: navy uniform, gold braid, peaked cap.
defineCharacter('director', {
  map: { ...SKIN, H: 'e', h: 'f', C: '8', c: '9', A: '4', P: '8', B: '0', K: '8', G: '4' },
  over: { down: ['', '....KKKKKKKK....', '...KKKKGGKKKK...'], left: ['', '....KKKKKKKK....', '..KKKKKGGKKK....'], up: ['', '....KKKKKKKK....', '...KKKKKKKKKK...'] },
});

// ------------------------------------------------------------- Andalucía
// Rocío, Lola's mother: a red flamenca dress with white spots, a rose in her hair.
defineCharacter('rocio', {
  skirt: true,
  map: { ...SKIN_DARK, H: 'f', h: '0', C: '2', c: 'l', A: 'c', B: '0', K: '2', M: 'f' },
  over: {
    down: ['', '', '.KK.............', '.KK.............', '', '', '', '', '', '...CACCACCAC....'],
    up: ['', '', '.KK.............', '.KK.............', '', '', '', '.....MMMMMM.....', '......MMMM......'],
    left: ['', '', '', '', '', '', '', '', '............MM..'],
  },
});
// Abuelo Manolo, guitarist: black suit and a flat-brimmed Cordoban hat.
defineCharacter('manolo', {
  map: { ...SKIN_DARK, H: 'd', h: 'e', C: 'f', c: '0', A: 'c', P: 'f', B: '0', K: 'f' },
  over: {
    down: ['', '....KKKKKKKK....', '....KKKKKKKK....', '.KKKKKKKKKKKKKK.'],
    left: ['', '....KKKKKKKK....', '....KKKKKKKK....', 'KKKKKKKKKKKKKK..'],
    up: ['', '....KKKKKKKK....', '....KKKKKKKK....', '.KKKKKKKKKKKKKK.'],
  },
});
defineCharacter('carmela', {
  skirt: true,
  map: { ...SKIN, H: 'i', h: 't', C: '6', c: 'q', A: 'c', B: 'i', K: 'c' },
  over: { down: ['', '', '', '', '', '', '', '', '', '....KKKKKKKK....', '....KKKKKKKK....'] },
});
// Curro, a little Betis fan: green and white stripes.
defineCharacter('curro', {
  map: { ...SKIN_DARK, H: 'f', h: '0', C: '6', c: 'q', A: 'c', P: 'c', B: '0', W: 'c' },
  over: { down: ['', '', '', '', '', '', '', '', '', '....W.W..W.W....', '....W.W..W.W....'] },
});
defineCharacter('guia', {
  map: { ...SKIN, H: '3', h: 's', C: '7', c: '8', A: '4', P: 'f', B: '0' },
  over: { up: ['', '', '', '', '', '', '', '', '', '.......HH.......', '.......hh.......'] },
});
defineCharacter('jardinero', {
  map: { ...SKIN_DARK, H: 'i', h: 't', C: '6', c: 'q', A: 'n', P: 'q', B: 'i', K: 'n' },
  over: { down: ['', '.....KKKKKK.....', '..KKKKKKKKKKKK..'], left: ['', '.....KKKKKK.....', '.KKKKKKKKKKKK...'], up: ['', '.....KKKKKK.....', '..KKKKKKKKKKKK..'] },
});
// The poet's ghost of the Alhambra: pale robes, a white turban.
defineCharacter('fantasma', {
  map: { S: 'u', E: '9', H: 'c', h: 'u', C: 'c', c: 'u', A: 'b', P: 'u', B: 'd', K: 'c' },
  over: { down: ['....KKKKKKKK....', '...KKKKKKKKKK...', '..KKKKKKKKKKKK..'], left: ['....KKKKKKKK....', '...KKKKKKKKKK...', '..KKKKKKKKKKKK..'], up: ['....KKKKKKKK....', '...KKKKKKKKKK...', '..KKKKKKKKKKKK..'] },
});

// ------------------------------------------------------------- Galicia
// Maruxa, the meiga: a good witch in a black shawl and a plum headscarf.
defineCharacter('maruxa', {
  skirt: true,
  map: { ...SKIN, H: 'd', h: 'e', C: 'f', c: '0', A: 'o', B: '0', K: '1', k: 'l' },
  over: {
    down: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '...K........K...', '..K..........K..', '..K..........K..', '', '', '..k..........k..'],
    left: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '.........KKKK...', '..........KKK...', '..........KK....'],
    up: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '...KKKKKKKKKK...', '...KKKKKKKKKK...', '...kKKKKKKKKk...', '....kkkkkkkk....'],
  },
});
// The gaiteiro: black waistcoat, red sash, and his bagpipes under one arm.
defineCharacter('gaitero', {
  map: { ...SKIN, H: 'i', h: 't', C: 'f', c: '0', A: 'c', P: 'f', B: '0', R: '2', G: '1', g: 'd' },
  over: {
    down: ['', '', '', '', '', '', '', '', '...........gg...', '...cCCCCCCGGG...', '...RRRRRRRGGG...', '..........GG....'],
    left: ['', '', '', '', '', '', '', '', '...gg...........', '..GGG.CCCCC.....', '..GGG.RRRRR.....'],
  },
});
defineCharacter('pulpeira', {
  skirt: true,
  map: { ...SKIN, H: 'i', h: 't', C: '9', c: '8', A: 'c', B: 'i', K: 'c' },
  over: { down: ['', '', '', '', '', '', '', '', '', '....KKKKKKKK....', '....KKKKKKKK....'] },
});
// Uxía, in a yellow raincoat with the hood up.
defineCharacter('uxia', {
  skirt: true,
  map: { ...SKIN, H: 'i', h: 't', C: '4', c: 'n', A: '4', B: '2', K: '4', k: 'n' },
  over: {
    down: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '...KK......KK...', '...K........K...'],
    left: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '.......KKKKKK...', '........KKKKK...'],
    up: ['', '.....KKKKKK.....', '....KKKKKKKK....', '...KKKKKKKKKK...', '...KKKKKKKKKK...', '...KKKKKKKKKK...', '...kKKKKKKKKk...', '....kkkkkkkk....'],
  },
});
// La Dama Gris: a pale lady woven from forgotten words — long grey hair, grey gown.
defineCharacter('dama', {
  skirt: true,
  map: { S: 'u', E: '0', H: 'd', h: 'e', C: 'e', c: 'f', A: 'd', B: 'f' },
  over: {
    down: ['', '', '', '', '...H.HH..HH.H...', '..HH........HH..', '..H..........H..', '..H..........H..', '..HH........HH..', '..HH........HH..', '..H..........H..'],
    up: ['', '', '', '', '', '', '', '', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....', '.....hhhhhh.....'],
    left: ['', '', '', '', '...HHHHHHHHHH...', '', '', '', '.........HHH....', '..........HHH...', '..........HH....'],
  },
});

// ------------------------------------------------------------- Salamanca
// A tuno: a student minstrel in a black cape covered in coloured ribbons.
defineCharacter('tuno', {
  map: { ...SKIN, H: 'f', h: '0', C: 'f', c: '0', A: 'c', P: 'f', B: '0', R: '2', U: '9', Y: '4', G: '6' },
  over: {
    down: ['', '', '', '', '', '', '', '', '', '..cR.U.Y.G.Uc...', '..c..R..G..c....', '..c........c....'],
    left: ['', '', '', '', '', '', '', '', '', '...........RUYc.', '...........GR.c.'],
    up: ['', '', '', '', '', '', '', '', '', '..cRUYGRUYGRc...', '..cGRUYGRUYGc...', '..cccccccccccc..'],
  },
});
defineCharacter('profesora', {
  skirt: true,
  map: { ...SKIN, H: 'd', h: 'e', C: 'l', c: '1', A: 'c', B: '0', K: 'n', G: 'f' },
  over: { down: ['', '', '', '', '', '...GGG..GGG.....', '....G....G......'] },
});
defineCharacter('librera', {
  skirt: true,
  map: { ...SKIN_DARK, H: '3', h: 's', C: '7', c: '8', A: '4', B: 'i' },
});
