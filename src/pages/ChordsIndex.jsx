import { Link } from 'react-router-dom';
import Section from '../components/ui/Section';
import { CHORDS, QUALITIES, ROOTS, chordPath } from '../music/theory';
import { breadcrumbs, useHead } from '../seo/head';

const ChordsIndex = () => {
  useHead({
    title: `Piano Chords Chart: All ${CHORDS.length} Chords in Every Key | Quickeys`,
    description: `Interactive piano chord chart: major, minor, 7th, maj7, m7, sus, dim, aug, 9th and more in all 12 keys. See the notes on a keyboard and hear every chord.`,
    path: '/chords',
    jsonLd: [breadcrumbs([['Piano', '/'], ['Chords', '/chords']])],
  });

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold sm:text-4xl">Piano chords</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ROOTS.map((root) => (
          <Section key={root.slug} title={`${root.name}${root.alt ? ` / ${root.alt}` : ''} chords`} as="h2" className="!p-5">
            <ul className="flex flex-wrap gap-1.5">
              {CHORDS.filter((c) => c.root === root).map((c) => (
                <li key={c.slug}>
                  <Link to={chordPath(c)} className="chip !px-2.5 !py-1" title={`${c.name} chord`}>
                    {c.symbol}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ))}
      </div>
    </>
  );
};

export default ChordsIndex;
