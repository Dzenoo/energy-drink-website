import { Vector3 } from 'three';

import { LIQUID } from '@/experience/inside/liquid/helpers/liquid';

// The web of light the surface focuses into the drink. Scene units: 1 unit = 10 cm.
export const CAUSTICS = {
  /** Cells of the web per unit; 25 gives cells about 4 mm across. */
  scale: 25,
  /** How fast each cell's point wanders (radians per second); the web shifts with it. */
  speed: 0.8,
  /** Half-width of a line right under the surface (share of a cell); thin, so the web reads as sharp light. */
  width: 0.05,
  /** How much wider, and so dimmer, a line gets per unit of depth (share of a cell); low, so the web stays crisp down at the fruit. */
  blur: 0.03,
  /** Width of the cone of light under the opening: sideways units per unit of drop. */
  spread: 0.5,
  /** Share of the cone's width that fades out at its edge (0 = hard edge). */
  softness: 0.5,
  /** Brightness on the fruit, times the light from above (0 = none). */
  onFruit: 3,
};

// One set of uniforms for shaders/inside/caustics/caustics.glsl. Every piece of
// fruit shares it, so the web runs across all of them as one.
export const CAUSTICS_UNIFORMS = {
  // Advanced each frame by Caustics.
  uCausticTime: { value: 0 },
  uCausticSource: {
    value: new Vector3(
      LIQUID.openingCenter[0],
      LIQUID.lidHeight,
      LIQUID.openingCenter[1],
    ),
  },
  uCausticScale: { value: CAUSTICS.scale },
  uCausticSpeed: { value: CAUSTICS.speed },
  uCausticWidth: { value: CAUSTICS.width },
  uCausticBlur: { value: CAUSTICS.blur },
  uCausticSpread: { value: CAUSTICS.spread },
  uCausticSoftness: { value: CAUSTICS.softness },
  uCausticOnFruit: { value: CAUSTICS.onFruit },
};
