import type { StationDetails } from '@/content/stations';

import './Stats.css';

type StatsProps = Omit<Extract<StationDetails, { kind: 'stats' }>, 'kind'>;

// Key numbers: a column of big values on wide screens, one row on phones.
const Stats: React.FC<StatsProps> = ({ items }) => (
  <dl className="stats">
    {items.map(({ value, label, note }) => (
      <div key={label} className="stats__item">
        <dt className="stats__label">{label}</dt>
        <dd className="stats__value">{value}</dd>
        <dd className="stats__note">{note}</dd>
      </div>
    ))}
  </dl>
);

export default Stats;
