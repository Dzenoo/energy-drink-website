import { MathUtils, type Vector3 } from 'three';

import { LIQUID } from '@/experience/inside/liquid/utils/liquid';

// Heights around the drink's surface (units, 1 unit = 10 cm) where the froth
// covers the picture. Between `fullAbove` and `fullBelow` it covers all of it:
// the camera path (camera/utils/curve.ts) turns the camera around inside that
// band, so the turn is never seen.
const SPLASH = {
  /** Height above the surface where the froth starts to come in: just under the lid. */
  startAbove: 0.12,
  /** Height above the surface from which the picture is fully covered. */
  fullAbove: 0.045,
  /** Depth under the surface down to which the picture stays fully covered. */
  fullBelow: 0.065,
  /** Depth under the surface where the froth has cleared. */
  endBelow: 0.24,
};

/**
 * How much of the picture the froth of the dive covers, from where the camera
 * is: 0 none, 1 all of it. Outside the can there is none, whatever the height.
 */
export const splash = (camera: Vector3) => {
  if (Math.hypot(camera.x, camera.z) >= LIQUID.radius) return 0;
  const above = camera.y - LIQUID.height;
  return (
    (1 - MathUtils.smoothstep(above, SPLASH.fullAbove, SPLASH.startAbove)) *
    (1 - MathUtils.smoothstep(-above, SPLASH.fullBelow, SPLASH.endBelow))
  );
};
