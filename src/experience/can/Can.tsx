// Placeholder for the Blender model: a slim 250 ml can at real size.
// Scene units: 1 unit = 10 cm. The can stands on the origin, base at y = 0.
const CAN = {
  /** Radius (units); 0.265 = 26.5 mm. */
  radius: 0.265,
  /** Height (units); 1.34 = 134 mm. */
  height: 1.34,
  /** Segments around the side; enough for a smooth silhouette up close. */
  radialSegments: 48,
};

const Can: React.FC = () => (
  <mesh position-y={CAN.height / 2}>
    <cylinderGeometry
      args={[CAN.radius, CAN.radius, CAN.height, CAN.radialSegments]}
    />
    {/* Normal colors need no lights, which do not exist yet. */}
    <meshNormalMaterial />
  </mesh>
);

export default Can;
