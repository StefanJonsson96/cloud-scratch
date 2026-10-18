// Overworld characters: two body templates (trousers / long skirt) in three
// directions, palette-swapped and decorated with per-character overlays.
//
// Template letters: H hair, h hair shade, S skin, E eye, C clothes,
// c sleeves/shade, A accent, P trousers, B boots.

import { defineSprite } from '../engine/sprites';

type Dir = 'down' | 'up' | 'left';

const HEAD: Record<Dir, string[]> = {
  down: [
    '................',
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '...HHHHHHHHHH...',
    '...HSSSSSSSSH...',
    '...SSESSSSESS...',
    '...SSESSSSESS...',
    '....SSSSSSSS....',
  ],
  up: [
    '................',
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '...HHHHHHHHHH...',
    '...HHHHHHHHHH...',
    '...hHHHHHHHHh...',
    '...ShHHHHHHhS...',
    '....hhhhhhhh....',
  ],
  left: [
    '................',
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '...HHHHHHHHHH...',
    '...SSSHHHHHHH...',
    '..SSSSSHHHHHH...',
    '...SESSSHHHHH...',
    '....SSSSShh.....',
  ],
};

const BODY: Record<Dir, string[]> = {
  down: ['...cCCCCCCCCc...', '...cCCCAACCCc...', '...SCCCCCCCCS...'],
  up: ['...cCCCCCCCCc...', '...cCCCCCCCCc...', '...SCCCCCCCCS...'],
  left: ['.....CCCCCC.....', '.....cCCCCC.....', '.....SCCCCC.....'],
};

// Legs per template, direction and frame (0 = stand, 1 = step A, 2 = step B).
const LEGS: Record<'pants' | 'skirt', Record<Dir, string[][]>> = {
  pants: {
    down: [
      ['....PPPPPPPP....', '....PPP..PPP....', '....BBB..BBB....', '................'],
      ['....PPPPPPPP....', '....PPP..PPP....', '....BBB..PPP....', '.........BBB....'],
      ['....PPPPPPPP....', '....PPP..PPP....', '....PPP..BBB....', '....BBB.........'],
    ],
    up: [
      ['....PPPPPPPP....', '....PPP..PPP....', '....BBB..BBB....', '................'],
      ['....PPPPPPPP....', '....PPP..PPP....', '....BBB..PPP....', '.........BBB....'],
      ['....PPPPPPPP....', '....PPP..PPP....', '....PPP..BBB....', '....BBB.........'],
    ],
    left: [
      ['.....PPPPPP.....', '.....PP..PP.....', '.....BB..BB.....', '................'],
      ['.....PPPPPP.....', '....PP....PP....', '...BB......BB...', '................'],
      ['.....PPPPPP.....', '.....PPPPP......', '.....BB.BB......', '................'],
    ],
  },
  skirt: {
    down: [
      ['...CCCCCCCCCC...', '..CCACCACCACCC..', '....BB....BB....', '................'],
      ['...CCCCCCCCCC...', '..CCACCACCACCC..', '....BB.....BB...', '................'],
      ['...CCCCCCCCCC...', '..CCACCACCACCC..', '...BB.....BB....', '................'],
    ],
    up: [
      ['...CCCCCCCCCC...', '..CCCCCCCCCCCC..', '....BB....BB....', '................'],
      ['...CCCCCCCCCC...', '..CCCCCCCCCCCC..', '....BB.....BB...', '................'],
      ['...CCCCCCCCCC...', '..CCCCCCCCCCCC..', '...BB.....BB....', '................'],
    ],
    left: [
      ['....CCCCCCCC....', '...CCACCACCAC...', '.....BB..BB.....', '................'],
      ['....CCCCCCCC....', '...CCACCACCAC...', '....BB....BB....', '................'],
      ['....CCCCCCCC....', '...CCACCACCAC...', '......BBBB......', '................'],
    ],
  },
};

interface CharDef {
  map: Record<string, string>;
  skirt?: boolean;
  /** Pixels drawn over the template, per direction ("." = keep). */
  over?: Partial<Record<Dir, string[]>>;
}

function overlay(base: string[], over?: string[]): string[] {
  if (!over) return base;
  return base.map((row, y) => {
    const o = over[y];
    if (!o) return row;
    let out = '';
    for (let x = 0; x < row.length; x++) out += o[x] && o[x] !== '.' ? o[x] : row[x];
    return out;
  });
}

function defineCharacter(name: string, c: CharDef) {
  for (const dir of ['down', 'up', 'left'] as Dir[]) {
    for (let f = 0; f < 3; f++) {
      const legs = LEGS[c.skirt ? 'skirt' : 'pants'][dir][f];
      const rows = overlay([...HEAD[dir], ...BODY[dir], ...legs], c.over?.[dir]);
      defineSprite(`${name}_${dir}_${f}`, { rows, map: c.map });
    }
  }
}

const SKIN = { S: 'j', E: '0' };
const SKIN_DARK = { S: 'h', E: '0' };

// ------------------------------------------------------------------- party
defineCharacter('hero', {
  map: { ...SKIN, H: 'i', h: 't', C: '9', c: '8', A: 'n', P: 'f', B: 'i' },
  over: {
    down: ['', '', '', '', '...H.HH..HH.H...'],
    left: ['', '', '', '', '...HHHHHHHHHH...'],
  },
});

defineCharacter('mateo', {
  map: { ...SKIN_DARK, H: 'f', h: '0', C: '8', c: '9', A: 'g', P: 'r', B: 'i', R: '2', L: 'l' },
  over: {
    down: ['', '.....RRRRRR.....', '....RRRRRRRR....', '...LLLLLLLLLL...'],
    up: ['', '.....RRRRRR.....', '....RRRRRRRR....', '...LLLLLLLLLL...', '...RRRRRRRRRR...'],
    left: ['', '.....RRRRRR.....', '....RRRRRRRR....', '...LLLLLLLLLL...'],
  },
});

defineCharacter('lola', {
  skirt: true,
  map: { ...SKIN, H: 's', h: 'l', C: '2', c: '2', A: 'c', B: '0', F: '4', P: 'p' },
  over: {
    down: ['', '..........PFP...', '...........P....', '', '', '', '..H........H....', '..H.........H...', '..HH........HH..'],
    up: ['', '..........PFP...', '...........P....', '', '', '', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..hHHHHHHHHHHh..'],
    left: ['', '.......PFP......', '........P.......', '', '', '', '.........HHHHH..', '.........HHHHHH.', '..........HHHH..'],
  },
});

// ------------------------------------------------------------------ cast
defineCharacter('abuela', {
  skirt: true,
  map: { ...SKIN, H: 'd', h: 'e', C: 'o', c: '1', A: 'n', B: 'i', G: 'u' },
  over: {
    down: ['......GGGG......', '.....GHHHHG.....'],
    up: ['......GGGG......', '.....GHHHHG.....'],
    left: ['........GGGG....', '.....HHHHHHG....'],
  },
});

defineCharacter('pescador', {
  map: { ...SKIN_DARK, H: 'd', h: 'e', C: '7', c: 'q', A: 'n', P: 'f', B: 'i', D: 'u' },
  over: { down: ['', '', '', '', '', '', '', '', '....DDDDDDDD....', '.....DDDDDD.....'] },
});

defineCharacter('vecino', { map: { ...SKIN, H: 'g', h: 'i', C: '6', c: 'q', A: 'n', P: 'f', B: 'i' } });
defineCharacter('vecino2', { map: { ...SKIN_DARK, H: '0', h: 'f', C: '3', c: 's', A: '4', P: '8', B: 'i' } });
defineCharacter('vecina', { skirt: true, map: { ...SKIN, H: 'i', h: 't', C: '3', c: 's', A: '4', B: 'i' } });
defineCharacter('vecina2', { skirt: true, map: { ...SKIN_DARK, H: 'n', h: 'g', C: 'a', c: '9', A: 'c', B: 'i' } });
defineCharacter('nino', { map: { ...SKIN, H: '4', h: 'n', C: '2', c: 'l', A: 'c', P: '9', B: 'i' } });
defineCharacter('vendedora', {
  skirt: true,
  map: { ...SKIN_DARK, H: 'f', h: '0', C: 'c', c: 'g', A: 'd', B: 'i', K: '2' },
  over: { down: ['', '', '', '', '', '', '', '', '', '...gcccccccccg..'] },
});
defineCharacter('guardia', {
  map: { ...SKIN, H: 'd', h: 'e', C: 'e', c: 'f', A: 'n', P: 'f', B: '0' },
  over: { down: ['', '', '', '', '...HHHHHHHHHH...'], left: ['', '', '', '', '...HHHHHHHHHH...'] },
});
defineCharacter('monje', {
  skirt: true,
  map: { ...SKIN, H: 'j', h: 'k', C: 'g', c: 'i', A: 'n', B: 'i' },
  over: { down: ['', '', '', '', '...HHHHHHHHHH...'] },
});
defineCharacter('peregrina', {
  map: { ...SKIN, H: 'n', h: 'g', C: 'r', c: 'g', A: 'c', P: 'g', B: 'i', Y: 'm' },
  over: { down: ['', '..YYYYYYYYYY....', '.YYYYYYYYYYYY...'], left: ['', '..YYYYYYYYYY....', '.YYYYYYYYYYYY...'], up: ['', '..YYYYYYYYYY....', '.YYYYYYYYYYYY...'] },
});
defineCharacter('callado', {
  skirt: true,
  map: { S: 'f', E: 'b', H: 'w', h: '0', C: 'w', c: '0', A: 'f', B: '0' },
});
defineCharacter('bruno', {
  map: { ...SKIN, H: 'e', h: 'f', C: 'w', c: '1', A: 'd', P: 'f', B: '0' },
});
