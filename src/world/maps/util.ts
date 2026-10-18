import type { GameState } from '../../state';

type Cond = (g: GameState) => boolean;

/** Flag is set. */
export const f =
  (k: string): Cond =>
  (g) =>
    !!g.flags[k];

/** Flag is not set. */
export const nf =
  (k: string): Cond =>
  (g) =>
    !g.flags[k];

export const all =
  (...cs: Cond[]): Cond =>
  (g) =>
    cs.every((c) => c(g));

export const any =
  (...cs: Cond[]): Cond =>
  (g) =>
    cs.some((c) => c(g));
