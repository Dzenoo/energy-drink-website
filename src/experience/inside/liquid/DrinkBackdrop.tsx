import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  type Mesh,
  ShaderMaterial,
} from 'three';

import fragmentShader from '@/shaders/inside/liquid/backdrop.frag.glsl';
import vertexShader from '@/shaders/inside/liquid/backdrop.vert.glsl';

import { DRINK_UNIFORMS } from './helpers/drinkUniforms';

import { useDrinkOnly } from './useDrinkOnly';

/** Draw order among see-through things: first, so bubbles and the like land on top of it. */
const RENDER_ORDER = -1;

/** One triangle in clip space that covers the whole screen: no seam down the middle, as two would have. */
const SCREEN_TRIANGLE = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);

// What the camera sees where nothing else is drawn inside the drink: lighter
// where the eye looks up toward the surface, darker toward the bottom, with the
// light pouring in overhead. Everything in the drink fades into this picture.
const DrinkBackdrop: React.FC = () => {
  const mesh = useRef<Mesh>(null);

  const { geometry, material } = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(SCREEN_TRIANGLE, 3));
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: DRINK_UNIFORMS,
      // Fades in over the studio; the depth test keeps it behind everything.
      transparent: true,
      depthWrite: false,
    });
    return { geometry, material };
  }, []);

  useLayoutEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useDrinkOnly(mesh);

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      renderOrder={RENDER_ORDER}
      visible={false}
      // Its position is set in clip space, so its bounds say nothing about where it is.
      frustumCulled={false}
    />
  );
};

export default DrinkBackdrop;
