import { useEffect, useRef } from 'react';
import { noteByMidi } from '../music/notes';
import { midiForCode } from '../music/keymap';
import { pressNote, releaseAll, releaseNote } from '../state/playback';

const isTyping = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * Plays the piano from the computer keyboard (mapped by physical key position).
 * Space holds the sustain pedal; ← / → shift the mapped octaves.
 */
export function useComputerKeyboard({ baseOctave, onOctaveShift, onSustainKey }) {
  // Read through a ref so the listeners don't need re-binding on every change.
  const latest = useRef({ baseOctave, onOctaveShift, onSustainKey });
  useEffect(() => {
    latest.current = { baseOctave, onOctaveShift, onSustainKey };
  });

  useEffect(() => {
    // code → note id currently held by that key, so the right note is released
    // even if the octave changed in between.
    const down = new Map();
    const isKeySource = (source) => source.startsWith('key:');

    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (e.code === 'Space') {
        e.preventDefault(); // no page scroll / button activation
        if (!e.repeat) latest.current.onSustainKey(true);
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        if (!e.repeat) latest.current.onOctaveShift(e.code === 'ArrowLeft' ? -1 : 1);
        return;
      }
      const midi = midiForCode(e.code, latest.current.baseOctave);
      const note = midi !== null && noteByMidi.get(midi);
      if (!note) return;
      e.preventDefault(); // e.g. Firefox quick-find on "'" or "/"
      if (e.repeat || down.has(e.code)) return;
      down.set(e.code, note.id);
      pressNote(note.id, `key:${e.code}`);
    };

    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        latest.current.onSustainKey(false);
        return;
      }
      const id = down.get(e.code);
      if (!id) return;
      down.delete(e.code);
      releaseNote(id, `key:${e.code}`);
    };

    // Key-up events are lost when the window loses focus: release everything.
    const onBlur = () => {
      down.clear();
      releaseAll(isKeySource);
      latest.current.onSustainKey(false);
    };
    const onVisibility = () => {
      if (document.hidden) onBlur();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      onBlur();
    };
  }, []);
}
