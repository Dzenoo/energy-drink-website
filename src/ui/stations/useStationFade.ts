import { useEffect, useRef } from 'react';
import { MathUtils } from 'three';

import { SCROLL } from '@/store/scroll/scroll';

const FADE = {
  /** Distance from a station (in stations) within which its text is fully shown. */
  shownWithin: 0.04,
  /** Distance from a station (in stations) beyond which its text is gone. */
  hiddenBeyond: 0.25,
};

/**
 * Ties each station's text to where the camera is, not to the input: the text
 * fades out as soon as the camera leaves its station and fades in only as the
 * camera arrives, so it always speaks about the shot on screen. It writes a
 * `--shown` CSS variable (0 … 1) straight onto each section every frame,
 * without React renders.
 */
export const useStationFade = (count: number) => {
  const sections = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Last written value per section, so the DOM is touched only on change.
    const written = new Array<number>(count).fill(-1);
    let frame = 0;

    const update = () => {
      frame = requestAnimationFrame(update);

      sections.current.forEach((section, index) => {
        if (!section) return;
        const distance = Math.abs(SCROLL.progress - index);
        // Rounded so the camera's endless tiny settling does not write every frame.
        const shown =
          Math.round(
            (1 -
              MathUtils.smoothstep(
                distance,
                FADE.shownWithin,
                FADE.hiddenBeyond,
              )) *
              1000,
          ) / 1000;
        if (shown === written[index]) return;

        written[index] = shown;
        section.style.setProperty('--shown', String(shown));
        // A hidden station can be neither clicked nor tabbed into.
        section.style.visibility = shown > 0 ? 'visible' : 'hidden';
      });
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [count]);

  return sections;
};
