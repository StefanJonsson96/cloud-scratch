// Chapter 3: the Whispering Forest and the glade of the grey she-wolf.

import type { MapDef, NpcDef } from '../types';
import { f, nf, all } from './util';

const flowers = (g: Parameters<NonNullable<MapDef['grey']>>[0]) =>
  ['flor_roja', 'flor_azul', 'flor_amarilla'].filter((k) => g.flags[k]).length;

function flower(id: string, x: number, y: number, colour: string): NpcDef[] {
  return [
    { id: `${id}_gris`, x, y, sprite: 'flor_gris', still: true, talk: id, when: nf(id) },
    { id: `${id}_color`, x, y, sprite: colour, still: true, talk: id, when: f(id) },
  ];
}

export const bosque: MapDef = {
  id: 'bosque',
  name: 'El Bosque Susurrante',
  nameEn: 'The Whispering Forest',
  music: 'field',
  bg: 'bosque',
  outside: 'T',
  rows: [
    'TPPTTTTTTTTTTTPPTPT::TPTTP~~PTPTTTPPTTPT',
    'TPPTTTTTPPTTTTTTTPP::TTTPT~~TTTTTTPTTTTT',
    'TPPTPTPTTTTTPPPPTPP::PPTPT~~TTTTTPTTTTTP',
    'TTPTTTTTTPPTTTTPTPTBBTTPPT~~TTPTTTPTPTPT',
    'PTPTTPTTPTPPTTTrrrrBBTPPTT~~TTPTPTTTTTTP',
    'TTTPPPTPTPTPTTTrrrr::....T~~TPTTPTTPTTTP',
    'TPPTPPTTPTTTPTPhDhh......T~~TTTTTTTPTTTT',
    'TTTTPTTTTPPTTPT,,,..f.,,,T~~PTPPTPTPTPTP',
    'TTTP.f....TTTTP,,,..f.,,,P~~TT..f...PTPT',
    'TTTT..::.fPTTTT.......,,,P~~TP..::..PTTT',
    'PTPT,,,:..TTTTT....::f...T~~TP..::..PTPT',
    'TTTT,,,:..TTPTPTTTP::TTPTP~~PT..:,,,TPTT',
    'PTPP,,,:.CPTTPTTTTT::PTTTT~~PP..:,,,TPTT',
    'TPTT,,,:..TTTTTTTTP::PTTPT~~TTf.:,,,TTTT',
    'TTTT,,,:ffTPTTPTTTT::TPTTT~~PTff:,,,CPTT',
    'PTPPf.::..PPTTTTPTT::TTTTP~~TP..:,,,TTTT',
    'TTTPf.::..::::::::::::::::==::..::..TPPT',
    'PTPP......,,,,,,........,,~~,,......PPTT',
    'PTTTTTPT.f,,,,,,........,,~~,,..TPPTTPPT',
    'TTTTTPTTPTTTTTPTTT:::TPTPT~~TTTTTTTPTTTP',
    'PTTTPTTPTTTTTPTTPT:::TPPPT~~TTPPPPTPTTTT',
    'TTTPPPPTTTTTTTPPTP:::TTTTP~~TPPTPTTTTTTP',
    'PTTTPTTTTTTTTPTPPT:::PTPTT~~TPTTTPTTPTPT',
    'TTTTTTPPPTPPTTPTPT:::PTPPT~~PTTTPTTPPTPT',
    'TTPTTTTPPPTPPTPTP......TTP~~TTPTPTTTTPTT',
    'PTTTPTTTTTPTTTTPP......PTT~~PPPTTTTTPTTT',
    'PTPTPTPTPTTPTPTTTf....YTTT~~PTTTTTPTPPPT',
    'PPTTPPTTTTPTTTTPT....fCPTT~~TTTTTTTPTTPP',
    'TTTTTPTPTTTPTTTTTf.....PTP~~TTPTTTPPTPTT',
    'TPTTTPPTTTTTPTPTT..f...PTT~~PPTPPPTPTTPP',
  ],
  grey: (g) => (g.flags.loba ? 0 : 0.75 - flowers(g) * 0.2),
  encounters: {
    rate: 0.11,
    groups: [
      [['lobo'], 3],
      [['arana', 'seta'], 2],
      [['serpiente'], 2],
      [['buho', 'lobo'], 2],
      [['seta', 'seta', 'arana'], 1],
      [['lobo', 'lobo'], 1],
    ],
  },
  patch: (g) =>
    flowers(g) >= 3
      ? [
          [19, 3, ':'],
          [20, 3, ':'],
          [19, 4, ':'],
          [20, 4, ':'],
        ]
      : [],
  npcs: [
    ...flower('flor_roja', 5, 9, 'flor_roja'),
    ...flower('flor_azul', 34, 9, 'flor_azul'),
    ...flower('flor_amarilla', 23, 6, 'flor_amarilla'),
    { id: 'lenador', x: 18, y: 7, sprite: 'pescador', dir: 'down', talk: 'lenador' },
  ],
  warps: [
    { x: 19, y: 29, to: 'san_sabor', tx: 15, ty: 1, dir: 'down' },
    { x: 20, y: 29, to: 'san_sabor', tx: 16, ty: 1, dir: 'down' },
    { x: 19, y: 0, to: 'claro', tx: 9, ty: 13, dir: 'up' },
    { x: 20, y: 0, to: 'claro', tx: 10, ty: 13, dir: 'up' },
    { x: 16, y: 6, to: 'bosque', tx: 16, ty: 7, when: () => false, blocked: 'locked_door' },
  ],
  triggers: [
    { x: 17, y: 26, w: 6, h: 3, script: 'ch3_start', when: nf('ch3') },
  ],
  things: [
    { x: 9, y: 12, script: 'chest:empanada:2' },
    { x: 36, y: 14, script: 'chest:abanico' },
    { x: 22, y: 27, script: 'chest:horchata:2' },
    { x: 22, y: 26, script: 'sign:bosque' },
    { x: 19, y: 3, script: 'thorns', when: (g) => flowers(g) < 3 },
    { x: 20, y: 3, script: 'thorns', when: (g) => flowers(g) < 3 },
    { x: 19, y: 4, script: 'thorns', when: (g) => flowers(g) < 3 },
    { x: 20, y: 4, script: 'thorns', when: (g) => flowers(g) < 3 },
  ],
};

export const claro: MapDef = {
  id: 'claro',
  name: 'El Claro de la Luna',
  nameEn: 'Moonlight Glade',
  music: 'dungeon',
  bg: 'bosque',
  outside: 'T',
  rows: [
    'TTTPPPPPP::TPTTPPTTP',
    'PPTPTTPPT::PPPTTTPTT',
    'TPTTTTPTT::TTPPPPTTT',
    'TPPP...ff.......PTPP',
    'PTTP...f....f...PTTT',
    'PPT............f.PPT',
    'PTP..............TTT',
    'PTT.ff...........TTT',
    'PTP..............TPP',
    'PPT....f.........PPT',
    'TTPPf...........PTTP',
    'TPTP............PTTP',
    'TPPTTTTTP::TPPPTTPTT',
    'TTTTPTTTT::PTTPPPPTT',
    'PTTPPPTTP::TTTPPPTTT',
  ],
  grey: (g) => (g.flags.loba ? 0 : 0.6),
  npcs: [
    { id: 'loba', x: 10, y: 6, sprite: 'loba', still: true, talk: 'boss_loba', when: nf('loba') },
    { id: 'loba_calma', x: 10, y: 6, sprite: 'loba', still: true, talk: 'loba_calma', when: f('loba') },
    { id: 'lobezno1', x: 8, y: 7, sprite: 'lobezno', still: true, talk: 'lobezno', when: f('loba') },
    { id: 'lobezno2', x: 12, y: 7, sprite: 'lobezno', still: true, talk: 'lobezno', when: f('loba') },
    { id: 'cristal', x: 10, y: 4, sprite: 'cristal', still: true, talk: 'cristal_color', when: all(f('loba'), nf('color')) },
  ],
  warps: [
    { x: 9, y: 14, to: 'bosque', tx: 19, ty: 1, dir: 'down' },
    { x: 10, y: 14, to: 'bosque', tx: 20, ty: 1, dir: 'down' },
    { x: 9, y: 0, to: 'montana', tx: 14, ty: 28, dir: 'up', when: f('color'), blocked: 'block_claro' },
    { x: 10, y: 0, to: 'montana', tx: 15, ty: 28, dir: 'up', when: f('color'), blocked: 'block_claro' },
  ],
  triggers: [{ x: 4, y: 9, w: 12, h: 2, script: 'boss_loba', when: nf('loba') }],
};
