// Position in the model's own space: the fruit's axis runs along y, from the
// tip at -1 to the shoulder at 1. The patterns are drawn in this space, so they
// stay on the piece however it is turned.
varying vec3 vObject;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  mat4 toWorld = modelMatrix;
  #ifdef USE_INSTANCING
    toWorld = modelMatrix * instanceMatrix;
  #endif

  vec4 world = toWorld * vec4(position, 1.0);
  vObject = position;
  vWorldPosition = world.xyz;
  // Pieces are scaled evenly, so the same matrix serves for normals.
  vWorldNormal = mat3(toWorld) * normal;
  gl_Position = projectionMatrix * viewMatrix * world;
}
