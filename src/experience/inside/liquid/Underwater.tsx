import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, FogExp2, MathUtils } from 'three';

import { immersion } from './utils/immersion';
import { IMMERSION, LIQUID } from './utils/liquid';

// Inside the drink there is no real volume: background and fog take the drink's
// color, darker with depth, so the can's inner walls vanish into it. They turn
// while the camera descends from the opening, together with the surface, so the
// screen is all drink before the camera goes under. The fog is always on the
// scene and only its density changes: adding or removing fog would rebuild every
// shader in the middle of the dive.
const Underwater: React.FC = () => {
  const scene = useThree((state) => state.scene);
  const fog = useMemo(() => new FogExp2('#000000', 0), []);
  const colors = useMemo(
    () => ({
      shallow: new Color(LIQUID.shallow),
      bottom: new Color(LIQUID.bottom),
      drink: new Color(),
    }),
    [],
  );
  /** The studio's background color, taken once, so it can be restored outside the drink. */
  const studio = useRef<Color | null>(null);
  /** Immersion last frame; out of the drink twice in a row, nothing changes. */
  const lastUnder = useRef(0);

  useLayoutEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(({ camera }) => {
    const background = scene.background;
    if (!(background instanceof Color)) return;
    studio.current ??= background.clone();

    const under = immersion(camera.position, IMMERSION);
    if (under === 0 && lastUnder.current === 0) return;
    lastUnder.current = under;

    // Above the surface the depth is 0: the drink's color right under it.
    const depth = Math.max(LIQUID.height - camera.position.y, 0);
    colors.drink.lerpColors(
      colors.shallow,
      colors.bottom,
      MathUtils.smoothstep(depth, 0, LIQUID.depthRange),
    );
    fog.color.copy(colors.drink);
    fog.density = LIQUID.density * under;
    background.lerpColors(studio.current, colors.drink, under);
  });

  return null;
};

export default Underwater;
