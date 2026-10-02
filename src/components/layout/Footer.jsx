import { Link } from 'react-router-dom';
import dev from '../../assets/dev-192.jpg';
import { AUTHOR } from '../../site';
import Logo from './Logo';

const LINKS = [
  ['/', 'Online piano'],
  ['/chords', 'Piano chords'],
  ['/scales', 'Piano scales'],
  ['/frequency-chart', 'Note frequencies'],
  ['/privacy', 'Privacy'],
];

const Footer = () => (
  <footer className="mx-auto mt-20 w-full max-w-6xl px-4 pb-10 sm:px-6">
    <div className="flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-sm">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <span className="font-display font-bold">MusicKeyboard.io</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          A quick, free online piano to find notes, chords and scales. No sign-up, no download.
        </p>
      </div>
      <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
        {LINKS.map(([to, label]) => (
          <Link key={to} to={to} className="text-muted hover:text-ink">{label}</Link>
        ))}
        <a href="/llms.txt" className="text-muted hover:text-ink">llms.txt</a>
      </nav>
    </div>
    <div className="mt-8 flex items-center gap-3 text-xs text-muted">
      <img src={dev} alt="" width={28} height={28} loading="lazy" className="h-7 w-7 rounded-full" />
      <p>
        Made with care by {AUTHOR} · v{__APP_VERSION__} · © 2024–{__BUILD_YEAR__}
      </p>
    </div>
  </footer>
);

export default Footer;
