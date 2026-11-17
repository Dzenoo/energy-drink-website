import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  type Mesh,
  MathUtils,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';
import { useFrame } from '@react-three/fiber';

import fragmentShader from '@/shaders/studio/backLight/backLight.frag.glsl';
import vertexShader from '@/shaders/studio/backLight/backLight.vert.glsl';

import { SCROLL } from '@/store/scroll/scroll';

import { BACK_LIGHT, BACK_LIGHT_EXTENT } from './helpers/backLight';

/** Half the plane's width and height (units): it reaches BACK_LIGHT_EXTENT radii from the middle. */
const HALF_WIDTH = BACK_LIGHT.radius * BACK_LIGHT_EXTENT;
const HALF_HEIGHT = HALF_WIDTH * BACK_LIGHT.stretch;

// A soft glow on the backdrop behind the can, so the dark can stands out on the
// first station like a product shot. One additive plane, scaled to the glow's
// size; once the camera has left the first station it is hidden and costs nothing.
const BackLight: React.FC = () => {
  const mesh = useRef<Mesh>(null);

  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);

  const { material, uniforms } = useMemo(() => {
    const uniforms = {
      uBackLightColor: { value: new Color(BACK_LIGHT.color) },
      uBackLightIntensity: { value: BACK_LIGHT.intensity },
      uBackLightFade: { value: 1 },
    };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      // Only light is drawn, added to what is behind: no sorting needed.
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    return { material, uniforms };
  }, []);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    if (!mesh.current) return;
    const [start, end] = BACK_LIGHT.fade;
    const shown = 1 - MathUtils.smoothstep(SCROLL.progress, start, end);
    uniforms.uBackLightFade.value = shown;
    mesh.current.visible = shown > 0;
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      position={[0, BACK_LIGHT.height, -BACK_LIGHT.distance]}
      scale={[HALF_WIDTH, HALF_HEIGHT, 1]}
    />
  );
};

export default BackLight;
