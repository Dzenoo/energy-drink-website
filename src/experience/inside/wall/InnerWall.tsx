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

import { DRINK_UNIFORMS } from '@/experience/inside/liquid/helpers/drinkUniforms';
import { LIQUID } from '@/experience/inside/liquid/helpers/liquid';
import { useDrinkOnly } from '@/experience/inside/liquid/useDrinkOnly';
import fragmentShader from '@/shaders/inside/wall/wall.frag.glsl';
import vertexShader from '@/shaders/inside/wall/wall.vert.glsl';

import { WALL } from './helpers/wall';

// The can from the inside. The model is one shell facing out, so from within the
// drink there is no can at all; this is its inner wall and bottom, up to the
// surface: metal that shows through the drink and fades into it with distance.
// It gives the drink a place and a size, and the surface an edge to meet.
const InnerWall: React.FC = () => {
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

  useDrinkOnly(mesh);

  return (
    <mesh ref={mesh} geometry={geometry} material={material} visible={false} />
  );
};

export default InnerWall;
