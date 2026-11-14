import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  type Mesh,
  ShaderMaterial,
} from 'three';

import fragmentShader from '@/shaders/inside/liquid/backdrop.frag.glsl';
import vertexShader from '@/shaders/inside/liquid/backdrop.vert.glsl';

import { DRINK_UNIFORMS } from './utils/drinkUniforms';

/** Draw order among see-through things: first, so bubbles and the like land on top of it. */
const RENDER_ORDER = -1;

/** One triangle in clip space that covers the whole screen: no seam down the middle, as two would have. */
const SCREEN_TRIANGLE = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);

// What the camera sees where nothing else is drawn inside the drink. The can has
// no inner walls, so this is most of the screen: lighter where the eye looks up
// toward the surface, darker toward the bottom, with the light pouring in overhead.
const DrinkBackdrop: React.FC = () => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
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

  // Hidden in the studio, so its shader would first be built at the moment of
  // the dive and stall it. Built here instead, on load.
  useLayoutEffect(() => {
    const backdrop = mesh.current;
    if (!backdrop) return;
    backdrop.visible = true;
    gl.compile(backdrop, camera, scene);
    backdrop.visible = false;
  }, [gl, scene, camera]);

  useFrame(() => {
    // In the studio it would be fully see-through: not drawn at all.
    if (mesh.current)
      mesh.current.visible = DRINK_UNIFORMS.uDrinkUnder.value > 0;
  });

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
