import { Generator } from 'maath/random';

import { BUBBLES, HERO_STREAMS, type HeroStream } from './bubbles';

/** Numbers per bubble: where around the axis, how far from it, where in its rise, how large. */
export const SEED_SIZE = 4;

/** First bubble of the first hero stream; they come last, after the loose bubbles and the random streams. */
export const HERO_START = BUBBLES.loose + BUBBLES.streams * BUBBLES.perStream;

/**
 * Turns a spot in the can (x, z in units) into the first two seed numbers, the
 * way the vertex shader reads them back: an angle around the axis, and the
 * distance from it as a share of the radius, squared.
 */
export const streamPlace = ([x, z]: HeroStream['position']) => {
  const around = (Math.atan2(z, x) / (Math.PI * 2) + 1) % 1;
  const away = Math.min(Math.hypot(x, z) / BUBBLES.radius, 1) ** 2;
  return [around, away] as const;
};

/**
 * Four numbers in [0, 1] for every bubble, from a seeded generator; the vertex
 * shader turns them into a path through the drink. A stream is a run of bubbles
 * with the same place and size and evenly spread starts, so they rise in a
 * string. Random streams come from the generator, hero streams from HERO_STREAMS.
 */
export const createBubbleSeeds = () => {
  const rng = new Generator(BUBBLES.seed);
  const count = HERO_START + HERO_STREAMS.length * BUBBLES.perHeroStream;
  const seeds = new Float32Array(count * SEED_SIZE);
  let bubble = 0;
  const add = (around: number, away: number, start: number, size: number) => {
    seeds.set([around, away, start, size], bubble * SEED_SIZE);
    bubble++;
  };
  const addStream = (
    around: number,
    away: number,
    size: number,
    length: number,
  ) => {
    const offset = rng.value();
    for (let index = 0; index < length; index++) {
      add(around, away, (offset + index / length) % 1, size);
    }
  };

  for (let index = 0; index < BUBBLES.loose; index++) {
    add(rng.value(), rng.value(), rng.value(), rng.value());
  }
  for (let stream = 0; stream < BUBBLES.streams; stream++) {
    addStream(rng.value(), rng.value(), rng.value(), BUBBLES.perStream);
  }
  for (const { position, size } of HERO_STREAMS) {
    addStream(...streamPlace(position), size, BUBBLES.perHeroStream);
  }

  return { seeds, count };
};
