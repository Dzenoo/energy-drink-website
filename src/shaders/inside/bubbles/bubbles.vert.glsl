#include "../liquid/drink.glsl"

// Per bubble, all in [0, 1]: where around the can's axis (x), how far from it
// (y), where in its rise it starts (z), how large it is (w).
attribute vec4 aSeed;

// Seconds since start.
uniform float uTime;
// Farthest a bubble starts from the can's axis (units).
uniform float uBubbleRadius;
// Radius of the largest bubble (units).
uniform float uBubbleSize;
// Seconds an average bubble takes from the bottom to the surface.
uniform float uBubbleRiseTime;
// How far a bubble drifts sideways on its way up (units).
uniform float uBubbleSway;

// Corner of the bubble's square: (-1, -1) to (1, 1).
varying vec2 vCorner;
// How much of the bubble's light reaches the camera: light at its depth, fog on the way.
varying float vLight;

const float TURN = 6.2831853;
// Share of the rise spent growing from nothing at the bottom, and where the
// bubble bursts at the surface.
const float BORN = 0.04;
const float BURST = 0.985;
// Distance from the camera (units) where a bubble starts to fade and where it
// is gone, so none pops against the lens.
const vec2 NEAR_FADE = vec2(0.07, 0.025);
// Below this share of its light a bubble is not drawn at all.
const float UNSEEN = 0.01;

void main() {
  // Many small bubbles, few large ones; the large rise faster.
  float size = mix(0.25, 1.0, aSeed.w * aSeed.w);
  float pace = mix(0.6, 1.4, aSeed.w) / uBubbleRiseTime;
  float life = fract(aSeed.z + uTime * pace);

  // Speeding up toward the surface, as the bubble grows.
  float height = mix(life, life * life, 0.35) * uDrinkSurface;

  // The square root spreads the bubbles evenly over the can's section instead
  // of crowding the axis.
  float around = aSeed.x * TURN;
  vec2 place = vec2(cos(around), sin(around)) * (sqrt(aSeed.y) * uBubbleRadius);
  // The drift depends on the height, so a stream of bubbles snakes instead of
  // swinging as a stiff line.
  float drift = height * 14.0 + aSeed.x * 40.0;
  place += uBubbleSway * vec2(
    sin(drift + uTime * 0.9),
    cos(drift * 1.3 + uTime * 1.1 + aSeed.y * 40.0)
  );

  vec3 center = vec3(place.x, height, place.y);
  vec4 viewCenter = viewMatrix * vec4(center, 1.0);
  float span = length(viewCenter.xyz);

  // Light fades with depth, and the drink hides what is far.
  float density = uDrinkDensity * uDrinkUnder;
  float lit = 0.25 + 0.75 * exp(-(uDrinkSurface - height) / uDrinkLightDepth);
  float fog = exp(-density * density * span * span);
  float near = smoothstep(NEAR_FADE.y, NEAR_FADE.x, span);
  vLight = lit * fog * near;
  vCorner = position.xy;

  if (vLight < UNSEEN) {
    // Outside the view: none of its pixels are drawn.
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }

  float grown =
    smoothstep(0.0, BORN, life) *
    (1.0 - smoothstep(BURST, 1.0, life)) *
    mix(0.7, 1.0, life);
  // A square facing the camera, around the bubble's center.
  viewCenter.xy += position.xy * (uBubbleSize * size * grown);
  gl_Position = projectionMatrix * viewCenter;
}
