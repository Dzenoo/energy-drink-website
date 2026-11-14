varying vec2 vLabelUv;

// Label colors at the bottom curve and at the neck: near black, a touch lighter
// toward the top.
uniform vec3 uLabelBottom;
uniform vec3 uLabelTop;
// Text mask (alpha = letter) and where it sits on the label: (left, bottom,
// right, top) in label space, around the can and height from the bottom, 0–1.
uniform sampler2D uLabelText;
uniform vec4 uLabelTextRect;
// The letters are bare aluminium showing through the print.
uniform vec3 uLetterColor;
uniform float uLetterRoughness;
