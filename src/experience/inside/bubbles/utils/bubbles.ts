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
  /** Farthest a bubble starts from the can's axis (units); the inner wall is at 0.262. */
  radius: 0.245,

  /** Radius of the largest bubble (units); 0.006 = 0.6 mm. The smallest is a quarter of it. */
  size: 0.006,
  /** Seconds an average bubble takes from the bottom to the surface; small ones are slower. */
  riseTime: 9,
  /** How far a bubble drifts sideways on its way up (units). */
  sway: 0.012,

  /** Color of the light a bubble catches. */
  light: '#ffe3dc',
  /** Brightness of the bubbles (1 = white at the rim); above 1 the rims glow in the bloom. */
  strength: 1.6,
};
