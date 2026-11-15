import { Generator } from 'maath/random';

import { BUBBLES } from './bubbles';

/** Numbers per bubble: where around the axis, how far from it, where in its rise, how large. */
export const SEED_SIZE = 4;

/**
 * Four numbers in [0, 1] for every bubble, from a seeded generator; the vertex
 * shader turns them into a path through the drink. A stream is a run of bubbles
 * with the same place and size and evenly spread starts, so they rise in a string.
 */
export const createBubbleSeeds = () => {
  const rng = new Generator(BUBBLES.seed);
  const count = BUBBLES.loose + BUBBLES.streams * BUBBLES.perStream;
  const seeds = new Float32Array(count * SEED_SIZE);
  let bubble = 0;
  const add = (around: number, away: number, start: number, size: number) => {
    seeds.set([around, away, start, size], bubble * SEED_SIZE);
    bubble++;
  };

  for (let index = 0; index < BUBBLES.loose; index++) {
    add(rng.value(), rng.value(), rng.value(), rng.value());
  }

  for (let stream = 0; stream < BUBBLES.streams; stream++) {
    const around = rng.value();
    const away = rng.value();
    const offset = rng.value();
    const size = rng.value();
    for (let index = 0; index < BUBBLES.perStream; index++) {
      add(around, away, (offset + index / BUBBLES.perStream) % 1, size);
    }
  }

  return { seeds, count };
};
