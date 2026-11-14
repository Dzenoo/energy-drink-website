import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import {
  Color,
  DoubleSide,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
} from 'three';

import fragmentShader from '@/shaders/inside/liquid/surface.frag.glsl';
import vertexShader from '@/shaders/inside/liquid/surface.vert.glsl';

import { immersion } from './utils/immersion';
import { IMMERSION, LIQUID } from './utils/liquid';

/** Segments around the surface disc; the waves live in the shader, so the disc stays flat. */
const SEGMENTS = 64;

// The drink's surface: dark with soft highlights from above, Snell's window from
// below. As the camera descends from the opening, the reflection gives way and
// the surface takes the drink's inside color, together with background and fog.
const LiquidSurface: React.FC = () => {
  const { material, uniforms } = useMemo(() => {
    const uniforms = {
      // Fog uniforms, filled by three.js, so the surface fades into the drink like the rest.
      ...UniformsUtils.clone(UniformsLib.fog),
      uTime: { value: 0 },
      uDeep: { value: new Color(LIQUID.deep) },
      uGlow: { value: new Color(LIQUID.glow) },
      uShine: { value: new Color(LIQUID.shine) },
      uInside: { value: new Color(LIQUID.shallow) },
      uApproach: { value: 0 },
      uWaveScale: { value: LIQUID.waveScale },
      uWaveHeight: { value: LIQUID.waveHeight },
    };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      // Seen from above through the opening and from below inside the drink.
      side: DoubleSide,
      fog: true,
    });
    return { material, uniforms };
  }, []);

  useLayoutEffect(() => () => material.dispose(), [material]);

  useFrame(({ camera }, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uApproach.value = immersion(camera.position, IMMERSION);
  });

  return (
    // A circle lies in the xy plane; turned flat, its front faces up.
    <mesh
      position-y={LIQUID.height}
      rotation-x={-Math.PI / 2}
      material={material}
    >
      <circleGeometry args={[LIQUID.radius - LIQUID.wallGap, SEGMENTS]} />
    </mesh>
  );
};

export default LiquidSurface;
