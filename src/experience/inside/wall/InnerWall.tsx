import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  DoubleSide,
  LatheGeometry,
  type Mesh,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';

import { DRINK_UNIFORMS } from '@/experience/inside/liquid/utils/drinkUniforms';
import { LIQUID } from '@/experience/inside/liquid/utils/liquid';
import fragmentShader from '@/shaders/inside/wall/wall.frag.glsl';
import vertexShader from '@/shaders/inside/wall/wall.vert.glsl';

import { WALL } from './utils/wall';

// The can from the inside. The model is one shell facing out, so from within the
// drink there is no can at all; this is its inner wall and bottom, up to the
// surface: metal that shows through the drink and fades into it with distance.
// It gives the drink a place and a size, and the surface an edge to meet.
const InnerWall: React.FC = () => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const mesh = useRef<Mesh>(null);

  const { geometry, material } = useMemo(() => {
    // Profile turned around the can's axis: bottom, rounded edge, wall.
    const geometry = new LatheGeometry(
      [
        new Vector2(0, 0),
        new Vector2(WALL.radius - WALL.bevel, 0),
        new Vector2(WALL.radius, WALL.bevel),
        new Vector2(WALL.radius, LIQUID.height),
      ],
      WALL.segments,
    );
    const [openingX, openingZ] = LIQUID.openingCenter;
    const uniforms = {
      // The drink's colors and fog, shared with the backdrop and the surface.
      ...DRINK_UNIFORMS,
      uWallColor: { value: new Color(WALL.color) },
      uWallAmbient: { value: WALL.ambient },
      uWallLightDepth: { value: WALL.lightDepth },
      uWallLight: {
        value: new Vector3(openingX, LIQUID.lidHeight, openingZ),
      },
      uWallGlint: { value: new Color(WALL.glint) },
      uWallGlintStrength: { value: WALL.glintStrength },
      uWallGloss: { value: WALL.gloss },
    };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      // Only ever seen from inside; both sides, so the lathe's winding does not matter.
      side: DoubleSide,
    });
    return { geometry, material };
  }, []);

  useLayoutEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Hidden in the studio, so its shader would first be built at the moment of
  // the dive and stall it. Built here instead, on load.
  useLayoutEffect(() => {
    const wall = mesh.current;
    if (!wall) return;
    wall.visible = true;
    gl.compile(wall, camera, scene);
    wall.visible = false;
  }, [gl, scene, camera]);

  useFrame(() => {
    // From the studio the can's shell hides it: not drawn at all.
    if (mesh.current)
      mesh.current.visible = DRINK_UNIFORMS.uDrinkUnder.value > 0;
  });

  return (
    <mesh ref={mesh} geometry={geometry} material={material} visible={false} />
  );
};

export default InnerWall;
