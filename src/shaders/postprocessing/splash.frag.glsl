// The moment of going through the drink's surface: froth washes over the whole
// picture and clears again. It marks the dive, and it hides the camera turning
// from looking down at the drink to looking up through it.
// `time` (seconds) and `aspect` (width / height) come from the postprocessing library.

#include "../noise/cellValue.glsl"

// How much of the picture the froth covers: 0 none, 1 all of it.
uniform float uSplash;
// Color of the froth, with its brightness already in it.
uniform vec3 uSplashColor;
// Clumps of froth across the screen's height.
uniform float uSplashScale;
// How fast the froth rushes up past the camera (clumps per second).
uniform float uSplashSpeed;

// How much the froth's pattern holds the cover back where it is thin: at half
// a splash only the thick clumps show, at a full one everything is covered.
const float PATTERN = 0.6;

// Smooth noise in [0, 1]: one random value per cell, blended between cells.
float valueNoise(vec2 p) {
  vec2 corner = floor(p);
  vec2 f = p - corner;
  ivec2 cell = ivec2(corner);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(cellValue(cell), cellValue(cell + ivec2(1, 0)), f.x),
    mix(cellValue(cell + ivec2(0, 1)), cellValue(cell + ivec2(1, 1)), f.x),
    f.y
  );
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uSplash <= 0.0) {
    outputColor = inputColor;
    return;
  }

  // In units of the screen's height on both axes, so the clumps are as large on
  // a phone as on a desktop.
  vec2 p = vec2(uv.x * aspect, uv.y) * uSplashScale;
  p.y -= time * uSplashSpeed;
  float froth = 0.65 * valueNoise(p) + 0.35 * valueNoise(p * 2.7 + 11.0);

  // The froth comes in as clumps that grow together, and breaks up the same way.
  float cover = smoothstep(
    0.0,
    1.0,
    uSplash * (1.0 + PATTERN) - (1.0 - froth) * PATTERN
  );
  outputColor = vec4(mix(inputColor.rgb, uSplashColor, cover), inputColor.a);
}
