#include <fog_pars_vertex>

varying vec3 vWorldPosition;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPosition = world.xyz;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
