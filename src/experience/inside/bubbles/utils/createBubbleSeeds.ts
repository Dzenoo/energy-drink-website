import { Generator } from 'maath/random';

import type { BubbleSettings } from './bubbles';

/** Numbers per bubble: where around the cloud's center, how far from it, where in its rise, how large. */
export const SEED_SIZE = 4;

/**
 * Four numbers in [0, 1] for every bubble of a cloud, from a seeded generator;
 * the vertex shader turns them into a path through the drink. A stream is a run
 * of bubbles with the same place and size and evenly spread starts, so they rise
 * in a string. Random streams come from the generator, hero streams from the settings.
 */
export const createBubbleSeeds = ({
  seed,
  loose,
  streams,
  perStream,
  heroStreams,
  perHeroStream,
  center,
  radius,
}: BubbleSettings) => {
  const rng = new Generator(seed);
  const count =
    loose + streams * perStream + heroStreams.length * perHeroStream;
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

  for (let index = 0; index < loose; index++) {
    add(rng.value(), rng.value(), rng.value(), rng.value());
  }
  for (let stream = 0; stream < streams; stream++) {
    addStream(rng.value(), rng.value(), rng.value(), perStream);
  }
  for (const { position, size } of heroStreams) {
    // A spot in the can becomes the first two seed numbers the way the vertex
    // shader reads them back: an angle around the cloud's center, and the
    // distance from it as a share of the radius, squared.
    const x = position[0] - center[0];
    const z = position[1] - center[1];
    const around = (Math.atan2(z, x) / (Math.PI * 2) + 1) % 1;
    const away = Math.min(Math.hypot(x, z) / radius, 1) ** 2;
    addStream(around, away, size, perHeroStream);
  }

  return { seeds, count };
};
