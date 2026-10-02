// Music theory reference data: chords, scales, note spelling and search.

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const LETTER_SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/** The 12 roots with their most common spelling (and the enharmonic one). */
export const ROOTS = [
  { pc: 0, name: 'C', slug: 'c' },
  { pc: 1, name: 'C#', alt: 'Db', slug: 'c-sharp' },
  { pc: 2, name: 'D', slug: 'd' },
  { pc: 3, name: 'Eb', alt: 'D#', slug: 'e-flat' },
  { pc: 4, name: 'E', slug: 'e' },
  { pc: 5, name: 'F', slug: 'f' },
  { pc: 6, name: 'F#', alt: 'Gb', slug: 'f-sharp' },
  { pc: 7, name: 'G', slug: 'g' },
  { pc: 8, name: 'Ab', alt: 'G#', slug: 'a-flat' },
  { pc: 9, name: 'A', slug: 'a' },
  { pc: 10, name: 'Bb', alt: 'A#', slug: 'b-flat' },
  { pc: 11, name: 'B', slug: 'b' },
];

/** "C#" → "Do#", "Bb" → "Sib". */
export const toSolfege = (name) => LETTER_SOLFEGE[name[0]] + name.slice(1);
export const displayName = (name, solfege) => (solfege ? toSolfege(name) : name);

/**
 * Spells the note `semitones` above `rootName` as the given scale degree
 * (so E-flat minor is Eb Gb Bb, not D# F# A#). Double accidentals fall back
 * to the simpler enharmonic name.
 */
export function spell(rootName, semitones, degree) {
  const rootPc = (LETTER_PC[rootName[0]] + accidentalValue(rootName.slice(1)) + 12) % 12;
  const pc = (rootPc + semitones) % 12;
  const letter = LETTERS[(LETTERS.indexOf(rootName[0]) + degree - 1) % 7];
  const diff = ((pc - LETTER_PC[letter] + 18) % 12) - 6;
  if (Math.abs(diff) > 1) return (rootName.includes('b') ? FLAT_NAMES : SHARP_NAMES)[pc];
  return letter + (diff === 1 ? '#' : diff === -1 ? 'b' : '');
}

function accidentalValue(acc) {
  return [...acc].reduce((v, c) => v + (c === '#' ? 1 : c === 'b' ? -1 : 0), 0);
}

const INTERVAL_LABELS = {
  0: 'R', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: 'b5', 7: '5', 8: '#5', 9: '6', 10: 'b7', 11: '7',
  13: 'b9', 14: '9', 17: '11', 21: '13',
};

// [semitones above the root, scale degree]
const t = (...pairs) => pairs.map(([semitones, degree]) => ({ semitones, degree }));

/** Chord qualities, ordered from most to least common. */
export const QUALITIES = [
  { id: 'major', symbol: '', slug: 'major', name: 'major', tones: t([0, 1], [4, 3], [7, 5]), aliases: ['', 'maj', 'major', 'mayor'] },
  { id: 'minor', symbol: 'm', slug: 'minor', name: 'minor', tones: t([0, 1], [3, 3], [7, 5]), aliases: ['m', 'min', 'minor', '-', 'menor'] },
  { id: '7', symbol: '7', slug: '7', name: 'dominant 7th', tones: t([0, 1], [4, 3], [7, 5], [10, 7]), aliases: ['7', 'dom7', 'dominant 7'] },
  { id: 'maj7', symbol: 'maj7', slug: 'major-7', name: 'major 7th', tones: t([0, 1], [4, 3], [7, 5], [11, 7]), aliases: ['maj7', 'major 7', 'ma7', 'Δ7', 'Δ'] },
  { id: 'm7', symbol: 'm7', slug: 'minor-7', name: 'minor 7th', tones: t([0, 1], [3, 3], [7, 5], [10, 7]), aliases: ['m7', 'min7', 'minor 7', '-7'] },
  { id: 'dim', symbol: 'dim', slug: 'diminished', name: 'diminished', tones: t([0, 1], [3, 3], [6, 5]), aliases: ['dim', 'diminished', '°'] },
  { id: 'aug', symbol: 'aug', slug: 'augmented', name: 'augmented', tones: t([0, 1], [4, 3], [8, 5]), aliases: ['aug', 'augmented', '+'] },
  { id: 'sus2', symbol: 'sus2', slug: 'sus2', name: 'suspended 2nd', tones: t([0, 1], [2, 2], [7, 5]), aliases: ['sus2', 'suspended 2'] },
  { id: 'sus4', symbol: 'sus4', slug: 'sus4', name: 'suspended 4th', tones: t([0, 1], [5, 4], [7, 5]), aliases: ['sus4', 'sus', 'suspended 4', 'suspended'] },
  { id: '6', symbol: '6', slug: '6', name: 'major 6th', tones: t([0, 1], [4, 3], [7, 5], [9, 6]), aliases: ['6', 'maj6', 'major 6'] },
  { id: 'm6', symbol: 'm6', slug: 'minor-6', name: 'minor 6th', tones: t([0, 1], [3, 3], [7, 5], [9, 6]), aliases: ['m6', 'min6', 'minor 6'] },
  { id: 'm7b5', symbol: 'm7b5', slug: 'half-diminished-7', name: 'half-diminished 7th', tones: t([0, 1], [3, 3], [6, 5], [10, 7]), aliases: ['m7b5', 'ø', 'ø7', 'half diminished', 'half-diminished 7'] },
  { id: 'dim7', symbol: 'dim7', slug: 'diminished-7', name: 'diminished 7th', tones: t([0, 1], [3, 3], [6, 5], [9, 7]), aliases: ['dim7', '°7', 'diminished 7'] },
  { id: 'mMaj7', symbol: 'm(maj7)', slug: 'minor-major-7', name: 'minor major 7th', tones: t([0, 1], [3, 3], [7, 5], [11, 7]), aliases: ['m(maj7)', 'mmaj7', 'minmaj7', 'minor major 7'] },
  { id: '7sus4', symbol: '7sus4', slug: '7-sus4', name: 'dominant 7th suspended 4th', tones: t([0, 1], [5, 4], [7, 5], [10, 7]), aliases: ['7sus4', '7sus'] },
  { id: '7#5', symbol: '7#5', slug: 'augmented-7', name: 'augmented 7th', tones: t([0, 1], [4, 3], [8, 5], [10, 7]), aliases: ['7#5', 'aug7', '+7', 'augmented 7'] },
  { id: 'add9', symbol: 'add9', slug: 'add9', name: 'added 9th', tones: t([0, 1], [4, 3], [7, 5], [14, 9]), aliases: ['add9', 'add2'] },
  { id: 'madd9', symbol: 'm(add9)', slug: 'minor-add9', name: 'minor added 9th', tones: t([0, 1], [3, 3], [7, 5], [14, 9]), aliases: ['m(add9)', 'madd9', 'minor add9'] },
  { id: '9', symbol: '9', slug: '9', name: 'dominant 9th', tones: t([0, 1], [4, 3], [7, 5], [10, 7], [14, 9]), aliases: ['9', 'dom9', 'dominant 9'] },
  { id: 'maj9', symbol: 'maj9', slug: 'major-9', name: 'major 9th', tones: t([0, 1], [4, 3], [7, 5], [11, 7], [14, 9]), aliases: ['maj9', 'major 9'] },
  { id: 'm9', symbol: 'm9', slug: 'minor-9', name: 'minor 9th', tones: t([0, 1], [3, 3], [7, 5], [10, 7], [14, 9]), aliases: ['m9', 'min9', 'minor 9'] },
  { id: '6/9', symbol: '6/9', slug: '6-9', name: 'six-nine', tones: t([0, 1], [4, 3], [7, 5], [9, 6], [14, 9]), aliases: ['6/9', '69', '6add9'] },
  { id: '11', symbol: '11', slug: '11', name: 'dominant 11th', tones: t([0, 1], [4, 3], [7, 5], [10, 7], [14, 9], [17, 11]), aliases: ['11', 'dom11'] },
  { id: 'm11', symbol: 'm11', slug: 'minor-11', name: 'minor 11th', tones: t([0, 1], [3, 3], [7, 5], [10, 7], [14, 9], [17, 11]), aliases: ['m11', 'min11', 'minor 11'] },
  { id: '13', symbol: '13', slug: '13', name: 'dominant 13th', tones: t([0, 1], [4, 3], [7, 5], [10, 7], [14, 9], [21, 13]), aliases: ['13', 'dom13'] },
];

export const SCALE_TYPES = [
  { id: 'major', slug: 'major', name: 'major', aka: 'Ionian mode', steps: t([0, 1], [2, 2], [4, 3], [5, 4], [7, 5], [9, 6], [11, 7]) },
  { id: 'minor', slug: 'natural-minor', name: 'natural minor', aka: 'Aeolian mode', steps: t([0, 1], [2, 2], [3, 3], [5, 4], [7, 5], [8, 6], [10, 7]) },
  { id: 'harmonic-minor', slug: 'harmonic-minor', name: 'harmonic minor', steps: t([0, 1], [2, 2], [3, 3], [5, 4], [7, 5], [8, 6], [11, 7]) },
  { id: 'melodic-minor', slug: 'melodic-minor', name: 'melodic minor', aka: 'jazz minor', steps: t([0, 1], [2, 2], [3, 3], [5, 4], [7, 5], [9, 6], [11, 7]) },
  { id: 'major-pentatonic', slug: 'major-pentatonic', name: 'major pentatonic', steps: t([0, 1], [2, 2], [4, 3], [7, 5], [9, 6]) },
  { id: 'minor-pentatonic', slug: 'minor-pentatonic', name: 'minor pentatonic', steps: t([0, 1], [3, 3], [5, 4], [7, 5], [10, 7]) },
  { id: 'blues', slug: 'blues', name: 'blues', steps: t([0, 1], [3, 3], [5, 4], [6, 5], [7, 5], [10, 7]) },
  { id: 'dorian', slug: 'dorian', name: 'Dorian', aka: '2nd mode of the major scale', steps: t([0, 1], [2, 2], [3, 3], [5, 4], [7, 5], [9, 6], [10, 7]) },
  { id: 'phrygian', slug: 'phrygian', name: 'Phrygian', aka: '3rd mode of the major scale', steps: t([0, 1], [1, 2], [3, 3], [5, 4], [7, 5], [8, 6], [10, 7]) },
  { id: 'lydian', slug: 'lydian', name: 'Lydian', aka: '4th mode of the major scale', steps: t([0, 1], [2, 2], [4, 3], [6, 4], [7, 5], [9, 6], [11, 7]) },
  { id: 'mixolydian', slug: 'mixolydian', name: 'Mixolydian', aka: '5th mode of the major scale', steps: t([0, 1], [2, 2], [4, 3], [5, 4], [7, 5], [9, 6], [10, 7]) },
  { id: 'locrian', slug: 'locrian', name: 'Locrian', aka: '7th mode of the major scale', steps: t([0, 1], [1, 2], [3, 3], [5, 4], [6, 5], [8, 6], [10, 7]) },
];

// Where chords and scales are voiced on the keyboard: root in octave 4 (C4 = MIDI 60).
const rootMidi = (pc) => 60 + pc;

const intervalLabel = (semitones) => INTERVAL_LABELS[semitones] ?? String(semitones);

function buildChord(root, quality) {
  const notes = quality.tones.map(({ semitones, degree }) => ({
    name: spell(root.name, semitones, degree),
    interval: intervalLabel(semitones),
    midi: rootMidi(root.pc) + semitones,
  }));
  const symbol = root.name + quality.symbol;
  return {
    type: 'chord',
    slug: `${root.slug}-${quality.slug}`,
    root,
    quality,
    symbol,
    name: `${root.name} ${quality.name}`,
    notes,
    midis: notes.map((n) => n.midi),
    pcs: notes.map((n) => n.midi % 12),
  };
}

function buildScale(root, scaleType) {
  const notes = scaleType.steps.map(({ semitones, degree }) => ({
    name: spell(root.name, semitones, degree),
    interval: intervalLabel(semitones),
    midi: rootMidi(root.pc) + semitones,
  }));
  return {
    type: 'scale',
    slug: `${root.slug}-${scaleType.slug}`,
    root,
    scaleType,
    name: `${root.name} ${scaleType.name}`,
    notes,
    // Played ascending, ending on the octave.
    midis: [...notes.map((n) => n.midi), rootMidi(root.pc) + 12],
    pcs: notes.map((n) => n.midi % 12),
  };
}

export const CHORDS = ROOTS.flatMap((root) => QUALITIES.map((q) => buildChord(root, q)));
export const SCALES = ROOTS.flatMap((root) => SCALE_TYPES.map((s) => buildScale(root, s)));
export const chordBySlug = new Map(CHORDS.map((c) => [c.slug, c]));
export const scaleBySlug = new Map(SCALES.map((s) => [s.slug, s]));
export const findChord = (pc, qualityId) => CHORDS.find((c) => c.root.pc === pc && c.quality.id === qualityId);
export const findScale = (pc, scaleId) => SCALES.find((s) => s.root.pc === pc && s.scaleType.id === scaleId);

export const chordPath = (chord) => `/chords/${chord.slug}`;
export const scalePath = (scale) => `/scales/${scale.slug}`;

/** Inversions of a chord: each tone in turn becomes the lowest note. */
export function inversions(chord) {
  const base = chord.notes.filter((n) => n.midi - chord.notes[0].midi < 12); // triad/7th core, no extensions
  return base.map((_, i) => {
    const notes = [...base.slice(i), ...base.slice(0, i).map((n) => ({ ...n, midi: n.midi + 12 }))];
    return {
      label: i === 0 ? 'Root position' : `${ordinal(i)} inversion`,
      symbol: i === 0 ? chord.symbol : `${chord.symbol}/${notes[0].name}`,
      notes,
    };
  });
}

const ordinal = (n) => ['', '1st', '2nd', '3rd', '4th', '5th'][n];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** The triads built on each degree of a 7-note scale. */
export function diatonicChords(scale) {
  if (scale.notes.length !== 7) return [];
  return scale.notes.map((note, i) => {
    const pcs = [0, 2, 4].map((k) => scale.notes[(i + k) % 7].midi % 12);
    const third = (pcs[1] - pcs[0] + 12) % 12;
    const fifth = (pcs[2] - pcs[0] + 12) % 12;
    const qualityId = third === 4 ? (fifth === 8 ? 'aug' : 'major') : fifth === 6 ? 'dim' : 'minor';
    const chord = findChord(pcs[0], qualityId);
    let numeral = third === 4 ? ROMAN[i] : ROMAN[i].toLowerCase();
    if (qualityId === 'dim') numeral += '°';
    if (qualityId === 'aug') numeral += '+';
    return { numeral, chord, symbol: note.name + chord.quality.symbol };
  });
}

/** Whole/half step pattern of a scale, e.g. "W W H W W W H". */
export function stepPattern(scale) {
  const midis = scale.midis;
  return midis.slice(1).map((m, i) => {
    const d = m - midis[i];
    return d === 1 ? 'H' : d === 2 ? 'W' : d === 3 ? 'W+H' : `${d}`;
  }).join(' ');
}

// ---------------------------------------------------------------------------
// Recognising what is being played

const INTERVAL_NAMES = [
  'Octave', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
  'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th',
];

const maskOf = (pcs) => pcs.reduce((m, pc) => m | (1 << (pc % 12)), 0);
const hasSeventh = (c) => c.quality.tones.some((x) => x.degree === 7);

// Chords by pitch-class set. Seventh chords also match without their fifth.
const CHORDS_BY_MASK = new Map();
const addToMask = (mask, entry) => {
  if (!CHORDS_BY_MASK.has(mask)) CHORDS_BY_MASK.set(mask, []);
  CHORDS_BY_MASK.get(mask).push(entry);
};
CHORDS.forEach((chord) => {
  const rank = QUALITIES.indexOf(chord.quality);
  addToMask(maskOf(chord.pcs), { chord, rank, omitted: false });
  if (hasSeventh(chord) && !chord.quality.id.includes('sus') && chord.quality.tones.some((x) => x.semitones === 7)) {
    addToMask(maskOf(chord.pcs.filter((pc) => pc !== (chord.root.pc + 7) % 12)), { chord, rank, omitted: true });
  }
});

/**
 * What the given MIDI notes form: `{ kind: 'chord', chords: [{ chord, bass, symbol }] }`,
 * `{ kind: 'interval', name }` or null.
 */
export function identify(midis) {
  if (midis.length < 2) return null;
  const sorted = [...midis].sort((a, b) => a - b);
  const bass = sorted[0] % 12;
  const pcs = [...new Set(sorted.map((m) => m % 12))];
  if (pcs.length === 1) return { kind: 'interval', name: 'Octave' };
  if (pcs.length === 2) {
    const upper = sorted.find((m) => m % 12 !== bass);
    return { kind: 'interval', name: INTERVAL_NAMES[(upper - sorted[0]) % 12] };
  }
  const matches = CHORDS_BY_MASK.get(maskOf(pcs)) ?? [];
  const complete = matches.filter((m) => !m.omitted);
  const chords = (complete.length ? complete : matches)
    .sort((a, b) => (a.chord.root.pc !== bass) - (b.chord.root.pc !== bass) || a.rank - b.rank)
    .slice(0, 3)
    .map(({ chord }) => {
      const bassName = chord.notes.find((n) => n.midi % 12 === bass)?.name;
      return { chord, bass: chord.root.pc === bass ? null : bassName };
    });
  return chords.length ? { kind: 'chord', chords } : null;
}

// ---------------------------------------------------------------------------
// Search

const SOLFEGE_ROOTS = { do: 'C', re: 'D', mi: 'E', fa: 'F', sol: 'G', la: 'A', si: 'B' };

const normalize = (s) =>
  s
    .normalize('NFKC')
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .replace(/\s+/g, ' ')
    .trim();

/** Every way someone might type a chord or scale name, lower-cased. */
function searchKeys(rootNames, suffixes) {
  const keys = new Set();
  for (const root of rootNames) {
    for (const suffix of suffixes) {
      const r = root.toLowerCase();
      keys.add(`${r}${suffix.toLowerCase()}`);
      if (suffix && /^[a-z]/i.test(suffix) && suffix.length > 2) keys.add(`${r} ${suffix.toLowerCase()}`);
    }
  }
  return [...keys];
}

const rootSpellings = (root) => {
  const names = [root.name, root.alt].filter(Boolean);
  return [...names, ...names.map(toSolfege), ...names.map((n) => n.replace('#', ' sharp').replace(/b$/, ' flat'))];
};

const SEARCH_INDEX = [
  ...CHORDS.map((chord) => ({
    item: chord,
    label: chord.symbol || chord.root.name,
    detail: `${chord.name} chord`,
    keys: searchKeys(rootSpellings(chord.root), [...chord.quality.aliases, `${chord.quality.name} chord`]),
    weight: chord.quality.id === 'major' || chord.quality.id === 'minor' ? 0 : 0.5,
  })),
  ...SCALES.map((scale) => ({
    item: scale,
    label: scale.name,
    detail: `${scale.scaleType.name} scale`,
    keys: searchKeys(rootSpellings(scale.root), [`${scale.scaleType.name} scale`, scale.scaleType.name]),
    weight: 1,
  })),
];

/**
 * Chords, scales and notes matching a free-text query ("Am7", "f# minor scale",
 * "Do mayor", "C4"…), best first.
 */
export function search(query, limit = 6) {
  let q = normalize(query);
  if (!q) return [];
  // "CM7" means C major 7 — the only case where M and m differ.
  q = q.replace(/^([A-Ga-g][#b]?)M(?!aj|in|a)/, '$1maj');
  const lower = q.toLowerCase();

  const single = parseNote(q);
  const results = [];
  if (single) results.push({ item: single, label: single.label, detail: 'note', score: -1 });

  for (const entry of SEARCH_INDEX) {
    let best = Infinity;
    for (const key of entry.keys) {
      if (key === lower) best = Math.min(best, 0);
      else if (key.startsWith(lower)) best = Math.min(best, 1 + (key.length - lower.length) / 20);
    }
    if (best < Infinity) results.push({ ...entry, score: best + entry.weight });
  }
  return results
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ item, label, detail }) => ({ item, label, detail }));
}

/** A single note with octave, like "C4", "f#3" or "Sol5". */
function parseNote(q) {
  const m = q.match(/^(do|re|mi|fa|sol|la|si|[a-g])\s*(#|b)?\s*(\d)$/i);
  if (!m) return null;
  const letter = SOLFEGE_ROOTS[m[1].toLowerCase()] ?? m[1].toUpperCase();
  const pc = (LETTER_PC[letter] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  const midi = (Number(m[3]) + 1) * 12 + pc;
  const name = letter + (m[2] ?? '');
  return { type: 'note', label: `${name}${m[3]}`, name, midis: [midi] };
}
