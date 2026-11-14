import { Color, Vector4, type MeshStandardMaterial, type Texture } from 'three';

import colorFragment from '@/shaders/can/label/label.color.frag.glsl';
import emissiveFragment from '@/shaders/can/label/label.emissive.frag.glsl';
import metalnessFragment from '@/shaders/can/label/label.metalness.frag.glsl';
import fragmentPars from '@/shaders/can/label/label.pars.frag.glsl';
import vertexPars from '@/shaders/can/label/label.pars.vert.glsl';
import roughnessFragment from '@/shaders/can/label/label.roughness.frag.glsl';
import vertexMain from '@/shaders/can/label/label.vert.glsl';

import { extendMaterial, injectAfter } from '../../utils/injectShader';

// Label size on the can (mm): once around the body, and along the profile from
// the bottom curve to the neck. The label UV spreads evenly over both.
const LABEL_AROUND = 166.5;
const LABEL_ALONG = 124.44;

const LABEL = {
  /** Color at the bottom curve: near black with a hint of strawberry red. */
  bottom: '#170b0e',
  /** Color at the neck: a touch lighter, so the can's shape reads from top to bottom. */
  top: '#221d1e',
  /** Text block on the front (mm), centered at mid-height: 36 × 22.5 matches the 1024 × 640 mask. */
  textWidth: 36,
  textHeight: 22.5,
  /** Bare aluminium letters, matching the can's metal. */
  letterColor: '#d4d8dd',
  letterRoughness: 0.3,
};

const textRect = () => {
  const halfAround = LABEL.textWidth / 2 / LABEL_AROUND;
  const halfAlong = LABEL.textHeight / 2 / LABEL_ALONG;
  // u = 0.5 is the front of the can.
  return new Vector4(
    0.5 - halfAround,
    0.5 - halfAlong,
    0.5 + halfAround,
    0.5 + halfAlong,
  );
};

export const LABEL_UNIFORMS = {
  uLabelBottom: { value: new Color(LABEL.bottom) },
  uLabelTop: { value: new Color(LABEL.top) },
  // Set once the font has loaded and the mask is drawn; until then three.js
  // binds an empty texture, so the label shows no letters.
  uLabelText: { value: null as Texture | null },
  uLabelTextRect: { value: textRect() },
  uLetterColor: { value: new Color(LABEL.letterColor) },
  uLetterRoughness: { value: LABEL.letterRoughness },
};

/**
 * Paints the label in the shader: a near-black gradient from the bottom curve to
 * the neck, with the text as bare aluminium letters. The material's metalness,
 * roughness and glow strength still apply to the print. Call before the material
 * first renders.
 */
export const addLabel = (material: MeshStandardMaterial) =>
  extendMaterial(material, 'label', (shader) => {
    Object.assign(shader.uniforms, LABEL_UNIFORMS);
    shader.vertexShader = injectAfter(
      injectAfter(shader.vertexShader, '#include <common>', vertexPars),
      '#include <worldpos_vertex>',
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
    fragment = injectAfter(
      fragment,
      '#include <metalnessmap_fragment>',
      metalnessFragment,
    );
    shader.fragmentShader = injectAfter(
      fragment,
      '#include <emissivemap_fragment>',
      emissiveFragment,
    );
  });
