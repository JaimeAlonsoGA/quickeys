import { memo } from 'react';
import { KEYMAP_LAYOUT, midiForCode } from '../music/keymap';
import { noteByMidi, pitchName } from '../music/notes';
import { useIsPressed } from '../state/playback';
import { useSettings } from '../state/SettingsProvider';
import PressedNotes from './PressedNotes';

/** Picture of the computer keys and the notes they play. */
const Keymap = () => {
  const { showPlayedNames } = useSettings();
  return (
    <div className="grid grid-cols-3 items-center font-medium">
      <KeyBlock rows={KEYMAP_LAYOUT.left} />
      <div>{showPlayedNames && <PressedNotes />}</div>
      <KeyBlock rows={KEYMAP_LAYOUT.right} />
    </div>
  );
};

const KeyBlock = ({ rows: [upper, lower] }) => (
  <div>
    <div className="flex flex-row">
      {upper.map((binding, i) => <KeymapKey key={binding?.code ?? i} binding={binding} />)}
    </div>
    <div className="flex flex-row ml-6">
      {lower.map((binding, i) => <KeymapKey key={binding?.code ?? i} binding={binding} />)}
    </div>
  </div>
);

const KeymapKey = ({ binding }) => {
  const { baseOctave, solfege } = useSettings();
  const midi = binding ? midiForCode(binding.code, baseOctave) : null;
  const note = midi !== null ? noteByMidi.get(midi) : null;
  if (!note) return <Keycap label={binding?.label ?? ''} />;
  return <MappedKeycap label={binding.label} id={note.id} name={pitchName(note.pc, solfege)} />;
};

const MappedKeycap = memo(function MappedKeycap({ label, id, name }) {
  const pressed = useIsPressed(id);
  return <Keycap label={label} name={name} pressed={pressed} used />;
});

const Keycap = ({ label, name = '', pressed = false, used = false }) => (
  <div className={`p-1 border border-gray-300 rounded-xl text-base ${used ? '' : 'bg-rose-600 opacity-10'} ${pressed ? '' : 'shadow-xl'}`}>
    <div className={`flex flex-col items-center justify-center w-4 h-4 p-4 rounded-xl ${pressed ? 'bg-gray-400' : 'bg-gray-100'}`}>
      {label}
    </div>
    <div className="text-xs font-normal italic min-h-4">{name}</div>
  </div>
);

export default Keymap;
