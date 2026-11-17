/**
 * Smooth 0 … 1 ramp between two edges, like GLSL smoothstep. Kept here instead
 * of three's MathUtils, so the page's own code does not pull three.js into the
 * first download.
 */
export const smoothstep = (x: number, min: number, max: number) => {
  const t = Math.min(Math.max((x - min) / (max - min), 0), 1);
  return t * t * (3 - 2 * t);
};
