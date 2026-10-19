import type { Dir, GameState } from '../state';

export interface NpcDef {
  id: string;
  x: number;
  y: number;
  sprite: string;
  dir?: Dir;
  /** Script id run when you talk to them. */
  talk: string;
  wander?: boolean;
  /** Only present when this returns true. */
  when?: (g: GameState) => boolean;
  /** Drawn greyed-out (silenced). */
  grey?: (g: GameState) => boolean;
  /** Non-character sprite (e.g. a glowing word crystal); no walking frames. */
  still?: boolean;
  /** Scenery (a windmill, a train): drawn as is, no bobbing, no shadow. */
  deco?: boolean;
}

export interface WarpDef {
  x: number;
  y: number;
  to: string;
  tx: number;
  ty: number;
  dir?: Dir;
  when?: (g: GameState) => boolean;
  /** Script to run instead when `when` is false (e.g. "the path is blocked"). */
  blocked?: string;
}

export interface TriggerDef {
  x: number;
  y: number;
  w?: number;
  h?: number;
  script: string;
  when?: (g: GameState) => boolean;
}

export interface ThingDef {
  x: number;
  y: number;
  script: string;
  when?: (g: GameState) => boolean;
}

export interface EncounterTable {
  rate: number;
  groups: [string[], number][];
}

export interface MapDef {
  id: string;
  name: string;
  nameEn: string;
  rows: string[];
  music: string;
  /** Battle background theme. */
  bg: string;
  /** Tile used outside the map edges. */
  outside?: string;
  encounters?: EncounterTable;
  npcs?: NpcDef[];
  warps?: WarpDef[];
  triggers?: TriggerDef[];
  things?: ThingDef[];
  /** 0..1: how drained of colour the place is (the Silence). */
  grey?: (g: GameState) => number;
  /** Tiles that change with the story (opened gates, lit lighthouses…). */
  patch?: (g: GameState) => [x: number, y: number, ch: string][];
  /** Script run every time the map is entered. */
  onEnter?: string;
  dark?: boolean;
  /** Which train station serves this map (see world/stops.ts); Act I's coast is 'puerto'. */
  region?: string;
  /** Particles over the map: Galician rain, Fallas embers, falling petals. */
  weather?: 'rain' | 'embers' | 'petals';
}
