// The cut face of a strawberry: a pale core along the axis, pink flesh around
// it, red just under the skin, and faint veins fanning out from the core.

// Veins from tip to shoulder, and how much darker they are than the flesh.
const float VEINS = 7.0;
const float VEIN_SHADE = 0.12;
// How glossy the wet cut face is next to the skin (0–1).
const float FLESH_GLOSS = 0.6;

// Returns the surface color (rgb) and how glossy it is there (a).
vec4 berrySurface(vec3 p, float fromAxis, float radius) {
  // 0 on the fruit's axis, 1 at the skin.
  float outward = clamp(fromAxis / radius, 0.0, 1.0);

  vec3 color = mix(uBerryCore, uBerryFlesh, smoothstep(0.1, 0.5, outward));
  color = mix(color, uBerrySkin, smoothstep(0.75, 1.0, outward));

  // Lines running outward and up from the core, like the fruit's fibers.
  float vein = 0.5 + 0.5 * sin((p.y * 0.5 - outward * 0.6) * TURN * VEINS);
  color *= 1.0 - VEIN_SHADE * vein * smoothstep(0.15, 0.5, outward);

  return vec4(color, FLESH_GLOSS);
}
