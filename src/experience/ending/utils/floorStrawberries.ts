// Look of the strawberries on the floor, besides the skin and flesh colors
// they share with the pieces in the drink (inside/strawberries/utils/strawberry.ts).
export const FLOOR_STRAWBERRY = {
  /** How much of the studio's panels still reaches the fruit (1 = as much as the can gets): barely any, so the fruit is a dim hint until the pointer's light finds it. */
  ambient: 0.02,
  /** Roughness of the skin and cut face. */
  wetRoughness: 0.7,
  /** Roughness of the pits the seeds sit in. */
  dryRoughness: 0.4,
  /** The calyx and stem: deep green. */
  leaf: '#2e5a1c',
  /** Roughness of the leaves. */
  leafRoughness: 0.5,
};

// One set of uniforms for every piece on the floor, so a change reaches all at once.
export const FLOOR_STRAWBERRY_UNIFORMS = {
  uBerryWetRoughness: { value: FLOOR_STRAWBERRY.wetRoughness },
  uBerryDryRoughness: { value: FLOOR_STRAWBERRY.dryRoughness },
};
