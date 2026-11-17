import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

import { INTRO, useIntroStore } from '@/store/intro/intro';
import { useScrollStore } from '@/store/scroll/scroll';

import { INTRO_SETTINGS } from './helpers/intro';

/** Longest frame step the animation takes (s): the first frames after loading can stall while shaders compile, and the can should not jump. */
const MAX_STEP = 1 / 30;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Runs the opening animation's clock. Mounted with the can, inside its Suspense,
// so the clock starts only once the can has loaded. The can, the drink's surface,
// the glow behind the can and the fade from black read INTRO.progress; the page
// waits for `landed`.
const Intro: React.FC = () => {
  useEffect(() => {
    // Without motion, the can is simply in its place and only the page fades in.
    if (prefersReducedMotion()) INTRO.progress = 1;
  }, []);

  useFrame((_, delta) => {
    if (INTRO.progress < 1) {
      // Scrolling on before the end does not wait for it: it runs out faster.
      const speed =
        useScrollStore.getState().station === 0 ? 1 : INTRO_SETTINGS.skipSpeed;
      INTRO.progress = Math.min(
        INTRO.progress +
          (Math.min(delta, MAX_STEP) * speed) / INTRO_SETTINGS.duration,
        1,
      );
    }

    const { landed, land } = useIntroStore.getState();
    if (!landed && INTRO.progress >= INTRO_SETTINGS.textAt) land();
  });

  return null;
};

export default Intro;
