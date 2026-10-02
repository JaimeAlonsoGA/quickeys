import { useEffect, useRef, useState } from 'react';
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu';
import { Link, NavLink } from 'react-router-dom';
import { ACCENTS } from '../../site';
import { useSettings } from '../../state/SettingsProvider';
import Logo from './Logo';

const NAV = [
  ['/', 'Piano'],
  ['/chords', 'Chords'],
  ['/scales', 'Scales'],
  ['/frequency-chart', 'Frequencies'],
];

const SCHEMES = [
  ['system', LuMonitor, 'Match system theme'],
  ['light', LuSun, 'Light theme'],
  ['dark', LuMoon, 'Dark theme'],
];

const Header = () => (
  <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 pt-4 sm:px-6 sm:pt-6">
    <Link to="/" className="flex items-center gap-2.5" aria-label="MusicKeyboard.io home">
      <Logo className="h-8 w-8" />
      <span className="font-display text-lg font-bold tracking-tight">
        MusicKeyboard<span className="text-muted font-semibold">.io</span>
      </span>
    </Link>
    <nav className="order-last -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto" aria-label="Main">
      {NAV.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
    <div className="ml-auto flex items-center gap-1">
      <AccentPicker />
      <SchemeToggle />
    </div>
  </header>
);

const AccentPicker = () => {
  const { accent, update } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = ACCENTS.find((a) => a.id === accent);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" className="icon-btn" aria-label="Accent colour" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="h-4 w-4 rounded-full ring-2 ring-surface" style={{ background: current.color }} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 flex gap-2 rounded-2xl border border-line bg-surface p-2 shadow-lift">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              title={a.name}
              aria-label={`${a.name} accent`}
              aria-pressed={a.id === accent}
              onClick={() => {
                update('accent', a.id);
                setOpen(false);
              }}
              className={`h-7 w-7 rounded-full transition hover:scale-110 ${a.id === accent ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`}
              style={{ background: a.color }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SchemeToggle = () => {
  const { colorScheme, update } = useSettings();
  const index = SCHEMES.findIndex(([id]) => id === colorScheme);
  const [, Icon, label] = SCHEMES[index];
  const next = SCHEMES[(index + 1) % SCHEMES.length];
  return (
    <button type="button" className="icon-btn" aria-label={`${label} (switch to ${next[2].toLowerCase()})`} title={label} onClick={() => update('colorScheme', next[0])}>
      <Icon size={18} />
    </button>
  );
};

export default Header;
