import { Color } from 'three';

// Look of the strawberry pieces in the drink.
export const STRAWBERRY = {
  /** Ripe skin. */
  skin: '#c4122a',
  /** Skin at the shoulder, where a strawberry stays paler. */
  skinPale: '#e07a5f',
  /** The seeds. */
  seed: '#e6c35c',
  /** Flesh on the cut face. */
  flesh: '#f26d7d',
  /** The pale core along the fruit's axis. */
  core: '#ffe9e2',

  /** Color of the light from above. */
  light: '#fff0ea',
  /** Strength of that light right under the surface (1 = the colors as set). */
  lightStrength: 2.5,
  /** Light from the drink all around (share of the drink's own color). */
  ambient: 1,
  /** Light shining through the thin edges of a piece (0 = none). */
  glow: 0.6,
  /** Strength of the wet highlight (0 = none). */
  gloss: 1.2,
};

// One set of uniforms for the look, shared by every piece's material, so a
// change reaches all of them at once.
export const STRAWBERRY_UNIFORMS = {
  uBerrySkin: { value: new Color(STRAWBERRY.skin) },
  uBerrySkinPale: { value: new Color(STRAWBERRY.skinPale) },
  uBerrySeed: { value: new Color(STRAWBERRY.seed) },
  uBerryFlesh: { value: new Color(STRAWBERRY.flesh) },
  uBerryCore: { value: new Color(STRAWBERRY.core) },
  uBerryLight: { value: new Color(STRAWBERRY.light) },
  uBerryLightStrength: { value: STRAWBERRY.lightStrength },
  uBerryAmbient: { value: STRAWBERRY.ambient },
  uBerryGlow: { value: STRAWBERRY.glow },
  uBerryGloss: { value: STRAWBERRY.gloss },
};
