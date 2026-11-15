// The fizz in the drink. Scene units: 1 unit = 10 cm.
export const BUBBLES = {
  /** Seed of the layout; the same seed gives the same bubbles on every load. */
  seed: 11,
  /** Bubbles rising on their own, anywhere in the drink. */
  loose: 420,
  /** Streams: strings of bubbles rising from one spot, as from a speck on the can's wall. */
  streams: 14,
  /** Bubbles in one stream, evenly spaced along it. */
  perStream: 16,
  /** Bubbles in one hero stream: denser, so up close it reads as an unbroken string. */
  perHeroStream: 26,
  /** Farthest a bubble starts from the can's axis (units); the inner wall is at 0.262. */
  radius: 0.245,

  /** Radius of the largest bubble (units); 0.01 = 1 mm. The smallest is a quarter of it. */
  size: 0.01,
  /** Seconds an average bubble takes from the bottom to the surface; small ones are slower. */
  riseTime: 9,
  /** How far a bubble drifts sideways on its way up (units). */
  sway: 0.012,

  /** Color of the light a bubble catches. */
  light: '#ffe3dc',
  /** Brightness of the bubbles (1 = white at the rim); above 1 the rims glow in the bloom. */
  strength: 1.6,
};

export type HeroStream = {
  /** Where the stream rises (x, z in units; the can's axis is the origin), within BUBBLES.radius of it. */
  position: [x: number, z: number];
  /** Size of its bubbles (0 = the smallest, 1 = the largest); larger ones also rise faster. */
  size: number;
};

// The streams the bubbles station is about: placed by hand for the camera's
// pose at that station (camera/utils/curve.ts), between the camera and the
// opening it looks up at, and along the wall at the edges of the shot.
export const HERO_STREAMS: readonly HeroStream[] = [
  { position: [0.103, -0.222], size: 0.15 },
  { position: [-0.245, 0.006], size: 0.35 },
  { position: [0.17, -0.1], size: 0.15 },
  { position: [-0.16, -0.03], size: 0.82 },
  { position: [0.01, -0.06], size: 0.52 },
  { position: [0.08, -0.08], size: 0.76 },
];
