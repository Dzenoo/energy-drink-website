import { useRef } from 'react';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';

import { MOTION } from '@/store/motion/motion';
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
  /** With reduced motion: time (s) the picture takes to dip out, and to come back at the new station. */
  dipOut: 0.25,
  dipIn: 0.4,
};

const lookTarget = new Vector3();

// Flies the camera along the station curve. The position on the curve springs
// toward the current station, so the camera glides between stations instead of
// jumping. With reduced motion there is no flight: the picture dips out, the
// camera jumps to the station, and the picture comes back. It also fits the
// lens to the screen's shape (helpers/framing.ts).
const CameraRig: React.FC = () => {
  // Last lens written, so the projection is rebuilt only when something changed.
  const lens = useRef({ fov: 0, lift: Number.NaN, width: 0, height: 0 });

  useFrame(({ camera, size }, delta) => {
    const { station } = useScrollStore.getState();

    if (MOTION.reduced && SCROLL.progress !== station) {
      // Away from the station: dip out, and jump once nothing shows. A new
      // station picked while coming back dips out again from where it is.
      SCROLL.dip = Math.min(SCROLL.dip + delta / CAMERA_RIG.dipOut, 1);
      if (SCROLL.dip === 1) SCROLL.progress = station;
    } else {
      if (!MOTION.reduced) {
        damp(SCROLL, 'progress', station, CAMERA_RIG.smoothTime, delta);
      }
      SCROLL.dip = Math.max(SCROLL.dip - delta / CAMERA_RIG.dipIn, 0);
    }

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
