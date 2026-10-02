import { notes } from '../music/notes';
import Title from './Title';

const FrequencyChart = ({ titleAs }) => (
  <section id="frequency-chart" className="flex flex-col justify-center items-center mt-12 scroll-mt-4">
    <Title as={titleAs}>Frequency Chart</Title>
    <div className="w-full max-w-3xl px-4 mt-12 overflow-x-auto">
      <table className="w-full text-center">
        <thead>
          <tr className="border-b">
            <th className="p-1 font-normal">Notes</th>
            <th className="p-1 font-normal">Frequency (Hz)</th>
            <th className="p-1 font-normal">Octave</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((n) => (
            <tr key={n.id} className="border-b">
              <td className={`p-1 ${n.pc === 9 ? 'bg-gradient-to-r from-white via-rose-200 to-white' : ''}`}>
                {n.english.replace('#', '♯')} / {n.solfege.replace('#', '♯')}
              </td>
              <td className="p-1 tabular-nums">{n.frequency.toFixed(2)}</td>
              <td className={`p-1 ${n.pc === 0 ? 'bg-gradient-to-r from-white via-blue-200 to-white' : ''}`}>{n.octave}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex flex-col justify-center items-center mt-12">
      <Title>Why a Frequency Chart?</Title>
      <div className="flex flex-col gap-2 text-justify w-full px-4 max-w-4xl my-4">
        <p>
          The frequency chart is a useful tool to understand the pitch of each note in the piano keyboard. The chart
          displays the frequency of each note in Hertz (Hz) and its corresponding octave, using standard tuning
          (A4 = 440 Hz, equal temperament).
        </p>
        <p>
          The frequency of a note is the number of vibrations per second that the sound wave produces. The higher the
          frequency, the higher the pitch of the note. Every octave doubles the frequency. The frequency chart is a
          valuable resource for music producers, composers, and musicians who want to learn more about the science of
          sound and music theory.
        </p>
      </div>
    </div>
  </section>
);

export default FrequencyChart;
