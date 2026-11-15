import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  type Mesh,
  ShaderMaterial,
} from 'three';

import { useDrinkOnly } from '@/experience/inside/liquid/useDrinkOnly';
import { DRINK_UNIFORMS } from '@/experience/inside/liquid/utils/drinkUniforms';
import fragmentShader from '@/shaders/inside/bubbles/bubbles.frag.glsl';
import vertexShader from '@/shaders/inside/bubbles/bubbles.vert.glsl';

import { BUBBLES } from './utils/bubbles';
import { createBubbleSeeds, SEED_SIZE } from './utils/createBubbleSeeds';

/** Corners of the square every bubble is drawn on, and the two triangles that fill it. */
const SQUARE = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]);
const SQUARE_TRIANGLES = [0, 1, 2, 0, 2, 3];

// The fizz: bubbles rising through the drink, loose and in streams. All of them
// are one draw call of small squares facing the camera; the vertex shader moves
// each along its path, the fragment shader draws a sphere on it. Nothing is
// computed per bubble on the CPU.
const Bubbles: React.FC = () => {
  const mesh = useRef<Mesh>(null);

  const { geometry, material, uniforms } = useMemo(() => {
    const { seeds, count } = createBubbleSeeds();
    const geometry = new InstancedBufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(SQUARE, 3));
    geometry.setIndex(SQUARE_TRIANGLES);
    geometry.setAttribute(
      'aSeed',
      new InstancedBufferAttribute(seeds, SEED_SIZE),
    );
    geometry.instanceCount = count;

    const uniforms = {
      // The drink's surface height, light and fog, shared with the rest of the drink.
      ...DRINK_UNIFORMS,
      uTime: { value: 0 },
      uBubbleRadius: { value: BUBBLES.radius },
      uBubbleSize: { value: BUBBLES.size },
      uBubbleRiseTime: { value: BUBBLES.riseTime },
      uBubbleSway: { value: BUBBLES.sway },
      uBubbleLight: { value: new Color(BUBBLES.light) },
      uBubbleStrength: { value: BUBBLES.strength },
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
    return { geometry, material, uniforms };
  }, []);

  useLayoutEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

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

export default Bubbles;
