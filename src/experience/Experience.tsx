import { Canvas } from '@react-three/fiber';
import { lazy, Suspense } from 'react';

import CameraRig from './camera/CameraRig';
import Can from './can/Can';
import Liquid from './inside/liquid/Liquid';
import Strawberries from './inside/strawberries/Strawberries';
import Studio from './studio/Studio';

const SCENE = {
  /** Dark studio backdrop. */
  background: '#050608',
  /** Vertical field of view (degrees). */
  fov: 35,
  /** Near plane (units, 1 unit = 10 cm); small because the camera passes through a 2 cm opening. */
  near: 0.01,
  /** Far plane (units). */
  far: 50,
  /** Pixel ratio range; capped at 2, since sharper costs a lot on phones for little gain. */
  dpr: [1, 2] as [number, number],
};

// Dev-only performance panel. In production the condition is false at build time,
// so the import and the r3f-perf code are left out of the bundle.
const Perf = import.meta.env.DEV
  ? lazy(() => import('r3f-perf').then(({ Perf }) => ({ default: Perf })))
  : null;

const Experience: React.FC = () => (
  <Canvas
    style={{ position: 'fixed', inset: 0 }}
    dpr={SCENE.dpr}
    camera={{ fov: SCENE.fov, near: SCENE.near, far: SCENE.far }}
  >
    <color attach="background" args={[SCENE.background]} />
    <CameraRig />
    <Studio />
    <Liquid />
    {/* The loader comes in phase 5; until then the can simply appears once loaded. */}
    <Suspense fallback={null}>
      <Can />
      <Strawberries />
    </Suspense>
    {Perf && (
      <Suspense fallback={null}>
        <Perf position="top-left" />
      </Suspense>
    )}
  </Canvas>
);

export default Experience;
