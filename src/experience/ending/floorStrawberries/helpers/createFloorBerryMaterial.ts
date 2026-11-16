import { DoubleSide, MeshStandardMaterial, Vector2 } from 'three';

import { STRAWBERRY_UNIFORMS } from '@/experience/inside/strawberries/helpers/strawberry';
import { injectAfter } from '@/experience/shared/shader/injectShader';
import colorFragment from '@/shaders/ending/floorStrawberries/berry.color.frag.glsl';
import normalFragment from '@/shaders/ending/floorStrawberries/berry.normal.frag.glsl';
import fragmentPars from '@/shaders/ending/floorStrawberries/berry.pars.frag.glsl';
import vertexPars from '@/shaders/ending/floorStrawberries/berry.pars.vert.glsl';
import roughnessFragment from '@/shaders/ending/floorStrawberries/berry.roughness.frag.glsl';
import vertexMain from '@/shaders/ending/floorStrawberries/berry.vert.glsl';

import {
  FLOOR_STRAWBERRY,
  FLOOR_STRAWBERRY_UNIFORMS,
} from './floorStrawberries';

/** Parts of a strawberry model, by material name: skin, cut face, calyx and stem. */
export type BerryPart = 'skin' | 'flesh' | 'leaf';

/**
 * A material for one part of a strawberry on the floor. The leaves are a plain
 * standard material; the skin and the cut face are standard materials with the
 * same patterns as the pieces in the drink. Barely any of the studio's panels
 * reach them: the light that follows the pointer is what shows them. `axis` is where the whole fruit's axis passes through
 * the piece (x, z in model units).
 */
export const createFloorBerryMaterial = (
  part: BerryPart,
  axis: readonly [number, number],
) => {
  // The model's faces are not all wound the same way, so both sides are drawn.
  if (part === 'leaf') {
    return new MeshStandardMaterial({
      color: FLOOR_STRAWBERRY.leaf,
      roughness: FLOOR_STRAWBERRY.leafRoughness,
      metalness: 0,
      envMapIntensity: FLOOR_STRAWBERRY.ambient,
      side: DoubleSide,
    });
  }

  const flesh = part === 'flesh';
  const material = new MeshStandardMaterial({
    metalness: 0,
    envMapIntensity: FLOOR_STRAWBERRY.ambient,
    side: DoubleSide,
    // A cut is flat, whatever the model's smoothed normals say at its rim.
    flatShading: flesh,
  });
  if (flesh) material.defines = { ...material.defines, FLESH: '' };

  const uniforms = {
    ...STRAWBERRY_UNIFORMS,
    ...FLOOR_STRAWBERRY_UNIFORMS,
    uBerryAxis: { value: new Vector2(...axis) },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = injectAfter(
      injectAfter(shader.vertexShader, '#include <common>', vertexPars),
      '#include <begin_vertex>',
      vertexMain,
    );
    let fragment = injectAfter(
      shader.fragmentShader,
      '#include <common>',
      fragmentPars,
    );
    fragment = injectAfter(
      fragment,
      '#include <color_fragment>',
      colorFragment,
    );
    fragment = injectAfter(
      fragment,
      '#include <roughnessmap_fragment>',
      roughnessFragment,
    );
    shader.fragmentShader = injectAfter(
      fragment,
      '#include <normal_fragment_begin>',
      normalFragment,
    );
  };
  // Keeps three.js from reusing a plain standard program, such as the leaves'.
  material.customProgramCacheKey = () => `floorBerry-${part}`;
  return material;
};
