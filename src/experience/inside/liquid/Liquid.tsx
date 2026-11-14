import DrinkBackdrop from './DrinkBackdrop';
import LiquidSurface from './LiquidSurface';
import Underwater from './Underwater';

// The drink in the can: its surface, and the color and fog under it.
const Liquid: React.FC = () => (
  <>
    <Underwater />
    <LiquidSurface />
    <DrinkBackdrop />
  </>
);

export default Liquid;
