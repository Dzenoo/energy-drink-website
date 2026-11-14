// Seen through moving liquid the whole picture sways. This shifts where each
// pixel reads the picture from, by a few slow waves crossing each other.
// `time` (seconds) and `aspect` (width / height) come from the postprocessing library.

// How far the camera is into the drink: 0 in the studio (no sway), 1 at the surface and below.
uniform float uUnder;
// Largest shift of the picture (share of the screen's height).
uniform float uStrength;
// Waves across the screen's height.
uniform float uScale;
// How fast the waves move (cycles per second).
uniform float uSpeed;

const float TURN = 6.2831853;

void mainUv(inout vec2 uv) {
  // In units of the screen's height on both axes, so the waves are as wide on a
  // phone as on a desktop.
  vec2 p = vec2(uv.x * aspect, uv.y) * uScale;
  float t = time * uSpeed;

  // Each axis sways by one large wave and one smaller, slanted one at another
  // speed, so the motion never visibly repeats. Their sum stays within ±1.5.
  vec2 sway = vec2(
    sin((p.y + t) * TURN) + 0.5 * sin((p.y * 2.3 + p.x - t * 1.3) * TURN),
    cos((p.x * 1.1 + t * 0.8) * TURN) +
      0.5 * sin((p.x * 1.9 - p.y + t * 1.7) * TURN)
  );

  uv += sway * vec2(1.0 / aspect, 1.0) * (uStrength * uUnder / 1.5);
}
