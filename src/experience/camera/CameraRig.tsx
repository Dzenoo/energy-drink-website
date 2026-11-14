import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { Vector3 } from 'three';

import { SCROLL, useScrollStore } from '@/store/scroll/scroll';

import { POSITION_CURVE, progressToCurveT, TARGET_CURVE } from './utils/curve';

const CAMERA_RIG = {
  /** Spring time (s) to roughly reach the next station; longer feels heavier and smoother. */
  smoothTime: 0.6,
};

const lookTarget = new Vector3();

// Flies the camera along the station curve. The position on the curve springs
// toward the current station, so the camera glides between stations instead of jumping.
const CameraRig: React.FC = () => {
  useFrame(({ camera }, delta) => {
    const { station } = useScrollStore.getState();
    damp(SCROLL, 'progress', station, CAMERA_RIG.smoothTime, delta);

    const t = progressToCurveT(SCROLL.progress);
    POSITION_CURVE.getPoint(t, camera.position);
    camera.lookAt(TARGET_CURVE.getPoint(t, lookTarget));
  });

  return null;
};

export default CameraRig;
