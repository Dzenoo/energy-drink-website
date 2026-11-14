#include "./drink.glsl"
#include "./waves.glsl"

// The studio's panels as a cube map: what the surface mirrors, seen from above.
uniform samplerCube uEnvironment;
// How strongly the surface mirrors the studio (1 = as much as still water).
uniform float uReflection;

// Seen from below, through the surface: the lid's underside, lit by the drink.
uniform vec3 uLid;
// Height of the lid (units), and the opening in it: center and half-size (xz, units).
uniform float uLidHeight;
uniform vec2 uOpeningCenter;
uniform vec2 uOpeningSize;
// Studio light falling in through the opening: color and strength (1 = full white).
uniform vec3 uOpeningLight;
uniform float uOpeningStrength;
// Glow that light leaves on the lid around the opening: strength, and how far it
// spreads (in opening radii, to 1/e).
uniform float uHaloStrength;
uniform float uHaloSize;
// How softly Snell's window turns into the mirror at its edge (0 = hard edge).
uniform float uWindowEdge;

varying vec3 vWorldPosition;

// Water to air.
const float REFRACTION = 1.33;
// Share of light water mirrors when seen head-on.
const float WATER_MIRROR = 0.02;
// Softness of the opening's edge (in opening radii).
const float OPENING_EDGE = 0.08;
// Smallest upward part of a refracted ray: keeps a ray that barely leaves the
// surface from running to infinity before it meets the lid.
const float MIN_RISE = 0.05;

// From above: the drink's own color, seen along the look ray as it bends into
// the drink, under a mirror image of the studio. Every wave tilts both, so each
// has a lit side and a dark side: that is what reads as a liquid surface.
vec3 fromAbove(vec3 look, vec3 normal) {
  // Water mirrors little head-on and almost everything at a grazing angle.
  float facing = max(dot(normal, -look), 0.0);
  float mirror = WATER_MIRROR + (1.0 - WATER_MIRROR) * pow(1.0 - facing, 5.0);
  vec3 studio = texture(uEnvironment, reflect(look, normal)).rgb;

  // A ray bent steeper by a wave looks deeper into the drink: darker.
  vec3 into = refract(look, normal, 1.0 / REFRACTION);
  vec3 body = drinkColor(into, uDrinkSurface);

  return body + studio * (mirror * uReflection);
}

// From below: inside Snell's window overhead the look ray bends out of the drink
// and reaches the lid and the bright opening; beyond the window's edge the
// surface is a mirror of the drink below. The waves bend both, so the opening
// dances and the window's edge wobbles.
vec3 fromBelow(vec3 look, vec3 normal) {
  // The side of the surface the look ray meets.
  vec3 facing = -normal;
  vec3 mirrored = drinkColor(reflect(look, facing), cameraPosition.y);

  // k <= 0 means total internal reflection: no light gets out.
  float cosine = dot(look, facing);
  float k = 1.0 - REFRACTION * REFRACTION * (1.0 - cosine * cosine);
  if (k <= 0.0) return mirrored;

  // Follow the bent ray up to the lid and see how far from the opening it lands
  // (in opening radii from its edge; negative is inside).
  vec3 through = refract(look, facing, REFRACTION);
  float rise = (uLidHeight - uDrinkSurface) / max(through.y, MIN_RISE);
  vec2 onLid = vWorldPosition.xz + through.xz * rise;
  float fromEdge = length((onLid - uOpeningCenter) / uOpeningSize) - 1.0;

  float opening = 1.0 - smoothstep(-OPENING_EDGE, OPENING_EDGE, fromEdge);
  float halo = exp(-max(fromEdge, 0.0) / uHaloSize);
  vec3 above =
    uLid + uOpeningLight * (opening * uOpeningStrength + halo * uHaloStrength);

  return mix(mirrored, above, smoothstep(0.0, uWindowEdge, k));
}

void main() {
  vec2 slope = surfaceSlope(vWorldPosition.xz);
  vec3 normal = normalize(vec3(-slope.x, 1.0, -slope.y));
  vec3 toSurface = vWorldPosition - cameraPosition;
  float span = length(toSurface);
  vec3 look = toSurface / span;

  // Tone mapping comes later, in postprocessing: colors here may be brighter
  // than white, so the opening still shines through the fog from deep down.
  if (gl_FrontFacing) {
    // Up close the reflection fades and the view opens into the drink: by the
    // surface this is exactly what the backdrop shows, so going under shows no change.
    vec3 drink = drinkColor(look, cameraPosition.y);
    gl_FragColor = vec4(mix(fromAbove(look, normal), drink, uDrinkUnder), 1.0);
  } else {
    gl_FragColor = vec4(fromBelow(look, normal), 1.0);
  }

  gl_FragColor.rgb = drinkFog(gl_FragColor.rgb, look, span, cameraPosition.y);

  #include <colorspace_fragment>
}
