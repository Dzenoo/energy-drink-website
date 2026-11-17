import { MathUtils } from 'three';

import { VIEW } from '@/experience/camera/helpers/framing';

// The opening animation: once the can has loaded, the picture comes up out of
// black while the can rises into its place from below, turning as it comes and
// slowing down into its idle spin. Shares are of the animation's duration (0 … 1).
// Scene units: 1 unit = 10 cm.
export const INTRO_SETTINGS = {
  /** Length of the whole animation (s). */
  duration: 2.2,
  /** How many times faster it runs out once the visitor scrolls on before it ends. */
  skipSpeed: 4,
  /** How far below its place the can starts (units); the can is 1.31 tall, so it starts out of the shot. */
  rise: 1.8,
  /** How far the can turns on its way up (radians), in the direction of its idle spin; π is half a turn. */
  turn: Math.PI,
  /** Sharpness of the ease-out: higher starts faster and settles longer and softer. */
  easePower: 4,
  /** Share by which the picture has fully come up out of black. */
  darkUntil: 0.3,
  /** Shares between which the glow behind the can comes on. */
  glowFrom: 0.2,
  glowTo: 0.8,
  /** Share at which the page around the can (text, header) starts to come in. */
  textAt: 0.7,
};

/** Eased arrival, 0 … 1: quick at first, settling softly into place. */
export const introArrival = (progress: number) =>
  1 - Math.pow(1 - MathUtils.clamp(progress, 0, 1), INTRO_SETTINGS.easePower);

/**
 * How far below its place the can is during the opening (units, ≤ 0). Everything
 * that sits in the can and shows from outside (the drink's surface) drops by
 * the same amount, so the closed lid keeps covering it. Narrow screens see a
 * taller view (camera/helpers/framing.ts), so the can starts lower there by the
 * same factor and still begins out of the shot.
 */
export const introDrop = (progress: number) =>
  -INTRO_SETTINGS.rise * VIEW.heightScale * (1 - introArrival(progress));

/** How dark the picture is during the opening: 1 black, 0 fully up. */
export const introDarkness = (progress: number) =>
  1 - MathUtils.smoothstep(progress, 0, INTRO_SETTINGS.darkUntil);

/** How much of the glow behind the can is on during the opening, 0 … 1. */
export const introGlow = (progress: number) =>
  MathUtils.smoothstep(
    progress,
    INTRO_SETTINGS.glowFrom,
    INTRO_SETTINGS.glowTo,
  );
