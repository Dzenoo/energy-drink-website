import { STATIONS } from '@/content/stations';
import { useScrollStore } from '@/store/scroll/scroll';

import './Stations.css';

// Every station stays in the DOM, so the text is readable and indexable;
// only the active one is visible, and the others fade out in place.
const Stations: React.FC = () => {
  const station = useScrollStore((state) => state.station);

  return (
    <main className="stations">
      {STATIONS.map(({ id, title }, index) => (
        <section
          key={id}
          className="station"
          data-active={index === station}
          aria-hidden={index !== station}
        >
          <h2 className="station__title">{title}</h2>
        </section>
      ))}
    </main>
  );
};

export default Stations;
