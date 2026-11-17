import { lazy, Suspense } from 'react';

import { useLoadingStore } from '@/store/loading/loading';

import Header from '@/ui/header/Header';
import IntroReveal from '@/ui/introReveal/IntroReveal';
import Loader from '@/ui/loader/Loader';
import ScrollInput from '@/ui/scrollInput/ScrollInput';
import ScrollStatus from '@/ui/scrollStatus/ScrollStatus';
import Stations from '@/ui/stations/Stations';

// The scene (three.js, the experience and its shaders) is a separate download,
// so the page and the loader arrive first and show while it comes in.
const Experience = lazy(() =>
  import('@/experience/Experience').then((module) => {
    useLoadingStore.getState().setSceneCode();
    return module;
  }),
);

const App: React.FC = () => (
  <>
    <ScrollInput />

    <Suspense fallback={null}>
      <Experience />
    </Suspense>

    {/* The page frame and the station text, over the scene; they come in once the can has arrived. */}
    <IntroReveal>
      <Header />
      <Stations />
      <ScrollStatus />
    </IntroReveal>

    <Loader />
  </>
);

export default App;
