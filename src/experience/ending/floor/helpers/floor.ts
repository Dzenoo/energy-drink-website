// The studio floor the strawberries lie on. Scene units: 1 unit = 10 cm.
export const FLOOR = {
  /** Side of the floor (units); far past where it has faded into the backdrop. */
  size: 10,
  /** Dark, a touch lighter than the backdrop, so the light from the pointer has something to fall on. */
  color: '#0c0d10',
  /** Roughness: the light shows on it as a soft pool, not as a mirror image. */
  roughness: 0.7,
  /** How much of the studio's panels still reaches the floor (1 = as much as the can gets): almost none, the end is dark. */
  ambient: 0.03,
  /** Distance from the middle (units) where the floor starts to fade into the backdrop, and where it is gone. */
  fadeStart: 1.65,
  fadeEnd: 3.7,
};
