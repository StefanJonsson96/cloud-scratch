// Chapter 5: the Mute Tower.

import type { MapDef } from '../types';
import { nf, all } from './util';

const towerEnemies = {
  rate: 0.12,
  groups: [
    [['sombra'], 3],
    [['eco', 'sombra'], 2],
    [['libro'], 2],
    [['caballero'], 2],
    [['fantasma', 'eco'], 2],
    [['libro', 'sombra', 'eco'], 1],
  ] as [string[], number][],
};

export const torre1: MapDef = {
  id: 'torre1',
  name: 'La Torre Muda',
  nameEn: 'The Mute Tower',
  music: 'dungeon',
  bg: 'torre',
  outside: '|',
  rows: [
    '||||||||||||||||||||||',
    '|uuuu|uuuuuuuuuu|uuuu|',
    '|uuuu|uuuu>>uuuu|uuCu|',
    '|uuuu|uuuuuuuuuu|uuuu|',
    '|uuuu|||||GG|||||uuuu|',
    '|uuuuuuuuuuuuuuuuuuuu|',
    '|uyyyyyyyyyyyyyyyyyyu|',
    '|uyyyyyy||||||yyyyyyu|',
    '|uyyCyyy|uuuu|yyyyyyu|',
    '|uyyyyyy|uuuu|yyyyyyu|',
    '|uyyyyyy||uu||yyyyyyu|',
    '|uuuuuuuuuuuuuuuuuuuu|',
    '||||||||||uu||||||||||',
    '||||||||||uu||||||||||',
    '||||||||||++||||||||||',
  ],
  encounters: towerEnemies,
  patch: (g) => (g.flags.gate_torre1 ? [[10, 4, 'u'], [11, 4, 'u']] : []),
  npcs: [
    { id: 'recuerdo1', x: 3, y: 2, sprite: 'cristal', still: true, talk: 'recuerdo1' },
    { id: 'recuerdo2', x: 18, y: 8, sprite: 'cristal', still: true, talk: 'recuerdo2' },
  ],
  warps: [
    { x: 10, y: 14, to: 'templo', tx: 10, ty: 2, dir: 'down' },
    { x: 11, y: 14, to: 'templo', tx: 11, ty: 2, dir: 'down' },
    { x: 10, y: 2, to: 'torre2', tx: 10, ty: 12, dir: 'up' },
    { x: 11, y: 2, to: 'torre2', tx: 11, ty: 12, dir: 'up' },
  ],
  triggers: [{ x: 10, y: 12, w: 2, h: 1, script: 'ch5_start', when: nf('ch5') }],
  things: [
    { x: 10, y: 4, script: 'gate_torre1', when: nf('gate_torre1') },
    { x: 11, y: 4, script: 'gate_torre1', when: nf('gate_torre1') },
    { x: 19, y: 2, script: 'chest:empanada:2' },
    { x: 4, y: 8, script: 'chest:pluma' },
  ],
};

export const torre2: MapDef = {
  id: 'torre2',
  name: 'La Torre Muda · 2',
  nameEn: 'The Mute Tower · 2F',
  music: 'dungeon',
  bg: 'torre',
  outside: '|',
  rows: [
    '||||||||||||||||||||||',
    '|uuuuuuuuu>>uuuuuuuuu|',
    '|uuuuuuuuuuuuuuuuuuuu|',
    '|||||||||GGGG|||||||||',
    '|yyyyyyyyyyyyyyyyyyyy|',
    '|yy||||||yyyy||||||yy|',
    '|yy|uuuu|yyyy|uuuu|yy|',
    '|yy|uCuu|yyyy|uuCu|yy|',
    '|yy|uuuu|yyyy|uuuu|yy|',
    '|yy||uu||yyyy||uu||yy|',
    '|yyyyyyyyyyyyyyyyyyyy|',
    '|yyyyyyyyyyyyyyyyyyyy|',
    '||||||||||uu||||||||||',
    '||||||||||>>||||||||||',
  ],
  encounters: towerEnemies,
  patch: (g) => (g.flags.gate_torre2 ? [[9, 3, 'u'], [10, 3, 'u'], [11, 3, 'u'], [12, 3, 'u']] : []),
  npcs: [{ id: 'recuerdo3', x: 15, y: 6, sprite: 'cristal', still: true, talk: 'recuerdo3' }],
  warps: [
    { x: 10, y: 13, to: 'torre1', tx: 10, ty: 3, dir: 'down' },
    { x: 11, y: 13, to: 'torre1', tx: 11, ty: 3, dir: 'down' },
    { x: 10, y: 1, to: 'cima', tx: 7, ty: 8, dir: 'up' },
    { x: 11, y: 1, to: 'cima', tx: 8, ty: 8, dir: 'up' },
  ],
  things: [
    { x: 9, y: 3, script: 'gate_torre2', when: nf('gate_torre2') },
    { x: 10, y: 3, script: 'gate_torre2', when: nf('gate_torre2') },
    { x: 11, y: 3, script: 'gate_torre2', when: nf('gate_torre2') },
    { x: 12, y: 3, script: 'gate_torre2', when: nf('gate_torre2') },
    { x: 5, y: 7, script: 'chest:paella:2' },
    { x: 16, y: 7, script: 'chest:horchata:3' },
  ],
};

export const cima: MapDef = {
  id: 'cima',
  name: 'La Cima',
  nameEn: 'The Summit',
  music: 'dungeon',
  bg: 'cima',
  outside: '|',
  rows: [
    '||||||||||||||||',
    '|uuuuuuuuuuuuuu|',
    '|uuuuuuuuuuuuuu|',
    '|uuuu_______uuu|',
    '|uuuu_______uuu|',
    '|uuuu_______uuu|',
    '|uuuuuuuuuuuuuu|',
    '|uuuuuuuuuuuuuu|',
    '||||||uuuu||||||',
    '||||||u>>u||||||',
    '||||||||||||||||',
  ],
  grey: (g) => (g.flags.final ? 0 : 0.5),
  npcs: [
    { id: 'callado', x: 8, y: 3, sprite: 'callado_down_0', still: true, talk: 'final', when: nf('final') },
  ],
  warps: [
    { x: 7, y: 9, to: 'torre2', tx: 10, ty: 2, dir: 'down', when: nf('final') },
    { x: 8, y: 9, to: 'torre2', tx: 11, ty: 2, dir: 'down', when: nf('final') },
  ],
  triggers: [{ x: 5, y: 6, w: 7, h: 1, script: 'final', when: all(nf('final')) }],
};
