import { BRAND } from '@/content/brand';
import { STATIONS, type StationDetails } from '@/content/stations';

import { useScrollStore } from '@/store/scroll/scroll';

import Flavour from './flavour/Flavour';

import Nutrition from './nutrition/Nutrition';

import Stats from './stats/Stats';

import Steps from './steps/Steps';

import { useStationFade } from './useStationFade';

import './Stations.css';

/** The second column of a station, by what it shows. */
const Details: React.FC<{ details: StationDetails }> = ({ details }) => {
  switch (details.kind) {
    case 'stats':
      return <Stats items={details.items} />;
    case 'steps':
      return <Steps items={details.items} />;
    case 'flavour':
      return <Flavour {...details} />;
    case 'nutrition':
      return <Nutrition {...details} />;
  }
};

// Every station stays in the DOM, so the text is readable and indexable; how
// much of each shows follows the camera (useStationFade).
const Stations: React.FC = () => {
  const station = useScrollStore((state) => state.station);
  const goTo = useScrollStore((state) => state.goTo);
  const sections = useStationFade(STATIONS.length);

  return (
    <main className="stations">
      {STATIONS.map(
        (
          { id, eyebrow, title, lead, layout, mood, details, hint, restart },
          index,
        ) => {
          // The brand name on the first station is the page's one main heading.
          const Heading = index === 0 ? 'h1' : 'h2';

          return (
            <section
              key={id}
              ref={(element) => {
                sections.current[index] = element;
              }}
              className="station"
              data-layout={layout}
              data-mood={mood}
              aria-hidden={index !== station}
            >
              <div className="station__main">
                <p className="station__eyebrow">{eyebrow}</p>
                <Heading className="station__title">{title}</Heading>
                <p className="station__lead">{lead}</p>

                {hint && (
                  <p className="station__hint">
                    <span className="station__hint-pointer">
                      {hint.pointer}
                    </span>
                    <span className="station__hint-touch">{hint.touch}</span>
                  </p>
                )}

                {restart && (
                  <>
                    <button
                      type="button"
                      className="station__restart"
                      onClick={() => goTo(0)}
                    >
                      {restart}
                    </button>
                    <p className="station__fineprint">{BRAND.warning}</p>
                    <p className="station__fineprint">{BRAND.note}</p>
                  </>
                )}
              </div>

              <div className="station__details">
                <Details details={details} />
              </div>
            </section>
          );
        },
      )}
    </main>
  );
};

export default Stations;
