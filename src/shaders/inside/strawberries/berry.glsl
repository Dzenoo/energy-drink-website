// The strawberry's own look, the same wherever it is drawn: its shape, the skin
// with its seeds, and the cut face. Each shader that includes this adds its own
// light on top: the drink's inside the can, the studio's on the floor.

// Where the whole fruit's axis passes through this piece (x, z in model units):
// a half, a quarter and a slice are cut from it differently.
uniform vec2 uBerryAxis;
// Skin: ripe red, the paler shoulder, the seeds.
uniform vec3 uBerrySkin;
uniform vec3 uBerrySkinPale;
uniform vec3 uBerrySeed;
// Cut face: the flesh and the pale core.
uniform vec3 uBerryFlesh;
uniform vec3 uBerryCore;

const float TURN = 6.2831853;
// The fruit's widest radius (model units) and the height (0 tip, 1 shoulder)
// where it is widest; measured on the model.
const float WIDEST = 0.85;
const float WIDEST_AT = 0.77;

// Radius of the whole fruit at a height (model units): swelling from the tip to
// the widest point, then closing a little toward the shoulder.
float berryRadius(float y) {
  float t = clamp(y * 0.5 + 0.5, 0.0, 1.0);
  float below = sin(1.5707963 * pow(min(t / WIDEST_AT, 1.0), 0.8));
  float above = max(t - WIDEST_AT, 0.0) / (1.0 - WIDEST_AT);
  return WIDEST * below * cos(0.94 * above * above);
}

#ifdef FLESH
  #include "./flesh.glsl"
#else
  #include "./skin.glsl"
#endif
