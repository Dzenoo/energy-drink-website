import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import { useLoadingStore } from '@/store/loading/loading';

// Tells the loader the scene is ready to be seen. It sits inside the models'
// Suspense, so it mounts once they have loaded. Shaders are built while the
// first frame draws, and frame callbacks run before drawing, so the second
// callback is the first moment that frame is done: no stall is left to show.
const SceneReady: React.FC = () => {
  const frames = useRef(0);

  useFrame(() => {
    if (frames.current >= 2) return;
    frames.current += 1;
    if (frames.current === 2) useLoadingStore.getState().setSceneReady();
  });

  return null;
};

export default SceneReady;
