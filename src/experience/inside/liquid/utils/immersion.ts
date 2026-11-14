import { MathUtils, type Vector3 } from 'three';

export type ImmersionSettings = {
  /** Height of the drink's surface (units). */
  surfaceHeight: number;
  /** Inner radius of the can (units); outside it the camera is in the studio, even below the surface height. */
  radius: number;
  /** Height above the surface (units) where the view starts to turn into the drink. */
  range: number;
};

/**
 * How far the camera has gone into the drink: 0 in the studio, rising while it
 * descends from the opening to the surface, 1 at the surface and below. Surface,
 * background and fog all follow this one value, so going under shows no change:
 * the screen is already all drink when the camera crosses the surface.
 */
export const immersion = (
  camera: Vector3,
  { surfaceHeight, radius, range }: ImmersionSettings,
) => {
  if (Math.hypot(camera.x, camera.z) >= radius) return 0;
  return 1 - MathUtils.smoothstep(camera.y - surfaceHeight, 0, range);
};
