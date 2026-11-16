// Only light is drawn, added on top of the drink, so the rays need no sorting
// and add up where they cross.

#include "../liquid/drink.glsl"
#include "../../noise/cellValue.glsl"

// Seconds since start; runs the flicker.
uniform float uTime;
// Brightness of a ray, times the drink's light from above.
uniform float uRayStrength;
// Depth (units) where a ray has faded to 1/e.
uniform float uRayDepth;
// How fast the flicker runs down a ray (clumps per second).
uniform float uRayShimmerSpeed;
// Distance from the camera (units) where a ray starts to fade (x) and where it is gone (y).
uniform vec2 uRayNearFade;

varying vec2 vRay;
varying vec3 vWorldPosition;
varying vec3 vAxis;
varying float vLength;
varying float vBrightness;
varying float vPhase;

// How quickly a ray falls off from its middle to its sides (Gaussian; at the
// strip's edge 3.0 leaves 5 %, so the edge never shows).
const float SOFTNESS = 3.0;
// Share of the length over which a ray fades in under the surface, and the
// share from which it fades out toward its end.
const float FADE_IN = 0.08;
const float FADE_OUT_FROM = 0.5;
// Clumps of flicker per unit along a ray, and how much they dim it (0 = none):
// the waves above break the light up as it comes in.
const float SHIMMER_SCALE = 12.0;
const float SHIMMER_DEPTH = 0.6;
// Looking along a ray, its strip turns edge-on and its light piles up in one
// spot: it fades out between these two alignments of the look and the ray.
const float ALONG_FADE_START = 0.75;
const float ALONG_FADE_END = 0.95;
// Share of the drink's fog the rays fade in: they are the light the drink
// itself scatters, so they carry farther than solid things do.
const float FOG_SHARE = 0.5;
// Number of flicker phases: each ray reads its own row of noise cells.
const float PHASES = 1000.0;

void main() {
  vec3 toRay = vWorldPosition - cameraPosition;
  float span = length(toRay);
  vec3 look = toRay / span;

  float across = exp(-SOFTNESS * vRay.x * vRay.x);
  float ends =
    smoothstep(0.0, FADE_IN, vRay.y) * (1.0 - smoothstep(FADE_OUT_FROM, 1.0, vRay.y));

  float depth = max(uDrinkSurface - vWorldPosition.y, 0.0);
  float lit = exp(-depth / uRayDepth);

  // Smooth value noise along the ray, running down it with time.
  float along = vRay.y * vLength * SHIMMER_SCALE - uTime * uRayShimmerSpeed;
  float cell = floor(along);
  float blend = smoothstep(0.0, 1.0, along - cell);
  int row = int(vPhase * PHASES);
  float noise = mix(
    cellValue(ivec2(int(cell), row)),
    cellValue(ivec2(int(cell) + 1, row)),
    blend
  );
  float shimmer = 1.0 - SHIMMER_DEPTH * noise;

  float near = smoothstep(uRayNearFade.y, uRayNearFade.x, span);
  float sideOn =
    1.0 - smoothstep(ALONG_FADE_START, ALONG_FADE_END, abs(dot(vAxis, look)));
  float density = uDrinkDensity * uDrinkUnder * FOG_SHARE;
  float fog = exp(-density * density * span * span);

  float light =
    uRayStrength * vBrightness * across * ends * lit * shimmer * near * sideOn * fog;
  gl_FragColor = vec4(uDrinkLight * light, 1.0);
  #include <colorspace_fragment>
}
