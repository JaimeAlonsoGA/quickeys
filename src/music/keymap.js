// Computer keyboard → piano mapping, by physical key position (KeyboardEvent.code)
// so it works the same on QWERTY, QWERTZ, AZERTY, etc. `offset` is the number
// of semitones above the C of the base octave.
export const BINDINGS = [
  { code: 'KeyQ', label: 'Q', offset: 0 },
  { code: 'Digit2', label: '2', offset: 1 },
  { code: 'KeyW', label: 'W', offset: 2 },
  { code: 'Digit3', label: '3', offset: 3 },
  { code: 'KeyE', label: 'E', offset: 4 },
  { code: 'KeyR', label: 'R', offset: 5 },
  { code: 'Digit5', label: '5', offset: 6 },
  { code: 'KeyT', label: 'T', offset: 7 },
  { code: 'Digit6', label: '6', offset: 8 },
  { code: 'KeyY', label: 'Y', offset: 9 },
  { code: 'Digit7', label: '7', offset: 10 },
  { code: 'KeyU', label: 'U', offset: 11 },
  { code: 'KeyI', label: 'I', offset: 12 },
  { code: 'Digit9', label: '9', offset: 13 },
  { code: 'KeyO', label: 'O', offset: 14 },
  { code: 'Digit0', label: '0', offset: 15 },
  { code: 'KeyP', label: 'P', offset: 16 },
  { code: 'IntlBackslash', label: '<', offset: 17 },
  { code: 'KeyA', label: 'A', offset: 18 },
  { code: 'KeyZ', label: 'Z', offset: 19 },
  { code: 'KeyS', label: 'S', offset: 20 },
  { code: 'KeyX', label: 'X', offset: 21 },
  { code: 'KeyD', label: 'D', offset: 22 },
  { code: 'KeyC', label: 'C', offset: 23 },
  { code: 'KeyV', label: 'V', offset: 24 },
  { code: 'KeyG', label: 'G', offset: 25 },
  { code: 'KeyB', label: 'B', offset: 26 },
  { code: 'KeyH', label: 'H', offset: 27 },
  { code: 'KeyN', label: 'N', offset: 28 },
  { code: 'KeyM', label: 'M', offset: 29 },
  { code: 'KeyK', label: 'K', offset: 30 },
  { code: 'Comma', label: ',', offset: 31 },
  { code: 'KeyL', label: 'L', offset: 32 },
  { code: 'Period', label: '.', offset: 33 },
];

const bindingByCode = new Map(BINDINGS.map((b) => [b.code, b]));

// Visual layout of the two keymap blocks: [upper row, lower row]. null = spacer.
const row = (codes) => codes.map((code) => (code ? bindingByCode.get(code) ?? { code, label: code.replace(/^(Key|Digit)/, '') } : null));
export const KEYMAP_LAYOUT = {
  left: [
    row(['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0']),
    row(['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP']),
  ],
  right: [
    row([null, 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL']),
    row(['IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period']),
  ],
};

// The mapped span (C..A two octaves up) must stay inside C2..B7.
export const MIN_BASE_OCTAVE = 2;
export const MAX_BASE_OCTAVE = 5;
export const DEFAULT_BASE_OCTAVE = 4;

const SPAN = BINDINGS[BINDINGS.length - 1].offset;

export const clampOctave = (o) => Math.min(MAX_BASE_OCTAVE, Math.max(MIN_BASE_OCTAVE, Math.round(o)));

/** MIDI number played by a key code, or null when the code is not mapped. */
export function midiForCode(code, baseOctave) {
  const binding = bindingByCode.get(code);
  return binding ? (baseOctave + 1) * 12 + binding.offset : null;
}

/** Map of MIDI number → key label for every mapped note. */
export function labelsByMidi(baseOctave) {
  const base = (baseOctave + 1) * 12;
  return new Map(BINDINGS.map((b) => [base + b.offset, b.label]));
}

export const rangeOf = (baseOctave) => {
  const lo = (baseOctave + 1) * 12;
  return [lo, lo + SPAN];
};
