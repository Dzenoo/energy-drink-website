import { useEffect } from 'react';

import { useScrollStore } from '@/store/scroll/scroll';
import { WIPE_INPUT } from '@/store/wipe/wipe';

const INPUT = {
  /** Wheel delta (px) a gesture must add up to before it counts as a step; filters small trackpad nudges. */
  wheelThreshold: 40,
  /** Quiet time (ms) that ends a wheel gesture, so one gesture, trackpad inertia included, moves one station. */
  wheelIdleMs: 200,
  /** Pixels per line for wheels that report in lines instead of pixels (some Firefox setups). */
  wheelLineHeight: 16,
  /** Shortest vertical swipe (px) that counts as a step. */
  swipeMinPx: 50,
};

const NEXT_KEYS = new Set(['ArrowDown', 'PageDown']);
const PREVIOUS_KEYS = new Set(['ArrowUp', 'PageUp']);

// Turns wheel, swipe and keyboard into station steps. Mounted once, at the top of the app.
const ScrollInput: React.FC = () => {
  useEffect(() => {
    const { step } = useScrollStore.getState();

    let wheelDelta = 0;
    let wheelLocked = false;
    let wheelIdleTimer = 0;
    let touchStartY: number | null = null;

    const onWheel = (event: WheelEvent) => {
      // Trackpad pinch arrives as a wheel event with ctrlKey; it is zoom, not scroll.
      if (event.ctrlKey) return;

      // Every event pushes the end of the gesture further, so inertia keeps the lock on.
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(() => {
        wheelLocked = false;
        wheelDelta = 0;
      }, INPUT.wheelIdleMs);

      if (wheelLocked) return;

      // deltaY is read before deltaMode on purpose: Firefox switches to line units
      // if deltaMode is checked first.
      const delta = event.deltaY;
      wheelDelta +=
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? delta * INPUT.wheelLineHeight
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? delta * window.innerHeight
            : delta;

      if (Math.abs(wheelDelta) < INPUT.wheelThreshold) return;
      step(wheelDelta > 0 ? 1 : -1);
      wheelLocked = true;
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      // A touch that started on the can was wiping it, not scrolling.
      if (WIPE_INPUT.touchOnCan) {
        WIPE_INPUT.touchOnCan = false;
        touchStartY = null;
        return;
      }

      const endY = event.changedTouches[0]?.clientY;
      if (touchStartY === null || endY === undefined) return;

      // Finger moving up reads as scrolling down, like on a normal page.
      const distance = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(distance) >= INPUT.swipeMinPx) step(distance > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      // Arrow keys in a text field move its cursor or value, not the stations.
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement)
      ) {
        return;
      }

      if (NEXT_KEYS.has(event.key)) step(1);
      else if (PREVIOUS_KEYS.has(event.key)) step(-1);
      else return;
      event.preventDefault();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(wheelIdleTimer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return null;
};

export default ScrollInput;
