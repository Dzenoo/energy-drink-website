// One step of the wipe map: how wiped each point of the screen is (0 = misted,
// 1 = just wiped). The old map recovers a little, and this frame's brush stroke
// is drawn on top.
uniform sampler2D uPrevious;
// How much the wipe recovers this frame (frame time / recovery time).
uniform float uFade;
// Brush stroke this frame, from the last position to the current one (screen uv).
uniform vec2 uFrom;
uniform vec2 uTo;
// Brush radius (fraction of the screen height) and its soft edge (fraction of the radius).
uniform float uRadius;
uniform float uSoftness;
// Screen width / height, so the brush stays round on any screen.
uniform float uAspect;
// 1 when the brush moved this frame, 0 when only the recovery runs.
uniform float uActive;

varying vec2 vUv;

float segmentDistance(vec2 point, vec2 a, vec2 b) {
  vec2 toPoint = point - a;
  vec2 segment = b - a;
  float along = clamp(dot(toPoint, segment) / max(dot(segment, segment), 1e-8), 0.0, 1.0);
  return length(toPoint - segment * along);
}

void main() {
  float previous = texture2D(uPrevious, vUv).r;
  vec2 scale = vec2(uAspect, 1.0);
  float fromStroke = segmentDistance(vUv * scale, uFrom * scale, uTo * scale);
  float brush =
    uActive * (1.0 - smoothstep(uRadius * (1.0 - uSoftness), uRadius, fromStroke));
  gl_FragColor = vec4(max(previous - uFade, brush), 0.0, 0.0, 1.0);
}
