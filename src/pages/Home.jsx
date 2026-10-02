import { Link } from 'react-router-dom';
import QuickPiano, { SelectionProvider, useSelection } from '../components/piano/QuickPiano';
import Faq from '../components/ui/Faq';
import Section from '../components/ui/Section';
import { CHORDS, SCALES, chordPath, findChord, findScale } from '../music/theory';
import { faq, useHead } from '../seo/head';
import { SITE_NAME, SITE_URL, AUTHOR } from '../site';

const POPULAR_CHORDS = [
  [0, 'major'], [7, 'major'], [2, 'major'], [9, 'major'], [4, 'major'], [5, 'major'], [10, 'major'],
  [9, 'minor'], [4, 'minor'], [2, 'minor'], [11, 'minor'], [6, 'minor'],
  [0, 'maj7'], [7, '7'], [9, 'm7'], [2, 'm7'], [5, 'maj7'], [4, '7'],
  [2, 'sus4'], [0, 'add9'], [11, 'dim'], [7, 'sus2'],
].map(([pc, q]) => findChord(pc, q));

const POPULAR_SCALES = [
  [0, 'major'], [9, 'minor'], [7, 'major'], [4, 'minor'], [9, 'minor-pentatonic'], [4, 'minor-pentatonic'],
  [0, 'major-pentatonic'], [9, 'blues'], [2, 'dorian'], [7, 'mixolydian'], [4, 'harmonic-minor'], [5, 'lydian'],
].map(([pc, s]) => findScale(pc, s));

const HOME_FAQ = [
  ['How do I play the piano online?', 'Click or tap the keys, or use your computer keyboard: the Q–P row and the number row play the first octaves, Z–. and A–L continue above. Hold Space for the sustain pedal and use the arrow keys to move the keyboard up or down an octave.'],
  ['How do I find a chord on the piano?', 'Type its name in the search box, like "Am7", "F#m" or "Do mayor". The notes light up on the keyboard and the chord plays. You can also pick one of the popular chords below or browse the full chord chart.'],
  ['Can it tell me which chord I am playing?', 'Yes. Play two or more notes and MusicKeyboard.io names the interval or chord instantly, including inversions (like C/E) and seventh, ninth and suspended chords.'],
  ['Does it work on phones and tablets?', 'Yes. It works in any modern browser with multi-touch, nothing to install. Swipe the keyboard sideways or use the octave buttons to move around.'],
  ['Is it free?', 'Completely free, with no sign-up. Your settings (colours, note names, zoom, volume) are saved in your browser.'],
  ['Which notes does the keyboard cover?', 'Six octaves of recorded acoustic piano, from C2 to B7 (72 keys), tuned to A4 = 440 Hz.'],
];

const Home = () => {
  useHead({
    title: 'Online Piano – Find Any Note, Chord or Scale Instantly | MusicKeyboard.io',
    description:
      'A quick, free online piano. Play with your mouse, touch or computer keyboard, type any chord or scale to see it on the keys, and get the chord you play named instantly. No sign-up.',
    path: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        applicationCategory: 'MusicApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript and Web Audio',
        description: 'Free online piano keyboard with chord finder, chord recognition, scales and note frequencies.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Person', name: AUTHOR },
        featureList: [
          '72-key piano with recorded sound',
          'Computer keyboard, mouse and multi-touch input',
          'Chord and scale search',
          'Real-time chord recognition',
          'Sustain pedal',
          'Note names in English (C D E) or solfège (Do Re Mi)',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      faq(HOME_FAQ),
    ],
  });

  return (
    <SelectionProvider>
      <div className="mb-5 max-w-3xl">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          The quick piano<span className="text-accent">.</span>
        </h1>
        <p className="mt-1 text-muted sm:text-lg">Play a note, find any chord or scale, hear it instantly. Free, nothing to install.</p>
      </div>

      <QuickPiano />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Section
          title="Popular chords"
          intro="Tap to see and hear them on the piano."
          action={<Link to="/chords" className="text-sm font-semibold text-accent">All {CHORDS.length} chords →</Link>}
        >
          <Chips items={POPULAR_CHORDS} label={(c) => c.symbol} title={(c) => `${c.name} chord`} />
        </Section>
        <Section
          title="Scales"
          intro="Major, minor, pentatonic, blues and the modes, in every key."
          action={<Link to="/scales" className="text-sm font-semibold text-accent">All {SCALES.length} scales →</Link>}
        >
          <Chips items={POPULAR_SCALES} label={(s) => s.name} title={(s) => `${s.name} scale`} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {[
          ['Play', 'Tap the keys or use your computer keyboard. Hold Space for sustain, arrows to change octave.'],
          ['Find', 'Type “Am7”, “Eb major scale” or “Sol”. The keys light up and you hear it.'],
          ['Learn', 'Play a few notes and the chord is named for you, inversions included.'],
        ].map(([title, text], i) => (
          <div key={title} className="card p-5">
            <span className="font-mono text-xs font-semibold text-accent">0{i + 1}</span>
            <h2 className="mt-1 text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>

      <Section title="Questions" className="mt-6">
        <Faq items={HOME_FAQ} />
      </Section>
    </SelectionProvider>
  );
};

const Chips = ({ items, label, title }) => {
  const { selection, select } = useSelection();
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.slug}>
          {/* A real link (for crawlers and new tabs); a plain click plays it here. */}
          <a
            href={item.type === 'chord' ? chordPath(item) : `/scales/${item.slug}`}
            title={title(item)}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              select(item, { reveal: true });
            }}
            className={`chip ${selection?.slug === item.slug && selection?.type === item.type ? 'chip-active' : ''}`}
          >
            {label(item)}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default Home;
