import { describe, expect, it } from 'vitest';
import { BINDINGS, MAX_BASE_OCTAVE, MIN_BASE_OCTAVE, labelsByMidi, midiForCode, rangeOf } from './keymap';
import { FIRST_MIDI, LAST_MIDI, noteById, noteByMidi, notes } from './notes';
import { CHORDS, SCALES, chordBySlug, diatonicChords, identify, inversions, scaleBySlug, search, spell, stepPattern } from './theory';

describe('notes', () => {
  it('covers C2..B7 with a sample for every key', () => {
    expect(notes).toHaveLength(72);
    expect(notes[0].id).toBe('C2');
    expect(notes.at(-1).id).toBe('B7');
    expect(notes.every((n) => n.src)).toBe(true);
  });

  it('uses standard tuning', () => {
    expect(noteById.get('A4').frequency).toBeCloseTo(440, 5);
    expect(noteById.get('C4').frequency.toFixed(2)).toBe('261.63');
  });
});

describe('keymap', () => {
  it('maps the default layout to C4..A6', () => {
    expect(midiForCode('KeyQ', 4)).toBe(60);
    expect(midiForCode('IntlBackslash', 4)).toBe(noteById.get('F5').midi);
    expect(midiForCode('Period', 4)).toBe(noteById.get('A6').midi);
    expect(midiForCode('KeyF', 4)).toBeNull();
  });

  it('maps every key to a distinct semitone and stays in range', () => {
    const offsets = BINDINGS.map((b) => b.offset).sort((a, b) => a - b);
    expect(offsets).toEqual(offsets.map((_, i) => i));
    for (let o = MIN_BASE_OCTAVE; o <= MAX_BASE_OCTAVE; o++) {
      const [lo, hi] = rangeOf(o);
      expect(lo).toBeGreaterThanOrEqual(FIRST_MIDI);
      expect(hi).toBeLessThanOrEqual(LAST_MIDI);
      expect([...labelsByMidi(o).keys()].every((m) => noteByMidi.has(m))).toBe(true);
    }
  });
});

describe('spelling', () => {
  it('spells notes by scale degree', () => {
    expect(chordBySlug.get('e-flat-minor').notes.map((n) => n.name)).toEqual(['Eb', 'Gb', 'Bb']);
    expect(chordBySlug.get('f-sharp-major').notes.map((n) => n.name)).toEqual(['F#', 'A#', 'C#']);
    expect(chordBySlug.get('c-7').notes.map((n) => n.name)).toEqual(['C', 'E', 'G', 'Bb']);
    expect(scaleBySlug.get('f-major').notes.map((n) => n.name)).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
    expect(scaleBySlug.get('c-blues').notes.map((n) => n.name)).toEqual(['C', 'Eb', 'F', 'Gb', 'G', 'Bb']);
  });

  it('avoids double accidentals', () => {
    expect(spell('C', 9, 7)).toBe('A'); // not Bbb
    expect(chordBySlug.get('c-diminished-7').notes.map((n) => n.name)).toEqual(['C', 'Eb', 'Gb', 'A']);
  });
});

describe('reference data', () => {
  it('has unique slugs for every chord and scale in all keys', () => {
    expect(CHORDS).toHaveLength(300);
    expect(SCALES).toHaveLength(144);
    expect(new Set(CHORDS.map((c) => c.slug)).size).toBe(300);
    expect(new Set(SCALES.map((s) => s.slug)).size).toBe(144);
    expect(CHORDS.every((c) => c.midis.every((m) => noteByMidi.has(m)))).toBe(true);
  });

  it('builds diatonic chords, step patterns and inversions', () => {
    expect(diatonicChords(scaleBySlug.get('c-major')).map((c) => c.symbol)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
    expect(diatonicChords(scaleBySlug.get('a-harmonic-minor')).map((c) => c.numeral)).toEqual(['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°']);
    expect(stepPattern(scaleBySlug.get('d-major'))).toBe('W W H W W W H');
    expect(inversions(chordBySlug.get('c-major')).map((i) => i.symbol)).toEqual(['C', 'C/E', 'C/G']);
  });
});

describe('identify', () => {
  const ids = (...list) => list.map((id) => noteById.get(id).midi);
  const top = (...list) => {
    const r = identify(ids(...list));
    return r.kind === 'chord' ? r.chords[0].chord.symbol + (r.chords[0].bass ? `/${r.chords[0].bass}` : '') : r.name;
  };

  it('names chords, inversions and intervals', () => {
    expect(top('C4', 'E4', 'G4')).toBe('C');
    expect(top('C4', 'Dsharp4', 'G4')).toBe('Cm');
    expect(top('Dsharp4', 'Fsharp4', 'Asharp4')).toBe('Ebm');
    expect(top('E3', 'G3', 'C4')).toBe('C/E');
    expect(top('G3', 'B3', 'D4', 'F4')).toBe('G7');
    expect(top('C4', 'E4', 'Asharp4')).toBe('C7');
    expect(top('C4', 'G4')).toBe('Perfect 5th');
    expect(top('C4', 'C5')).toBe('Octave');
    expect(identify(ids('C4'))).toBeNull();
    expect(identify(ids('C4', 'Csharp4', 'D4'))).toBeNull();
  });
});

describe('search', () => {
  const first = (q) => {
    const [r] = search(q);
    return r && `${r.item.type}:${r.item.slug ?? r.label}`;
  };

  it('understands chord symbols, names, flats and solfège', () => {
    expect(first('Am7')).toBe('chord:a-minor-7');
    expect(first('am')).toBe('chord:a-minor');
    expect(first('CM7')).toBe('chord:c-major-7');
    expect(first('Cmaj7')).toBe('chord:c-major-7');
    expect(first('Bb')).toBe('chord:b-flat-major');
    expect(first('D#m')).toBe('chord:e-flat-minor');
    expect(first('F♯ minor')).toBe('chord:f-sharp-minor');
    expect(first('Do mayor')).toBe('chord:c-major');
    expect(first('lam')).toBe('chord:a-minor');
  });

  it('finds scales and single notes', () => {
    expect(first('d dorian')).toBe('scale:d-dorian');
    expect(first('e minor pentatonic')).toBe('scale:e-minor-pentatonic');
    expect(first('A4')).toBe('note:A4');
    expect(search('zzz')).toEqual([]);
  });
});
