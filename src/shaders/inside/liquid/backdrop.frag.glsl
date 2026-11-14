#include "./drink.glsl"

varying vec3 vDirection;

void main() {
  vec3 color = drinkColor(normalize(vDirection), cameraPosition.y);
  // Fades in over the studio while the camera descends to the surface.
  gl_FragColor = vec4(color, uDrinkUnder);
  #include <colorspace_fragment>
}
