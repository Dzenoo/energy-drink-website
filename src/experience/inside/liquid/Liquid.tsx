import LiquidSurface from './LiquidSurface';
import Underwater from './Underwater';

// The drink in the can: its surface, and the color and fog under it.
const Liquid: React.FC = () => (
  <>
    <LiquidSurface />
    <Underwater />
  </>
);

export default Liquid;
