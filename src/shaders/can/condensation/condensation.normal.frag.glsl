// Condensation, second part: tilts the shading normal outward from each drop's
// center, strongest at the edge, so drops catch the studio panels like lenses.
vec3 condSlopeView =
  vCondAxisX * condSlope.x + vCondAxisY * condSlope.y + vCondAxisZ * condSlope.z;
normal = normalize(normal + condSlopeView * uDropNormal * condCover);
