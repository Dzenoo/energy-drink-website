import Experience from '@/experience/Experience';

import Header from '@/ui/header/Header';
import ScrollInput from '@/ui/scrollInput/ScrollInput';
import ScrollStatus from '@/ui/scrollStatus/ScrollStatus';
import Stations from '@/ui/stations/Stations';

const App: React.FC = () => (
  <>
    <ScrollInput />

    <Experience />

    {/* The page frame and the station text, over the scene. */}
    <Header />
    <Stations />
    <ScrollStatus />
  </>
);

export default App;
