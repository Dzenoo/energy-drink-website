import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useLayoutEffect, useMemo } from 'react';

import { DRINK_UNIFORMS } from '@/experience/inside/liquid/utils/drinkUniforms';

import { POSTPROCESSING } from './utils/postprocessing';
import { WobbleEffect } from './utils/wobbleEffect';

// Everything that happens to the picture after the scene is drawn, for the whole
// experience: the underwater sway (only in the drink), bloom, vignette, tone
// mapping and grain. The scene is drawn without tone mapping into a buffer that
// keeps colors brighter than white, so bloom can find the light sources; tone
// mapping comes after it, and grain last, on the final colors.
const Postprocessing: React.FC = () => {
  const wobble = useMemo(() => new WobbleEffect(), []);
  useLayoutEffect(() => () => wobble.dispose(), [wobble]);

  useFrame(() => {
    // The sway comes in with the dive, on the same value as the drink's color.
    wobble.under.value = DRINK_UNIFORMS.uDrinkUnder.value;
  });

  return (
    <EffectComposer multisampling={POSTPROCESSING.multisampling}>
      <primitive object={wobble} />
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
      <Noise
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={POSTPROCESSING.grain}
      />
    </EffectComposer>
  );
};

export default Postprocessing;
