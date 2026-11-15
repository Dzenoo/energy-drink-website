// The drink's surface: a swell of smooth noise layers drifting in different
// directions, so it never repeats the way a few sine waves do, and rings from
// popping bubbles on top of it.

// Seconds since start; moves the swell.
uniform float uTime;
// Noise cells per unit (10 cm) for the largest waves.
uniform float uWaveScale;
// How steep the waves are.
uniform float uWaveHeight;
// How fast the waves drift (noise cells per second).
uniform float uWaveSpeed;
// How steep the rings from popping bubbles are.
uniform float uRippleHeight;

#include "../../noise/cellValue.glsl"

// A unit direction per noise cell: the way the noise climbs at that corner.
vec2 waveGradient(ivec2 cell) {
  float angle = cellValue(cell) * 6.2831853;
  return vec2(cos(angle), sin(angle));
}

// Slope (d/dx, d/dy) of gradient noise at p, worked out exactly from the
// interpolation instead of sampling the noise three times. Gradient noise, not
// value noise: its hills do not follow the grid of cells, so the surface reads
// as water instead of blotches. The technique (gradient noise with analytic
// derivatives) is the one described by Inigo Quilez; the code is written here.
vec2 noiseSlope(vec2 p) {
  vec2 corner = floor(p);
  vec2 f = p - corner;
  ivec2 cell = ivec2(corner);

  // Quintic fade and its derivative: the slope stays smooth across cell borders.
  vec2 fade = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 fadeSlope = 30.0 * f * f * (f * (f - 2.0) + 1.0);

  vec2 ga = waveGradient(cell);
  vec2 gb = waveGradient(cell + ivec2(1, 0));
  vec2 gc = waveGradient(cell + ivec2(0, 1));
  vec2 gd = waveGradient(cell + ivec2(1, 1));

  // The height each corner's direction gives at p.
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float cross = va - vb - vc + vd;

  // The corners' directions blended, plus the change of the blend itself.
  return ga +
    fade.x * (gb - ga) +
    fade.y * (gc - ga) +
    fade.x * fade.y * (ga - gb - gc + gd) +
    fadeSlope * (vec2(vb - va, vc - va) + fade.yx * cross);
}

// Rings spreading from where a bubble of the fizz pops: the detail that makes a
// surface read as liquid at a glance.
const int RIPPLES = 4;
// How long one ring lives (seconds) and how far its front travels in that time (units).
const float RIPPLE_LIFE = 3.0;
const float RIPPLE_REACH = 0.3;
// Distance between two crests of a ring (units); 0.035 = 3.5 mm.
const float RIPPLE_WAVELENGTH = 0.035;
// Half-width of the band of crests that travels with the front (units).
const float RIPPLE_BAND = 0.04;
// Rings start within this distance of the can's axis (units).
const float RIPPLE_AREA = 0.2;

vec2 rippleSlope(vec2 position) {
  vec2 slope = vec2(0.0);
  for (int i = 0; i < RIPPLES; i++) {
    // Each ring runs on its own clock, shifted so they never start together.
    float clock = uTime / RIPPLE_LIFE + float(i) / float(RIPPLES);
    float age = fract(clock);
    // A new random place for every life of every ring.
    ivec2 seed = ivec2(int(floor(clock)), i);
    vec2 center =
      (vec2(cellValue(seed), cellValue(seed + ivec2(0, RIPPLES))) - 0.5) *
      (2.0 * RIPPLE_AREA);

    vec2 offset = position - center;
    float radius = length(offset);
    float fromFront = radius - age * RIPPLE_REACH;

    // A short band of crests around the front; it rises quickly at birth and
    // flattens as the ring spreads.
    float band = exp(-fromFront * fromFront / (RIPPLE_BAND * RIPPLE_BAND));
    float strength = smoothstep(0.0, 0.08, age) * (1.0 - age) * (1.0 - age);
    float crest = cos(fromFront * (6.2831853 / RIPPLE_WAVELENGTH));

    slope += offset / max(radius, 1e-4) * (crest * band * strength);
  }
  return slope * uRippleHeight;
}

// Surface slope (dh/dx, dh/dz) at a world position (xz, units).
vec2 surfaceSlope(vec2 position) {
  // Each layer: drift direction (xy), frequency (z), share of the slope (w).
  // All drift at the same speed in their own cells, so the large waves travel
  // faster than the ripples, as on real water.
  const vec4 layers[3] = vec4[3](
    vec4(0.80, 0.60, 1.0, 1.0),
    vec4(-0.45, 0.89, 2.1, 0.6),
    vec4(0.20, -0.98, 4.3, 0.35)
  );
  vec2 p = position * uWaveScale;
  vec2 slope = vec2(0.0);
  for (int i = 0; i < 3; i++) {
    vec4 layer = layers[i];
    // The constant shift keeps the layers' cells from lining up at the center.
    vec2 drift = layer.xy * (uTime * uWaveSpeed) + float(i) * 17.3;
    slope += noiseSlope(p * layer.z + drift) * layer.w;
  }
  return slope * uWaveHeight + rippleSlope(position);
}
