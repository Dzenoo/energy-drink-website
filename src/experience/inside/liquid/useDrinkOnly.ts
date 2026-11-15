import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useLayoutEffect } from 'react';
import type { Object3D } from 'three';

import { DRINK_UNIFORMS } from './utils/drinkUniforms';

/**
 * For things that exist only inside the drink (backdrop, inner wall, bubbles):
 * drawn only while the camera is in or near the drink, since from the studio the
 * can's shell hides them anyway. Hidden things get no shader until they first
 * show, which would stall the dive, so the shader is built here, on load.
 */
export const useDrinkOnly = (object: RefObject<Object3D | null>) => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useLayoutEffect(() => {
    const target = object.current;
    if (!target) return;
    target.visible = true;
    gl.compile(target, camera, scene);
    target.visible = false;
  }, [object, gl, scene, camera]);

  useFrame(() => {
    if (object.current) {
      object.current.visible = DRINK_UNIFORMS.uDrinkUnder.value > 0;
    }
  });
};
