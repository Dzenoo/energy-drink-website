import { useGLTF } from '@react-three/drei';
import { useLayoutEffect } from 'react';
import { Mesh, MeshNormalMaterial } from 'three';

// Slim 250 ml can from Blender, meshopt-compressed. Scene units: 1 unit = 10 cm,
// base at y = 0, opening toward +z. The moving parts hang under empties that keep
// their pivots through quantization: TabPivot sits on the rivet, PanelPivot on the
// hinge at the back of the opening.
const MODEL_URL = '/models/can.glb';

/** Draco is off: the model uses meshopt, and this keeps drei from setting up a CDN decoder. */
const USE_DRACO = false;

// Normal colors need no lights, which do not exist yet; real materials come in phase 2.
const placeholderMaterial = new MeshNormalMaterial();

const Can: React.FC = () => {
  const { scene } = useGLTF(MODEL_URL, USE_DRACO);

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) object.material = placeholderMaterial;
    });
  }, [scene]);

  return <primitive object={scene} />;
};

// Starts the download with the app instead of when the can first renders.
useGLTF.preload(MODEL_URL, USE_DRACO);

export default Can;
