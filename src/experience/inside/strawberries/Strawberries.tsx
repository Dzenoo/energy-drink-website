import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  DoubleSide,
  type Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  ShaderMaterial,
  Vector2,
} from 'three';

import { useDrinkOnly } from '@/experience/inside/liquid/useDrinkOnly';
import { DRINK_UNIFORMS } from '@/experience/inside/liquid/utils/drinkUniforms';
import { preloadModel, useModel } from '@/experience/shared/model/useModel';
import fragmentShader from '@/shaders/inside/strawberries/strawberry.frag.glsl';
import vertexShader from '@/shaders/inside/strawberries/strawberry.vert.glsl';

import { createLayout } from './utils/layout';
import { STRAWBERRY_UNIFORMS } from './utils/strawberry';

const MODEL_URL = '/models/strawberry.glb';

/** Name the cut faces' material has in the model; everything else is skin. */
const FLESH_MATERIAL = 'Flesh';

/**
 * Piece types (node names in the model), how many of each float in the drink,
 * and where the whole fruit's axis passes through the piece (x, z in model
 * units, measured on the model): the seeds and the core are laid out around it.
 */
const PIECES = [
  { node: 'StrawberryHalf', count: 4, axis: [-0.42, 0] },
  { node: 'StrawberryQuarter', count: 5, axis: [-0.42, 0.42] },
  { node: 'StrawberrySlice', count: 6, axis: [-0.5, 0] },
] as const;

/** The skin or the cut face of one piece type; `flesh` picks the pattern in the shader. */
const createMaterial = (axis: readonly [number, number], flesh: boolean) =>
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      // The drink's light and fog, and the look shared by all pieces.
      ...DRINK_UNIFORMS,
      ...STRAWBERRY_UNIFORMS,
      uBerryAxis: { value: new Vector2(...axis) },
    },
    defines: flesh ? { FLESH: '' } : {},
    // The model's faces are not all wound the same way; the shader turns each to the camera.
    side: DoubleSide,
  });

// Strawberry pieces floating in the drink. No textures and no lights: the skin
// with its seeds, the cut face, and the light from above are all in the shader.
const Strawberries: React.FC = () => {
  const { nodes } = useModel(MODEL_URL);
  const group = useRef<Group>(null);

  // One instanced mesh per piece type and part (skin, cut face): every piece of
  // the drink takes 6 draw calls in total, however many pieces there are.
  const batches = useMemo(() => {
    const layout = createLayout(PIECES.map(({ count }) => count));
    const instanceMatrix = new Matrix4();

    return PIECES.flatMap(({ node, axis }, index) => {
      const piece = nodes[node];
      if (!piece) throw new Error(`Node "${node}" is missing in ${MODEL_URL}`);
      const placements = layout[index] ?? [];

      // A piece is a group with one mesh per material; its matrix holds the
      // meshopt dequantization scale, so each placement is applied on top of it.
      piece.updateMatrixWorld(true);
      const meshes: Mesh[] = [];
      piece.traverse((object) => {
        if (object instanceof Mesh) meshes.push(object);
      });

      return meshes.map((mesh) => {
        const flesh =
          !Array.isArray(mesh.material) &&
          mesh.material.name === FLESH_MATERIAL;
        const batch = new InstancedMesh(
          mesh.geometry,
          createMaterial(axis, flesh),
          placements.length,
        );
        placements.forEach((placement, instance) => {
          batch.setMatrixAt(
            instance,
            instanceMatrix.multiplyMatrices(placement, mesh.matrixWorld),
          );
        });
        // Bounds over all instances, so frustum culling does not drop visible pieces.
        batch.computeBoundingSphere();
        return batch;
      });
    });
  }, [nodes]);

  useLayoutEffect(
    () => () => {
      for (const batch of batches) {
        // The geometry belongs to the cached model; only what was made here is freed.
        if (!Array.isArray(batch.material)) batch.material.dispose();
        batch.dispose();
      }
    },
    [batches],
  );

  useDrinkOnly(group);

  return (
    <group ref={group} visible={false}>
      {batches.map((batch) => (
        <primitive key={batch.uuid} object={batch} />
      ))}
    </group>
  );
};

preloadModel(MODEL_URL);

export default Strawberries;
