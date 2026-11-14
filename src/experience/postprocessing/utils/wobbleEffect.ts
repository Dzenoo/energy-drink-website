import { Effect } from 'postprocessing';
import { Uniform } from 'three';

import fragmentShader from '@/shaders/postprocessing/wobble.frag.glsl';

import { POSTPROCESSING } from './postprocessing';

// The underwater sway of the whole picture, as an effect in the postprocessing
// chain. It only moves where the picture is read from, so it joins the other
// effects in one pass.
export class WobbleEffect extends Effect {
  readonly under = new Uniform(0);
  readonly strength = new Uniform(POSTPROCESSING.wobbleStrength);
  readonly scale = new Uniform(POSTPROCESSING.wobbleScale);
  readonly speed = new Uniform(POSTPROCESSING.wobbleSpeed);

  constructor() {
    super('WobbleEffect', fragmentShader);
    this.uniforms.set('uUnder', this.under);
    this.uniforms.set('uStrength', this.strength);
    this.uniforms.set('uScale', this.scale);
    this.uniforms.set('uSpeed', this.speed);
  }
}
