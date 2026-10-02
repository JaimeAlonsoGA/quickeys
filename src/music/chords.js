import { pitchName } from './notes';

// Chord qualities as semitone intervals from the root.
const QUALITIES = [
  { suffix: 'Maj', intervals: [0, 4, 7] },
  { suffix: 'm', intervals: [0, 3, 7] },
  { suffix: 'dim', intervals: [0, 3, 6] },
  { suffix: 'aug', intervals: [0, 4, 8] },
  { suffix: 'sus2', intervals: [0, 2, 7] },
  { suffix: 'sus4', intervals: [0, 5, 7] },
  { suffix: '7', intervals: [0, 4, 7, 10] },
  { suffix: 'maj7', intervals: [0, 4, 7, 11] },
  { suffix: 'm7', intervals: [0, 3, 7, 10] },
  { suffix: 'm(maj7)', intervals: [0, 3, 7, 11] },
  { suffix: 'm7b5', intervals: [0, 3, 6, 10] },
  { suffix: 'dim7', intervals: [0, 3, 6, 9] },
  { suffix: '7#5', intervals: [0, 4, 8, 10] },
  { suffix: '7sus4', intervals: [0, 5, 7, 10] },
  { suffix: '6', intervals: [0, 4, 7, 9] },
  { suffix: 'm6', intervals: [0, 3, 7, 9] },
  { suffix: 'add9', intervals: [0, 2, 4, 7] },
  { suffix: 'madd9', intervals: [0, 2, 3, 7] },
  { suffix: '9', intervals: [0, 2, 4, 7, 10] },
  { suffix: 'maj9', intervals: [0, 2, 4, 7, 11] },
  { suffix: 'm9', intervals: [0, 2, 3, 7, 10] },
  { suffix: '6/9', intervals: [0, 2, 4, 7, 9] },
  { suffix: '11', intervals: [0, 2, 4, 5, 7, 10] },
  { suffix: 'm11', intervals: [0, 2, 3, 5, 7, 10] },
  { suffix: '13', intervals: [0, 2, 4, 7, 9, 10] },
];

const INTERVALS = [
  'Octave', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
  'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th',
];

const maskOf = (pcs) => pcs.reduce((m, pc) => m | (1 << (pc % 12)), 0);

// Every chord of every root, keyed by its pitch-class bitmask. Chords with a
// seventh are also matched with their (often omitted) fifth left out.
const CHORDS = new Map();
const addChord = (mask, chord) => {
  if (!CHORDS.has(mask)) CHORDS.set(mask, []);
  CHORDS.get(mask).push(chord);
};
for (let root = 0; root < 12; root++) {
  QUALITIES.forEach((q, rank) => {
    const pcs = q.intervals.map((i) => root + i);
    addChord(maskOf(pcs), { root, suffix: q.suffix, rank, omitted: false });
    const hasSeventh = q.intervals.includes(10) || q.intervals.includes(11);
    if (hasSeventh && q.intervals.includes(7) && !q.suffix.includes('sus')) {
      addChord(maskOf(pcs.filter((pc) => pc !== root + 7)), { root, suffix: q.suffix, rank, omitted: true });
    }
  });
}

/**
 * Names the chord (3+ distinct pitch classes) or interval (2) formed by the
 * given MIDI notes. Returns an empty string when nothing is recognised.
 */
export function describeNotes(midis, solfege = false, max = 3) {
  if (midis.length < 2) return '';
  const sorted = [...midis].sort((a, b) => a - b);
  const bass = sorted[0] % 12;
  const pcs = [...new Set(sorted.map((m) => m % 12))];

  if (pcs.length === 1) return sorted.length > 1 ? 'Octave' : '';
  if (pcs.length === 2) {
    const upper = sorted.find((m) => m % 12 !== bass);
    return INTERVALS[(upper - sorted[0]) % 12];
  }

  const matches = CHORDS.get(maskOf(pcs)) ?? [];
  // A chord voiced without its fifth only counts when nothing complete matches.
  const complete = matches.filter((c) => !c.omitted);
  return (complete.length ? complete : matches)
    // Root position first, then simpler chords.
    .sort((a, b) => (a.root !== bass) - (b.root !== bass) || a.rank - b.rank)
    .slice(0, max)
    .map((c) => {
      const name = pitchName(c.root, solfege) + c.suffix;
      return c.root === bass ? name : `${name}/${pitchName(bass, solfege)}`;
    })
    .join(' · ');
}
