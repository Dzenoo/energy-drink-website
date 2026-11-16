import { Generator } from 'maath/random';
import { MathUtils, Quaternion, Vector2, Vector3 } from 'three';

import type { PieceNode } from '@/experience/inside/strawberries/utils/pieces';

/** Model nodes that lie on the floor: the whole fruit and the pieces. */
export type FloorNode = PieceNode | 'StrawberryWhole';

export type FloorPiece = {
  node: FloorNode;
  /** Where it lies on the floor (x, z in units). */
  place: Vector2;
  /** How it is turned; its height comes later, from the model, so it rests on the floor. */
  rotation: Quaternion;
  /** Size; 1 is life size, the models being 3 cm long. */
  scale: number;
};

// The strawberries strewn over the floor of the end: a wide band across the
// bottom of the shot, from edge to edge, so the dark above stays free for the
// text. Scene units: 1 unit = 10 cm.
export const FLOOR_LAYOUT = {
  /** Seed of the layout; the same seed gives the same strawberries on every load. */
  seed: 3,
  /** How many of each to place: mostly whole fruit, cut pieces among them. A crowded band leaves some out. */
  counts: {
    StrawberryWhole: 70,
    StrawberryHalf: 10,
    StrawberryQuarter: 8,
    StrawberrySlice: 10,
  } satisfies Record<FloorNode, number>,
  /** Half the band's width (units): past both edges of a wide screen at the end pose. */
  halfWidth: 1.5,
  /** The band's front and back edges (z, units). */
  front: 0.35,
  back: -0.9,
  /** Smallest and largest size (1 = life size). */
  minScale: 0.85,
  maxScale: 1.1,
  /** Radius of the floor each covers at life size (units); a whole fruit is 2.5 cm wide. */
  footprints: {
    StrawberryWhole: 0.13,
    StrawberryHalf: 0.11,
    StrawberryQuarter: 0.08,
    StrawberrySlice: 0.1,
  } satisfies Record<FloorNode, number>,
  /** Closest two pieces may lie, as a share of their footprints added up: below 1, neighbours touch, as in a real heap. */
  spacing: 0.8,
  /** How far a whole fruit's axis may tilt out of lying flat (degrees): none lies perfectly level. */
  tilt: 12,
  /** How far a piece may rock on its cut face (degrees). */
  rock: 6,
  /** Tries per piece before it is left out, so a crowded band cannot loop forever. */
  maxAttempts: 60,
};

const X_AXIS = new Vector3(1, 0, 0);
const Y_UP = new Vector3(0, 1, 0);
const Z_AXIS = new Vector3(0, 0, 1);

const turn = (axis: Vector3, radians: number) =>
  new Quaternion().setFromAxisAngle(axis, radians);

/**
 * The band, placed by trial: random spots kept only when clear of the pieces
 * placed before. Whole fruit lie on their side, spun around their own axis;
 * pieces lie on a cut face or on their skin.
 */
const createFloorLayout = (): FloorPiece[] => {
  const rng = new Generator(FLOOR_LAYOUT.seed);
  const between = (min: number, max: number) => min + (max - min) * rng.value();
  const degrees = (limit: number) => MathUtils.degToRad(between(-limit, limit));
  const placed: (FloorPiece & { footprint: number })[] = [];

  const nodes = Object.keys(FLOOR_LAYOUT.counts) as FloorNode[];
  for (const node of nodes) {
    for (let piece = 0; piece < FLOOR_LAYOUT.counts[node]; piece++) {
      for (let attempt = 0; attempt < FLOOR_LAYOUT.maxAttempts; attempt++) {
        const place = new Vector2(
          between(-FLOOR_LAYOUT.halfWidth, FLOOR_LAYOUT.halfWidth),
          between(FLOOR_LAYOUT.back, FLOOR_LAYOUT.front),
        );
        const scale = between(FLOOR_LAYOUT.minScale, FLOOR_LAYOUT.maxScale);
        const footprint = FLOOR_LAYOUT.footprints[node] * scale;

        const clear = placed.every(
          (other) =>
            other.place.distanceTo(place) >=
            (other.footprint + footprint) * FLOOR_LAYOUT.spacing,
        );
        if (!clear) continue;

        // The model's own turn applies first, then lying down, then the heading on the floor.
        const heading = turn(Y_UP, rng.value() * Math.PI * 2);
        const rotation =
          node === 'StrawberryWhole'
            ? heading
                .multiply(
                  turn(X_AXIS, Math.PI / 2 + degrees(FLOOR_LAYOUT.tilt)),
                )
                .multiply(turn(Y_UP, rng.value() * Math.PI * 2))
            : // The cut faces face along the model's x: turned up or down, the piece lies on one.
              heading
                .multiply(
                  turn(Z_AXIS, (rng.value() < 0.5 ? 1 : -1) * (Math.PI / 2)),
                )
                .multiply(turn(X_AXIS, degrees(FLOOR_LAYOUT.rock)));

        placed.push({ node, place, rotation, scale, footprint });
        break;
      }
    }
  }

  return placed.map(({ node, place, rotation, scale }) => ({
    node,
    place,
    rotation,
    scale,
  }));
};

/** The band, the same on every load. */
export const FLOOR_PIECES = createFloorLayout();
