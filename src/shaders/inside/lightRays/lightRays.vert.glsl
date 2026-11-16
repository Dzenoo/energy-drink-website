// A shaft of light drawn on a long strip that turns around its own axis to face
// the camera, so from any side it reads as a beam, never as a flat card.

// Per ray: where it starts under the opening (xyz, units) and its flicker phase (w, 0 to 1).
attribute vec4 aStart;
// Which way it falls (normalized).
attribute vec3 aDirection;
// Per ray: share of the full length (x), the most it may run before the wall or
// the floor (y, units), width (z) and brightness (w) as shares of the settings.
attribute vec4 aShape;

// Length of the longest ray (units).
uniform float uRayLength;
// Half-width where a ray leaves the surface (units), and how many times wider it is at its end.
uniform float uRayWidth;
uniform float uRayFlare;

// Across the ray (-1 to 1), and along it (0 at the surface, 1 at its end).
varying vec2 vRay;
varying vec3 vWorldPosition;
varying vec3 vAxis;
// Length of this ray (units), its brightness and its flicker phase.
varying float vLength;
varying float vBrightness;
varying float vPhase;

void main() {
  float span = min(uRayLength * aShape.x, aShape.y);
  vec3 onAxis = aStart.xyz + aDirection * (position.y * span);

  // Sideways, square to both the ray and the way to the camera. Looking straight
  // along the ray there is no such direction; any will do, since the fragment
  // shader fades the ray out there.
  vec3 side = cross(aDirection, cameraPosition - onAxis);
  float sideLength = length(side);
  side = sideLength > 1e-6 ? side / sideLength : vec3(1.0, 0.0, 0.0);

  float halfWidth = uRayWidth * aShape.z * mix(1.0, uRayFlare, position.y);
  vec3 world = onAxis + side * (position.x * halfWidth);

  vRay = position.xy;
  vWorldPosition = world;
  vAxis = aDirection;
  vLength = span;
  vBrightness = aShape.w;
  vPhase = aStart.w;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
