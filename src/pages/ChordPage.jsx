import { Link, useParams } from 'react-router-dom';
import PreviewPiano from '../components/piano/PreviewPiano';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Faq from '../components/ui/Faq';
import Section from '../components/ui/Section';
import { CHORDS, chordBySlug, chordPath, displayName, inversions } from '../music/theory';
import { breadcrumbs, faq, useHead } from '../seo/head';
import { useSettings } from '../state/SettingsProvider';
import NotFound from './NotFound';

const list = (names) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]);

function chordFaq(chord) {
  const names = chord.notes.map((n) => n.name);
  const formula = chord.notes.map((n) => n.interval).join(' – ');
  const sym = chord.symbol;
  return [
    [`What notes are in the ${sym} chord?`, `The ${chord.name} chord (${sym}) has ${names.length} notes: ${list(names)}.`],
    [`How do you play ${sym} on the piano?`, `Put your right hand on ${list(names)}, starting from ${names[0]}. A common fingering for three-note chords is thumb (1), middle finger (3) and little finger (5).`],
    [`What is the formula of a ${chord.quality.name} chord?`, `${formula} (in semitones from the root: ${chord.quality.tones.map((x) => x.semitones).join(', ')}).`],
    ...(chord.root.alt ? [[`Is ${sym} the same as ${chord.root.alt}${chord.quality.symbol}?`, `Yes. ${chord.root.name} and ${chord.root.alt} are the same key on the piano (enharmonic), so ${sym} and ${chord.root.alt}${chord.quality.symbol} sound the same.`]] : []),
  ];
}

const ChordPage = () => {
  const { slug } = useParams();
  const chord = chordBySlug.get(slug);
  const { solfege } = useSettings();
  const names = chord?.notes.map((n) => n.name) ?? [];

  useHead(chord ? {
    title: `${chord.symbol} Piano Chord – ${chord.name} (${names.join(' ')}) | Quickeys`,
    description: `The ${chord.name} chord (${chord.symbol}) on piano: notes ${names.join(', ')}. Hear it, see it on an interactive keyboard, and learn its formula and inversions.`,
    path: chordPath(chord),
    type: 'article',
    jsonLd: [
      breadcrumbs([['Piano', '/'], ['Chords', '/chords'], [`${chord.symbol}`, chordPath(chord)]]),
      faq(chordFaq(chord)),
      {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: `${chord.name} chord`,
        alternateName: [chord.symbol, chord.root.alt && chord.root.alt + chord.quality.symbol].filter(Boolean),
        description: `A ${chord.quality.name} chord built on ${chord.root.name}: ${names.join(', ')}.`,
        inDefinedTermSet: 'https://quickeys.app/chords',
      },
    ],
  } : { title: 'Chord not found | Quickeys', description: 'This chord does not exist.', noindex: true });

  if (!chord) return <NotFound />;

  const sameRoot = CHORDS.filter((c) => c.root === chord.root && c !== chord);
  const otherKeys = CHORDS.filter((c) => c.quality === chord.quality && c !== chord);
  const show = (name) => displayName(name, solfege);

  return (
    <>
      <Breadcrumbs items={[['Piano', '/'], ['Chords', '/chords'], [chord.symbol, chordPath(chord)]]} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold sm:text-5xl">
          {chord.symbol} <span className="text-muted font-semibold">chord</span>
        </h1>
        <p className="mt-2 text-lg text-muted">
          {chord.name}{chord.root.alt ? ` · also written ${chord.root.alt}${chord.quality.symbol}` : ''}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section>
          <PreviewPiano midis={chord.midis} names={names} playLabel={`Play ${chord.symbol}`} className="h-36 sm:h-48" />
          <p className="mt-4 text-sm text-muted">
            Want it in context? <Link className="font-semibold text-accent" to={`/?q=${encodeURIComponent(chord.symbol)}`}>Open {chord.symbol} on the full piano</Link>.
          </p>
        </Section>
        <Section title="Notes">
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
            {chord.notes.map((n) => (
              <li key={n.midi} className="rounded-2xl bg-sunken px-3 py-2 text-center">
                <div className="font-display text-2xl font-bold">{show(n.name)}</div>
                <div className="font-mono text-xs text-muted">{n.interval}</div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Formula: <span className="font-mono text-ink">{chord.notes.map((n) => n.interval).join(' – ')}</span>
          </p>
        </Section>
      </div>

      <Section title={`${chord.symbol} inversions`} className="mt-6" intro="The same notes, with a different note in the bass.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {inversions(chord).map((inv) => (
            <div key={inv.label}>
              <h3 className="mb-2 text-base font-bold">
                {inv.label} <span className="font-mono text-sm font-normal text-muted">{inv.symbol}</span>
              </h3>
              <PreviewPiano midis={inv.notes.map((n) => n.midi)} names={inv.notes.map((n) => n.name)} playLabel={inv.notes.map((n) => show(n.name)).join(' ')} className="h-24" compact />
            </div>
          ))}
        </div>
      </Section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title={`More ${chord.root.name} chords`}>
          <ChordLinks chords={sameRoot} />
        </Section>
        <Section title={`${chord.quality.name[0].toUpperCase()}${chord.quality.name.slice(1)} chords in other keys`}>
          <ChordLinks chords={otherKeys} />
        </Section>
      </div>

      <Section title="FAQ" className="mt-6">
        <Faq items={chordFaq(chord)} />
      </Section>
    </>
  );
};

const ChordLinks = ({ chords }) => (
  <ul className="flex flex-wrap gap-1.5">
    {chords.map((c) => (
      <li key={c.slug}>
        <Link to={chordPath(c)} className="chip !px-2.5 !py-1" title={`${c.name} chord`}>{c.symbol}</Link>
      </li>
    ))}
  </ul>
);

export default ChordPage;
