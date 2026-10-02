import { useSyncExternalStore } from 'react';
import { audioEngine } from '../audio/engine';
import { notes } from '../music/notes';

// Which notes are down, and who is holding each one (a pointer, a computer
// key…). A note sounds while at least one source holds it, so releasing the
// mouse doesn't cut a note that is still held on the keyboard.
const holders = new Map();
let pressed = []; // ids of the notes down, low to high
let sustainOn = false;
const listeners = new Set();
const strikeListeners = new Set();

const emit = () => {
  pressed = notes.filter((n) => holders.has(n.id)).map((n) => n.id);
  listeners.forEach((l) => l());
};

export function pressNote(id, source) {
  let sources = holders.get(id);
  if (sources?.has(source)) return;
  audioEngine.noteOn(id);
  strikeListeners.forEach((l) => l(id));
  if (sources) {
    sources.add(source);
    return;
  }
  sources = new Set([source]);
  holders.set(id, sources);
  emit();
}

export function releaseNote(id, source) {
  const sources = holders.get(id);
  if (!sources?.delete(source)) return;
  if (sources.size) return;
  holders.delete(id);
  audioEngine.noteOff(id);
  emit();
}

/** Releases every note held by sources matching the predicate (all by default). */
export function releaseAll(match = () => true) {
  for (const [id, sources] of [...holders]) {
    for (const source of [...sources]) {
      if (match(source)) releaseNote(id, source);
    }
  }
}

export function setSustain(on) {
  if (sustainOn === on) return;
  sustainOn = on;
  audioEngine.setSustain(on);
  listeners.forEach((l) => l());
}

/** Called with the note id every time a note is struck. */
export function onStrike(listener) {
  strikeListeners.add(listener);
  return () => strikeListeners.delete(listener);
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const usePressedNotes = () => useSyncExternalStore(subscribe, () => pressed);
export const useIsPressed = (id) => useSyncExternalStore(subscribe, () => holders.has(id));
export const useSustain = () => useSyncExternalStore(subscribe, () => sustainOn);
