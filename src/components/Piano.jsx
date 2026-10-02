import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { audioEngine } from '../audio/engine';
import { useComputerKeyboard } from '../hooks/useComputerKeyboard';
import { useIsLg, useIsXl } from '../hooks/useMediaQuery';
import { clampOctave, labelsByMidi, rangeOf } from '../music/keymap';
import { noteByMidi, notes } from '../music/notes';
import { onStrike, pressNote, releaseNote, setSustain } from '../state/playback';
import { useSettings } from '../state/SettingsProvider';
import Key from './Key';
import Keymap from './Keymap';
import MiniKeyboard from './MiniKeyboard';
import PressedNotes from './PressedNotes';
import Settings from './settings/Settings';
import Themes from './Themes';

const noteIdFromEvent = (e) => e.target.closest?.('[data-note]')?.dataset.note;
const keyElement = (scroller, id) => scroller?.querySelector(`[data-note="${id}"]`);
const isFullyVisible = (scroller, el) =>
  el.offsetLeft >= scroller.scrollLeft - 1 &&
  el.offsetLeft + el.offsetWidth <= scroller.scrollLeft + scroller.clientWidth + 1;

const Piano = () => {
  const settings = useSettings();
  const { theme, zoom, solfege, showAllNames, showPlayedNames, showKeyLabels, showKeymap,
    showMiniKeyboard, hideScrollbar, autoScroll, sustainLatch, baseOctave, volume, update } = settings;
  const isLg = useIsLg();
  const isXl = useIsXl();
  const scrollerRef = useRef(null);
  const [visible, setVisible] = useState({ first: -1, last: -1 });
  const [sustainKey, setSustainKey] = useState(false);

  // --- Sound settings -------------------------------------------------------
  useEffect(() => audioEngine.setVolume(volume), [volume]);
  useEffect(() => setSustain(sustainKey || sustainLatch), [sustainKey, sustainLatch]);

  // --- Computer keyboard ----------------------------------------------------
  const shiftOctave = useCallback((delta) => update('baseOctave', (o) => clampOctave(o + delta)), [update]);
  useComputerKeyboard({ baseOctave, onOctaveShift: shiftOctave, onSustainKey: setSustainKey });

  // --- Scrolling ------------------------------------------------------------
  const scrollToNote = useCallback((id, behavior = 'smooth') => {
    const scroller = scrollerRef.current;
    const el = keyElement(scroller, id);
    if (!el) return;
    scroller.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2, behavior });
  }, []);

  const updateVisible = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let first = -1;
    let last = -1;
    scroller.querySelectorAll('[data-note]').forEach((el, i) => {
      if (isFullyVisible(scroller, el)) {
        if (first < 0) first = i;
        last = i;
      }
    });
    setVisible((prev) => (prev.first === first && prev.last === last ? prev : { first, last }));
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateVisible);
    };
    scroller.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(scroller);
    observer.observe(scroller.firstElementChild); // the keys row, resized by zoom
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', schedule);
      observer.disconnect();
    };
  }, [updateVisible]);

  // Start centred on the C above the lowest mapped octave (C5 by default).
  const centerNote = noteByMidi.get(rangeOf(baseOctave)[0] + 12)?.id;
  const initialCenter = useRef(centerNote);
  useLayoutEffect(() => {
    scrollToNote(initialCenter.current, 'auto');
    updateVisible();
  }, [scrollToNote, updateVisible]);

  // Follow the mapped octaves when they change.
  const previousCenter = useRef(centerNote);
  useEffect(() => {
    if (previousCenter.current === centerNote) return;
    previousCenter.current = centerNote;
    if (autoScroll) scrollToNote(centerNote);
  }, [centerNote, autoScroll, scrollToNote]);

  // Keep struck notes in view.
  useEffect(() => {
    if (!autoScroll) return undefined;
    return onStrike((id) => {
      const scroller = scrollerRef.current;
      const el = keyElement(scroller, id);
      if (el && !isFullyVisible(scroller, el)) scrollToNote(id);
    });
  }, [autoScroll, scrollToNote]);

  // --- Sample loading -------------------------------------------------------
  // Decode what is likely to be played first; the rest loads on demand.
  const [lo, hi] = rangeOf(baseOctave);
  useEffect(() => {
    audioEngine.preload(notes.filter((n) => n.midi >= lo && n.midi <= hi).map((n) => n.id));
  }, [lo, hi]);
  useEffect(() => {
    if (visible.first < 0) return undefined;
    const timer = setTimeout(() => audioEngine.preload(notes.slice(visible.first, visible.last + 1).map((n) => n.id)), 300);
    return () => clearTimeout(timer);
  }, [visible]);

  // --- Pointer input (mouse, touch, pen) ------------------------------------
  // One handler set on the keys container; each pointer holds one note, and a
  // mouse dragged with the button down glides across the keys.
  const pointerNotes = useRef(new Map());

  const pointerPress = (pointerId, id) => {
    const previous = pointerNotes.current.get(pointerId);
    if (previous === id) return;
    if (previous) releaseNote(previous, `ptr:${pointerId}`);
    pointerNotes.current.set(pointerId, id);
    pressNote(id, `ptr:${pointerId}`);
  };

  const pointerRelease = useCallback((pointerId) => {
    const previous = pointerNotes.current.get(pointerId);
    if (!previous) return;
    pointerNotes.current.delete(pointerId);
    releaseNote(previous, `ptr:${pointerId}`);
  }, []);

  useEffect(() => {
    const onUp = (e) => pointerRelease(e.pointerId);
    const notes = pointerNotes.current;
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      [...notes.keys()].forEach(pointerRelease);
    };
  }, [pointerRelease]);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const id = noteIdFromEvent(e);
    if (!id) return;
    if (e.pointerType === 'mouse') e.preventDefault(); // no focus ring or text selection
    pointerPress(e.pointerId, id);
  };

  const onPointerOver = (e) => {
    if (e.pointerType !== 'mouse') return;
    const id = noteIdFromEvent(e);
    if (!id) return;
    audioEngine.load(id); // warm up the sample on hover
    if (pointerNotes.current.has(e.pointerId) && e.buttons & 1) pointerPress(e.pointerId, id);
  };

  const onPointerLeave = (e) => {
    if (e.pointerType === 'mouse') pointerRelease(e.pointerId);
  };

  // --- Rendering ------------------------------------------------------------
  const labels = useMemo(() => (isLg && showKeyLabels ? labelsByMidi(baseOctave) : null), [isLg, showKeyLabels, baseOctave]);
  const keymapShown = isXl && showKeymap;

  return (
    <section className="text-center" aria-label="Piano">
      <div className="flex flex-col mt-4 gap-6">
        <h1 className="text-2xl lg:text-4xl text-gray-300 font-bold font-spaceage">MusicKeyboard.io</h1>
        <div className={`w-full h-4 ${theme.gradient}`} />
        <div
          ref={scrollerRef}
          className={`relative w-full h-40 lg:h-64 overflow-x-scroll border border-gray-300 shadow-md select-none ${hideScrollbar ? 'hide-scrollbar' : ''}`}
          onPointerDown={onPointerDown}
          onPointerOver={onPointerOver}
          onPointerLeave={onPointerLeave}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="w-full h-full flex flex-row justify-between">
            {notes.map((note) => (
              <Key
                key={note.id}
                note={note}
                label={labels?.get(note.midi)}
                theme={theme}
                zoom={zoom}
                solfege={solfege}
                showAllNames={showAllNames}
                showPlayedNames={showPlayedNames}
                showLabel={showKeyLabels}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-2 xl:gap-12 items-center">
        <div className={`w-full ${showMiniKeyboard ? '' : 'invisible'}`}>
          <MiniKeyboard visible={visible} onSelect={scrollToNote} range={isLg ? [lo, hi] : null} theme={theme} />
        </div>
        <div className="w-full flex flex-row justify-center items-center min-h-24">
          {keymapShown && (
            <div className="flex justify-center w-full">
              <Keymap />
            </div>
          )}
          {!keymapShown && showPlayedNames && <PressedNotes />}
        </div>
        <Settings />
        {isLg && (
          <p className="text-xs text-gray-400">
            Play with your computer keyboard · <kbd className="font-mono">Space</kbd> sustain pedal ·{' '}
            <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd> change octave
          </p>
        )}
        <Themes />
      </div>
    </section>
  );
};

export default Piano;
