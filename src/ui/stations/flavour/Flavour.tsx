import type { StationDetails } from '@/content/stations';

import './Flavour.css';

type FlavourProps = Omit<Extract<StationDetails, { kind: 'flavour' }>, 'kind'>;

// Tasting notes and the full ingredient list; on phones only the notes show.
const Flavour: React.FC<FlavourProps> = ({
  notesTitle,
  notes,
  ingredientsTitle,
  ingredients,
}) => (
  <div className="flavour">
    <h3 className="flavour__heading">{notesTitle}</h3>
    <ul className="flavour__notes">
      {notes.map((note) => (
        <li key={note} className="flavour__note">
          {note}
        </li>
      ))}
    </ul>

    <div className="flavour__ingredients">
      <h3 className="flavour__heading">{ingredientsTitle}</h3>
      <p className="flavour__list">{ingredients}</p>
    </div>
  </div>
);

export default Flavour;
