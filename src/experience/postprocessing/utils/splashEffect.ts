import { Effect } from 'postprocessing';
import { Color, Uniform } from 'three';

import fragmentShader from '@/shaders/postprocessing/splash.frag.glsl';

import { POSTPROCESSING } from './postprocessing';

// The froth that washes over the picture as the camera goes through the drink's
// surface, as an effect in the postprocessing chain.
export class SplashEffect extends Effect {
  /** How much of the picture the froth covers: 0 none, 1 all of it. */
  readonly splash = new Uniform(0);
  readonly color = new Uniform(
    new Color(POSTPROCESSING.splashColor).multiplyScalar(
      POSTPROCESSING.splashBrightness,
    ),
  );
  readonly scale = new Uniform(POSTPROCESSING.splashScale);
  readonly speed = new Uniform(POSTPROCESSING.splashSpeed);

  constructor() {
    super('SplashEffect', fragmentShader);
    this.uniforms.set('uSplash', this.splash);
    this.uniforms.set('uSplashColor', this.color);
    this.uniforms.set('uSplashScale', this.scale);
    this.uniforms.set('uSplashSpeed', this.speed);
  }
}
