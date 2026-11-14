import { CatmullRomCurve3, Vector3 } from 'three';

type Point = readonly [x: number, y: number, z: number];

// One camera pose per station in content/stations.ts, in scene units (1 unit = 10 cm).
// The can stands on the origin: base at y = 0, lid at y = 1.34, opening toward +z.
// This is a rough first pass; the poses get tuned once the real model and effects are in.
const POSES: readonly { position: Point; target: Point }[] = [
  // Cold can: calm front shot of the whole can.
  { position: [0, 0.75, 3.2], target: [0, 0.67, 0] },
  // Opening: above the lid, looking down at the opening.
  { position: [0.25, 2, 0.9], target: [0, 1.34, 0.12] },
  // Entry: through the opening, just under the drink's surface.
  { position: [0, 1.15, 0.12], target: [0, 0.7, 0.3] },
  // Bubbles: mid-depth, looking up toward the light from the surface.
  { position: [0, 0.8, 0], target: [0.2, 1.1, -0.2] },
  // Strawberry: near the bottom, drifting past the pieces.
  { position: [0.1, 0.4, -0.05], target: [-0.2, 0.45, 0.15] },
  // Surfacing: up through the surface and out of the opening.
  { position: [0.15, 1.9, 0.5], target: [0, 1.34, 0.12] },
  // End: the open can again, from a new angle.
  { position: [0.9, 0.9, 2.8], target: [0, 0.67, 0] },
];

const toCurve = (points: Point[]) =>
  // Centripetal keeps the curve from looping or overshooting between close poses.
  new CatmullRomCurve3(
    points.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    'centripetal',
  );

// getPoint(t) spaces the poses evenly in t, so station i sits at t = i / (count - 1).
/** Where the camera is. */
export const POSITION_CURVE = toCurve(POSES.map(({ position }) => position));
/** Where the camera looks. */
export const TARGET_CURVE = toCurve(POSES.map(({ target }) => target));
