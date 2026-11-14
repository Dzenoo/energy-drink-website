varying vec3 vCondPosition;
varying vec3 vCondNormal;
varying vec3 vCondAxisX;
varying vec3 vCondAxisY;
varying vec3 vCondAxisZ;
varying vec4 vCondClip;

// Seconds since start; moves the running drops.
uniform float uCondTime;
// Radius of the can body (units); the body is unwrapped around it.
uniform float uCondRadius;
// How strongly drops bend the surface normal, and how glossy water is.
uniform float uDropNormal;
uniform float uDropRoughness;
// Fine mist on the cold metal: roughness it adds to the surface.
uniform float uMistRoughness;
// Drops running down the body: columns around the can, height of one drop's
// cell (units), share of cells with a drop, speed (units per second), radius
// (units) and trail length (fraction of a cell, at most 0.5).
uniform float uRunColumns;
uniform float uRunCellHeight;
uniform float uRunDensity;
uniform float uRunSpeed;
uniform float uRunSize;
uniform float uTrailLength;
// How wiped each point of the screen is (red: 0 = misted, 1 = just wiped).
uniform sampler2D uWipeMap;

const float COND_TAU = 6.28318530718;

#include "./hash.glsl"

// Running drops on the body: columns around the can, each scrolling down at
// its own speed, with at most one drop per cell and a wiped trail above it.
// p is (arc length around the body, height) in units.
// Returns the offset from the drop's center in drop radii (xy), the drop's
// radius in units (z, 0 when none) and the trail strength (w).
vec4 condRunners(vec2 p, float circumference) {
  float columns = max(1.0, floor(uRunColumns + 0.5));
  float columnWidth = circumference / columns;
  float column = mod(floor(p.x / columnWidth), columns);
  vec4 columnHash = hashCell(ivec2(int(column), 0), 2u);

  float speed = uRunSpeed * (0.5 + columnHash.x);
  float y = p.y + uCondTime * speed + columnHash.y * uRunCellHeight;
  float row = floor(y / uRunCellHeight);
  vec4 h = hashCell(ivec2(int(column), int(row)), 3u);
  if (h.w > uRunDensity) return vec4(0.0);

  float radius = uRunSize * (0.6 + 0.4 * h.z);
  float localX = (fract(p.x / columnWidth) - 0.5) * columnWidth;
  float localY = (fract(y / uRunCellHeight) - 0.5) * uRunCellHeight;
  // The path wanders a little on the surface, so drop and trail curve together.
  float pathX =
    (h.x - 0.5) * columnWidth * 0.5 +
    sin(p.y * 30.0 + h.y * COND_TAU) * radius * 0.5;

  vec2 fromCenter = vec2(localX - pathX, localY);
  // Heavier at the bottom: the drop is stretched above its center.
  if (fromCenter.y > 0.0) fromCenter.y /= 1.4;
  fromCenter /= radius;

  float trailLength = uTrailLength * uRunCellHeight;
  float trail = 0.0;
  if (localY > 0.0 && localY < trailLength) {
    float along = localY / trailLength;
    float width = radius * 0.8 * (1.0 - 0.5 * along);
    trail =
      (1.0 - smoothstep(width * 0.6, width, abs(localX - pathX))) *
      (1.0 - along);
  }
  return vec4(fromCenter, radius, trail);
}
