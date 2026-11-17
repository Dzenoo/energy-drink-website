import { useEffect, useRef, useState } from 'react';

import { BRAND } from '@/content/brand';
import { LOADER_TEXT } from '@/content/loader';

import { useLoadingStore } from '@/store/loading/loading';

import './Loader.css';

const LOADER = {
  /** Share of the bar for the scene's code, the biggest download. */
  codeShare: 0.5,
  /** Share of the bar for the models; the rest is the first frame with its shaders. */
  modelShare: 0.4,
  /** While the code downloads (no progress is reported for it), the bar creeps toward this share of its part, so it never looks stuck. */
  codeCreep: 0.9,
  /** Time (s) the creep takes to cover about two thirds of the way. */
  creepTime: 2,
  /** Spring time (s) of the shown value toward the real one; it rises smoothly, never jumps. */
  smoothTime: 0.35,
  /** Shortest time (s) the loader shows, so a cached load does not flash it. */
  minDuration: 1,
  /** Pause (s) on a full can before the loader leaves. */
  hold: 0.3,
  /** Fade out (s); Loader.css reads it as --loader-fade. */
  fade: 0.8,
  /** Longest frame step (s), so a stalled frame does not jump the bar. */
  maxStep: 0.1,
  /** Shown value where the bar snaps to full once everything is ready. */
  snapAt: 0.995,
};

/** Font the brand is drawn in; the letters wait for it, so they never show in a fallback font. */
const BRAND_FONT = '700 1em "Oswald Variable"';

// The first screen: the brand's letters fill with the drink from the bottom as
// the page loads. The bar follows the real steps (code, models, first frame),
// written straight to the DOM every frame instead of through React renders.
// Once full, it fades out and the opening animation starts under it.
const Loader: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  const done = useLoadingStore((state) => state.done);
  const [fontReady, setFontReady] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let active = true;
    document.fonts
      .load(BRAND_FONT, BRAND.name)
      .finally(() => active && setFontReady(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const start = performance.now();
    let last = start;
    let shown = 0;
    let frame = 0;
    let holdTimer = 0;

    const write = () => {
      const value = Math.round(shown * 100);
      element.style.setProperty('--fill', String(shown));
      element.setAttribute('aria-valuenow', String(value));
      if (percent.current) {
        percent.current.textContent = `${String(value).padStart(3, '0')} %`;
      }
    };

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const step = Math.min((now - last) / 1000, LOADER.maxStep);
      last = now;

      const { sceneCode, models, sceneReady } = useLoadingStore.getState();
      const code = sceneCode
        ? 1
        : LOADER.codeCreep * (1 - Math.exp(-elapsed / LOADER.creepTime));
      const target =
        code * LOADER.codeShare +
        (sceneCode ? models : 0) * LOADER.modelShare +
        (sceneReady ? 1 - LOADER.codeShare - LOADER.modelShare : 0);

      // Springs toward the real value and never goes back.
      shown = Math.max(
        shown,
        shown + (target - shown) * (1 - Math.exp(-step / LOADER.smoothTime)),
      );

      const full =
        sceneReady && elapsed >= LOADER.minDuration && shown >= LOADER.snapAt;
      if (full) shown = 1;
      write();

      if (full) {
        holdTimer = window.setTimeout(
          () => useLoadingStore.getState().finish(),
          LOADER.hold * 1000,
        );
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(holdTimer);
    };
  }, []);

  // Once faded out, it leaves the page.
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setGone(true), LOADER.fade * 1000);
    return () => window.clearTimeout(timer);
  }, [done]);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="loader"
      data-done={done}
      data-font-ready={fontReady}
      role="progressbar"
      aria-label={LOADER_TEXT.label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      style={{ '--loader-fade': `${LOADER.fade}s` } as React.CSSProperties}
    >
      <p className="loader__brand" aria-hidden="true">
        <span className="loader__outline">{BRAND.name}</span>
        <span className="loader__fill">{BRAND.name}</span>
      </p>

      <p className="loader__status" aria-hidden="true">
        <span>{LOADER_TEXT.status}</span>
        <span ref={percent} className="loader__percent">
          000 %
        </span>
      </p>
    </div>
  );
};

export default Loader;
