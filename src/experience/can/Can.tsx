import { useLayoutEffect } from 'react';
import { Mesh, MeshNormalMaterial } from 'three';

import { preloadModel, useModel } from '@/experience/shared/model/useModel';

// Slim 250 ml can from Blender, meshopt-compressed. Scene units: 1 unit = 10 cm,
// base at y = 0, opening toward +z. The moving parts hang under empties that keep
// their pivots through quantization: TabPivot sits on the rivet, PanelPivot on the
// hinge at the back of the opening.
const MODEL_URL = '/models/can.glb';

// Normal colors need no lights, which do not exist yet; real materials come in phase 2.
const placeholderMaterial = new MeshNormalMaterial();

const Can: React.FC = () => {
  const { scene } = useModel(MODEL_URL);

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) object.material = placeholderMaterial;
    });
  }, [scene]);

  return <primitive object={scene} />;
};

preloadModel(MODEL_URL);

export default Can;
