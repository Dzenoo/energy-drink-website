import { useEffect, useMemo, useRef } from 'react';
import {
  MathUtils,
  Plane,
  type PointLight,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';
import { useFrame } from '@react-three/fiber';
import { damp3 } from 'maath/easing';

import { SCROLL } from '@/store/scroll/scroll';

import { showsEnding } from '../cut/helpers/cut';

import { FLOOR_LAYOUT } from '../floorStrawberries/helpers/floorLayout';

import { POINTER_LIGHT } from './helpers/pointerLight';

/** The floor, and an upright wall at the back of the band for pointers above the horizon. */
const FLOOR_PLANE = new Plane(new Vector3(0, 1, 0), 0);
const BACK_PLANE = new Plane(new Vector3(0, 0, 1), -FLOOR_LAYOUT.back);

/** Middle of the band, front to back (z, units). */
const BAND_MIDDLE = (FLOOR_LAYOUT.front + FLOOR_LAYOUT.back) / 2;
const BAND_HALF_DEPTH = (FLOOR_LAYOUT.front - FLOOR_LAYOUT.back) / 2;

type Pointer = {
  /** A mouse over the page, or a finger on the screen. */
  active: boolean;
  /** Where it is (normalized device coordinates, -1 to 1). */
  screen: Vector2;
};

// A soft light over the strawberries of the end that follows the pointer: on
// the dark floor it shows only the few strawberries under it. It is in the
// scene from the start with no brightness: a light added later would make
// three.js rebuild the shader of every lit material, the can's included.
const PointerLight: React.FC = () => {
  const light = useRef<PointLight>(null);
  const pointer = useRef<Pointer>({ active: false, screen: new Vector2() });
  const work = useMemo(
    () => ({
      raycaster: new Raycaster(),
      hit: new Vector3(),
      target: new Vector3(0, POINTER_LIGHT.height, BAND_MIDDLE),
      time: 0,
    }),
    [],
  );

  // The canvas fills the window, so window coordinates map straight to the screen.
  useEffect(() => {
    const state = pointer.current;
    const move = (event: PointerEvent) => {
      state.screen.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
      // A finger only moves while it touches; a mouse counts as soon as it moves.
      if (event.pointerType === 'mouse') state.active = true;
    };
    const down = (event: PointerEvent) => {
      move(event);
      state.active = true;
    };
    const up = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') state.active = false;
    };
    const leave = () => {
      state.active = false;
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    const lamp = light.current;
    if (!lamp) return;

    // Dark, and nothing to follow, until the end scene shows.
    const shown = showsEnding(SCROLL.progress);
    lamp.intensity = shown ? POINTER_LIGHT.intensity : 0;
    if (!shown) return;

    work.time += delta;
    const { hit, raycaster, target } = work;

    if (pointer.current.active) {
      raycaster.setFromCamera(pointer.current.screen, camera);
      // Above the horizon the ray never meets the floor: the back of the band stands in.
      if (!raycaster.ray.intersectPlane(FLOOR_PLANE, hit)) {
        raycaster.ray.intersectPlane(BACK_PLANE, hit);
      }
    } else {
      const angle = work.time * POINTER_LIGHT.wanderSpeed;
      hit.set(
        Math.sin(angle) * FLOOR_LAYOUT.halfWidth * POINTER_LIGHT.wanderWidth,
        0,
        BAND_MIDDLE +
          Math.sin(angle * 0.7) * BAND_HALF_DEPTH * POINTER_LIGHT.wanderDepth,
      );
    }

    // Always over the band, however far off the pointer is.
    target.set(
      MathUtils.clamp(hit.x, -FLOOR_LAYOUT.halfWidth, FLOOR_LAYOUT.halfWidth),
      POINTER_LIGHT.height,
      MathUtils.clamp(hit.z, FLOOR_LAYOUT.back, FLOOR_LAYOUT.front),
    );
    damp3(lamp.position, target, POINTER_LIGHT.smoothTime, delta);
  });

  return (
    <pointLight
      ref={light}
      intensity={0}
      color={POINTER_LIGHT.color}
      distance={POINTER_LIGHT.distance}
      position={[0, POINTER_LIGHT.height, BAND_MIDDLE]}
    />
  );
};

export default PointerLight;
