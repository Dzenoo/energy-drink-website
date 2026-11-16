import { Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three';

import { type PieceNode, PIECES } from './pieces';

type Triple = [x: number, y: number, z: number];

type Hero = {
  piece: PieceNode;
  /** Where the piece floats (units; the can stands on the origin). */
  position: Triple;
  /** How it is turned (degrees around x, y, z). */
  rotation: Triple;
  /** Size; the models are about 30 mm tall, so 0.25 gives 7.5 mm. */
  scale: number;
};

// The only pieces in the drink: placed by hand in front of the camera's pose at
// the strawberry station (camera/helpers/curve.ts), each turned to show a
// different side: skin with its seeds, a cut face, a tip. Nothing else floats
// in the drink, so the shot holds just these three.
const HEROES: readonly Hero[] = [
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
    rotation: [-120, 27, 138],
    scale: 0.1,
  },
];

/** Placement matrix of a piece placed by hand. */
const placeHero = ({ position, rotation, scale }: Hero) => {
  const [x, y, z] = rotation.map(MathUtils.degToRad) as Triple;
  return new Matrix4().compose(
    new Vector3(...position),
    new Quaternion().setFromEuler(new Euler(x, y, z)),
    new Vector3(scale, scale, scale),
  );
};

/** Placement matrices per piece type, in the order of PIECES. */
export const createLayout = (): Matrix4[][] =>
  PIECES.map(({ node }) =>
    HEROES.filter(({ piece }) => piece === node).map(placeHero),
  );
