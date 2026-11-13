import { create } from 'zustand';

import { STATIONS } from '@/content/stations';

/** Number of stations in the scroll. */
export const STATION_COUNT = STATIONS.length;

type ScrollStore = {
  /** Index of the station the visitor is on, or flying to. */
  station: number;
  /** Moves one station forward (1) or back (-1), stopping at both ends. */
  step: (direction: 1 | -1) => void;
};

// The station changes only on input, so it lives in Zustand: the HTML re-renders
// on it, while the 3D side reads it with getState() inside the frame loop.
export const useScrollStore = create<ScrollStore>((set) => ({
  station: 0,
  step: (direction) =>
    set(({ station }) => ({
      station: Math.min(Math.max(station + direction, 0), STATION_COUNT - 1),
    })),
}));

/**
 * Scroll state that changes every frame, read directly by the 3D and HTML sides.
 * `progress` is a continuous station index (0 … STATION_COUNT - 1) that springs
 * toward `station`; the camera rig advances it.
 */
export const SCROLL = { progress: 0 };
