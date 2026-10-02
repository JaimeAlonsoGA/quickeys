import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import FrequencyChartPage from './pages/FrequencyChartPage';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import { SettingsProvider } from './state/SettingsProvider';

const App = () => (
  <SettingsProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/freqchart" element={<FrequencyChartPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </SettingsProvider>
);

export default App;
