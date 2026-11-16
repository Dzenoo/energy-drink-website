import { Matrix4, type Mesh, Vector3 } from 'three';

const point = new Vector3();
const toPlaced = new Matrix4();

/**
 * Height (units) to lift a turned and scaled model by so its lowest point
 * touches the floor at y = 0. `meshes` are the model's parts with their world
 * matrices in the model (they carry the meshopt scale), `orientation` is the
 * placement without its position.
 */
export const restOnFloor = (meshes: readonly Mesh[], orientation: Matrix4) => {
  let lowest = Infinity;
  for (const mesh of meshes) {
    toPlaced.multiplyMatrices(orientation, mesh.matrixWorld);
    const position = mesh.geometry.getAttribute('position');
    for (let index = 0; index < position.count; index++) {
      point.fromBufferAttribute(position, index).applyMatrix4(toPlaced);
      lowest = Math.min(lowest, point.y);
    }
  }
  return -lowest;
};
