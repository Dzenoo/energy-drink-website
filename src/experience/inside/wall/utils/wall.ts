// The can's inner wall, as seen from inside the drink. Scene units: 1 unit = 10 cm.
export const WALL = {
  /** Radius (units): 0.3 mm inside the can's outer shell (0.265), so the two never fight for the same pixels. */
  radius: 0.262,
  /** Size of the rounded edge between the wall and the bottom (units). */
  bevel: 0.03,
  /** Segments around the wall. */
  segments: 64,

  /** The metal seen through the drink. */
  color: '#a83248',
  /** Light the wall gets everywhere, from the drink around it (share of full light). */
  ambient: 0.1,
  /** Depth (units) where the light from the opening has faded to about a third (1/e); 0.05 keeps it to a thin band under the surface. */
  lightDepth: 0.05,
  /** Color of the opening's reflection in the metal. */
  glint: '#ffd9cf',
  /** Strength of that reflection (0 = none). */
  glintStrength: 0.1,
  /** How tight the reflection is (exponent); higher is a smaller, sharper glint. */
  gloss: 70,
};
