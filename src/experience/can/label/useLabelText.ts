import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { CanvasTexture } from 'three';

import { LABEL_UNIFORMS } from './utils/label';
import { createLabelTextMask } from './utils/labelText';

/** Texture filtering at grazing angles, where the letters curve away from the camera; 8 is sharp enough. */
const TEXT_ANISOTROPY = 8;

// Draws the label text once the font has loaded and hands the mask to the label shader.
export const useLabelText = () => {
  const maxAnisotropy = useThree((state) =>
    state.gl.capabilities.getMaxAnisotropy(),
  );

  useEffect(() => {
    let texture: CanvasTexture | null = null;
    let cancelled = false;

    createLabelTextMask(Math.min(TEXT_ANISOTROPY, maxAnisotropy))
      .then((mask) => {
        // Unmounted while the font loaded: the mask is no longer needed.
        if (cancelled) {
          mask.dispose();
          return;
        }
        texture = mask;
        LABEL_UNIFORMS.uLabelText.value = mask;
      })
      .catch((error: unknown) => {
        console.error('Label text could not be drawn', error);
      });

    return () => {
      cancelled = true;
      texture?.dispose();
      LABEL_UNIFORMS.uLabelText.value = null;
    };
  }, [maxAnisotropy]);
};
