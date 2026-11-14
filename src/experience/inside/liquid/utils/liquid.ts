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
  /** The drink seen from above: dark red. */
  deep: '#3a0610',
  /** Light coming through the surface, seen from below. */
  glow: '#ff6a7a',
  /** Highlights on the surface, seen from above. */
  shine: '#ffd9df',
  /** Waves per unit; with the speeds in the shader, a slow, small swell. */
  waveScale: 40,
  /** How steep the waves are; low keeps the drink calm. */
  waveHeight: 0.05,

  // Inside.
  /** Drink color just under the surface, where the light comes in. */
  shallow: '#b0102f',
  /** Drink color at the bottom of the can. */
  bottom: '#22020a',
  /** Depth (units) from the surface to the darkest color. */
  depthRange: 0.8,
  /** Fog density in the drink (per unit); things fade out over a few centimetres. */
  density: 3,
};

/** One set of settings for surface, background and fog, so they turn together. */
export const IMMERSION: ImmersionSettings = {
  surfaceHeight: LIQUID.height,
  radius: LIQUID.radius,
  range: LIQUID.immersionRange,
};
