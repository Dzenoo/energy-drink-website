import { CatmullRomCurve3, MathUtils, Vector3 } from 'three';

import { STATION_COUNT } from '@/store/scroll/scroll';

type Point = readonly [x: number, y: number, z: number];

type Pose = {
  position: Point;
  target: Point;
  /** A station from content/stations.ts; poses without it only shape the path between stations. */
  station?: true;
};

// Camera path in scene units (1 unit = 10 cm). The can stands on the origin: base
// at y = 0, lid at about y = 1.31, drink surface at y = 1.16. The opening runs
// from z = 0.045 (the panel's hinge) to z = 0.175, so the dive and the climb pass
// through it at about z = 0.12: clear of the rim and of the panel hanging in.
// The camera never looks straight up or down, where lookAt could spin it around.
// It does not come back out through the opening: after the strawberries the
// picture goes black (ending/cut/helpers/cut.ts), and in the dark the camera leaves
// through the can's wall and turns around, out to the end.
const POSES: readonly Pose[] = [
  // Cold can: calm front shot of the whole can.
  { position: [0, 0.75, 3.2], target: [0, 0.67, 0], station: true },
  // Opening: above the lid, looking down at the opening.
  { position: [0, 1.62, 0.42], target: [0, 1.3, 0.12], station: true },
  // Just above the opening, looking down into it.
  { position: [0, 1.42, 0.15], target: [0, 1.16, 0.07] },
  // Over the drink, still looking down at it. From here to the next pose the
  // froth of the dive covers the whole picture (postprocessing/helpers/splash.ts),
  // and under it the camera turns around: it went in looking down and back, and
  // it comes out of the froth looking up and forward.
  { position: [0, 1.2, 0.115], target: [0, 1, 0.06] },
  // Just under the surface, already looking up at the opening it came through;
  // from here it only sinks back and away to the bubbles station.
  { position: [0, 1.1, 0.09], target: [0, 1.3, 0.16] },
  // Bubbles: mid-depth by the back wall, turned around to look up at the bright
  // opening the camera came in through, with the streams placed for this shot
  // rising toward it (bubbles/helpers/bubbles.ts).
  { position: [0, 0.8, -0.22], target: [0, 1.16, 0.11], station: true },
  // Strawberry: low in the can, by the front wall, looking back (-z) across its
  // whole width at the pieces placed for this shot (strawberries/helpers/layout.ts).
  { position: [0.06, 0.45, 0.16], target: [-0.02, 0.46, -0.2], station: true },
  // Sinking deeper into the darkening drink, still looking back. The picture is
  // black from about here on.
  { position: [0.03, 0.3, 0.02], target: [-0.05, 0.25, -0.3] },
  // Out in the dark studio, close to the strawberries on the floor: in between,
  // unseen, the camera has left through the can's wall and turned around. The
  // end comes up from here as it pulls back (ending/floorStrawberries/helpers/floorLayout.ts).
  { position: [0, 0.35, 1.4], target: [0, 0.4, -0.3] },
  // End: looking almost level over the floor, so the strawberries lie in a band
  // across the bottom of the shot and the dark above is left for the text.
  { position: [0, 1.1, 1.96], target: [0, 0.5, -0.3], station: true },
];

const toCurve = (points: Point[]) =>
  // Centripetal keeps the curve from looping or overshooting between close poses.
  new CatmullRomCurve3(
    points.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    'centripetal',
  );

/** Where the camera is. */
export const POSITION_CURVE = toCurve(POSES.map(({ position }) => position));
/** Where the camera looks. */
export const TARGET_CURVE = toCurve(POSES.map(({ target }) => target));

// getPoint(t) spaces the poses evenly in t, so pose i sits at t = i / (count - 1);
// these are the t of the poses that are stations.
const STATION_T = POSES.flatMap(({ station }, index) =>
  station ? [index / (POSES.length - 1)] : [],
);

if (STATION_T.length !== STATION_COUNT) {
  throw new Error(
    `Camera curve has ${STATION_T.length} stations, the content has ${STATION_COUNT}`,
  );
}

/**
 * Turns scroll progress (a continuous station index) into a curve t: between two
 * stations the camera moves evenly over the poses that lie between them.
 */
export const progressToCurveT = (progress: number) => {
  const clamped = MathUtils.clamp(progress, 0, STATION_COUNT - 1);
  const from = Math.min(Math.floor(clamped), STATION_COUNT - 2);
  const start = STATION_T[from] ?? 0;
  const end = STATION_T[from + 1] ?? 1;
  return MathUtils.lerp(start, end, clamped - from);
};
