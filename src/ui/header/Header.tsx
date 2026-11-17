import { BRAND } from '@/content/brand';
import { FRAME } from '@/content/frame';
import { STATIONS } from '@/content/stations';

import { useScrollStore } from '@/store/scroll/scroll';

import './Header.css';

// The page frame's top bar: the brand, which flies back to the start, and a
// navigation through the stations with the current one marked.
const Header: React.FC = () => {
  const station = useScrollStore((state) => state.station);
  const goTo = useScrollStore((state) => state.goTo);

  return (
    <header className="header">
      <button type="button" className="header__brand" onClick={() => goTo(0)}>
        {BRAND.name}
      </button>

      <nav aria-label={FRAME.navLabel}>
        <ol className="header__nav">
          {STATIONS.map(({ id, label }, index) => (
            <li key={id}>
              <button
                type="button"
                className="header__link"
                aria-current={index === station ? 'step' : undefined}
                onClick={() => goTo(index)}
              >
                <span className="header__label">{label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </header>
  );
};

export default Header;
