import type { ImmersionSettings } from './immersion';

// The drink in the can. Scene units: 1 unit = 10 cm.
export const LIQUID = {
  /** Surface height (units); 1.16 = 116 mm, just under the shoulder. */
  height: 1.16,
  /** Can body radius (units). */
  radius: 0.265,
  /** Gap between the surface disc and the can wall (units), so they never fight for the same pixels. */
  wallGap: 0.001,
  /** Height above the surface (units) where the view starts to turn into the drink: 0.14 is from the opening down. */
  immersionRange: 0.14,

  // Surface.
  /** How strongly the surface mirrors the studio, seen from above (1 = as much as still water); higher makes the panels' reflections read in the dark studio. */
  reflection: 6,
  /** Noise cells per unit for the largest waves; 20 makes them about 1 cm long. */
  waveScale: 20,
  /** How steep the waves are; low, so the swell stays calm under the rings. */
  waveHeight: 0.09,
  /** How fast the waves drift (noise cells per second). */
  waveSpeed: 0.4,
  /** How steep the rings from popping bubbles are (0 = no rings); they carry most of the surface's life. */
  rippleHeight: 1,

  // Surface from below.
  /** The lid's underside seen through the surface: dark, so the opening stands out. */
  lid: '#3d0a16',
  /** Height of the lid (units); the top of the Panel in the model. */
  lidHeight: 1.3,
  /** Center of the opening in the lid (x, z in units); from the Panel's bounds in the model. */
  openingCenter: [0, 0.11] as [number, number],
  /** Half-size of the opening (x, z in units); from the Panel's bounds in the model. */
  openingSize: [0.07, 0.065] as [number, number],
  /** Studio light falling in through the opening. */
  openingLight: '#deb39d',
  /** Strength of that light (1 = full white); above 1 it still shines through the fog from deep down. */
  openingStrength: 6.9,
  /** Strength of the glow the light leaves on the lid around the opening. */
  haloStrength: 2.15,
  /** How far that glow spreads (in opening radii, to about a third); wide, so the whole window glows. */
  haloSize: 2.5,
  /** How softly Snell's window turns into the mirror at its edge (0 = hard edge). */
  windowEdge: 1,

  // Inside.
  /** Drink color just under the surface, where the light comes in. */
  shallow: '#b0102f',
  /** Drink color at the bottom of the can. */
  bottom: '#22020a',
  /** Depth (units) from the surface to the darkest color. */
  depthRange: 0.8,
  /** Fog density in the drink (per unit); things fade out over a few centimetres. */
  density: 3,
  /** How far the eye sees into the drink (units): looking up shows the color that much shallower, looking down that much deeper. */
  reach: 0.45,
  /** Color of the light pouring in from above. */
  light: '#ff8a7a',
  /** Strength of that light straight overhead, right under the surface (0 = none). */
  lightStrength: 0.5,
  /** How tightly the light gathers around straight up (exponent); higher is a smaller, sharper glow. */
  lightFocus: 2.5,
  /** Depth (units) where the light has faded to about a third (1/e). */
  lightDepth: 0.6,
};

/** One set of settings for surface, background and fog, so they turn together. */
export const IMMERSION: ImmersionSettings = {
  surfaceHeight: LIQUID.height,
  radius: LIQUID.radius,
  range: LIQUID.immersionRange,
};
