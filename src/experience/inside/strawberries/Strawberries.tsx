import { useMemo } from 'react';
import { InstancedMesh, Matrix4, Mesh, MeshNormalMaterial } from 'three';

import { preloadModel, useModel } from '@/experience/shared/model/useModel';

import { createLayout } from './utils/layout';

const MODEL_URL = '/models/strawberry.glb';

/** Piece types (node names in the model) and how many of each float in the drink. */
const PIECES = [
  { node: 'StrawberryHalf', count: 4 },
  { node: 'StrawberryQuarter', count: 5 },
  { node: 'StrawberrySlice', count: 6 },
] as const;

// Normal colors need no lights; the real skin and flesh materials come in phase 4.
const placeholderMaterial = new MeshNormalMaterial();

const Strawberries: React.FC = () => {
  const { nodes } = useModel(MODEL_URL);

  // One instanced mesh per piece type and material (skin, flesh): every piece of
  // the drink takes 6 draw calls in total, however many pieces there are.
  const batches = useMemo(() => {
    const layout = createLayout(PIECES.map(({ count }) => count));
    const instanceMatrix = new Matrix4();

    return PIECES.flatMap(({ node }, index) => {
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
        const batch = new InstancedMesh(
          mesh.geometry,
          placeholderMaterial,
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

  return (
    <>
      {batches.map((batch) => (
        <primitive key={batch.uuid} object={batch} />
      ))}
    </>
  );
};

preloadModel(MODEL_URL);

export default Strawberries;
