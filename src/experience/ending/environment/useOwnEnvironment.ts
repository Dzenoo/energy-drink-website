import type { MeshStandardMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Gives materials the studio's panels as their own environment. A material that
 * only borrows the scene's environment ignores its envMapIntensity (three.js
 * then uses the scene's), so the end could not be darker than the can. The
 * studio's cube map is set once it has rendered, so it is picked up here.
 */
export const useOwnEnvironment = (
  materials: readonly MeshStandardMaterial[],
) => {
  useFrame(({ scene }) => {
    for (const material of materials) {
      if (material.envMap !== scene.environment) {
        material.envMap = scene.environment;
      }
    }
  });
};
