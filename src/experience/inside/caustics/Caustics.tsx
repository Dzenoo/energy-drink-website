import { useFrame } from '@react-three/fiber';

import { CAUSTICS_UNIFORMS } from './helpers/caustics';

// Moves the web of light on the fruit. Draws nothing of its own: the fruit adds
// the web to its light in its shader.
const Caustics: React.FC = () => {
  useFrame((_, delta) => {
    CAUSTICS_UNIFORMS.uCausticTime.value += delta;
  });

  return null;
};

export default Caustics;
