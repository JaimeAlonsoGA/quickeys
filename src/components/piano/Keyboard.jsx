import { forwardRef, memo, useCallback, useEffect, useId, useRef } from 'react';
import { audioEngine } from '../../audio/engine';
import { notes as ALL_NOTES } from '../../music/notes';
import { toSolfege } from '../../music/theory';
import { pressNote, releaseNote, useIsPressed } from '../../state/playback';

const noteIdFromEvent = (e) => e.target.closest?.('[data-note]')?.dataset.note;

/**
 * A playable piano keyboard for the MIDI range [from, to].
 *
 * - `fit`: keys stretch to fill the width (no scrolling); otherwise each white
 *   key is `keyWidth` px wide and the keyboard scrolls horizontally.
 * - `marked`: Map of MIDI number → note name to highlight (a chord or scale,
 *   spelled the right way: Eb, not D#).
 * - `labels`: Map of MIDI number → computer key label.
 */
const Keyboard = forwardRef(function Keyboard(
  { from = 36, to = 107, fit = false, keyWidth = 40, marked, labels, solfege = false, className = '' },
  scrollerRef,
) {
  const range = ALL_NOTES.filter((n) => n.midi >= from && n.midi <= to);
  const whites = range.filter((n) => n.white);
  const pointerNotes = useRef(new Map());
  const uid = useId(); // keeps each keyboard's pointers apart

  const pointerPress = (pointerId, noteId) => {
    const previous = pointerNotes.current.get(pointerId);
    if (previous === noteId) return;
    if (previous) releaseNote(previous, `ptr:${uid}:${pointerId}`);
    pointerNotes.current.set(pointerId, noteId);
    pressNote(noteId, `ptr:${uid}:${pointerId}`);
  };

  const pointerRelease = useCallback((pointerId) => {
    const previous = pointerNotes.current.get(pointerId);
    if (!previous) return;
    pointerNotes.current.delete(pointerId);
    releaseNote(previous, `ptr:${uid}:${pointerId}`);
  }, [uid]);

  useEffect(() => {
    const held = pointerNotes.current;
    const onUp = (e) => pointerRelease(e.pointerId);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      [...held.keys()].forEach(pointerRelease);
    };
  }, [pointerRelease]);

  const handlers = {
    onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const noteId = noteIdFromEvent(e);
      if (!noteId) return;
      if (e.pointerType === 'mouse') e.preventDefault(); // no focus ring or text selection
      pointerPress(e.pointerId, noteId);
    },
    // A mouse dragged with the button down glides across the keys.
    onPointerOver(e) {
      if (e.pointerType !== 'mouse') return;
      const noteId = noteIdFromEvent(e);
      if (!noteId) return;
      audioEngine.load(noteId); // warm the sample up on hover
      if (pointerNotes.current.has(e.pointerId) && e.buttons & 1) pointerPress(e.pointerId, noteId);
    },
    onPointerLeave(e) {
      if (e.pointerType === 'mouse') pointerRelease(e.pointerId);
    },
    onContextMenu: (e) => e.preventDefault(),
  };

  let whiteIndex = 0;
  const keys = range.map((note) => {
    const common = {
      note,
      marked: marked?.has(note.midi) ? (marked.get(note.midi) ?? note.english) : null,
      label: labels?.get(note.midi),
      solfege,
    };
    if (note.white) {
      whiteIndex += 1;
      return <WhiteKey key={note.id} {...common} />;
    }
    return <BlackKey key={note.id} {...common} offset={whiteIndex} />;
  });

  return (
    <div
      ref={scrollerRef}
      className={`piano-scroll select-none ${fit ? 'overflow-hidden' : 'overflow-x-auto'} ${className}`}
      {...handlers}
    >
      <div
        className="relative flex h-full"
        style={{
          '--wk': fit ? `${100 / whites.length}%` : `${keyWidth}px`,
          '--bk': 'calc(var(--wk) * 0.62)',
          width: fit ? '100%' : 'max-content',
        }}
      >
        {keys}
      </div>
    </div>
  );
});

const noteName = (note, solfege, spelled) => {
  const name = spelled ?? note.english;
  return solfege ? toSolfege(name) : name;
};

const WhiteKey = memo(function WhiteKey({ note, marked, label, solfege }) {
  const pressed = useIsPressed(note.id);
  const lit = pressed || marked;
  const showName = lit || note.pc === 0;
  return (
    <div
      data-note={note.id}
      role="button"
      aria-label={`${note.english}${note.octave}`}
      aria-pressed={pressed}
      className={`relative h-full shrink-0 rounded-b-[10px] border border-t-0 border-[#e3d9cb] transition-[background,box-shadow] duration-75
        ${pressed
          ? 'bg-accent shadow-[inset_0_6px_12px_rgb(0_0_0/0.18)]'
          : marked
            ? 'bg-gradient-to-b from-[#fffdf9] to-accent-soft'
            : 'bg-gradient-to-b from-[#fffdf9] to-[#f4ede3] shadow-[inset_0_-5px_0_rgb(0_0_0/0.05)] hover:to-[#ece3d6]'}`}
      style={{ width: 'var(--wk)' }}
    >
      {label && !pressed && (
        <span className="absolute inset-x-0 top-[62%] text-center font-mono text-[10px] font-semibold text-[#b3a593]">{label}</span>
      )}
      <span className="absolute inset-x-0 bottom-2 flex flex-col items-center gap-1">
        {marked && !pressed && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        {showName && (
          <span
            className={`text-[10px] leading-none sm:text-xs ${pressed ? 'font-bold text-accent-ink' : lit ? 'font-semibold text-accent' : 'text-[#b3a593]'}`}
          >
            {noteName(note, solfege, marked)}
            {note.pc === 0 && !solfege && !marked ? note.octave : ''}
          </span>
        )}
      </span>
    </div>
  );
});

const BlackKey = memo(function BlackKey({ note, marked, label, solfege, offset }) {
  const pressed = useIsPressed(note.id);
  return (
    <div
      data-note={note.id}
      role="button"
      aria-label={`${note.english}${note.octave}`}
      aria-pressed={pressed}
      className={`absolute top-0 z-10 h-[62%] rounded-b-[8px] transition-[background] duration-75
        ${pressed
          ? 'bg-accent shadow-[inset_0_4px_8px_rgb(0_0_0/0.25)]'
          : 'bg-gradient-to-b from-[#3b352f] to-[#1d1a17] shadow-[0_3px_4px_rgb(0_0_0/0.25),inset_0_-4px_0_rgb(255_255_255/0.06)] hover:from-[#4a433b]'}`}
      style={{ left: `calc(var(--wk) * ${offset} - var(--bk) / 2)`, width: 'var(--bk)' }}
    >
      {label && !pressed && (
        <span className="absolute inset-x-0 bottom-6 text-center font-mono text-[10px] font-semibold text-white/45">{label}</span>
      )}
      <span className="absolute inset-x-0 bottom-1.5 flex flex-col items-center gap-1">
        {marked && !pressed && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        {(pressed || marked) && (
          <span className={`text-[9px] leading-none font-semibold ${pressed ? 'text-accent-ink' : 'text-white/80'}`}>
            {noteName(note, solfege, marked)}
          </span>
        )}
      </span>
    </div>
  );
});

export default Keyboard;

