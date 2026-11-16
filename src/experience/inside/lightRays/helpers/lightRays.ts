// Shafts of light falling from the opening into the drink. Scene units: 1 unit = 10 cm.
export const LIGHT_RAYS = {
  /** Seed of the layout; the same seed gives the same rays on every load. */
  seed: 7,
  /** Number of rays; all of them are one draw call. */
  count: 7,
  /** Share of the caustics' cone the rays keep to, so they fall where the web lights the fruit. */
  coneShare: 0.8,
  /** Farthest a ray reaches from the can's axis (units): inside the wall (0.262), so none runs into it. */
  wallRadius: 0.24,
  /** Lowest a ray reaches (units above the can's base). */
  floor: 0.1,

  /** Length of the longest ray (units); each gets 60–100 % of it, less where the wall or the floor stops it. */
  length: 0.9,
  /** Half-width of a ray where it leaves the surface (units); 0.015 = 1.5 mm. */
  width: 0.015,
  /** How many times wider a ray is at its far end: light spreads as it falls. */
  flare: 3,
  /** Brightness of a ray (times the drink's light from above). */
  strength: 0.4,
  /** Depth (units) where a ray has faded to about a third (1/e); deeper than the drink's own light, so the rays still show at the fruit. */
  depth: 0.5,
  /** How fast the flicker runs down a ray (clumps per second). */
  shimmerSpeed: 0.3,
  /** Distance from the camera (units) where a ray starts to fade, and where it is gone: no flat edge sweeps across the lens. */
  nearFade: [0.15, 0.04] as [start: number, end: number],
};
