import type { PropsWithChildren } from 'react';

import { useIntroStore } from '@/store/intro/intro';

import './IntroReveal.css';

// Holds the page around the scene back until the can has arrived in the opening
// animation, then fades it in. Its children are fixed to the screen, so this
// wrapper adds no box of its own to the layout.
const IntroReveal: React.FC<PropsWithChildren> = ({ children }) => {
  const landed = useIntroStore((state) => state.landed);

  return (
    <div className="intro-reveal" data-landed={landed}>
      {children}
    </div>
  );
};

export default IntroReveal;
