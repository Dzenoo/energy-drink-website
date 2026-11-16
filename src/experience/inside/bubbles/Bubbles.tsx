import BubbleCloud from './BubbleCloud';

import { FIZZ, PLUNGE } from './helpers/bubbles';

// All the bubbles in the drink: the fizz rising through all of it, and the mist
// of the plunge under the opening.
const Bubbles: React.FC = () => (
  <>
    <BubbleCloud settings={FIZZ} />
    <BubbleCloud settings={PLUNGE} />
  </>
);

export default Bubbles;
