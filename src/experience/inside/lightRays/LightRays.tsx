import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  type Mesh,
  ShaderMaterial,
  Vector2,
} from 'three';
import { useFrame } from '@react-three/fiber';

import { DRINK_UNIFORMS } from '@/experience/inside/liquid/helpers/drinkUniforms';
import { useDrinkOnly } from '@/experience/inside/liquid/useDrinkOnly';
import fragmentShader from '@/shaders/inside/lightRays/lightRays.frag.glsl';
import vertexShader from '@/shaders/inside/lightRays/lightRays.vert.glsl';

import { createRaySeeds } from './helpers/createRaySeeds';
import { LIGHT_RAYS } from './helpers/lightRays';

/** Corners of the strip every ray is drawn on: across (x, -1 to 1) and along (y, 0 at the surface to 1 at the end). */
const STRIP = new Float32Array([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0]);
const STRIP_TRIANGLES = [0, 1, 2, 0, 2, 3];

// Shafts of light falling from the opening into the drink: one draw call of
// strips, each turned in the vertex shader to face the camera. Only light is
// drawn, added on top of the drink.
const LightRays: React.FC = () => {
  const mesh = useRef<Mesh>(null);

  const geometry = useMemo(() => {
    const { starts, directions, shapes, count } = createRaySeeds();
    const geometry = new InstancedBufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(STRIP, 3));
    geometry.setIndex(STRIP_TRIANGLES);
    geometry.setAttribute('aStart', new InstancedBufferAttribute(starts, 4));
    geometry.setAttribute(
      'aDirection',
      new InstancedBufferAttribute(directions, 3),
    );
    geometry.setAttribute('aShape', new InstancedBufferAttribute(shapes, 4));
    geometry.instanceCount = count;
    return geometry;
  }, []);

  const { material, uniforms } = useMemo(() => {
    const uniforms = {
      // The drink's surface height, light color and fog, shared with the rest of the drink.
      ...DRINK_UNIFORMS,
      uTime: { value: 0 },
      uRayLength: { value: LIGHT_RAYS.length },
      uRayWidth: { value: LIGHT_RAYS.width },
      uRayFlare: { value: LIGHT_RAYS.flare },
      uRayStrength: { value: LIGHT_RAYS.strength },
      uRayDepth: { value: LIGHT_RAYS.depth },
      uRayShimmerSpeed: { value: LIGHT_RAYS.shimmerSpeed },
      uRayNearFade: { value: new Vector2(...LIGHT_RAYS.nearFade) },
    };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      // Only light is drawn, added to what is behind: no sorting needed.
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      // A strip turned to the camera may face either way.
      side: DoubleSide,
    });
    return { material, uniforms };
  }, []);

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
      // The shader places and turns the strips, so the geometry's bounds say nothing about where they are.
      frustumCulled={false}
    />
  );
};

export default LightRays;
