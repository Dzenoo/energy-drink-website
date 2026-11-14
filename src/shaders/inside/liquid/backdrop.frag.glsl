#include "./drink.glsl"

varying vec3 vDirection;

void main() {
  vec3 color = drinkColor(normalize(vDirection), cameraPosition.y);
  // Fades in over the studio while the camera descends to the surface. Not tone
  // mapped: the drink's colors show exactly as set, here and on the surface.
  gl_FragColor = vec4(color, uDrinkUnder);
  #include <colorspace_fragment>
}
