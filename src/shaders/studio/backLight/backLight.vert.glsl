// A flat plane behind the can, facing the first station's camera; only its
// position across the plane (-1 to 1 on both axes) goes to the fragment shader.

varying vec2 vPlane;

void main() {
  vPlane = uv * 2.0 - 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
