#include "../liquid/drink.glsl"
#include "../caustics/caustics.glsl"
#include "./berry.glsl"

// Light from above: color and strength right under the surface.
uniform vec3 uBerryLight;
uniform float uBerryLightStrength;
// Light from the drink all around (share of the drink's own color).
uniform float uBerryAmbient;
// Light shining through the thin edges of a piece.
uniform float uBerryGlow;
// Strength of the wet highlight.
uniform float uBerryGloss;
// Brightness of the caustics on the fruit, times the light from above.
uniform float uCausticOnFruit;

varying vec3 vObject;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

// How far the light from above wraps around to the sides (0 = hard, 1 = all
// around): fruit is soft and lets light in.
const float WRAP = 0.5;
// How tight the wet highlight is (exponent).
const float GLOSS_POWER = 50.0;

void main() {
  vec3 toPiece = vWorldPosition - cameraPosition;
  float span = length(toPiece);
  vec3 look = toPiece / span;

  #ifdef FLESH
    // A cut is flat, whatever the model's smoothed normals say at its rim.
    vec3 normal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
  #else
    vec3 normal = normalize(vWorldNormal);
  #endif
  // Whichever way the face is wound, it faces the camera.
  if (dot(normal, look) > 0.0) normal = -normal;

  float fromAxis = length(vObject.xz - uBerryAxis);
  vec4 surface = berrySurface(vObject, fromAxis, berryRadius(vObject.y));

  // Less light reaches a piece the deeper it floats.
  float depth = max(uDrinkSurface - vWorldPosition.y, 0.0);
  float lit = exp(-depth / uDrinkLightDepth);

  // Light from above, wrapped around the sides, plus the drink's own glow from
  // whichever way the surface faces.
  float fromAbove = clamp((normal.y + WRAP) / (1.0 + WRAP), 0.0, 1.0);
  vec3 light =
    uBerryLight * (uBerryLightStrength * fromAbove * lit) +
    drinkColor(normal, vWorldPosition.y) * uBerryAmbient;
  // The web of light the waves focus through the opening, on top of it: it
  // fades with depth like the rest of the light from above.
  float caustic = caustics(vWorldPosition, normal) * uCausticOnFruit;
  light += uBerryLight * (uBerryLightStrength * caustic * lit);
  vec3 color = surface.rgb * light;

  // Thin edges let the light through.
  float edge = pow(1.0 - abs(dot(normal, look)), 3.0);
  color += surface.rgb * uBerryLight * (uBerryGlow * edge * lit);

  // The wet surface mirrors the light above.
  vec3 halfway = normalize(vec3(0.0, 1.0, 0.0) - look);
  float gloss = pow(max(dot(normal, halfway), 0.0), GLOSS_POWER);
  color += uBerryLight * (uBerryGloss * surface.a * gloss * lit);

  gl_FragColor = vec4(drinkFog(color, look, span, cameraPosition.y), 1.0);
  #include <colorspace_fragment>
}
