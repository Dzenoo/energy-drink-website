// Condensation, first part: runs once roughness and metalness are known. Mist makes the
// cold metal rough; running drops are glossy and wipe a trail of mist away.
// Keeps the drop slope for the normal part.
vec3 condNormal = normalize(vCondNormal);
float condCircumference = COND_TAU * uCondRadius;
// Screen size of a pixel in units, for smooth drop edges. Taken before any
// branch, since derivatives need every pixel nearby to run the same code.
float condPixel = length(fwidth(vCondPosition));
// Where a hand passed, mist and drops are gone and come back as the wipe fades;
// smoothstep eases them in instead of a linear fade.
float condWipe = smoothstep(
  0.0,
  1.0,
  texture2D(uWipeMap, vCondClip.xy / vCondClip.w * 0.5 + 0.5).r
);

vec3 condSlope = vec3(0.0);
float condCover = 0.0;
float condTrail = 0.0;

// Drops only run down steep surfaces; the lid and the bottom keep just the mist.
float condSteep = 1.0 - smoothstep(0.2, 0.5, abs(condNormal.y));
if (condSteep > 0.0) {
  // The body unwrapped around the can's axis: (arc length, height) in units.
  vec2 bodyPoint = vec2(
    atan(vCondPosition.z, vCondPosition.x) / COND_TAU * condCircumference,
    vCondPosition.y
  );
  vec4 runner = condRunners(bodyPoint, condCircumference);
  if (runner.z > 0.0) {
    float edge = condPixel / runner.z;
    condCover =
      (1.0 - smoothstep(1.0 - edge, 1.0, length(runner.xy))) * condSteep;
    vec3 tangent = normalize(vec3(-vCondPosition.z, 0.0, vCondPosition.x));
    condSlope = tangent * runner.x + vec3(0.0, runner.y, 0.0);
    condTrail = runner.w * condSteep;
  }
}

condCover *= 1.0 - condWipe;
float condMist = uMistRoughness * (1.0 - condTrail) * (1.0 - condWipe);
roughnessFactor = mix(
  clamp(roughnessFactor + condMist, 0.0, 1.0),
  uDropRoughness,
  condCover
);
