import { useLayoutEffect, useMemo, useRef } from 'react';
import { FogExp2, MathUtils } from 'three';
import { useFrame, useThree } from '@react-three/fiber';

import { DRINK_UNIFORMS } from './helpers/drinkUniforms';
import { immersion } from './helpers/immersion';
import { IMMERSION, LIQUID } from './helpers/liquid';

// Tracks how far the camera is into the drink and turns the scene with it: the
// drink's shaders read it from the shared uniforms, and three.js's own materials
// fade into the fog. The fog is always on the scene and only its density
// changes: adding or removing fog would rebuild every shader in the middle of
// the dive.
const Underwater: React.FC = () => {
  const scene = useThree((state) => state.scene);
  const fog = useMemo(() => new FogExp2('#000000', 0), []);
  /** Immersion last frame; out of the drink twice in a row, nothing changes. */
  const lastUnder = useRef(0);

  useLayoutEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(({ camera }) => {
    const under = immersion(camera.position, IMMERSION);
    if (under === 0 && lastUnder.current === 0) return;
    lastUnder.current = under;
    DRINK_UNIFORMS.uDrinkUnder.value = under;

    // Fog has one color for the whole screen: the drink's color at the camera's
    // own depth, which is what the backdrop shows straight ahead.
    const depth = Math.max(LIQUID.height - camera.position.y, 0);
    fog.color.lerpColors(
      DRINK_UNIFORMS.uDrinkShallow.value,
      DRINK_UNIFORMS.uDrinkBottom.value,
      MathUtils.smoothstep(depth, 0, DRINK_UNIFORMS.uDrinkDepthRange.value),
    );
    fog.density = LIQUID.density * under;
  });

  return null;
};

export default Underwater;
