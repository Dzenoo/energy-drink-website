// The studio floor under the strawberries fades into the backdrop with
// distance, so it has no edge and no horizon.

varying vec3 vFloorWorld;

// Distance from the middle (units) where the floor starts to fade into the
// backdrop, and where it is gone; the backdrop's color.
uniform float uFloorFadeStart;
uniform float uFloorFadeEnd;
uniform vec3 uFloorFar;
