import { useGLTF } from '@react-three/drei';

// Draco is off: the models use meshopt, whose decoder ships with the bundle,
// and this keeps drei from setting up a Draco decoder from a CDN.
const USE_DRACO = false;

/** Loads a meshopt-compressed .glb; suspends until it is ready. */
export const useModel = (url: string) => useGLTF(url, USE_DRACO);

/** Starts a model download with the app instead of when it first renders. */
export const preloadModel = (url: string) => useGLTF.preload(url, USE_DRACO);
