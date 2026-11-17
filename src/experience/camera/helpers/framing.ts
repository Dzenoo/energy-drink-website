import { MathUtils } from 'three';

import { STATION_COUNT } from '@/store/scroll/scroll';

// How the shot adapts to the screen's shape. Wide screens see the scene as it
// was composed; narrow ones widen the view so nothing at the sides is lost, and
// upright ones also move the picture up, leaving the bottom to the text.
export const FRAMING = {
  /** Vertical field of view (degrees) on wide screens. */
  fov: 35,
  /** Least horizontal field of view (degrees): narrower screens widen the vertical one to keep it. */
  minHorizontalFov: 28,
  /** Width-to-height ratios over which the upright shift comes in: none at the first, all of it at the second. */
  uprightFrom: 1,
  uprightTo: 0.75,
  /**
   * Per station, in scroll order: how far the picture moves up on upright
   * screens (share of the screen's height). The can goes up, above the text at
   * the bottom; the end goes down, so the strawberries on the floor sit under
   * the text at the top.
   */
  lift: [0.12, 0, 0, 0, -0.32],
};

/**
 * Live view values, written by the camera rig every frame and read by parts that
 * must fit the view: how much taller the view is than on a wide screen
 * (1 = as composed).
 */
export const VIEW = { heightScale: 1 };

if (FRAMING.lift.length !== STATION_COUNT) {
  throw new Error(
    `Camera framing has ${FRAMING.lift.length} lifts, the content has ${STATION_COUNT} stations`,
  );
}

/** Vertical field of view (degrees) for a screen's width-to-height ratio. */
export const verticalFov = (aspect: number) => {
  const halfHorizontal = MathUtils.degToRad(FRAMING.minHorizontalFov / 2);
  const keepHorizontal = MathUtils.radToDeg(
    2 * Math.atan(Math.tan(halfHorizontal) / aspect),
  );
  return Math.max(FRAMING.fov, keepHorizontal);
};

/** How upright a screen is, 0 (wide) … 1 (phone held upright). */
export const uprightShare = (aspect: number) =>
  1 - MathUtils.smoothstep(aspect, FRAMING.uprightTo, FRAMING.uprightFrom);

/** The picture's lift at a scroll progress, blended between the stations around it. */
export const liftAt = (progress: number) => {
  const clamped = MathUtils.clamp(progress, 0, STATION_COUNT - 1);
  const from = Math.floor(clamped);
  const to = Math.min(from + 1, STATION_COUNT - 1);
  return MathUtils.lerp(
    FRAMING.lift[from] ?? 0,
    FRAMING.lift[to] ?? 0,
    clamped - from,
  );
};
