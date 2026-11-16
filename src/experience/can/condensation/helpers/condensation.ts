import type { MeshStandardMaterial, Texture } from 'three';

import {
  extendMaterial,
  injectAfter,
} from '@/experience/shared/shader/injectShader';

import normalFragment from '@/shaders/can/condensation/condensation.normal.frag.glsl';
import fragmentPars from '@/shaders/can/condensation/condensation.pars.frag.glsl';
import vertexPars from '@/shaders/can/condensation/condensation.pars.vert.glsl';
import roughnessFragment from '@/shaders/can/condensation/condensation.roughness.frag.glsl';
import vertexMain from '@/shaders/can/condensation/condensation.vert.glsl';

// Scene units: 1 unit = 10 cm.
const CONDENSATION = {
  /** Can body radius (units); 0.265 = 26.5 mm. */
  radius: 0.265,
  /** How strongly a drop bends the surface normal; higher reads as a rounder drop. */
  dropNormal: 1.2,
  /** Roughness of water: glossy, so drops catch the studio panels sharply. */
  dropRoughness: 0.05,
  /** Roughness the mist adds to the metal; light, so the can stays shiny under it. */
  mistRoughness: 0.1,
  /** Columns of running drops around the can. */
  runColumns: 40,
  /** Height of one drop's cell (units); a drop and its trail fit in one cell. */
  runCellHeight: 0.4,
  /** Share of cells with a drop; 1 fills every cell. */
  runDensity: 1,
  /** Base speed (units per second); each column runs at 0.5–1.5× of it. */
  runSpeed: 0.05,
  /** Drop radius (units); 0.01 = 1 mm. */
  runSize: 0.01,
  /** Trail length behind a drop (fraction of a cell, at most 0.5). */
  trailLength: 0.4,
};

// One set of uniforms shared by every material with condensation, so the time
// is set once for the whole can.
export const CONDENSATION_UNIFORMS = {
  uCondTime: { value: 0 },
  uCondRadius: { value: CONDENSATION.radius },
  uDropNormal: { value: CONDENSATION.dropNormal },
  uDropRoughness: { value: CONDENSATION.dropRoughness },
  uMistRoughness: { value: CONDENSATION.mistRoughness },
  uRunColumns: { value: CONDENSATION.runColumns },
  uRunCellHeight: { value: CONDENSATION.runCellHeight },
  uRunDensity: { value: CONDENSATION.runDensity },
  uRunSpeed: { value: CONDENSATION.runSpeed },
  uRunSize: { value: CONDENSATION.runSize },
  uTrailLength: { value: CONDENSATION.trailLength },
  // Set by the wipe each frame it runs; until then three.js binds an empty (black) texture: no wipe.
  uWipeMap: { value: null as Texture | null },
};

/**
 * Adds mist and running drops to a standard material: they change its normal and
 * roughness, the rest of the lighting stays three.js's own. Call before the
 * material first renders. The roughness part runs after metalness, so effects
 * that set the base roughness (the label's letters) always come before the mist.
 */
export const addCondensation = (material: MeshStandardMaterial) =>
  extendMaterial(material, 'condensation', (shader) => {
    Object.assign(shader.uniforms, CONDENSATION_UNIFORMS);
    shader.vertexShader = injectAfter(
      injectAfter(shader.vertexShader, '#include <common>', vertexPars),
      '#include <worldpos_vertex>',
      vertexMain,
    );
    shader.fragmentShader = injectAfter(
      injectAfter(
        injectAfter(shader.fragmentShader, '#include <common>', fragmentPars),
        '#include <metalnessmap_fragment>',
        roughnessFragment,
      ),
      '#include <normal_fragment_maps>',
      normalFragment,
    );
  });
