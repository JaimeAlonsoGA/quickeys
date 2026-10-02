import About from '../components/About';
import Footer from '../components/Footer';
import FrequencyChart from '../components/FrequencyChart';
import Piano from '../components/Piano';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Home = () => {
  useDocumentTitle('MusicKeyboard.io – Free Online Piano Keyboard');
  return (
    <>
      <main>
        <Piano />
        <About />
        <FrequencyChart />
      </main>
      <Footer />
    </>
  );
};

export default Home;
