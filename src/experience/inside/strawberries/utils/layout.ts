import { Generator } from 'maath/random';
import { Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three';

import { STATIONS } from '@/content/stations';
import {
  POSITION_CURVE,
  progressToCurveT,
} from '@/experience/camera/utils/curve';

import { type PieceNode, PIECES } from './pieces';

type Triple = [x: number, y: number, z: number];

export type Hero = {
  piece: PieceNode;
  /** Where the piece floats (units; the can stands on the origin). */
  position: Triple;
  /** How it is turned (degrees around x, y, z). */
  rotation: Triple;
  /** Size; the models are about 30 mm tall, so 0.25 gives 7.5 mm. */
  scale: number;
};

// The pieces the strawberry station is about: placed by hand in front of the
// camera's pose at that station (camera/utils/curve.ts), each turned to show a
// different side: skin with its seeds, a cut face, a tip.
export const HEROES: readonly Hero[] = [
  {
    piece: 'StrawberryHalf',
    position: [-0.05, 0.45, -0.03],
    rotation: [74, 63, -15],
    scale: 0.15,
  },
  {
    piece: 'StrawberryQuarter',
    position: [0.03, 0.5, -0.14],
    rotation: [-91, 88, 19],
    scale: 0.25,
  },
  {
    piece: 'StrawberrySlice',
    position: [0.1, 0.42, -0.04],
    rotation: [12, 67, 138],
    scale: 0.1,
  },
];

// Where the other pieces drift: inside the real can (1 unit = 10 cm), in its
// lower part. Fruit sinks, and the stations above (the dive, the bubbles) keep a
// clear view; from there the pieces only show far below, through the drink.
const LAYOUT = {
  /** Seed of the layout; the same seed gives the same layout on every load. */
  seed: 5,
  /** Farthest a piece sits from the can's axis (units); the can's inner radius is 0.265. */
  radius: 0.2,
  /** Lowest piece height (units above the can's base). */
  minY: 0.15,
  /** Highest piece height (units); under the camera at the bubbles station, which looks up. */
  maxY: 0.68,
  /** Smallest piece scale; the models are about 30 mm tall, so 0.2 gives 6 mm. */
  minScale: 0.2,
  /** Largest piece scale; 0.27 gives about 8 mm. */
  maxScale: 0.27,
  /** Closest a piece center may be to the camera path and to the view of a hero (units): the camera never flies through one, and none covers a hero. */
  clearance: 0.11,
  /** Closest two piece centers may be (units), so pieces do not overlap. */
  pieceSpacing: 0.08,
  /** Points sampled along the camera path for the clearance test. */
  pathSamples: 200,
  /** Points sampled between the camera and each hero for the clearance test. */
  sightSamples: 6,
  /** Tries per piece before it is left out, so a crowded layout cannot loop forever. */
  maxAttempts: 200,
};

/** Station of the heroes: the camera's pose there is what they are composed for. */
const HERO_STATION = STATIONS.findIndex(({ id }) => id === 'strawberry');

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

/** Placement matrix of a piece placed by hand. */
export const placeHero = ({ position, rotation, scale }: Hero) => {
  const [x, y, z] = rotation.map(MathUtils.degToRad) as Triple;
  return new Matrix4().compose(
    new Vector3(...position),
    new Quaternion().setFromEuler(new Euler(x, y, z)),
    new Vector3(scale, scale, scale),
  );
};

/**
 * Placement matrices per piece type, in the order of PIECES: first the heroes of
 * that type, then the drifting pieces. Those are placed by trial: random spots
 * in the can, kept only when clear of the camera path, of the view from the
 * hero station to each hero, and of the pieces placed before. A type may get
 * fewer pieces than asked when no clear spot is found.
 */
export const createLayout = (): Matrix4[][] => {
  const rng = new Generator(LAYOUT.seed);
  const between = (min: number, max: number) => min + (max - min) * rng.value();

  const heroPositions = HEROES.map(({ position }) => new Vector3(...position));
  const keepClear = Array.from({ length: LAYOUT.pathSamples }, (_, index) =>
    POSITION_CURVE.getPoint(index / (LAYOUT.pathSamples - 1)),
  );
  const heroCamera = POSITION_CURVE.getPoint(progressToCurveT(HERO_STATION));
  for (const hero of heroPositions) {
    for (let sample = 1; sample < LAYOUT.sightSamples; sample++) {
      keepClear.push(
        heroCamera.clone().lerp(hero, sample / LAYOUT.sightSamples),
      );
    }
  }

  const placed = [...heroPositions];
  const isClear = (point: Vector3) =>
    keepClear.every((sample) => sample.distanceTo(point) >= LAYOUT.clearance) &&
    placed.every((other) => other.distanceTo(point) >= LAYOUT.pieceSpacing);

  return PIECES.map(({ node, count }) => {
    const matrices = HEROES.filter(({ piece }) => piece === node).map(
      placeHero,
    );

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
