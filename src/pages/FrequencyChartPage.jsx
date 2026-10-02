import Footer from '../components/Footer';
import FrequencyChart from '../components/FrequencyChart';
import SiteHeader from '../components/SiteHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const FrequencyChartPage = () => {
  useDocumentTitle('Piano Note Frequency Chart – MusicKeyboard.io');
  return (
    <>
      <main className="pt-4">
        <SiteHeader />
        <FrequencyChart titleAs="h1" />
      </main>
      <Footer />
    </>
  );
};

export default FrequencyChartPage;
