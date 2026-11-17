import type { RefObject } from 'react';
import type { Group } from 'three';
import { useFrame } from '@react-three/fiber';

import {
  INTRO_SETTINGS,
  introArrival,
  introDrop,
} from '@/experience/intro/helpers/intro';

import { INTRO } from '@/store/intro/intro';

// Brings the can up into its place during the opening animation: it starts
// below the shot and turned back, and both run out together as it arrives. The
// turn is added on top of the idle spin (useSpin) and slows to nothing, so the
// can glides into its spin without a jolt. Drops stay on the can, since the
// condensation is computed on the model, not in the world.
export const useIntroRise = (group: RefObject<Group | null>) => {
  useFrame(() => {
    if (!group.current) return;
    const y = introDrop(INTRO.progress);
    const turn = -INTRO_SETTINGS.turn * (1 - introArrival(INTRO.progress));

    // After the opening nothing changes: nothing to write.
    if (group.current.position.y !== y) group.current.position.y = y;
    if (group.current.rotation.y !== turn) group.current.rotation.y = turn;
  });
};
