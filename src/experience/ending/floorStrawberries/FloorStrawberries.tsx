import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  type Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  type MeshStandardMaterial,
  Vector3,
} from 'three';

import {
  PIECES,
  STRAWBERRY_MODEL_URL,
} from '@/experience/inside/strawberries/helpers/pieces';
import { useModel } from '@/experience/shared/model/useModel';

import { useEndingOnly } from '../cut/useEndingOnly';
import { useOwnEnvironment } from '../environment/useOwnEnvironment';
import {
  type BerryPart,
  createFloorBerryMaterial,
} from './helpers/createFloorBerryMaterial';
import { type FloorNode, FLOOR_PIECES } from './helpers/floorLayout';
import { restOnFloor } from './helpers/restOnFloor';

/** Model types on the floor, and where the whole fruit's axis passes through each (x, z in model units). */
const TYPES: readonly {
  node: FloorNode;
  axis: readonly [number, number];
}[] = [...PIECES, { node: 'StrawberryWhole', axis: [0, 0] }];

/** Material names given in Blender, and the part each one is; everything else is skin. */
const PART_BY_MATERIAL: Partial<Record<string, BerryPart>> = {
  Flesh: 'flesh',
  Leaf: 'leaf',
};

const partOf = (mesh: Mesh): BerryPart =>
  (!Array.isArray(mesh.material) && PART_BY_MATERIAL[mesh.material.name]) ||
  'skin';

// The strawberries strewn over the floor of the end: whole fruit and cut pieces
// in a band across the bottom of the shot, dim in the dark until the light that
// follows the pointer finds them. One instanced mesh per model part, so all of
// them take 8 draw calls however many there are.
const FloorStrawberries: React.FC = () => {
  const { nodes } = useModel(STRAWBERRY_MODEL_URL);
  const group = useRef<Group>(null);

  const { batches, materials } = useMemo(() => {
    const orientation = new Matrix4();
    const size = new Vector3();
    const instanceMatrix = new Matrix4();
    const materials: MeshStandardMaterial[] = [];

    const batches = TYPES.flatMap(({ node, axis }) => {
      const model = nodes[node];
      if (!model) {
        throw new Error(`Node "${node}" is missing in ${STRAWBERRY_MODEL_URL}`);
      }
      const pieces = FLOOR_PIECES.filter((piece) => piece.node === node);
      if (pieces.length === 0) return [];

      // A model is a group with one mesh per part; their matrices hold the
      // meshopt dequantization scale, so each placement is applied on top of them.
      model.updateMatrixWorld(true);
      const meshes: Mesh[] = [];
      model.traverse((object) => {
        if (object instanceof Mesh) meshes.push(object);
      });

      // Each piece turned and scaled, then lifted so it rests on the floor.
      const placements = pieces.map(({ place, rotation, scale }) => {
        size.setScalar(scale);
        orientation.makeRotationFromQuaternion(rotation).scale(size);
        const height = restOnFloor(meshes, orientation);
        return new Matrix4().compose(
          new Vector3(place.x, height, place.y),
          rotation,
          size,
        );
      });

      return meshes.map((mesh) => {
        const material = createFloorBerryMaterial(partOf(mesh), axis);
        materials.push(material);

        const batch = new InstancedMesh(
          mesh.geometry,
          material,
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

    return { batches, materials };
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

  useEndingOnly(group);
  useOwnEnvironment(materials);

  return (
    <group ref={group} visible={false}>
      {batches.map((batch) => (
        <primitive key={batch.uuid} object={batch} />
      ))}
    </group>
  );
};

export default FloorStrawberries;
