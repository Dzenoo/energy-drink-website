const query = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Whether the visitor asked their system for less motion. Read every frame by
 * the 3D side, so it is a plain object. It follows the setting live: the one
 * listener is added here, once, when the app first loads this module.
 */
export const MOTION = { reduced: query.matches };

query.addEventListener('change', (event) => {
  MOTION.reduced = event.matches;
});
