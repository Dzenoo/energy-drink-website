import Experience from '@/experience/Experience';

import Header from '@/ui/header/Header';
import IntroReveal from '@/ui/introReveal/IntroReveal';
import ScrollInput from '@/ui/scrollInput/ScrollInput';
import ScrollStatus from '@/ui/scrollStatus/ScrollStatus';
import Stations from '@/ui/stations/Stations';

const App: React.FC = () => (
  <>
    <ScrollInput />

    <Experience />

    {/* The page frame and the station text, over the scene; they come in once the can has arrived. */}
    <IntroReveal>
      <Header />
      <Stations />
      <ScrollStatus />
    </IntroReveal>
  </>
);

export default App;
