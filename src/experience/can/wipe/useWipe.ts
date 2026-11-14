import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  HalfFloatType,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  type Texture,
} from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

import fragmentShader from '@/shaders/can/wipe/wipe.frag.glsl';
import vertexShader from '@/shaders/can/wipe/wipe.vert.glsl';
import { useScrollStore } from '@/store/scroll/scroll';
import { WIPE_INPUT } from '@/store/wipe/wipe';

import { CONDENSATION_UNIFORMS } from '../condensation/utils/condensation';

const WIPE = {
  /** Wipe map size (px); the wipe is soft, so a small map covering the screen is enough. */
  mapSize: 256,
  /** Station where a touch on the can wipes; elsewhere every swipe scrolls. */
  touchStation: 0,
  /** Brush radius (fraction of the screen height); broad, like a palm. */
  radius: 0.15,
  /** Soft edge of the brush (fraction of the radius). */
  softness: 0.5,
  /** Seconds until the mist is back; short, so the wipe follows the hand like a glow. */
  recovery: 0.5,
};

type Brush = {
  /** Where this frame's stroke starts (screen uv), or null when the pointer is off the can. */
  from: Vector2 | null;
  /** Where the pointer is now (screen uv). */
  to: Vector2;
  /** The pointer moved over the can since the last frame. */
  moved: boolean;
  /** Time of the last stroke (s); after a full recovery the map is all zero and the pass can rest. */
  lastStroke: number;
  /** Clock of the wipe (s). */
  time: number;
};

const toScreenUv = (pointer: Vector2, target: Vector2) =>
  target.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5);

// Wiping the mist off the can by hand. A small map covering the screen remembers
// where the pointer passed; each frame it recovers a little and the new stroke is
// drawn on top, by rendering back and forth between two targets. Condensation
// reads the map and clears mist and drops where it is wiped.
// Returns the pointer handlers for the can.
export const useWipe = () => {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);

  const pass = useMemo(() => {
    // Half floats: with 8 bits a slow recovery rounds back to the same value and never ends.
    const targetOptions = { type: HalfFloatType, depthBuffer: false };
    const uniforms = {
      uPrevious: { value: null as Texture | null },
      uFade: { value: 0 },
      uFrom: { value: new Vector2() },
      uTo: { value: new Vector2() },
      uRadius: { value: WIPE.radius },
      uSoftness: { value: WIPE.softness },
      uAspect: { value: 1 },
      uActive: { value: 0 },
    };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    return {
      uniforms,
      material,
      quad: new FullScreenQuad(material),
      /** Holds the current map. */
      read: new WebGLRenderTarget(WIPE.mapSize, WIPE.mapSize, targetOptions),
      /** Receives the next map; the two swap every pass. */
      write: new WebGLRenderTarget(WIPE.mapSize, WIPE.mapSize, targetOptions),
    };
  }, []);

  const brush = useRef<Brush>({
    from: null,
    to: new Vector2(),
    moved: false,
    lastStroke: -Infinity,
    time: 0,
  });

  useEffect(() => {
    // Render targets start with undefined content; both must start fully misted.
    for (const target of [pass.read, pass.write]) {
      gl.setRenderTarget(target);
      gl.clear();
    }
    gl.setRenderTarget(null);
    CONDENSATION_UNIFORMS.uWipeMap.value = pass.read.texture;

    return () => {
      CONDENSATION_UNIFORMS.uWipeMap.value = null;
      pass.read.dispose();
      pass.write.dispose();
      pass.quad.dispose();
      pass.material.dispose();
    };
  }, [gl, pass]);

  // Keeps the brush round when the screen changes shape.
  useEffect(() => {
    pass.uniforms.uAspect.value = size.width / size.height;
  }, [pass, size]);

  useFrame((_, delta) => {
    const state = brush.current;
    state.time += delta;
    // Nothing to draw and everything recovered: the map is all zero, so skip the pass.
    if (!state.moved && state.time - state.lastStroke > WIPE.recovery) return;

    const { uniforms } = pass;
    uniforms.uPrevious.value = pass.read.texture;
    uniforms.uFade.value = delta / WIPE.recovery;
    uniforms.uActive.value = state.moved ? 1 : 0;
    uniforms.uFrom.value.copy(state.from ?? state.to);
    uniforms.uTo.value.copy(state.to);

    gl.setRenderTarget(pass.write);
    pass.quad.render(gl);
    gl.setRenderTarget(null);

    [pass.read, pass.write] = [pass.write, pass.read];
    CONDENSATION_UNIFORMS.uWipeMap.value = pass.read.texture;

    if (state.moved) {
      state.lastStroke = state.time;
      state.from = state.to.clone();
      state.moved = false;
    }
  });

  return useMemo(() => {
    const canWipe = (event: ThreeEvent<PointerEvent>) =>
      event.pointerType !== 'touch' || WIPE_INPUT.touchOnCan;

    return {
      onPointerDown: (event: ThreeEvent<PointerEvent>) => {
        if (
          event.pointerType === 'touch' &&
          useScrollStore.getState().station === WIPE.touchStation
        ) {
          WIPE_INPUT.touchOnCan = true;
        }
      },
      onPointerMove: (event: ThreeEvent<PointerEvent>) => {
        if (!canWipe(event)) return;
        const state = brush.current;
        toScreenUv(event.pointer, state.to);
        // The first point after entering the can starts a new stroke instead of joining the old one.
        if (!state.from) state.from = state.to.clone();
        state.moved = true;
      },
      onPointerOut: () => {
        brush.current.from = null;
      },
    };
  }, []);
};
