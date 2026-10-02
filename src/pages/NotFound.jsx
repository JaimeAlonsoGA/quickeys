import { Link } from 'react-router-dom';
import { useHead } from '../seo/head';

const NotFound = () => {
  useHead({ title: 'Page not found | Quickeys', description: 'This page does not exist.', path: '/404', noindex: true });
  return (
    <div className="card mx-auto max-w-xl p-10 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold">This key doesn’t exist</h1>
      <p className="mt-2 text-muted">The page you are looking for isn’t here.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink">Back to the piano</Link>
    </div>
  );
};

export default NotFound;
