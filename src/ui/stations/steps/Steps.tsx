import type { StationDetails } from '@/content/stations';

import './Steps.css';

type StepsProps = Omit<Extract<StationDetails, { kind: 'steps' }>, 'kind'>;

// Numbered steps; on phones only their titles show.
const Steps: React.FC<StepsProps> = ({ items }) => (
  <ol className="steps">
    {items.map(({ title, text }, index) => (
      <li key={title} className="steps__item">
        <span className="steps__number" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="steps__title">{title}</p>
        <p className="steps__text">{text}</p>
      </li>
    ))}
  </ol>
);

export default Steps;
