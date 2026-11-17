// Fades the whole picture to black: on the cut to the end, so the camera leaving
// the can and the scene being swapped are never seen, and at the very start,
// where the picture comes up out of black as the can rises in.

// How dark the picture is: 0 not at all, 1 black.
uniform float uBlackout;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = vec4(inputColor.rgb * (1.0 - uBlackout), inputColor.a);
}
