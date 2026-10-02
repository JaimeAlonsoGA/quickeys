/** Three piano keys, the middle one pressed in the accent colour. */
const Logo = ({ className = '' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <rect x="1" y="1" width="30" height="30" rx="9" className="fill-ink" />
    <rect x="6" y="7" width="6" height="18" rx="2" fill="#fffdf9" />
    <rect x="13" y="7" width="6" height="18" rx="2" className="fill-accent" />
    <rect x="20" y="7" width="6" height="18" rx="2" fill="#fffdf9" />
    <rect x="10.2" y="7" width="3.6" height="10" rx="1.4" className="fill-ink" />
    <rect x="18.2" y="7" width="3.6" height="10" rx="1.4" className="fill-ink" />
  </svg>
);

export default Logo;
