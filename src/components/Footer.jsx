import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="mt-12 px-4 mb-2 text-center text-sm">
    <nav className="flex justify-center gap-4 mb-2 text-gray-500">
      <Link to="/" className="hover:underline">Piano</Link>
      <Link to="/freqchart" className="hover:underline">Frequency chart</Link>
      <Link to="/privacy" className="hover:underline">Privacy policy</Link>
    </nav>
    <p className="text-xs">current version: {__APP_VERSION__}</p>
    <p>musickeyboard.io © 2024–{new Date().getFullYear()} developed and updated by Jaime Alonso García-Amorena</p>
  </footer>
);

export default Footer;
