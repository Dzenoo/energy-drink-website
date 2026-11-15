// The outside of a strawberry: red, paler at the shoulder, with seeds sitting in
// small pits in staggered rows. The rows are laid out around the fruit's axis,
// so they need no texture and no unwrapping.

// Seeds around the fruit, and rows of them from tip to shoulder.
const float SEEDS_AROUND = 14.0;
const float SEED_ROWS = 9.0;
// Radius of a pit and of the seed in it (model units; the fruit is 2 tall).
const float PIT = 0.075;
const float SEED = 0.032;
// How much darker the bottom of a pit is than the skin around it.
const float PIT_SHADE = 0.45;

// Returns the surface color (rgb) and how glossy it is there (a).
vec4 berrySurface(vec3 p, float fromAxis, float radius) {
  float angle = atan(p.z - uBerryAxis.y, p.x - uBerryAxis.x);
  vec2 lattice = vec2(angle / TURN * SEEDS_AROUND, (p.y * 0.5 + 0.5) * SEED_ROWS);
  // Every other row is shifted by half a seed, as on the fruit.
  lattice.x += 0.5 * mod(floor(lattice.y), 2.0);

  // Distance to the nearest seed in model units, so pits stay round where the
  // fruit is narrow.
  vec2 cell = fract(lattice) - 0.5;
  vec2 cellSize = vec2(TURN * fromAxis / SEEDS_AROUND, 2.0 / SEED_ROWS);
  float toSeed = length(cell * cellSize);

  float pit = 1.0 - smoothstep(0.0, PIT, toSeed);
  float seed = 1.0 - smoothstep(SEED * 0.6, SEED, toSeed);

  vec3 skin = mix(uBerrySkin, uBerrySkinPale, smoothstep(0.55, 1.0, p.y));
  vec3 color = mix(skin * (1.0 - PIT_SHADE * pit), uBerrySeed, seed);
  // Wet skin shines; the pits do not catch the light.
  return vec4(color, 1.0 - pit);
}
