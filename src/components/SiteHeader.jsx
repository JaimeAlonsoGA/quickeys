import { Link } from 'react-router-dom';

const SiteHeader = () => (
  <header className="text-center">
    <Link to="/" className="text-2xl lg:text-4xl text-gray-300 font-bold font-spaceage">MusicKeyboard.io</Link>
  </header>
);

export default SiteHeader;
