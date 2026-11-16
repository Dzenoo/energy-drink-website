import { Generator } from 'maath/random';
import { Vector2, Vector3 } from 'three';

import { CAUSTICS } from '@/experience/inside/caustics/utils/caustics';
import { LIQUID } from '@/experience/inside/liquid/utils/liquid';

import { LIGHT_RAYS } from './lightRays';

// Random ranges per ray, as shares of the settings.
const RAY_SPREAD = {
  /** Shortest ray, as a share of LIGHT_RAYS.length. */
  minLength: 0.6,
  /** Narrowest and widest ray, as a share of LIGHT_RAYS.width. */
  minWidth: 0.6,
  maxWidth: 1.4,
  /** Dimmest ray, as a share of LIGHT_RAYS.strength. */
  minBrightness: 0.5,
  /** How far under the surface a ray starts (units), so its end never cuts the surface. */
  belowSurface: 0.005,
};

/**
 * How far a ray can run (units) before it leaves the circle of the given radius
 * around the can's axis or reaches the floor.
 */
const reachInside = (start: Vector3, direction: Vector3) => {
  const toFloor = (start.y - LIGHT_RAYS.floor) / -direction.y;

  // |start.xz + t * direction.xz| = radius, solved for the t ahead of the start.
  const position = new Vector2(start.x, start.z);
  const heading = new Vector2(direction.x, direction.z);
  const a = heading.lengthSq();
  if (a === 0) return toFloor;
  const b = 2 * position.dot(heading);
  const c = position.lengthSq() - LIGHT_RAYS.wallRadius ** 2;
  const toWall = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);

  return Math.min(toFloor, toWall);
};

/**
 * Per ray, from a seeded generator: where it starts (a spot under the opening)
 * with a flicker phase, which way it falls (within the cone of light the
 * caustics use), and its shape: share of the full length, the most it may run
 * before the wall or the floor, width and brightness.
 */
export const createRaySeeds = () => {
  const rng = new Generator(LIGHT_RAYS.seed);
  const between = (min: number, max: number) => min + (max - min) * rng.value();
  const { count } = LIGHT_RAYS;
  const starts = new Float32Array(count * 4);
  const directions = new Float32Array(count * 3);
  const shapes = new Float32Array(count * 4);
  const maxTilt = CAUSTICS.spread * LIGHT_RAYS.coneShare;

  for (let ray = 0; ray < count; ray++) {
    // The square root spreads the spots evenly over the opening instead of crowding its middle.
    const away = Math.sqrt(rng.value());
    const around = rng.value() * Math.PI * 2;
    const start = new Vector3(
      LIQUID.openingCenter[0] + Math.cos(around) * away * LIQUID.openingSize[0],
      LIQUID.height - RAY_SPREAD.belowSurface,
      LIQUID.openingCenter[1] + Math.sin(around) * away * LIQUID.openingSize[1],
    );

    const tilt = maxTilt * Math.sqrt(rng.value());
    const heading = rng.value() * Math.PI * 2;
    const direction = new Vector3(
      Math.cos(heading) * tilt,
      -1,
      Math.sin(heading) * tilt,
    ).normalize();

    starts.set([start.x, start.y, start.z, rng.value()], ray * 4);
    directions.set([direction.x, direction.y, direction.z], ray * 3);
    shapes.set(
      [
        between(RAY_SPREAD.minLength, 1),
        reachInside(start, direction),
        between(RAY_SPREAD.minWidth, RAY_SPREAD.maxWidth),
        between(RAY_SPREAD.minBrightness, 1),
      ],
      ray * 4,
    );
  }

  return { starts, directions, shapes, count };
};
