import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { Mesh, MeshStandardMaterial, SRGBColorSpace } from 'three';

import { preloadModel, useModel } from '@/experience/shared/model/useModel';

// Slim 250 ml can from Blender, meshopt-compressed. Scene units: 1 unit = 10 cm,
// base at y = 0, opening toward +z. The moving parts hang under empties that keep
// their pivots through quantization: TabPivot sits on the rivet, PanelPivot on the
// hinge at the back of the opening.
const MODEL_URL = '/models/can.glb';

// Wraps the can body once: the left and right edges meet at the seam on the back.
// The background was generated with ChatGPT (OpenAI) and tiles horizontally.
const LABEL_URL = '/textures/label/label.webp';

/** Texture filtering at grazing angles, where the label curves away from the camera; 8 is sharp enough. */
const LABEL_ANISOTROPY = 8;

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
// with soft panel highlights under the varnish.
const labelMaterial = new MeshStandardMaterial({
  name: 'Label',
  metalness: 0.5,
  roughness: 0.33,
  // The dark studio barely lights a printed surface, so the label image also
  // glows weakly: the print stays readable without looking like a screen.
  emissive: '#ffffff',
  emissiveIntensity: 0.35,
});

const Can: React.FC = () => {
  const { scene } = useModel(MODEL_URL);
  const label = useTexture(LABEL_URL);
  const maxAnisotropy = useThree((state) =>
    state.gl.capabilities.getMaxAnisotropy(),
  );

  useLayoutEffect(() => {
    // glTF UVs expect textures that are not flipped; the image holds sRGB colors.
    label.flipY = false;
    label.colorSpace = SRGBColorSpace;
    label.anisotropy = Math.min(LABEL_ANISOTROPY, maxAnisotropy);
    label.needsUpdate = true;
    labelMaterial.map = label;
    labelMaterial.emissiveMap = label;
    // Adding maps changes the shader, so the material has to be rebuilt once.
    labelMaterial.needsUpdate = true;
  }, [label, maxAnisotropy]);

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
useTexture.preload(LABEL_URL);

export default Can;
