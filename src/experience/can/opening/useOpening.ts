import { useMemo } from 'react';
import { MathUtils, type Object3D } from 'three';
import { useFrame } from '@react-three/fiber';

import { SCROLL } from '@/store/scroll/scroll';

const OPENING = {
  /** Scroll progress (stations) where the can starts to open: late on the way from station 1 to 2. */
  start: 0.7,
  /** Scroll progress where the can is fully open: station 2. */
  end: 1,
  /** How far the tab's ring lifts (degrees); a small lift reads as a press, not a pull. */
  tabLift: 8,
  /** How far the panel swings into the can (degrees). */
  panelSwing: 120,
};

/** Pivot empties from Blender: TabPivot sits on the rivet, PanelPivot on the hinge at the back of the opening. */
const TAB_PIVOT = 'TabPivot';
const PANEL_PIVOT = 'PanelPivot';

// Opens the can as the visitor scrolls toward station 2, and closes it again on
// the way back: the tab's ring lifts and its nose pushes the panel into the can.
// Both turn around +x on their pivots, which lifts the tab's ring (behind the
// rivet) and sinks the panel (in front of its hinge).
export const useOpening = (scene: Object3D) => {
  const pivots = useMemo(() => {
    const tab = scene.getObjectByName(TAB_PIVOT);
    const panel = scene.getObjectByName(PANEL_PIVOT);
    if (!tab || !panel) {
      throw new Error(
        `${TAB_PIVOT} or ${PANEL_PIVOT} is missing in the can model`,
      );
    }
    return { tab, panel };
  }, [scene]);

  useFrame(() => {
    const open = MathUtils.smoothstep(
      SCROLL.progress,
      OPENING.start,
      OPENING.end,
    );

    // The tab lifts first; the panel gives way while the tab's nose presses on it.
    const tabRotation = MathUtils.degToRad(
      OPENING.tabLift * MathUtils.smoothstep(open, 0, 0.55),
    );
    const panelRotation = MathUtils.degToRad(
      OPENING.panelSwing * MathUtils.smoothstep(open, 0.2, 0.6),
    );

    // Most frames nothing moves (the visitor rests on a station), so nothing is written.
    if (pivots.tab.rotation.x !== tabRotation) {
      pivots.tab.rotation.x = tabRotation;
    }
    if (pivots.panel.rotation.x !== panelRotation) {
      pivots.panel.rotation.x = panelRotation;
    }
  });
};
