import { noteByMidi } from '../../music/notes';

/** Helper: the keyboard range (whole octaves, C to B) covering some MIDI notes. */
export function octaveRangeFor(midis, minOctaves = 2) {
  const lo = Math.floor(Math.min(...midis) / 12) * 12;
  let hi = Math.ceil((Math.max(...midis) + 1) / 12) * 12 - 1;
  if (hi - lo + 1 < minOctaves * 12) hi = lo + minOctaves * 12 - 1;
  return [Math.max(lo, 36), Math.min(hi, 107)];
}

export const keyElement = (scroller, noteId) => scroller?.querySelector(`[data-note="${noteId}"]`);
export const midiToId = (midi) => noteByMidi.get(midi)?.id;
