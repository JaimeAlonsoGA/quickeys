/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuArrowRight, LuChevronLeft, LuChevronRight, LuKeyboard, LuMinus, LuPlay, LuPlus, LuVolume2, LuVolumeX,
} from 'react-icons/lu';
import { TbPiano } from 'react-icons/tb';
import { audioEngine } from '../../audio/engine';
import { useComputerKeyboard } from '../../hooks/useComputerKeyboard';
import { useIsLg } from '../../hooks/useMediaQuery';
import { MAX_BASE_OCTAVE, MIN_BASE_OCTAVE, clampOctave, labelsByMidi, rangeOf } from '../../music/keymap';
import { FIRST_MIDI, LAST_MIDI, noteById, noteByMidi, notes } from '../../music/notes';
import { chordPath, displayName, identify, scalePath, search } from '../../music/theory';
import { onStrike, playSequence, setSustain, stopPreview, usePressedNotes, useSustain } from '../../state/playback';
import { ZOOM_LEVELS, useSettings } from '../../state/SettingsProvider';
import Keyboard from './Keyboard';
import { keyElement, midiToId } from './geometry';
import QuickSearch from './QuickSearch';

// --- Selection shared by the piano card and the chord/scale chips --------

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [selection, setSelection] = useState(null);
  const cardRef = useRef(null);

  const select = useCallback((item, { reveal = false, play = true } = {}) => {
    const midis = item.midis.filter((m) => m >= FIRST_MIDI && m <= LAST_MIDI);
    if (!midis.length) return;
    setSelection({ ...item, midis });
    if (reveal) {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect && (rect.top < 0 || rect.bottom > window.innerHeight)) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    const ids = midis.map(midiToId);
    if (!play) return;
    if (item.type === 'scale') playSequence(ids, { gap: 200, hold: 450 });
    else playSequence(ids, { gap: 35, hold: 1600 });
  }, []);

  const clear = useCallback(() => {
    stopPreview();
    setSelection(null);
  }, []);

  const value = useMemo(() => ({ selection, select, clear, cardRef }), [selection, select, clear]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export const useSelection = () => useContext(SelectionContext);

const labelOf = (item, solfege) => {
  if (item.type === 'chord') return displayName(item.root.name, solfege) + item.quality.symbol;
  if (item.type === 'scale') return `${displayName(item.root.name, solfege)} ${item.scaleType.name}`;
  return displayName(item.name, solfege) + item.label.slice(item.name.length);
};

const pathOf = (item) => (item.type === 'chord' ? chordPath(item) : item.type === 'scale' ? scalePath(item) : null);

// --- The card ---------------------------------------------------------------

const QuickPiano = () => {
  const { solfege, showKeyLabels, sustainLatch, baseOctave, zoom, volume, update } = useSettings();
  const { selection, select, clear, cardRef } = useSelection();
  const isLg = useIsLg();
  const scrollerRef = useRef(null);
  const [sustainKey, setSustainKey] = useState(false);
  const [visible, setVisible] = useState([0, 0]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);
  useEffect(() => {
    setSustain(sustainKey || sustainLatch);
  }, [sustainKey, sustainLatch]);

  const shiftOctave = useCallback((d) => update('baseOctave', (o) => clampOctave(o + d)), [update]);
  useComputerKeyboard({ baseOctave, onOctaveShift: shiftOctave, onSustainKey: setSustainKey });

  // Deep link: /?q=Am7 opens with that chord selected.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (!q) return;
    const [first] = search(q, 1);
    if (first) select(first.item, { play: false }); // no sound before a user gesture
  }, [select]);

  // --- scrolling ---
  const centerOn = useCallback((midi, behavior = 'smooth') => {
    const scroller = scrollerRef.current;
    const el = keyElement(scroller, midiToId(midi));
    if (!el) return;
    scroller.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2, behavior });
  }, []);

  const updateVisible = useCallback(() => {
    const s = scrollerRef.current;
    if (!s) return;
    const width = ZOOM_LEVELS[zoom];
    const first = Math.floor(s.scrollLeft / width);
    const last = Math.floor((s.scrollLeft + s.clientWidth) / width);
    setVisible((prev) => (prev[0] === first && prev[1] === last ? prev : [first, last]));
  }, [zoom]);

  useEffect(() => {
    const s = scrollerRef.current;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateVisible);
    };
    schedule();
    s.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(s);
    return () => {
      cancelAnimationFrame(frame);
      s.removeEventListener('scroll', schedule);
      observer.disconnect();
    };
  }, [updateVisible]);

  const [lo, hi] = rangeOf(baseOctave);
  const keymapCenter = lo + 12;
  useLayoutEffect(() => {
    centerOn(keymapCenter, 'auto');
    // Only on mount and zoom changes; octave changes scroll smoothly below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, centerOn]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    centerOn(keymapCenter);
  }, [keymapCenter, centerOn]);

  useEffect(() => {
    if (selection) centerOn((Math.min(...selection.midis) + Math.max(...selection.midis)) / 2 | 0);
  }, [selection, centerOn]);

  // Keep struck notes in view.
  useEffect(() => onStrike((id) => {
    const s = scrollerRef.current;
    const el = keyElement(s, id);
    if (!el) return;
    if (el.offsetLeft < s.scrollLeft || el.offsetLeft + el.offsetWidth > s.scrollLeft + s.clientWidth) {
      centerOn(noteById.get(id).midi);
    }
  }), [centerOn]);

  // --- samples: decode the keymap range up front, the rest on demand ---
  useEffect(() => {
    audioEngine.preload(notes.filter((n) => n.midi >= lo && n.midi <= hi).map((n) => n.id));
  }, [lo, hi]);

  const labels = useMemo(() => (isLg && showKeyLabels ? labelsByMidi(baseOctave) : null), [isLg, showKeyLabels, baseOctave]);
  const marked = useMemo(() => {
    if (!selection) return null;
    const names = new Map((selection.notes ?? []).map((n) => [n.midi % 12, n.name]));
    return new Map(selection.midis.map((m) => [m, names.get(m % 12) ?? null]));
  }, [selection]);

  // Escape clears the selection (when not typing).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) clear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clear]);

  return (
    <section ref={cardRef} aria-label="Piano" className="card scroll-mt-4 overflow-visible p-3 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="lg:w-[26rem] lg:shrink-0">
          {/* Remounted when the selection changes elsewhere, so the box shows it. */}
          <QuickSearch
            key={selection ? `${selection.type}:${selection.slug ?? selection.label}` : 'none'}
            initialQuery={selection ? labelOf(selection, false) : ''}
            onSelect={select}
            onClear={clear}
            hasSelection={Boolean(selection)}
          />
        </div>
        <Readout selection={selection} solfege={solfege} onReplay={() => selection && select(selection)} />
      </div>

      <Keyboard
        ref={scrollerRef}
        keyWidth={ZOOM_LEVELS[zoom]}
        marked={marked}
        labels={labels}
        solfege={solfege}
        className="mt-3 h-44 rounded-2xl border border-[#d9cdbd] bg-[#2a2520] p-0 shadow-inner sm:mt-4 sm:h-56 lg:h-60"
      />

      <OctaveStrip visible={visible} onJump={centerOn} />

      <Toolbar isLg={isLg} lo={lo} hi={hi} />
    </section>
  );
};

// --- Readout: what is playing or selected -----------------------------------

const NO_NOTES = [];

const Readout = ({ selection, solfege, onReplay }) => {
  const pressed = usePressedNotes();
  const sustain = useSustain();
  const isPreview = selection && pressed.every((id) => selection.midis.some((m) => midiToId(m) === id));
  const live = pressed.length > 0 && !isPreview;

  // Keep showing the last notes played after the keys are released (a quick
  // tap on a phone still tells you the note), until something else is picked.
  const [last, setLast] = useState(NO_NOTES);
  const [lastSelection, setLastSelection] = useState(selection);
  if (selection !== lastSelection) {
    setLastSelection(selection);
    setLast(NO_NOTES);
  }
  if (live && last !== pressed) setLast(pressed);

  const shown = live ? pressed : last;
  const played = shown.map((id) => noteById.get(id));
  const playing = played.length > 0;

  let title = null;
  let subtitle = null;
  let chips = [];
  let link = null;

  if (playing) {
    chips = played.map((n) => (solfege ? n.solfege : n.english) + n.octave);
    if (played.length === 1) {
      const n = played[0];
      title = (solfege ? n.solfege : n.english) + n.octave;
      subtitle = `${n.frequency.toFixed(2)} Hz · MIDI ${n.midi}`;
      chips = [];
    } else {
      const found = identify(played.map((n) => n.midi));
      if (found?.kind === 'chord') {
        const [{ chord, bass }] = found.chords;
        title = displayName(chord.root.name, solfege) + chord.quality.symbol + (bass ? `/${displayName(bass, solfege)}` : '');
        subtitle = `${chord.name}${bass ? ` over ${bass}` : ''}${found.chords.length > 1 ? ` · also ${found.chords.slice(1).map((c) => c.chord.symbol + (c.bass ? `/${c.bass}` : '')).join(', ')}` : ''}`;
        link = chordPath(chord);
      } else if (found?.kind === 'interval') {
        title = found.name;
        subtitle = 'interval';
      } else {
        title = `${played.length} notes`;
        subtitle = 'no common chord';
      }
    }
  } else if (selection) {
    title = labelOf(selection, solfege);
    subtitle = selection.type === 'chord' ? `${selection.name} chord` : selection.type === 'scale' ? `${selection.scaleType.name} scale` : 'note';
    chips = selection.notes ? selection.notes.map((n) => displayName(n.name, solfege)) : [];
    link = pathOf(selection);
  }

  return (
    <div className="flex min-h-[4.5rem] flex-1 items-center gap-3 rounded-2xl bg-sunken/70 px-4 py-2" aria-live="polite">
      {title ? (
        <>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</span>
              {subtitle && <span className="truncate text-sm text-muted">{subtitle}</span>}
            </div>
            {chips.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {chips.map((c, i) => (
                  <span key={`${c}-${i}`} className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-ink/80">{c}</span>
                ))}
              </div>
            )}
          </div>
          {sustain && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">Sustain</span>}
          {selection && !playing && (
            <button type="button" onClick={onReplay} className="icon-btn bg-surface text-accent" aria-label="Play again">
              <LuPlay size={16} />
            </button>
          )}
          {link && (
            <Link to={link} className="icon-btn hidden bg-surface sm:inline-flex" aria-label="Open the full page" title="Open the full page">
              <LuArrowRight size={16} />
            </Link>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">Tap a key</span> or type a chord. Play several notes and the chord is named
          instantly.
          {sustain && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">Sustain</span>}
        </p>
      )}
    </div>
  );
};

// --- Octave strip: jump around the keyboard ---------------------------------

const OCTAVES = [2, 3, 4, 5, 6, 7];


const OctaveStrip = ({ visible, onJump }) => (
  <div className="mt-2 flex items-center gap-1 overflow-x-auto px-1" role="group" aria-label="Jump to octave">
    {OCTAVES.map((o) => {
      // White-key index range of this octave: 7 white keys per octave from C2.
      const start = (o - 2) * 7;
      const inView = start + 7 > visible[0] && start <= visible[1];
      return (
        <button
          key={o}
          type="button"
          onClick={() => onJump((o + 1) * 12 + 5)}
          aria-label={`Show octave ${o}`}
          className={`rounded-full px-2.5 py-1 font-mono text-xs transition ${inView ? 'bg-accent-soft text-accent font-semibold' : 'text-muted hover:bg-sunken'}`}
        >
          C{o}
        </button>
      );
    })}
  </div>
);

// --- Toolbar ----------------------------------------------------------------

const Toolbar = ({ isLg, lo, hi }) => {
  const { solfege, showKeyLabels, sustainLatch, baseOctave, zoom, volume, update } = useSettings();
  const name = (midi) => {
    const n = noteByMidi.get(midi);
    return (solfege ? n.solfege : n.english) + n.octave;
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-line pt-3 text-sm">
      <div className="flex rounded-full bg-sunken p-0.5" role="group" aria-label="Note names">
        {[[false, 'C D E'], [true, 'Do Re Mi']].map(([value, label]) => (
          <button
            key={label}
            type="button"
            aria-pressed={solfege === value}
            onClick={() => update('solfege', value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${solfege === value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-pressed={sustainLatch}
        onClick={() => update('sustainLatch', !sustainLatch)}
        className={`icon-btn px-3 text-xs font-semibold ${sustainLatch ? 'bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent' : ''}`}
        title={isLg ? 'Sustain pedal (or hold Space)' : 'Sustain pedal'}
      >
        <TbPiano size={16} /> Sustain
      </button>

      {isLg && (
        <>
          <button
            type="button"
            aria-pressed={showKeyLabels}
            onClick={() => update('showKeyLabels', !showKeyLabels)}
            className={`icon-btn px-3 text-xs font-semibold ${showKeyLabels ? 'text-ink' : ''}`}
            title="Show the computer keys on the piano"
          >
            <LuKeyboard size={16} /> Keys
          </button>
          <div className="flex items-center" title="Octaves played by the computer keyboard (← →)">
            <button type="button" className="icon-btn" aria-label="Lower octave" disabled={baseOctave <= MIN_BASE_OCTAVE} onClick={() => update('baseOctave', baseOctave - 1)}>
              <LuChevronLeft size={16} />
            </button>
            <span className="min-w-[5.5rem] text-center font-mono text-xs text-muted">{name(lo)}–{name(hi)}</span>
            <button type="button" className="icon-btn" aria-label="Higher octave" disabled={baseOctave >= MAX_BASE_OCTAVE} onClick={() => update('baseOctave', baseOctave + 1)}>
              <LuChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      <div className="ml-auto flex items-center gap-1">
        <button type="button" className="icon-btn" aria-label="Smaller keys" disabled={zoom <= 0} onClick={() => update('zoom', zoom - 1)}>
          <LuMinus size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Bigger keys" disabled={zoom >= ZOOM_LEVELS.length - 1} onClick={() => update('zoom', zoom + 1)}>
          <LuPlus size={16} />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={volume ? 'Mute' : 'Unmute'}
          onClick={() => update('volume', volume ? 0 : 0.8)}
        >
          {volume ? <LuVolume2 size={16} /> : <LuVolumeX size={16} />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => update('volume', Number(e.target.value) / 100)}
          aria-label="Volume"
          className="hidden w-20 accent-[rgb(var(--accent))] sm:block"
        />
      </div>

      {isLg && (
        <p className="w-full text-xs text-muted">
          Play with your keyboard: <kbd className="font-mono">Q</kbd>–<kbd className="font-mono">P</kbd> and{' '}
          <kbd className="font-mono">Z</kbd>–<kbd className="font-mono">.</kbd> · <kbd className="font-mono">Space</kbd> sustain ·{' '}
          <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd> octave · <kbd className="font-mono">/</kbd> search ·{' '}
          <kbd className="font-mono">Esc</kbd> clear
        </p>
      )}
    </div>
  );
};

export default QuickPiano;
