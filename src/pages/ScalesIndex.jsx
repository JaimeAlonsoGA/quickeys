import { Link } from 'react-router-dom';
import Section from '../components/ui/Section';
import { ROOTS, SCALES, SCALE_TYPES, scalePath, stepPattern } from '../music/theory';
import { breadcrumbs, useHead } from '../seo/head';

const ScalesIndex = () => {
  useHead({
    title: `Piano Scales: Major, Minor, Pentatonic, Blues & Modes in Every Key | MusicKeyboard.io`,
    description: 'Every piano scale in all 12 keys: major, natural/harmonic/melodic minor, pentatonic, blues, Dorian, Phrygian, Lydian, Mixolydian and Locrian. Notes, patterns and chords, on an interactive keyboard.',
    path: '/scales',
    jsonLd: [breadcrumbs([['Piano', '/'], ['Scales', '/scales']])],
  });

  return (
    <>
      <div className="mb-6 max-w-3xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Piano scales</h1>
        <p className="mt-2 text-muted sm:text-lg">
          {SCALES.length} scales: {SCALE_TYPES.length} scale types in all 12 keys, each with its notes, step pattern and the chords
          that belong to it.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {SCALE_TYPES.map((type) => {
          const scales = SCALES.filter((s) => s.scaleType === type);
          return (
            <Section key={type.id} title={`${type.name[0].toUpperCase()}${type.name.slice(1)} scales`} className="!p-5">
              <p className="-mt-2 mb-3 text-sm text-muted">
                {type.aka ? `${type.aka} · ` : ''}<span className="font-mono">{stepPattern(scales[0])}</span>
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {ROOTS.map((root) => {
                  const s = scales.find((x) => x.root === root);
                  return (
                    <li key={s.slug}>
                      <Link to={scalePath(s)} className="chip !px-2.5 !py-1" title={`${s.name} scale`}>{root.name}</Link>
                    </li>
                  );
                })}
              </ul>
            </Section>
          );
        })}
      </div>
    </>
  );
};

export default ScalesIndex;
