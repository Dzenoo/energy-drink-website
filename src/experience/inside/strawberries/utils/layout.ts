import { Generator } from 'maath/random';
import { Matrix4, Quaternion, Vector3 } from 'three';

import { POSITION_CURVE } from '@/experience/camera/utils/curve';

// Where the strawberry pieces float: inside the real can (1 unit = 10 cm), in the
// lower part where the camera passes them at station 5.
const LAYOUT = {
  /** Seed of the layout; the same seed gives the same layout on every load. */
  seed: 5,
  /** Farthest a piece sits from the can's axis (units); the can's inner radius is 0.265. */
  radius: 0.2,
  /** Lowest piece height (units above the can's base). */
  minY: 0.15,
  /** Highest piece height (units). */
  maxY: 0.9,
  /** Smallest piece scale; the models are about 30 mm tall, so 0.2 gives 6 mm. */
  minScale: 0.2,
  /** Largest piece scale; 0.27 gives about 8 mm. */
  maxScale: 0.27,
  /** Closest a piece center may be to the camera path (units), so the camera never flies through one. */
  pathClearance: 0.07,
  /** Closest two piece centers may be (units), so pieces do not overlap. */
  pieceSpacing: 0.08,
  /** Points sampled along the camera path for the clearance test. */
  pathSamples: 200,
  /** Tries per piece before it is left out, so a crowded layout cannot loop forever. */
  maxAttempts: 200,
};

/** Uniformly random rotation (Shoemake's method), driven by the seeded generator. */
const randomRotation = (rng: Generator) => {
  const u1 = rng.value();
  const u2 = rng.value() * Math.PI * 2;
  const u3 = rng.value() * Math.PI * 2;
  const a = Math.sqrt(1 - u1);
  const b = Math.sqrt(u1);
  return new Quaternion(
    a * Math.sin(u2),
    a * Math.cos(u2),
    b * Math.sin(u3),
    b * Math.cos(u3),
  );
};

/**
 * Places the pieces by trial: random spots inside the can, kept only when clear of
 * the camera path and of the pieces placed before. Returns one list of placement
 * matrices per piece type, in the order of `counts`; a type may get fewer pieces
 * than asked when no clear spot is found.
 */
export const createLayout = (counts: readonly number[]): Matrix4[][] => {
  const rng = new Generator(LAYOUT.seed);
  const between = (min: number, max: number) => min + (max - min) * rng.value();

  const path = Array.from({ length: LAYOUT.pathSamples }, (_, index) =>
    POSITION_CURVE.getPoint(index / (LAYOUT.pathSamples - 1)),
  );
  const placed: Vector3[] = [];
  const isClear = (point: Vector3) =>
    path.every((sample) => sample.distanceTo(point) >= LAYOUT.pathClearance) &&
    placed.every((other) => other.distanceTo(point) >= LAYOUT.pieceSpacing);

  return counts.map((count) => {
    const matrices: Matrix4[] = [];

    for (let piece = 0; piece < count; piece++) {
      for (let attempt = 0; attempt < LAYOUT.maxAttempts; attempt++) {
        // The square root spreads points evenly over the disc instead of crowding the axis.
        const distance = LAYOUT.radius * Math.sqrt(rng.value());
        const angle = rng.value() * Math.PI * 2;
        const position = new Vector3(
          Math.cos(angle) * distance,
          between(LAYOUT.minY, LAYOUT.maxY),
          Math.sin(angle) * distance,
        );
        if (!isClear(position)) continue;

        const scale = between(LAYOUT.minScale, LAYOUT.maxScale);
        placed.push(position);
        matrices.push(
          new Matrix4().compose(
            position,
            randomRotation(rng),
            new Vector3(scale, scale, scale),
          ),
        );
        break;
      }
    }

    return matrices;
  });
};
