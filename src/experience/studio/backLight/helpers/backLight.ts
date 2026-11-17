// Glow on the studio backdrop behind the can, on the first station only.
// Scene units: 1 unit = 10 cm; the can stands on the origin, about 1.31 tall.
export const BACK_LIGHT = {
  /** Color of the glow: a dim neutral grey, so it lifts the backdrop without turning it white. */
  color: '#242323',
  /** Brightness in the glow's middle (1 = the color as set). */
  intensity: 2.2,
  /** How far behind the can's axis the glow lies (units); close, so the glow hugs the can. */
  distance: 0.5,
  /** Height of the glow's middle (units); a little under the can's middle (about 0.67). */
  height: 0.6,
  /** Distance from the middle (units) where the glow has fallen to about a third. */
  radius: 1.2,
  /** Height to width of the glow: below 1 it is wider than tall, a band across the backdrop. */
  stretch: 0.5,
  /** Scroll progress (stations) where the glow starts to fade, and where it is gone: halfway to the second station. */
  fade: [0, 0.5] as [start: number, end: number],
};

/**
 * The glow is drawn on a square plane this many radii from its middle to its
 * edge; the falloff there is below 0.02 % of the middle, so the edge never shows.
 * The fragment shader uses the same number.
 */
export const BACK_LIGHT_EXTENT = 3;
