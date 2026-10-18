// Story objects drawn on the map: word crystals, the boat, the sleeping cat…

import { defineSprite } from '../engine/sprites';

// A glowing "Palabra" — a word crystal stolen by the Silence.
defineSprite('cristal', {
  rows: [
    '................',
    '.......c........',
    '......cbc.......',
    '.....cbbac......',
    '....cbbbaac.....',
    '...cbbbbaaac....',
    '...cbbbaaaa9....',
    '...cbbaaaa99....',
    '....cbaaa99.....',
    '.....caa99......',
    '......a9........',
    '................',
    '.....n.n.n......',
    '....nnnnnnn.....',
    '................',
    '................',
  ],
});

defineSprite('barca', {
  rows: [
    '................',
    '.......c........',
    '.......cc.......',
    '.......ccc......',
    '.......cccc.....',
    '.......g........',
    '..rrrrrrrrrrrr..',
    '..grrrrrrrrrrg..',
    '...gggggggggg...',
    '................',
  ],
});

defineSprite('gato', {
  rows: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '..f..f..........',
    '..ffff..........',
    '..f4f4fffffff...',
    '..ffffffffffff..',
    '...fffffffffff..',
    '...ff.f..ff.f.ff',
    '................',
  ],
});

// Magic flowers in the Whispering Forest: grey until you name their colour.
const FLOR = [
  '................',
  '.....PP..PP.....',
  '....PPPPPPPP....',
  '...PPPP44PPPP...',
  '...PPP4444PPP...',
  '....PPP44PPP....',
  '.....PPPPPP.....',
  '.......66.......',
  '...66..66.......',
  '....66.66..66...',
  '.....6666.66....',
  '.......6666.....',
  '.......66.......',
  '......6666......',
  '................',
  '................',
];
defineSprite('flor_gris', { rows: FLOR, map: { P: 'd', '4': 'u', '6': 'e' } });
defineSprite('flor_roja', { rows: FLOR, map: { P: '2' } });
defineSprite('flor_azul', { rows: FLOR, map: { P: '9' } });
defineSprite('flor_amarilla', { rows: FLOR, map: { P: '4', '4': '3' } });
