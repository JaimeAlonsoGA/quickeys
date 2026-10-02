import { describeNotes } from '../music/chords';
import { noteById } from '../music/notes';
import { usePressedNotes, useSustain } from '../state/playback';
import { useSettings } from '../state/SettingsProvider';

/** Names of the notes being played, plus the chord or interval they form. */
const PressedNotes = () => {
  const pressed = usePressedNotes();
  const sustain = useSustain();
  const { solfege } = useSettings();
  const played = pressed.map((id) => noteById.get(id));
  const harmony = describeNotes(played.map((n) => n.midi), solfege);

  return (
    <div className="flex flex-col justify-center items-center font-medium min-h-24" aria-live="polite">
      <div className="flex flex-row flex-wrap justify-center gap-x-8 min-h-6">
        {played.map((n) => (
          <span key={n.id}>{solfege ? n.solfege : `${n.english}${n.octave}`}</span>
        ))}
      </div>
      <div className="flex flex-row items-center gap-2 mt-4 min-h-10">
        {harmony && <div className="border border-gray-300 rounded-xl p-2">{harmony}</div>}
        {sustain && <span className="text-xs bg-gray-200 text-gray-600 rounded-xl px-2 py-1">Sustain</span>}
      </div>
    </div>
  );
};

export default PressedNotes;
