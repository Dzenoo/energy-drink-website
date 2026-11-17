import type { StationDetails } from '@/content/stations';

import './Nutrition.css';

type NutritionProps = Omit<
  Extract<StationDetails, { kind: 'nutrition' }>,
  'kind'
>;

// The nutrition panel printed on the can, as a real table.
const Nutrition: React.FC<NutritionProps> = ({ caption, columns, rows }) => (
  <table className="nutrition">
    <caption className="nutrition__caption">{caption}</caption>
    <thead>
      <tr>
        <td />
        {columns.map((column) => (
          <th key={column} scope="col">
            {column}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map(({ name, values }) => (
        <tr key={name}>
          <th scope="row">{name}</th>
          {values.map((value, index) => (
            <td key={columns[index]}>{value}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Nutrition;
