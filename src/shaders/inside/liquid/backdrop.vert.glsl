// Look direction of each pixel in world space; not normalized, so it stays exact
// when interpolated across the triangle.
varying vec3 vDirection;

void main() {
  // The triangle is already in clip space, on the far plane (z = w): behind
  // everything, so pixels covered by anything else are skipped by the depth test.
  gl_Position = vec4(position.xy, 1.0, 1.0);

  // Undo the perspective projection by hand, then the camera's rotation.
  vec3 viewRay = vec3(
    position.x / projectionMatrix[0][0],
    position.y / projectionMatrix[1][1],
    -1.0
  );
  vDirection = transpose(mat3(viewMatrix)) * viewRay;
}
