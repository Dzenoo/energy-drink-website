import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type Object3D } from 'three';

import { SCROLL } from '@/store/scroll/scroll';

const SPIN = {
  /** Turning speed on station 1 (radians per second); 0.35 is one turn in about 18 s. */
  speed: 0.35,
  /** Scroll progress where the spin starts to slow down, just after leaving station 1. */
  slowFrom: 0.02,
  /** Scroll progress where the spin has stopped and the can faces the camera. */
  slowTo: 0.3,
  /** How quickly the can settles on its front (per second); higher stops more firmly. */
  settle: 3,
};

const TURN = Math.PI * 2;
/** How far past the front (radians) the can may drift and still settle back instead of turning once more. */
const FRONT_SLACK = 0.3;

// Turns the can slowly on station 1. On the way to station 2 the turn slows down
// and the can settles with its opening toward the camera (a whole number of
// turns), always ahead in the turning direction, so the opening always looks the same.
export const useSpin = (can: Object3D) => {
  const angle = useRef(0);

  useFrame((_, delta) => {
    const spin =
      1 - MathUtils.smoothstep(SCROLL.progress, SPIN.slowFrom, SPIN.slowTo);
    angle.current += SPIN.speed * spin * delta;

    if (spin < 1) {
      const front = Math.ceil((angle.current - FRONT_SLACK) / TURN) * TURN;
      // The pull toward the front grows as the spin fades out.
      angle.current = MathUtils.damp(
        angle.current,
        front,
        SPIN.settle * (1 - spin),
        delta,
      );
    }

    // Resting on station 2 and beyond, the angle no longer changes: nothing to write.
    if (can.rotation.y !== angle.current) can.rotation.y = angle.current;
  });
};
