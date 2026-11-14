// Condensation lives on the can, not on the screen, so the shader gets the
// object-space position and normal (scene units) and the object's axes in view
// space, to turn drop slopes into a view-space normal.
varying vec3 vCondPosition;
varying vec3 vCondNormal;
varying vec3 vCondAxisX;
varying vec3 vCondAxisY;
varying vec3 vCondAxisZ;
// Clip-space position, to find this point on the screen in the wipe map; it is
// divided in the fragment shader, where the division stays correct in perspective.
varying vec4 vCondClip;
