import { lazy, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import CameraRig from './camera/CameraRig';
import { FRAMING } from './camera/helpers/framing';

import Can from './can/Can';

import BeforeEnding from './ending/BeforeEnding';
import EndScene from './ending/EndScene';

import Bubbles from './inside/bubbles/Bubbles';
import Caustics from './inside/caustics/Caustics';
import LightRays from './inside/lightRays/LightRays';
import Liquid from './inside/liquid/Liquid';
import Strawberries from './inside/strawberries/Strawberries';
import InnerWall from './inside/wall/InnerWall';

import Intro from './intro/Intro';

import ModelProgress from './loading/ModelProgress';
import SceneReady from './loading/SceneReady';

import Postprocessing from './postprocessing/Postprocessing';

import BackLight from './studio/backLight/BackLight';
import Studio from './studio/Studio';
import { STUDIO } from './studio/helpers/studio';

const SCENE = {
  /** Near plane (units, 1 unit = 10 cm); small because the camera passes through a 2 cm opening. */
  near: 0.01,
  /** Far plane (units). */
  far: 50,
  /** Highest pixel ratio on screens used with a mouse; sharper than 2 costs a lot for little gain. */
  maxDpr: 2,
  /**
   * Highest pixel ratio on touch screens: about 44 % fewer pixels than 2, which
   * the grain and bloom hide on a phone, as headroom for mid-range phones. Set
   * once on load and never changed, so there is no stall from resizing mid-visit.
   */
  maxTouchDpr: 1.5,
};

const isTouchScreen = window.matchMedia('(pointer: coarse)').matches;
/** Pixel ratio range for this device. */
const DPR: [number, number] = [
  1,
  isTouchScreen ? SCENE.maxTouchDpr : SCENE.maxDpr,
];

// Dev-only performance panel. In production the condition is false at build time,
// so the import and the r3f-perf code are left out of the bundle.
const Perf = import.meta.env.DEV
  ? lazy(() => import('r3f-perf').then(({ Perf }) => ({ default: Perf })))
  : null;

const Experience: React.FC = () => (
  <Canvas
    style={{ position: 'fixed', inset: 0 }}
    dpr={DPR}
    // The field of view starts as composed; the camera rig fits it to the screen.
    camera={{ fov: FRAMING.fov, near: SCENE.near, far: SCENE.far }}
    // Tone mapping and antialiasing happen in postprocessing, on the buffer the
    // scene is drawn into, so the renderer does neither itself.
    flat
    gl={{ antialias: false }}
  >
    <color attach="background" args={[STUDIO.background]} />

    <CameraRig />

    <Studio />
    <BackLight />

    <BeforeEnding>
      <Liquid />
      <InnerWall />
      <Caustics />
      <Bubbles />
      <LightRays />

      {/* The loader covers the page until the models have loaded and the first
          frame is drawn; the opening animation starts once it has gone. */}
      <ModelProgress />
      <Suspense fallback={null}>
        <Can />
        <Strawberries />

        <SceneReady />
        <Intro />
      </Suspense>
    </BeforeEnding>

    <EndScene />

    <Postprocessing />

    {Perf && (
      <Suspense fallback={null}>
        <Perf position="top-left" />
      </Suspense>
    )}
  </Canvas>
);

export default Experience;
