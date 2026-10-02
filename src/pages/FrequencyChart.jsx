import Section from '../components/ui/Section';
import { notes } from '../music/notes';
import { breadcrumbs, faq, useHead } from '../seo/head';
import { playSequence } from '../state/playback';

const QA = [
  ['What frequency is middle C?', 'Middle C (C4) is 261.63 Hz in standard tuning.'],
  ['What is A440?', 'A440 is the standard tuning reference: the A above middle C (A4) vibrates at 440 Hz. Every other note is derived from it.'],
  ['How is the frequency of a note calculated?', 'In equal temperament, f = 440 × 2^((n − 69) / 12), where n is the MIDI note number (A4 = 69). Each semitone multiplies the frequency by about 1.0595, and each octave doubles it.'],
];

const FrequencyChart = () => {
  useHead({
    title: 'Piano Note Frequency Chart (Hz) – C2 to B7, A4 = 440 Hz | MusicKeyboard.io',
    description: 'Frequency in hertz of every piano note from C2 to B7 in standard tuning (A4 = 440 Hz, equal temperament). Click any note to hear it.',
    path: '/frequency-chart',
    jsonLd: [breadcrumbs([['Piano', '/'], ['Note frequencies', '/frequency-chart']]), faq(QA)],
  });

  const octaves = [2, 3, 4, 5, 6, 7];
  return (
    <>
      <div className="mb-6 max-w-3xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Note frequency chart</h1>
        <p className="mt-2 text-muted sm:text-lg">
          The pitch of every note in hertz, tuned to A4 = 440 Hz (equal temperament). Each octave doubles the frequency.
          Click a note to hear it.
        </p>
      </div>
      <Section>
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 bg-surface py-2 pr-3 text-left font-semibold">Note</th>
                {octaves.map((o) => (
                  <th key={o} scope="col" className="py-2 text-right font-mono font-semibold text-muted">Octave {o}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((name, pc) => (
                <tr key={name} className={name.includes('#') ? 'bg-sunken/60' : ''}>
                  <th scope="row" className="sticky left-0 bg-inherit py-1.5 pr-3 text-left font-display font-bold">
                    {name} <span className="font-sans text-xs font-normal text-muted">/ {notes[pc].solfege}</span>
                  </th>
                  {octaves.map((o) => {
                    const n = notes.find((x) => x.pc === pc && x.octave === o);
                    return (
                      <td key={o} className="py-1 text-right">
                        <button
                          type="button"
                          onClick={() => playSequence([n.id], { hold: 1200 })}
                          className={`rounded-lg px-2 py-0.5 font-mono tabular-nums transition hover:bg-accent-soft hover:text-accent ${n.id === 'A4' || n.id === 'C4' ? 'font-bold text-accent' : ''}`}
                          aria-label={`${name}${o}: ${n.frequency.toFixed(2)} hertz, play`}
                        >
                          {n.frequency.toFixed(2)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="About note frequencies" className="mt-6">
        <div className="prose-cozy max-w-3xl">
          <p>
            The frequency of a note is the number of vibrations per second of its sound wave. The higher the frequency, the
            higher the pitch. Middle C (C4) is 261.63 Hz and the A above it (A4) is the 440 Hz tuning reference.
          </p>
        </div>
        <div className="mt-4">
          <FaqList />
        </div>
      </Section>
    </>
  );
};

const FaqList = () => (
  <dl className="grid gap-4 md:grid-cols-3">
    {QA.map(([q, a]) => (
      <div key={q} className="rounded-2xl bg-sunken p-4">
        <dt className="font-semibold">{q}</dt>
        <dd className="mt-1 text-sm text-ink/80">{a}</dd>
      </div>
    ))}
  </dl>
);

export default FrequencyChart;
