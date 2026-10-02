import { memo } from 'react';
import { useIsPressed } from '../state/playback';

// Which white "half keys" are drawn under the neighbouring black keys.
const PSEUDO_SIDES = {
  0: ['right'], // C
  2: ['left', 'right'], // D
  4: ['left'], // E
  5: ['right'], // F
  7: ['left', 'right'], // G
  9: ['left', 'right'], // A
  11: ['left'], // B
};

/**
 * One piano key. Pointer input is handled by the parent (event delegation via
 * `data-note`); this component only renders and subscribes to its own pressed
 * state, so pressing a note re-renders a single key.
 */
const Key = memo(function Key({ note, label, theme, zoom, solfege, showAllNames, showPlayedNames, showLabel }) {
  const pressed = useIsPressed(note.id);
  const name = solfege ? note.solfege : `${note.english}${note.octave}`;
  const showName = note.white && (showAllNames || (showPlayedNames && pressed));
  const sides = PSEUDO_SIDES[note.pc] ?? [];
  const closesOctaveGroup = note.pc === 4 || note.pc === 11; // E and B

  let top = note.white ? theme.wKeys : `${theme.bKeys} shadow-xl`;
  if (pressed) top = note.white ? `${theme.wPress} shadow-none` : `${theme.bPress} shadow-xs`;

  return (
    <div className="h-full flex flex-col" data-note={note.id}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={`${note.english}${note.octave}`}
        aria-pressed={pressed}
        className={`h-full w-full ${closesOctaveGroup ? `border-r-2 ${theme.border}` : ''}`}
      >
        <span className={`block h-4/5 w-full ${top}`} style={{ padding: `0 ${zoom + 8}px` }} />
        <span className={`flex justify-center items-center h-1/5 relative ${theme.wKeysBot}`}>
          {note.white && sides.map((side) => (
            <span
              key={side}
              className={`absolute h-full w-1/2 z-10 ${theme.wKeysBot} ${side === 'right' ? `-right-1/2 border-r-2 ${theme.border}` : '-left-1/2'}`}
            />
          ))}
          <span className={`w-4 text-center text-gray-400 ${zoom < 10 ? 'text-xs' : ''}`}>
            {showName ? name : ''}
          </span>
          {showLabel && label && !pressed && (
            <span className={`absolute font-mono text-xs font-bold ${note.white ? 'mb-48 text-gray-400' : 'mb-60 text-white'}`}>
              {label}
            </span>
          )}
        </span>
      </button>
    </div>
  );
});

export default Key;
