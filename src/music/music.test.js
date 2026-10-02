import { describe, expect, it } from 'vitest';
import { describeNotes } from './chords';
import { BINDINGS, MAX_BASE_OCTAVE, MIN_BASE_OCTAVE, labelsByMidi, midiForCode, rangeOf } from './keymap';
import { FIRST_MIDI, LAST_MIDI, noteById, noteByMidi, notes } from './notes';

describe('notes', () => {
  it('covers C2..B7 with a sample for every key', () => {
    expect(notes).toHaveLength(72);
    expect(notes[0].id).toBe('C2');
    expect(notes.at(-1).id).toBe('B7');
    expect(notes.every((n) => n.src)).toBe(true);
    expect(notes.filter((n) => n.white)).toHaveLength(42);
  });

  it('uses standard tuning', () => {
    expect(noteById.get('A4').frequency).toBeCloseTo(440, 5);
    expect(noteById.get('C4').frequency.toFixed(2)).toBe('261.63');
    expect(noteById.get('Csharp2')).toMatchObject({ english: 'C#', solfege: 'Do#', octave: 2, white: false });
  });
});

describe('keymap', () => {
  it('maps the default layout to C4..A6', () => {
    expect(midiForCode('KeyQ', 4)).toBe(noteById.get('C4').midi);
    expect(midiForCode('Digit2', 4)).toBe(noteById.get('Csharp4').midi);
    expect(midiForCode('IntlBackslash', 4)).toBe(noteById.get('F5').midi);
    expect(midiForCode('KeyV', 4)).toBe(noteById.get('C6').midi);
    expect(midiForCode('Period', 4)).toBe(noteById.get('A6').midi);
    expect(midiForCode('KeyF', 4)).toBeNull();
  });

  it('maps every key to a distinct semitone', () => {
    const offsets = BINDINGS.map((b) => b.offset).sort((a, b) => a - b);
    expect(offsets).toEqual(offsets.map((_, i) => i));
  });

  it('keeps every octave setting inside the playable range', () => {
    for (let o = MIN_BASE_OCTAVE; o <= MAX_BASE_OCTAVE; o++) {
      const [lo, hi] = rangeOf(o);
      expect(lo).toBeGreaterThanOrEqual(FIRST_MIDI);
      expect(hi).toBeLessThanOrEqual(LAST_MIDI);
      expect([...labelsByMidi(o).keys()].every((m) => noteByMidi.has(m))).toBe(true);
    }
    expect(rangeOf(MAX_BASE_OCTAVE + 1)[1]).toBeGreaterThan(LAST_MIDI);
  });
});

describe('describeNotes', () => {
  const midi = (...ids) => ids.map((id) => noteById.get(id).midi);

  it('names triads with sharps and flats', () => {
    expect(describeNotes(midi('C4', 'E4', 'G4'))).toBe('CMaj');
    expect(describeNotes(midi('C4', 'Dsharp4', 'G4'))).toBe('Cm');
    expect(describeNotes(midi('Fsharp3', 'Asharp3', 'Csharp4'))).toBe('F#Maj');
    expect(describeNotes(midi('B3', 'D4', 'F4'))).toBe('Bdim');
  });

  it('names sevenths, including without the fifth', () => {
    expect(describeNotes(midi('G3', 'B3', 'D4', 'F4'))).toBe('G7');
    expect(describeNotes(midi('C4', 'E4', 'Asharp4'))).toBe('C7');
    expect(describeNotes(midi('D4', 'F4', 'A4', 'C5'))).toMatch(/^Dm7/);
  });

  it('detects inversions and ambiguous chords', () => {
    expect(describeNotes(midi('E3', 'G3', 'C4'))).toBe('CMaj/E');
    expect(describeNotes(midi('A3', 'C4', 'E4', 'G4'))).toMatch(/^Am7 · C6\/A/);
  });

  it('names intervals and handles trivial input', () => {
    expect(describeNotes(midi('C4', 'G4'))).toBe('Perfect 5th');
    expect(describeNotes(midi('E4', 'C5'))).toBe('Minor 6th');
    expect(describeNotes(midi('C4', 'C5'))).toBe('Octave');
    expect(describeNotes(midi('C4'))).toBe('');
    expect(describeNotes(midi('C4', 'Csharp4', 'D4'))).toBe('');
  });

  it('uses solfège when asked', () => {
    expect(describeNotes(midi('A3', 'C4', 'E4'), true)).toBe('Lam');
  });
});
