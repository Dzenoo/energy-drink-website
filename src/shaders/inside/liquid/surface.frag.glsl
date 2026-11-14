#include <fog_pars_fragment>
#include "./drink.glsl"

// Seconds since start; moves the swell.
uniform float uTime;
// The drink seen from above: dark red.
uniform vec3 uDeep;
// Light coming through the surface, seen from below.
uniform vec3 uGlow;
// Highlights on the surface, seen from above.
uniform vec3 uShine;
// Waves per unit (10 cm) and how steep they are.
uniform float uWaveScale;
uniform float uWaveHeight;

varying vec3 vWorldPosition;

// Water to air.
const float REFRACTION = 1.33;

// Gentle swell: a few sine waves in different directions, slow and small, so the
// drink looks still with a little life. Returns the surface slope (dh/dx, dh/dz).
vec2 surfaceSlope(vec2 p) {
  // Each wave: direction (xy), frequency (z), speed (w).
  const vec4 waves[4] = vec4[4](
    vec4(0.80, 0.60, 1.0, 0.9),
    vec4(-0.45, 0.89, 1.7, 1.3),
    vec4(0.20, -0.98, 2.9, 1.9),
    vec4(-0.94, -0.34, 4.3, 2.6)
  );
  vec2 slope = vec2(0.0);
  for (int i = 0; i < 4; i++) {
    vec4 wave = waves[i];
    float phase = dot(p, wave.xy) * wave.z + uTime * wave.w;
    // Higher waves are smaller, so the surface does not look noisy.
    slope += wave.xy * cos(phase) / wave.z;
  }
  return slope * uWaveHeight;
}

void main() {
  vec2 slope = surfaceSlope(vWorldPosition.xz * uWaveScale);
  vec3 normal = normalize(vec3(-slope.x, 1.0, -slope.y));
  vec3 toCamera = normalize(cameraPosition - vWorldPosition);
  vec3 look = -toCamera;
  vec3 color;

  if (gl_FrontFacing) {
    // From above: dark drink, mirroring the light from the opening more at a grazing angle.
    float facing = max(dot(normal, toCamera), 0.0);
    float fresnel = 0.02 + 0.98 * pow(1.0 - facing, 5.0);
    vec3 mirrored = reflect(look, normal);
    float highlight = pow(max(mirrored.y, 0.0), 24.0);
    color = uDeep + uShine * (fresnel * 0.6 + highlight * 0.5);
  } else {
    // From below: light passes only inside Snell's window overhead; beyond its edge
    // the surface mirrors the drink. k < 0 means total internal reflection.
    float cosine = dot(look, normal);
    float k = 1.0 - REFRACTION * REFRACTION * (1.0 - cosine * cosine);
    float window = smoothstep(0.0, 0.25, k);
    color = mix(uDeep, uGlow, window);
  }

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>

  // The drink in this pixel's look direction: exactly what the backdrop shows
  // there. Mixed in after tone mapping, because the backdrop is not tone mapped.
  vec3 drink = drinkColor(look, cameraPosition.y);
  // Up close from above the reflection fades and the view opens into the drink,
  // so going under shows no change.
  if (gl_FrontFacing) {
    gl_FragColor.rgb = mix(gl_FragColor.rgb, drink, uDrinkUnder);
  }
  // three.js's fog amount, but fading into the backdrop's color for this
  // direction instead of one fog color, so the far surface melts into the drink.
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, drink, fogFactor);
  #endif

  #include <colorspace_fragment>
}
