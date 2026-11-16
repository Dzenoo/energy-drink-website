import Experience from '@/experience/Experience';

import ScrollInput from '@/ui/scrollInput/ScrollInput';
import Stations from '@/ui/stations/Stations';

const App: React.FC = () => (
  <>
    <ScrollInput />

    <Experience />

    <Stations />
  </>
);

export default App;
