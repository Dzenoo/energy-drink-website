// A bubble drawn on a flat square as if it were a sphere: only the light it
// catches is drawn, added on top of the drink, so the middle stays see-through
// and the order the bubbles are drawn in does not matter.

// Color of the light a bubble catches, and its brightness (1 = white at the rim).
uniform vec3 uBubbleLight;
uniform float uBubbleStrength;

varying vec2 vCorner;
varying float vLight;

// How quickly the bright rim falls off toward the middle (exponent).
const float RIM = 2.5;
// How tight the glint of the light from above is (exponent), and its brightness
// next to the rim.
const float GLINT = 90.0;
const float GLINT_STRENGTH = 2.5;
// Light in the middle of the bubble, so it is not a bare ring.
const float BODY = 0.05;

void main() {
  float fromCenter = dot(vCorner, vCorner);
  if (fromCenter > 1.0) discard;

  // The sphere's surface over this pixel: toward the camera in the middle,
  // sideways at the rim. Turned from the camera's axes to the world's.
  float toCamera = sqrt(1.0 - fromCenter);
  mat3 cameraAxes = transpose(mat3(viewMatrix));
  vec3 normal = cameraAxes * vec3(vCorner, toCamera);

  // Seen at a grazing angle the bubble's wall mirrors everything: a bright rim,
  // brighter on top, where the light comes from.
  float rim = pow(1.0 - toCamera, RIM) * mix(0.35, 1.0, 0.5 + 0.5 * normal.y);

  // A small sharp reflection of the light above, between straight up and the camera.
  vec3 halfway = normalize(vec3(0.0, 1.0, 0.0) + cameraAxes[2]);
  float glint = pow(max(dot(normal, halfway), 0.0), GLINT) * GLINT_STRENGTH;

  // One pixel of soft edge, so the rim does not shimmer as the bubble moves.
  float edge = 1.0 - smoothstep(1.0 - fwidth(fromCenter) * 1.5, 1.0, fromCenter);

  float light = (rim + glint + BODY) * uBubbleStrength * vLight * edge;
  gl_FragColor = vec4(uBubbleLight * light, 1.0);
  #include <colorspace_fragment>
}
