import { Suspense } from 'react';

import Floor from './Floor';
import FloorStrawberries from './FloorStrawberries';
import PointerLight from './PointerLight';

// What comes up out of the dark at the end: strawberries strewn across the
// studio floor, dim until the light that follows the pointer finds them. It
// stands where the can stood, and the dark above it is left for the text.
const EndScene: React.FC = () => (
  <>
    {/* Outside the Suspense: the light must be in the scene before any lit material is first drawn. */}
    <PointerLight />
    <Floor />
    <Suspense fallback={null}>
      <FloorStrawberries />
    </Suspense>
  </>
);

export default EndScene;
