import { Effect } from 'postprocessing';
import { Uniform } from 'three';

import fragmentShader from '@/shaders/postprocessing/blackout.frag.glsl';

// The fade to black on the way to the end, as an effect in the postprocessing
// chain; it joins the other effects in one pass.
export class BlackoutEffect extends Effect {
  /** How dark the picture is: 0 not at all, 1 black. */
  readonly blackout = new Uniform(0);

  constructor() {
    super('BlackoutEffect', fragmentShader);
    this.uniforms.set('uBlackout', this.blackout);
  }
}
