import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ChordPage from './pages/ChordPage';
import ChordsIndex from './pages/ChordsIndex';
import FrequencyChart from './pages/FrequencyChart';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import ScalePage from './pages/ScalePage';
import ScalesIndex from './pages/ScalesIndex';
import { SettingsProvider } from './state/SettingsProvider';

/** The routes, shared by the browser entry and the prerenderer. */
const App = () => (
  <SettingsProvider>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/chords" element={<ChordsIndex />} />
        <Route path="/chords/:slug" element={<ChordPage />} />
        <Route path="/scales" element={<ScalesIndex />} />
        <Route path="/scales/:slug" element={<ScalePage />} />
        <Route path="/frequency-chart" element={<FrequencyChart />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </SettingsProvider>
);

export default App;
