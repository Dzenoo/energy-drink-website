import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';

import { useLoadingStore } from '@/store/loading/loading';

// Reports how much of the models has loaded to the loader. It sits outside the
// models' Suspense, so it runs while they load. drei's useProgress follows
// three.js's default loading manager, which the model loader uses.
const ModelProgress: React.FC = () => {
  const progress = useProgress((state) => state.progress);

  useEffect(() => {
    useLoadingStore.getState().setModels(progress / 100);
  }, [progress]);

  return null;
};

export default ModelProgress;
