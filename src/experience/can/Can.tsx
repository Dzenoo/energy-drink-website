import { useLayoutEffect } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';

import { preloadModel, useModel } from '@/experience/shared/model/useModel';

import { addCondensation } from './condensation/helpers/condensation';
import { useCondensation } from './condensation/useCondensation';
import { bakePartTransform } from './helpers/bakePartTransform';
import { addLabel } from './label/helpers/label';
import { useLabelText } from './label/useLabelText';
import { useOpening } from './opening/useOpening';
import { useSpin } from './spin/useSpin';
import { useWipe } from './wipe/useWipe';

// Slim 250 ml can from Blender, meshopt-compressed. Scene units: 1 unit = 10 cm,
// base at y = 0, opening toward +z. The moving parts hang under empties that keep
// their pivots through quantization: TabPivot sits on the rivet, PanelPivot on the
// hinge at the back of the opening.
const MODEL_URL = '/models/can.glb';

/** Model parts whose quantization transform is baked back, so condensation sees real units. */
const PARTS = ['Can', 'Panel', 'Tab'];

// Materials are matched to the model by the names given in Blender. They keep
// those names, so matching again (React runs effects twice in development) still works.
const metalMaterial = new MeshStandardMaterial({
  name: 'Metal',
  // Cool aluminium; the studio panels give it its highlights.
  color: '#d4d8dd',
  metalness: 1,
  roughness: 0.3,
});
// Ink printed on aluminium: half metal, so the can still shines through the print,
// with soft panel highlights under the varnish. The colors come from the label shader.
const labelMaterial = new MeshStandardMaterial({
  name: 'Label',
  metalness: 0.5,
  roughness: 0.33,
  // The dark studio barely lights a printed surface, so the label also glows
  // weakly in its own colors: readable without looking like a screen.
  emissive: '#ffffff',
  emissiveIntensity: 0.35,
});

addLabel(labelMaterial);
// The whole can is cold and covered in drops: metal and label alike.
addCondensation(metalMaterial);
addCondensation(labelMaterial);

const Can: React.FC = () => {
  const { scene } = useModel(MODEL_URL);

  useLabelText();
  useCondensation();
  useOpening(scene);
  useSpin(scene);
  const wipeHandlers = useWipe();

  useLayoutEffect(() => {
    for (const name of PARTS) {
      const part = scene.getObjectByName(name);
      if (!part) throw new Error(`Part "${name}" is missing in ${MODEL_URL}`);
      bakePartTransform(part);
    }

    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.material =
        object.material.name === labelMaterial.name
          ? labelMaterial
          : metalMaterial;
    });
  }, [scene]);

  return <primitive object={scene} {...wipeHandlers} />;
};

preloadModel(MODEL_URL);

export default Can;
