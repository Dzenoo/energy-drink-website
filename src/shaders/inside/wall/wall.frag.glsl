#include "../liquid/drink.glsl"

// The metal seen through the drink.
uniform vec3 uWallColor;
// Light the wall gets everywhere, from the drink around it (share of full light).
uniform float uWallAmbient;
// Depth (units) where the light from the opening has faded to 1/e on the wall.
uniform float uWallLightDepth;
// Where the light comes in: the middle of the opening (world position, units).
uniform vec3 uWallLight;
// The opening's reflection in the metal: color, strength, and how tight it is (exponent).
uniform vec3 uWallGlint;
uniform float uWallGlintStrength;
uniform float uWallGloss;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vec3 toWall = vWorldPosition - cameraPosition;
  float span = length(toWall);
  vec3 look = toWall / span;

  // Whichever way the geometry is wound, the wall faces the camera.
  vec3 normal = normalize(vWorldNormal);
  if (dot(normal, look) > 0.0) normal = -normal;

  // Less light reaches the wall the deeper it is.
  float depth = max(uDrinkSurface - vWorldPosition.y, 0.0);
  float lit = exp(-depth / uWallLightDepth);

  vec3 toLight = normalize(uWallLight - vWorldPosition);
  float diffuse = max(dot(normal, toLight), 0.0);
  vec3 halfway = normalize(toLight - look);
  float glint = pow(max(dot(normal, halfway), 0.0), uWallGloss);

  vec3 color =
    uWallColor * (uWallAmbient + diffuse * lit) +
    uWallGlint * (uWallGlintStrength * glint * lit);

  gl_FragColor = vec4(drinkFog(color, look, span, cameraPosition.y), 1.0);
  #include <colorspace_fragment>
}
