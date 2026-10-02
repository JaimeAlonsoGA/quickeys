import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
    <ol className="flex flex-wrap items-center gap-1.5">
      {items.map(([label, to], i) => (
        <li key={to} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>/</span>}
          {i < items.length - 1 ? <Link to={to} className="hover:text-ink">{label}</Link> : <span className="text-ink" aria-current="page">{label}</span>}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
