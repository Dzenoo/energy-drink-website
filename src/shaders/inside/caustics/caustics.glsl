// Caustics: the web of light the wavy surface focuses onto the fruit under it. Light only comes in through the opening, so the web fills a cone that
// widens downward from there. Include after ../liquid/drink.glsl: the depth of
// a point is measured from its surface.

#include "../../noise/cellValue.glsl"

// Seconds since start; moves the web.
uniform float uCausticTime;
// Middle of the opening, at the lid's height (world, units): the cone's tip.
uniform vec3 uCausticSource;
// Cells of the web per unit.
uniform float uCausticScale;
// How fast each cell's point wanders (radians per second).
uniform float uCausticSpeed;
// Half-width of a line right under the surface (share of a cell), and how much
// wider it gets per unit of depth.
uniform float uCausticWidth;
uniform float uCausticBlur;
// Width of the cone: sideways units per unit of drop from the opening, and the
// share of it that fades out at its edge.
uniform float uCausticSpread;
uniform float uCausticSoftness;

// How far each cell's point may wander from the cell's middle (share of a cell):
// under 0.5, so the 3 x 3 cells around a pixel always hold its two nearest points.
const float CAUSTIC_WANDER = 0.45;
// The second layer: turned (radians), larger by this factor, and shifted, so its
// cells never line up with the first.
const float CAUSTIC_TURN = 0.6;
const float CAUSTIC_ZOOM = 1.37;
const vec2 CAUSTIC_SHIFT = vec2(31.7, 12.9);

// Distance from p to the nearest border between two cells of a moving Voronoi
// pattern (second nearest point minus nearest, in cells): 0 on a border. The
// borders are where the waves focus light, so they become the bright lines.
float causticBorder(vec2 p, float time) {
  vec2 corner = floor(p);
  vec2 inCell = p - corner;
  ivec2 base = ivec2(corner);

  float nearest = 8.0;
  float second = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      ivec2 offset = ivec2(x, y);
      // One hash per cell; the second axis takes its phase from the first's
      // digits, which is random enough and half the cost.
      float seed = cellValue(base + offset);
      vec2 phase = 6.2831853 * vec2(seed, fract(seed * 61.0));
      vec2 point =
        vec2(offset) + 0.5 + CAUSTIC_WANDER * sin(time * vec2(1.0, 1.3) + phase);

      float span = length(point - inCell);
      if (span < nearest) {
        second = nearest;
        nearest = span;
      } else if (span < second) {
        second = span;
      }
    }
  }
  return second - nearest;
}

// Brightness of the caustics at a world position (0 = none; about 1 where the
// lines cross right under the surface). `surfaceNormal` is the lit surface's
// normal: the web falls from above, so only what faces up catches it.
float caustics(vec3 position, vec3 surfaceNormal) {
  // Inside the cone of light under the opening?
  vec2 sideways = position.xz - uCausticSource.xz;
  float drop = max(uCausticSource.y - position.y, 1e-3);
  float angle = length(sideways) / drop;
  float cone =
    1.0 - smoothstep(uCausticSpread * (1.0 - uCausticSoftness), uCausticSpread, angle);
  float facing = max(surfaceNormal.y, 0.0);
  if (cone * facing <= 0.0) return 0.0;

  // Deeper, the lines spread wider and dimmer: the same light over more area.
  float depth = max(uDrinkSurface - position.y, 0.0);
  float width = uCausticWidth + depth * uCausticBlur;
  float energy = uCausticWidth / width;

  float time = uCausticTime * uCausticSpeed;
  vec2 p = position.xz * uCausticScale;
  mat2 turn = mat2(cos(CAUSTIC_TURN), sin(CAUSTIC_TURN), -sin(CAUSTIC_TURN), cos(CAUSTIC_TURN));
  vec2 q = turn * p * CAUSTIC_ZOOM + CAUSTIC_SHIFT;

  float first = 1.0 - smoothstep(0.0, width, causticBorder(p, time));
  float other = 1.0 - smoothstep(0.0, width, causticBorder(q, time * 0.8));

  // Squared, so a single line is dim and the knots where lines of both layers
  // cross are bright, as in a real caustic web.
  float web = 0.5 * (first + other);
  return web * web * energy * cone * facing;
}
