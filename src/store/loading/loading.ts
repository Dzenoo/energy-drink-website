import { create } from 'zustand';

type LoadingStore = {
  /** Whether the scene's code (three.js, the experience) has downloaded. */
  sceneCode: boolean;
  /** Share of the models loaded, 0 … 1. */
  models: number;
  /** Whether the scene has drawn its first frame, with every shader built. */
  sceneReady: boolean;
  /** Whether the loader has finished and is leaving; the opening animation waits for it. */
  done: boolean;
  setSceneCode: () => void;
  setModels: (share: number) => void;
  setSceneReady: () => void;
  finish: () => void;
};

// Loading steps reported by the scene (3D) and shown by the loader (HTML). Each
// changes only a few times per visit, so it lives in Zustand.
export const useLoadingStore = create<LoadingStore>((set) => ({
  sceneCode: false,
  models: 0,
  sceneReady: false,
  done: false,
  setSceneCode: () => set({ sceneCode: true }),
  setModels: (share) => set({ models: share }),
  setSceneReady: () => set({ sceneReady: true }),
  finish: () => set({ done: true }),
}));
