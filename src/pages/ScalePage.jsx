import { Link, useParams } from 'react-router-dom';
import PreviewPiano from '../components/piano/PreviewPiano';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Faq from '../components/ui/Faq';
import Section from '../components/ui/Section';
import { SCALES, chordPath, diatonicChords, displayName, scaleBySlug, scalePath, stepPattern } from '../music/theory';
import { breadcrumbs, faq, useHead } from '../seo/head';
import { useSettings } from '../state/SettingsProvider';
import NotFound from './NotFound';

const capital = (s) => s[0].toUpperCase() + s.slice(1);
const titleCase = (s) => s.split(' ').map(capital).join(' ');

function scaleFaq(scale, chords) {
  const names = scale.notes.map((n) => n.name);
  const qa = [
    [`What notes are in the ${scale.name} scale?`, `The ${scale.name} scale has ${names.length} notes: ${names.join(', ')}.`],
    [`What is the pattern of the ${scale.scaleType.name} scale?`, `${stepPattern(scale)} (W = whole step, H = half step), starting from the root.`],
  ];
  if (chords.length) {
    qa.push([`What chords are in ${scale.name}?`, `The triads of ${scale.name} are ${chords.map((c) => `${c.symbol} (${c.numeral})`).join(', ')}.`]);
  }
  return qa;
}

const ScalePage = () => {
  const { slug } = useParams();
  const scale = scaleBySlug.get(slug);
  const { solfege } = useSettings();
  const chords = scale ? diatonicChords(scale) : [];
  const names = scale?.notes.map((n) => n.name) ?? [];

  useHead(scale ? {
    title: `${titleCase(scale.name)} Scale on Piano – Notes ${names.join(' ')} | MusicKeyboard.io`,
    description: `The ${scale.name} scale on piano: ${names.join(', ')}. Pattern ${stepPattern(scale)}. Hear it and see it on an interactive keyboard${chords.length ? ', with its chords' : ''}.`,
    path: scalePath(scale),
    type: 'article',
    jsonLd: [
      breadcrumbs([['Piano', '/'], ['Scales', '/scales'], [capital(scale.name), scalePath(scale)]]),
      faq(scaleFaq(scale, chords)),
    ],
  } : { title: 'Scale not found | MusicKeyboard.io', description: 'This scale does not exist.', noindex: true });

  if (!scale) return <NotFound />;

  const show = (name) => displayName(name, solfege);
  const sameRoot = SCALES.filter((s) => s.root === scale.root && s !== scale);
  const otherKeys = SCALES.filter((s) => s.scaleType === scale.scaleType && s !== scale);

  return (
    <>
      <Breadcrumbs items={[['Piano', '/'], ['Scales', '/scales'], [capital(scale.name), scalePath(scale)]]} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold sm:text-5xl">
          {capital(scale.name)} <span className="text-muted font-semibold">scale</span>
        </h1>
        <p className="mt-2 text-lg text-muted">
          {scale.scaleType.aka ? `${capital(scale.scaleType.aka)} · ` : ''}
          {scale.root.alt ? `also ${scale.root.alt} ${scale.scaleType.name}` : `${scale.notes.length} notes`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section>
          <PreviewPiano midis={scale.midis} names={[...names, names[0]]} arpeggio playLabel="Play the scale" className="h-36 sm:h-48" />
          <p className="mt-4 text-sm text-muted">
            <Link className="font-semibold text-accent" to={`/?q=${encodeURIComponent(scale.name + ' scale')}`}>Open it on the full piano</Link> to
            play along.
          </p>
        </Section>
        <Section title="Notes">
          <ul className="grid grid-cols-4 gap-2">
            {scale.notes.map((n) => (
              <li key={n.midi} className="rounded-2xl bg-sunken px-2 py-2 text-center">
                <div className="font-display text-xl font-bold">{show(n.name)}</div>
                <div className="font-mono text-xs text-muted">{n.interval}</div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Pattern: <span className="font-mono text-ink">{stepPattern(scale)}</span>
          </p>
        </Section>
      </div>

      {chords.length > 0 && (
        <Section title={`Chords in ${scale.name}`} className="mt-6" intro="The triad built on each note of the scale.">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {chords.map((c) => (
              <li key={c.numeral}>
                <Link to={chordPath(c.chord)} className="block rounded-2xl border border-line px-3 py-3 text-center transition hover:border-accent/50 hover:bg-accent-soft/40">
                  <div className="font-mono text-xs text-muted">{c.numeral}</div>
                  <div className="font-display text-lg font-bold">{c.symbol}</div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title={`More ${scale.root.name} scales`}>
          <ScaleLinks scales={sameRoot} label={(s) => s.scaleType.name} />
        </Section>
        <Section title={`${capital(scale.scaleType.name)} scale in other keys`}>
          <ScaleLinks scales={otherKeys} label={(s) => s.root.name} />
        </Section>
      </div>

      <Section title="FAQ" className="mt-6">
        <Faq items={scaleFaq(scale, chords)} />
      </Section>
    </>
  );
};

const ScaleLinks = ({ scales, label }) => (
  <ul className="flex flex-wrap gap-1.5">
    {scales.map((s) => (
      <li key={s.slug}>
        <Link to={scalePath(s)} className="chip !px-2.5 !py-1" title={`${s.name} scale`}>{label(s)}</Link>
      </li>
    ))}
  </ul>
);

export default ScalePage;
