import { LIQUID } from '@/experience/inside/liquid/helpers/liquid';

export type HeroStream = {
  /** Where the stream rises (x, z in units; the can's axis is the origin), within the cloud's radius of its center. */
  position: [x: number, z: number];
  /** Size of its bubbles (0 = the smallest, 1 = the largest); larger ones also rise faster. */
  size: number;
};

/** One cloud of bubbles: one draw call. Scene units: 1 unit = 10 cm. */
export type BubbleSettings = {
  /** Seed of the layout; the same seed gives the same bubbles on every load. */
  seed: number;
  /** Bubbles rising on their own, anywhere in the cloud. */
  loose: number;
  /** Streams: strings of bubbles rising from one spot, as from a speck on the can's wall. */
  streams: number;
  /** Bubbles in one stream, evenly spaced along it. */
  perStream: number;
  /** Streams placed by hand, and bubbles in each: denser, so up close one reads as an unbroken string. */
  heroStreams: readonly HeroStream[];
  perHeroStream: number;

  /** Middle of the cloud (x, z in units), and the farthest a bubble starts from it (units). */
  center: [x: number, z: number];
  radius: number;
  /** Height (units) where the bubbles are born; they rise from there to the surface. */
  floor: number;

  /** Radius of the largest bubble (units); 0.01 = 1 mm. The smallest is a quarter of it. */
  size: number;
  /** Seconds an average bubble takes from the floor to the surface; small ones are slower. */
  riseTime: number;
  /** How the speed changes on the way up: above 0 a bubble speeds up toward the surface, below 0 it slows down and lingers under it (-1 to 1). */
  quicken: number;
  /** How far a bubble drifts sideways on its way up (units). */
  sway: number;
  /** Distance from the camera (units) where a bubble starts to fade, and where it is gone: none pops against the lens. */
  nearFade: [start: number, end: number];

  /** Color of the light a bubble catches. */
  light: string;
  /** Brightness of the bubbles (1 = white at the rim); above 1 the rims glow in the bloom. */
  strength: number;
};

// The streams the bubbles station is about: placed by hand for the camera's
// pose at that station (camera/helpers/curve.ts), between the camera and the
// opening it looks up at, and along the wall at the edges of the shot.
const HERO_STREAMS: readonly HeroStream[] = [
  { position: [0.103, -0.222], size: 0.15 },
  { position: [-0.245, 0.006], size: 0.35 },
  { position: [0.17, -0.1], size: 0.15 },
  { position: [-0.16, -0.03], size: 0.82 },
  { position: [0.01, -0.06], size: 0.52 },
  { position: [0.08, -0.08], size: 0.76 },
];

// The fizz: bubbles rising through the whole drink, loose and in streams.
export const FIZZ: BubbleSettings = {
  seed: 11,
  loose: 420,
  streams: 14,
  perStream: 16,
  heroStreams: HERO_STREAMS,
  perHeroStream: 26,

  center: [0, 0],
  // The can's inner wall is at 0.262.
  radius: 0.245,
  floor: 0,

  // 0.4 mm for the largest: fine fizz, so the fruit stays the subject up close.
  size: 0.004,
  riseTime: 9,
  quicken: 0.35,
  sway: 0.012,
  nearFade: [0.07, 0.025],

  light: '#ffe3dc',
  strength: 1.6,
};

// The plunge: a mist of very fine bubbles right under the opening, as if dragged
// in by the dive. The camera flies through it right after it goes under, on its
// way down to the bubbles station. They slow down and linger under the surface,
// so the mist is densest there and thins out below. The bubbles are far smaller
// than the fizz and fade out well before the lens: up close even a tiny bubble
// would fill the screen and read as fizz, not mist.
export const PLUNGE: BubbleSettings = {
  seed: 23,
  loose: 2400,
  streams: 0,
  perStream: 0,
  heroStreams: [],
  perHeroStream: 0,

  // Under the opening, a little toward the back, where the camera looks.
  center: [0, 0.02],
  radius: 0.17,
  // The mist reaches 2 cm under the surface.
  floor: LIQUID.height - 0.2,

  size: 0.0009,
  riseTime: 3,
  quicken: -0.5,
  sway: 0.01,
  nearFade: [0.16, 0.06],

  light: '#ffe3dc',
  strength: 1.6,
};
