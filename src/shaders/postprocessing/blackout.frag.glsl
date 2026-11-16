// The cut to the end: the whole picture fades to black and back, so the camera
// leaving the can and the scene being swapped are never seen.

// How dark the picture is: 0 not at all, 1 black.
uniform float uBlackout;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = vec4(inputColor.rgb * (1.0 - uBlackout), inputColor.a);
}
