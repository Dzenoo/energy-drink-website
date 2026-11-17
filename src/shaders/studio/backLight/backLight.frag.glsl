// Only light is drawn, added to the dark backdrop, so the glow needs no sorting
// and the can, drawn first, covers it where it stands in front.

// Color of the glow (linear).
uniform vec3 uBackLightColor;
// Brightness in the middle.
uniform float uBackLightIntensity;
// How much of the glow shows (0 to 1): it fades out as the camera leaves the first station.
uniform float uBackLightFade;

varying vec2 vPlane;

// Radii from the middle to the plane's edge (BACK_LIGHT_EXTENT in backLight.ts).
const float EXTENT = 3.0;

void main() {
  // Distance from the middle in radii; the plane is scaled, so this already
  // follows the glow's stretch.
  float distance = length(vPlane) * EXTENT;
  // Gaussian falloff: soft, with no ring or edge anywhere.
  float glow = exp(-distance * distance);

  gl_FragColor = vec4(uBackLightColor * (uBackLightIntensity * uBackLightFade * glow), 1.0);
  #include <colorspace_fragment>
}
