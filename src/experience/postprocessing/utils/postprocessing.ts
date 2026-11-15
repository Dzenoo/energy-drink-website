// Look of the whole picture, after the scene is drawn.
export const POSTPROCESSING = {
  /** Samples per pixel for smooth edges; the canvas's own antialiasing is off, since the scene is drawn into a buffer first. */
  multisampling: 4,

  // Bloom: light bleeding around the bright parts of the picture.
  /** Brightness where bloom starts (1 = white); low, so the lit drink and the metal's highlights glow softly too, not only the light sources. */
  bloomThreshold: 0.2,
  /** How softly bloom comes in above the threshold. */
  bloomSmoothing: 0.2,
  /** Strength of the glow. */
  bloomIntensity: 0.5,

  // Vignette: darker corners.
  /** Where the darkening starts (0 = center, 1 = corners). */
  vignetteOffset: 0.3,
  /** How dark the corners get (0 = none). */
  vignetteDarkness: 0.5,

  /** Film grain (0 = none); it also breaks up the bands in dark gradients. */
  grain: 0.3,

  // Wobble: the picture swaying while the camera is in the drink.
  /** Largest shift of the picture (share of the screen's height). */
  wobbleStrength: 0.02,
  /** Waves across the screen's height. */
  wobbleScale: 1.5,
  /** How fast the waves move (cycles per second). */
  wobbleSpeed: 0.4,

  // Splash: froth washing over the picture as the camera goes through the surface.
  /** Color of the froth: the drink's own dark red, so the dive reads as sinking into it rather than as a flash. */
  splashColor: '#58000b',
  /** Brightness of the froth (1 = the color as set). */
  splashBrightness: 0.65,
  /** Clumps of froth across the screen's height; many, so it is a fine grain rather than clouds. */
  splashScale: 30,
  /** How fast the froth drifts up past the camera (clumps per second). */
  splashSpeed: 0.1,
  /** How much stronger the picture sways in the froth than in the still drink (times the wobble). */
  splashWobble: 1.2,
};
