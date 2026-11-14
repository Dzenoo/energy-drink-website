import { Lightformer } from '@react-three/drei';
import { MathUtils } from 'three';

/** Distance of every panel from the environment's center (units); only the angle and size matter for reflections. */
const PANEL_DISTANCE = 5;

export type StudioPanelProps = {
  /** Angle around the can (degrees); 0 is the camera side, positive goes to the right. */
  azimuth: number;
  /** Angle above the horizon (degrees). */
  elevation: number;
  /** Panel width (units at PANEL_DISTANCE). */
  width: number;
  /** Panel length, vertical for side panels (units at PANEL_DISTANCE). */
  length: number;
  /** Brightness; above 1 it reads as a light source in reflections. */
  intensity: number;
  color: string;
};

// One soft rectangular light in the studio, placed on a sphere around the can
// and turned to face it.
const StudioPanel: React.FC<StudioPanelProps> = ({
  azimuth,
  elevation,
  width,
  length,
  intensity,
  color,
}) => {
  const theta = MathUtils.degToRad(azimuth);
  const phi = MathUtils.degToRad(elevation);

  return (
    <Lightformer
      form="rect"
      position={[
        PANEL_DISTANCE * Math.cos(phi) * Math.sin(theta),
        PANEL_DISTANCE * Math.sin(phi),
        PANEL_DISTANCE * Math.cos(phi) * Math.cos(theta),
      ]}
      target={[0, 0, 0]}
      scale={[width, length]}
      intensity={intensity}
      color={color}
    />
  );
};

export default StudioPanel;
