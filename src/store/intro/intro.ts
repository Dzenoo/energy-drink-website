import { create } from 'zustand';

/**
 * How far the opening animation has run, 0 … 1, as a share of its duration.
 * Changes every frame while it runs, so it is a plain object read by the 3D side.
 */
export const INTRO = { progress: 0 };

type IntroStore = {
  /** Whether the can has arrived far enough for the page around it to come in. */
  landed: boolean;
  land: () => void;
};

// Flips once per visit, so the HTML re-renders on it only then.
export const useIntroStore = create<IntroStore>((set) => ({
  landed: false,
  land: () => set({ landed: true }),
}));
