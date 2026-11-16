import { type RefObject, useLayoutEffect } from 'react';
import type { Object3D } from 'three';
import { useFrame, useThree } from '@react-three/fiber';

import { SCROLL } from '@/store/scroll/scroll';

import { showsEnding } from './helpers/cut';

/**
 * For things that exist only in the end scene (the floor, the pile): drawn only
 * once the picture has gone black on the way to the end. Hidden things get no
 * shader until they first show, which would stall the swap, so the shader is
 * built here, on load.
 */
export const useEndingOnly = (object: RefObject<Object3D | null>) => {
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
      object.current.visible = showsEnding(SCROLL.progress);
    }
  });
};
