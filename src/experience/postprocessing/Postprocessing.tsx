import { useLayoutEffect, useMemo } from 'react';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';

import { blackout } from '@/experience/ending/cut/helpers/cut';
import { DRINK_UNIFORMS } from '@/experience/inside/liquid/helpers/drinkUniforms';

import { SCROLL } from '@/store/scroll/scroll';

import { BlackoutEffect } from './helpers/blackoutEffect';
import { POSTPROCESSING } from './helpers/postprocessing';
import { splash } from './helpers/splash';
import { SplashEffect } from './helpers/splashEffect';
import { WobbleEffect } from './helpers/wobbleEffect';

// Everything that happens to the picture after the scene is drawn, for the whole
// experience: the underwater sway (only in the drink), the froth of the dive,
// bloom, vignette, tone mapping, the fade to black on the way to the end, and
// grain. The scene is drawn without tone mapping into a buffer that keeps colors
// brighter than white, so bloom can find the light sources; tone mapping comes
// after it, and grain last, on the final colors.
const Postprocessing: React.FC = () => {
  const wobble = useMemo(() => new WobbleEffect(), []);
  const froth = useMemo(() => new SplashEffect(), []);
  const fade = useMemo(() => new BlackoutEffect(), []);
  useLayoutEffect(
    () => () => {
      wobble.dispose();
      froth.dispose();
      fade.dispose();
    },
    [wobble, froth, fade],
  );

  useFrame(({ camera }) => {
    fade.blackout.value = blackout(SCROLL.progress);
    const covered = splash(camera.position);
    froth.splash.value = covered;
    // The sway comes in with the dive, on the same value as the drink's color,
    // and is stronger in the froth.
    wobble.under.value =
      DRINK_UNIFORMS.uDrinkUnder.value + covered * POSTPROCESSING.splashWobble;
  });

  return (
    <EffectComposer multisampling={POSTPROCESSING.multisampling}>
      <primitive object={wobble} />

      <primitive object={froth} />

      <Bloom
        mipmapBlur
        luminanceThreshold={POSTPROCESSING.bloomThreshold}
        luminanceSmoothing={POSTPROCESSING.bloomSmoothing}
        intensity={POSTPROCESSING.bloomIntensity}
      />

      <Vignette
        offset={POSTPROCESSING.vignetteOffset}
        darkness={POSTPROCESSING.vignetteDarkness}
      />

      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      <primitive object={fade} />

      <Noise
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={POSTPROCESSING.grain}
      />
    </EffectComposer>
  );
};

export default Postprocessing;
