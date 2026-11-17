import { useRef } from 'react';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';

import { SCROLL, useScrollStore } from '@/store/scroll/scroll';

import {
  POSITION_CURVE,
  progressToCurveT,
  TARGET_CURVE,
} from './helpers/curve';
import {
  FRAMING,
  liftAt,
  uprightShare,
  VIEW,
  verticalFov,
} from './helpers/framing';

const CAMERA_RIG = {
  /** Spring time (s) to roughly reach the next station; longer feels heavier and smoother. */
  smoothTime: 0.6,
};

const lookTarget = new Vector3();

// Flies the camera along the station curve. The position on the curve springs
// toward the current station, so the camera glides between stations instead of
// jumping. It also fits the lens to the screen's shape (helpers/framing.ts).
const CameraRig: React.FC = () => {
  // Last lens written, so the projection is rebuilt only when something changed.
  const lens = useRef({ fov: 0, lift: Number.NaN, width: 0, height: 0 });

  useFrame(({ camera, size }, delta) => {
    const { station } = useScrollStore.getState();
    damp(SCROLL, 'progress', station, CAMERA_RIG.smoothTime, delta);

    const t = progressToCurveT(SCROLL.progress);
    POSITION_CURVE.getPoint(t, camera.position);
    camera.lookAt(TARGET_CURVE.getPoint(t, lookTarget));

    if (!(camera instanceof PerspectiveCamera)) return;
    const { width, height } = size;
    const aspect = width / height;
    const fov = verticalFov(aspect);
    const lift = liftAt(SCROLL.progress) * uprightShare(aspect);
    VIEW.heightScale =
      Math.tan(MathUtils.degToRad(fov / 2)) /
      Math.tan(MathUtils.degToRad(FRAMING.fov / 2));

    const last = lens.current;
    if (
      fov === last.fov &&
      lift === last.lift &&
      width === last.width &&
      height === last.height
    ) {
      return;
    }
    Object.assign(last, { fov, lift, width, height });

    camera.fov = fov;
    // Lens shift: the camera sees a window moved down by the lift, so the
    // picture moves up without any change in perspective.
    if (lift !== 0) {
      camera.setViewOffset(width, height, 0, lift * height, width, height);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  });

  return null;
};

export default CameraRig;
