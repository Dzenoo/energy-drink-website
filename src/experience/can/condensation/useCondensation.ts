import { useFrame } from '@react-three/fiber';

import { CONDENSATION_UNIFORMS } from './utils/condensation';

// Moves the running drops: the condensation shared by the can's materials keeps
// its own clock, so the drops pick up where they were after a pause.
export const useCondensation = () => {
  useFrame((_, delta) => {
    CONDENSATION_UNIFORMS.uCondTime.value += delta;
  });
};
