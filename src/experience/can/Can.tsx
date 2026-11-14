import { useLayoutEffect } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';

import { preloadModel, useModel } from '@/experience/shared/model/useModel';

// Slim 250 ml can from Blender, meshopt-compressed. Scene units: 1 unit = 10 cm,
// base at y = 0, opening toward +z. The moving parts hang under empties that keep
// their pivots through quantization: TabPivot sits on the rivet, PanelPivot on the
// hinge at the back of the opening.
const MODEL_URL = '/models/can.glb';

// Materials are matched to the model by the names given in Blender. They keep
// those names, so matching again (React runs effects twice in development) still works.
const metalMaterial = new MeshStandardMaterial({
  name: 'Metal',
  // Cool aluminium; the studio panels give it its highlights.
  color: '#d4d8dd',
  metalness: 1,
  roughness: 0.3,
});
// Flat color until the label texture exists; low roughness keeps the panel highlights sharp.
const labelMaterial = new MeshStandardMaterial({
  name: 'Label',
  color: '#9e1b32',
  metalness: 0.5,
  roughness: 0.2,
});

const Can: React.FC = () => {
  const { scene } = useModel(MODEL_URL);

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.material =
        object.material.name === labelMaterial.name
          ? labelMaterial
          : metalMaterial;
    });
  }, [scene]);

  return <primitive object={scene} />;
};

preloadModel(MODEL_URL);

export default Can;
