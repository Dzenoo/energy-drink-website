import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  type Mesh,
  ShaderMaterial,
  Vector2,
} from 'three';
import { useFrame } from '@react-three/fiber';

import { DRINK_UNIFORMS } from '@/experience/inside/liquid/helpers/drinkUniforms';
import { useDrinkOnly } from '@/experience/inside/liquid/useDrinkOnly';

import fragmentShader from '@/shaders/inside/bubbles/bubbles.frag.glsl';
import vertexShader from '@/shaders/inside/bubbles/bubbles.vert.glsl';

import type { BubbleSettings } from './helpers/bubbles';
import { createBubbleSeeds, SEED_SIZE } from './helpers/createBubbleSeeds';

/** Corners of the square every bubble is drawn on, and the two triangles that fill it. */
const SQUARE = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]);
const SQUARE_TRIANGLES = [0, 1, 2, 0, 2, 3];

type BubbleCloudProps = {
  settings: BubbleSettings;
};

// One cloud of bubbles: one draw call of small squares facing the camera. The
// vertex shader moves each bubble along its path, the fragment shader draws a
// sphere on it. Nothing is computed per bubble on the CPU.
const BubbleCloud: React.FC<BubbleCloudProps> = ({ settings }) => {
  const mesh = useRef<Mesh>(null);

  const geometry = useMemo(() => {
    const { seeds, count } = createBubbleSeeds(settings);
    const geometry = new InstancedBufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(SQUARE, 3));
    geometry.setIndex(SQUARE_TRIANGLES);
    geometry.setAttribute(
      'aSeed',
      new InstancedBufferAttribute(seeds, SEED_SIZE),
    );
    geometry.instanceCount = count;
    return geometry;
  }, [settings]);

  const { material, uniforms } = useMemo(() => {
    const uniforms = {
      // The drink's surface height, light and fog, shared with the rest of the drink.
      ...DRINK_UNIFORMS,
      uTime: { value: 0 },
      // The cloud's own values, filled in from the settings below.
      uBubbleCenter: { value: new Vector2() },
      uBubbleRadius: { value: 0 },
      uBubbleFloor: { value: 0 },
      uBubbleSize: { value: 0 },
      uBubbleRiseTime: { value: 1 },
      uBubbleQuicken: { value: 0 },
      uBubbleSway: { value: 0 },
      uBubbleNearFade: { value: new Vector2() },
      uBubbleLight: { value: new Color() },
      uBubbleStrength: { value: 0 },
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

  useLayoutEffect(() => {
    uniforms.uBubbleCenter.value.set(...settings.center);
    uniforms.uBubbleRadius.value = settings.radius;
    uniforms.uBubbleFloor.value = settings.floor;
    uniforms.uBubbleSize.value = settings.size;
    uniforms.uBubbleRiseTime.value = settings.riseTime;
    uniforms.uBubbleQuicken.value = settings.quicken;
    uniforms.uBubbleSway.value = settings.sway;
    uniforms.uBubbleNearFade.value.set(...settings.nearFade);
    uniforms.uBubbleLight.value.set(settings.light);
    uniforms.uBubbleStrength.value = settings.strength;
  }, [uniforms, settings]);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => () => material.dispose(), [material]);

  useDrinkOnly(mesh);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      visible={false}
      // The shader places the bubbles, so the geometry's bounds say nothing about where they are.
      frustumCulled={false}
    />
  );
};

export default BubbleCloud;
