// The playable range: C2 (MIDI 36) to B7 (MIDI 107), 6 octaves / 72 keys.
export const FIRST_MIDI = 36;
export const LAST_MIDI = 107;

export const ENGLISH = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const SOLFEGE = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const FILE_NAMES = ['C', 'Csharp', 'D', 'Dsharp', 'E', 'F', 'Fsharp', 'G', 'Gsharp', 'A', 'Asharp', 'B'];

const samples = import.meta.glob('../assets/notes/*[2-7].mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const frequencyOf = (midi) => 440 * 2 ** ((midi - 69) / 12);

export const notes = [];
for (let midi = FIRST_MIDI; midi <= LAST_MIDI; midi++) {
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const id = `${FILE_NAMES[pc]}${octave}`;
  notes.push({
    index: notes.length,
    midi,
    id,
    pc,
    octave,
    english: ENGLISH[pc],
    solfege: SOLFEGE[pc],
    white: !ENGLISH[pc].includes('#'),
    frequency: frequencyOf(midi),
    src: samples[`../assets/notes/${id}.mp3`],
  });
}

export const noteById = new Map(notes.map((n) => [n.id, n]));
export const noteByMidi = new Map(notes.map((n) => [n.midi, n]));

/** Note name without octave, in the requested notation. */
export const pitchName = (pc, solfege) => (solfege ? SOLFEGE[pc] : ENGLISH[pc]);
