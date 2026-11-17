import { FRAME } from '@/content/frame';
import { STATIONS } from '@/content/stations';

import { useScrollStore } from '@/store/scroll/scroll';

import './ScrollStatus.css';

/** Station number as two digits, e.g. 01. */
const toNumber = (index: number) => String(index + 1).padStart(2, '0');

// The page frame's bottom bar: which station of how many, and a hint to keep
// scrolling that goes away on the last station, where there is nowhere further.
const ScrollStatus: React.FC = () => {
  const station = useScrollStore((state) => state.station);
  const lastIndex = STATIONS.length - 1;
  const { pointer, touch } = FRAME.scrollHint;

  return (
    <footer className="scroll-status">
      <p className="scroll-status__count">
        <span className="scroll-status__current">{toNumber(station)}</span>
        {' / '}
        {toNumber(lastIndex)}
        <span className="scroll-status__label">{STATIONS[station]?.label}</span>
      </p>

      <p
        className="scroll-status__hint"
        data-hidden={station === lastIndex}
        aria-hidden="true"
      >
        <span className="scroll-status__hint-pointer">{pointer}</span>
        <span className="scroll-status__hint-touch">{touch}</span>
        <span className="scroll-status__arrow" />
      </p>
    </footer>
  );
};

export default ScrollStatus;
