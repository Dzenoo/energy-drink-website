import { Color } from 'three';

import { LIQUID } from './liquid';

// One set of uniforms for shaders/inside/liquid/drink.glsl, shared by every
// material that shows the drink's color (backdrop, surface): set once per frame,
// and all of them fade into the same picture.
export const DRINK_UNIFORMS = {
  // Set each frame by Underwater while the camera is in or near the drink.
  uDrinkUnder: { value: 0 },
  uDrinkSurface: { value: LIQUID.height },
  uDrinkShallow: { value: new Color(LIQUID.shallow) },
  uDrinkBottom: { value: new Color(LIQUID.bottom) },
  uDrinkDepthRange: { value: LIQUID.depthRange },
  uDrinkReach: { value: LIQUID.reach },
  uDrinkLight: { value: new Color(LIQUID.light) },
  uDrinkLightStrength: { value: LIQUID.lightStrength },
  uDrinkLightFocus: { value: LIQUID.lightFocus },
  uDrinkLightDepth: { value: LIQUID.lightDepth },
};
