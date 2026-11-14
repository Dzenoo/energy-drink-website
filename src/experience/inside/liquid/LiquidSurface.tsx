import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import {
  Color,
  DoubleSide,
  ShaderMaterial,
  type Texture,
  Vector2,
} from 'three';

import fragmentShader from '@/shaders/inside/liquid/surface.frag.glsl';
import vertexShader from '@/shaders/inside/liquid/surface.vert.glsl';

import { DRINK_UNIFORMS } from './utils/drinkUniforms';
import { LIQUID } from './utils/liquid';

/** Segments around the surface disc; the waves live in the shader, so the disc stays flat. */
const SEGMENTS = 64;

// The drink's surface: from above, the drink's color under a mirror image of
// the studio, broken up by swell and by rings from popping bubbles; from below,
// Snell's window onto the lid and the bright opening, with a mirror of the
// drink around it. As the camera descends from the opening, the reflection gives way and the
// surface takes the drink's color for each look direction, together with the
// backdrop and the fog.
const LiquidSurface: React.FC = () => {
  const { material, uniforms } = useMemo(() => {
    const uniforms = {
      // The drink's colors and fog, shared with the backdrop and the wall.
      ...DRINK_UNIFORMS,
      uTime: { value: 0 },
      // Set once the studio has rendered its panels; until then three.js binds an empty (black) cube.
      uEnvironment: { value: null as Texture | null },
      uReflection: { value: LIQUID.reflection },
      uWaveScale: { value: LIQUID.waveScale },
      uWaveHeight: { value: LIQUID.waveHeight },
      uWaveSpeed: { value: LIQUID.waveSpeed },
      uRippleHeight: { value: LIQUID.rippleHeight },
      uLid: { value: new Color(LIQUID.lid) },
      uLidHeight: { value: LIQUID.lidHeight },
      uOpeningCenter: { value: new Vector2(...LIQUID.openingCenter) },
      uOpeningSize: { value: new Vector2(...LIQUID.openingSize) },
      uOpeningLight: { value: new Color(LIQUID.openingLight) },
      uOpeningStrength: { value: LIQUID.openingStrength },
      uHaloStrength: { value: LIQUID.haloStrength },
      uHaloSize: { value: LIQUID.haloSize },
      uWindowEdge: { value: LIQUID.windowEdge },
    };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      // Seen from above through the opening and from below inside the drink.
      side: DoubleSide,
    });
    return { material, uniforms };
  }, []);

  useLayoutEffect(() => () => material.dispose(), [material]);

  useFrame(({ scene }, delta) => {
    uniforms.uTime.value += delta;
    // The studio's cube map, the same one the can's metal mirrors.
    uniforms.uEnvironment.value = scene.environment;
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
