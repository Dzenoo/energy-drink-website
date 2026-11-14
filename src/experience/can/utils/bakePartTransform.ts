import {
  BufferAttribute,
  Matrix4,
  Mesh,
  Vector3,
  type BufferGeometry,
  type InterleavedBufferAttribute,
  type Object3D,
} from 'three';

// Attributes that carry positions and directions; UVs need no transform.
const SPATIAL_ATTRIBUTES = ['position', 'normal'] as const;

const toFloat = (attribute: BufferAttribute | InterleavedBufferAttribute) => {
  const array = new Float32Array(attribute.count * 3);
  const vector = new Vector3();
  for (let index = 0; index < attribute.count; index++) {
    vector.fromBufferAttribute(attribute, index).toArray(array, index * 3);
  }
  return new BufferAttribute(array, 3);
};

const bakeGeometry = (geometry: BufferGeometry, matrix: Matrix4) => {
  for (const name of SPATIAL_ATTRIBUTES) {
    const attribute = geometry.getAttribute(name);
    // A new float attribute per geometry: primitives of one mesh may share the
    // quantized source, which must not be transformed twice.
    if (attribute) geometry.setAttribute(name, toFloat(attribute));
  }
  geometry.applyMatrix4(matrix);
};

/**
 * meshopt quantization stores vertices as small integers and moves the scale and
 * offset that restore them onto the node. This bakes that transform back into the
 * geometry of one model part (Can, Panel, Tab), so its vertices are real scene
 * units relative to the part's parent again, which the condensation shader needs.
 * Running it twice changes nothing, since the second pass finds identity transforms.
 */
export const bakePartTransform = (part: Object3D) => {
  part.updateWorldMatrix(true, true);
  const toParent = part.parent
    ? new Matrix4().copy(part.parent.matrixWorld).invert()
    : new Matrix4();

  part.traverse((object) => {
    if (object instanceof Mesh) {
      bakeGeometry(
        object.geometry,
        new Matrix4().multiplyMatrices(toParent, object.matrixWorld),
      );
    }
  });

  part.traverse((object) => {
    object.position.set(0, 0, 0);
    object.quaternion.identity();
    object.scale.set(1, 1, 1);
    object.updateMatrix();
  });
  part.updateMatrixWorld(true);
};
