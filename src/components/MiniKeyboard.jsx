import { memo } from 'react';
import { notes } from '../music/notes';
import { useIsPressed } from '../state/playback';

/** Overview of the whole keyboard: shows the visible part and jumps on click. */
const MiniKeyboard = ({ visible, onSelect, range, theme }) => (
  <div className="h-16 flex justify-center items-center">
    <div className="lg:w-min w-full flex flex-row h-full border border-gray-300 rounded-xl overflow-hidden">
      {notes.map((note, i) => (
        <MiniKey
          key={note.id}
          note={note}
          inView={i >= visible.first && i <= visible.last}
          mapped={range !== null && note.midi >= range[0] && note.midi <= range[1]}
          highlight={theme.minikeyboard}
          onSelect={onSelect}
        />
      ))}
    </div>
  </div>
);

const MiniKey = memo(function MiniKey({ note, inView, mapped, highlight, onSelect }) {
  const pressed = useIsPressed(note.id);
  let color = note.white ? '' : 'bg-black h-4/5';
  if (mapped && !note.white) color = `${highlight} h-4/5`;
  if (pressed) color = `bg-gradient-to-b from-green-500 to-green-200 ${note.white ? '' : 'h-4/5'}`;

  return (
    <button
      type="button"
      aria-label={`Scroll to ${note.english}${note.octave}`}
      className={`w-3 shrink ${color} ${inView ? '' : 'opacity-20'}`}
      onClick={() => onSelect(note.id)}
    />
  );
});

export default MiniKeyboard;
