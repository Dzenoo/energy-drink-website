import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, type Mesh, MeshStandardMaterial } from 'three';

import { injectAfter } from '@/experience/can/utils/injectShader';
import { STUDIO } from '@/experience/studio/utils/studio';
import fadeFragment from '@/shaders/ending/floor/floor.fade.frag.glsl';
import fragmentPars from '@/shaders/ending/floor/floor.pars.frag.glsl';
import vertexPars from '@/shaders/ending/floor/floor.pars.vert.glsl';
import vertexMain from '@/shaders/ending/floor/floor.vert.glsl';

import { useEndingOnly } from './useEndingOnly';
import { useOwnEnvironment } from './useOwnEnvironment';
import { FLOOR } from './utils/floor';

// The studio floor of the end: nearly black, lit mostly by the light that
// follows the pointer, and fading into the backdrop so it has no edge.
const Floor: React.FC = () => {
  const mesh = useRef<Mesh>(null);

  const material = useMemo(() => {
    const uniforms = {
      uFloorFadeStart: { value: FLOOR.fadeStart },
      uFloorFadeEnd: { value: FLOOR.fadeEnd },
      uFloorFar: { value: new Color(STUDIO.background) },
    };
    const material = new MeshStandardMaterial({
      color: FLOOR.color,
      roughness: FLOOR.roughness,
      metalness: 0,
      envMapIntensity: FLOOR.ambient,
    });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = injectAfter(
        injectAfter(shader.vertexShader, '#include <common>', vertexPars),
        '#include <begin_vertex>',
        vertexMain,
      );
      shader.fragmentShader = injectAfter(
        injectAfter(shader.fragmentShader, '#include <common>', fragmentPars),
        '#include <opaque_fragment>',
        fadeFragment,
      );
    };
    // Keeps three.js from reusing a plain standard program for the floor.
    material.customProgramCacheKey = () => 'floor';
    return material;
  }, []);

  useLayoutEffect(() => () => material.dispose(), [material]);

  useEndingOnly(mesh);
  useOwnEnvironment(useMemo(() => [material], [material]));

  return (
    // A plane lies in the xy plane; turned flat, its front faces up.
    <mesh
      ref={mesh}
      rotation-x={-Math.PI / 2}
      material={material}
      visible={false}
    >
      <planeGeometry args={[FLOOR.size, FLOOR.size]} />
    </mesh>
  );
};

export default Floor;
