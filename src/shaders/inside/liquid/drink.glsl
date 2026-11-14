// The drink's color in a look direction. Everything in the drink (backdrop,
// surface, fog) takes its color from here, so they fade into one picture.

// How far the camera is into the drink: 0 in the studio, 1 at the surface and below.
uniform float uDrinkUnder;
// Height of the drink's surface (units).
uniform float uDrinkSurface;
// Lit drink right under the surface, and the dark drink at the bottom.
uniform vec3 uDrinkShallow;
uniform vec3 uDrinkBottom;
// Depth (units) from the surface to the darkest color.
uniform float uDrinkDepthRange;
// How far the eye sees into the drink (units): each pixel shows the drink's
// color that far along its look direction.
uniform float uDrinkReach;
// Light pouring in from above: its color and strength, how tightly it gathers
// around straight up (exponent), and the depth (units) where it has faded to 1/e.
uniform vec3 uDrinkLight;
uniform float uDrinkLightStrength;
uniform float uDrinkLightFocus;
uniform float uDrinkLightDepth;

// `direction` is the normalized look direction, `height` the camera's height (units).
vec3 drinkColor(vec3 direction, float height) {
  // Above the surface the depth is 0: the drink's color right under it.
  float depth = max(uDrinkSurface - height, 0.0);

  // Looking up the eye reaches shallower, lighter drink; looking down, deeper and darker.
  float seenDepth = depth - direction.y * uDrinkReach;
  vec3 color = mix(
    uDrinkShallow,
    uDrinkBottom,
    smoothstep(0.0, uDrinkDepthRange, seenDepth)
  );

  float light =
    pow(max(direction.y, 0.0), uDrinkLightFocus) * exp(-depth / uDrinkLightDepth);
  return color + uDrinkLight * (uDrinkLightStrength * light);
}
