// The label's color comes from the shader instead of a texture. glTF flips V,
// so v = 0 is the top of the label; the label works with the height from the bottom.
vec2 labelPoint = vec2(vLabelUv.x, 1.0 - vLabelUv.y);
vec3 labelColor = mix(uLabelBottom, uLabelTop, labelPoint.y);

// The mask is read everywhere: its transparent border, clamped at the edges,
// leaves the rest of the label empty, and sampling outside a branch keeps the
// mipmaps right along the letters.
vec2 labelTextUv = (labelPoint - uLabelTextRect.xy) / (uLabelTextRect.zw - uLabelTextRect.xy);
float labelLetters = texture2D(uLabelText, labelTextUv).a;

diffuseColor.rgb = mix(diffuseColor.rgb * labelColor, uLetterColor, labelLetters);
