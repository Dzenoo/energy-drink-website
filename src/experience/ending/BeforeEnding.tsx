import { type PropsWithChildren, useRef } from 'react';
import type { Group } from 'three';
import { useFrame } from '@react-three/fiber';

import { SCROLL } from '@/store/scroll/scroll';

import { showsEnding } from './cut/helpers/cut';

// Everything of the flight up to the cut: the can, the drink and all in it. Once
// the picture has gone black on the way to the end, it is hidden, so the end
// scene can stand in the same spot, under the same studio light.
const BeforeEnding: React.FC<PropsWithChildren> = ({ children }) => {
  const group = useRef<Group>(null);

  useFrame(() => {
    if (group.current) group.current.visible = !showsEnding(SCROLL.progress);
  });

  return <group ref={group}>{children}</group>;
};

export default BeforeEnding;
