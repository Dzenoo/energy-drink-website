import { Environment } from '@react-three/drei';

import StudioPanel, { type StudioPanelProps } from './StudioPanel';

/** Cube map size (px per face); the panels are soft, so more would only cost memory. */
const ENVIRONMENT_RESOLUTION = 256;

const PANELS: StudioPanelProps[] = [
  // Key: narrow, strong, cold strip on the right; draws the long highlight down the can.
  {
    azimuth: 55,
    elevation: 10,
    width: 0.5,
    length: 8,
    intensity: 4,
    color: '#dce8ff',
  },
  // Fill: narrow strip on the left; a second, softer line, so the shadow side keeps its shape.
  {
    azimuth: -65,
    elevation: 15,
    width: 0.9,
    length: 6,
    intensity: 1.5,
    color: '#ffffff',
  },
  // Top: broad softbox high on the left, behind the camera's view of the lid, so the flat lid reflects it.
  {
    azimuth: -90,
    elevation: 60,
    width: 6,
    length: 4,
    intensity: 1.2,
    color: '#ffffff',
  },
  // Rim: thin strip behind; separates the can's edge from the dark background.
  {
    azimuth: 150,
    elevation: 5,
    width: 0.6,
    length: 8,
    intensity: 2,
    color: '#cfe0ff',
  },
];

// The studio has no HDRI file: a few soft panels are rendered once into a small
// cube map, and the metal reflects them.
const Studio: React.FC = () => (
  <Environment frames={1} resolution={ENVIRONMENT_RESOLUTION}>
    {PANELS.map((panel, index) => (
      <StudioPanel key={index} {...panel} />
    ))}
  </Environment>
);

export default Studio;
