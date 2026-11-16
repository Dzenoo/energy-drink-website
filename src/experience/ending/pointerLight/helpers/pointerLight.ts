// The light that follows the pointer over the strawberries of the end. Scene
// units: 1 unit = 10 cm.
export const POINTER_LIGHT = {
  /** Warm white, so the red of the fruit glows under it. */
  color: '#ffe6dc',
  /** Brightness (candela, as three.js measures a point light): strong, since it is nearly the only light at the end. */
  intensity: 1.5,
  /** Height above the floor (units); low, so it lights a small pool of a few strawberries. */
  height: 0.35,
  /** Reach (units): past it the light is gone, so only the strawberries near the pointer show. */
  distance: 0.8,
  /** Spring time (s) to catch up with the pointer; it glides instead of jumping. */
  smoothTime: 0.35,
  /** With no pointer on the screen (a phone between touches), the light drifts along the band by itself: how fast (radians per second). */
  wanderSpeed: 0.25,
  /** How far it drifts sideways and back, as a share of the band's half-width and depth. */
  wanderWidth: 0.7,
  wanderDepth: 0.3,
};
