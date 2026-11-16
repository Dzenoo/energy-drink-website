// A strawberry in the studio: the same skin, seeds and cut face as in the drink
// (inside/strawberries/berry.glsl), lit by three.js's own lighting: the light
// that follows the pointer, and a little of the studio's panels.

#include "../../inside/strawberries/berry.glsl"

varying vec3 vBerryObject;

// Roughness of the wet skin and cut face, and of the pits the seeds sit in.
uniform float uBerryWetRoughness;
uniform float uBerryDryRoughness;
