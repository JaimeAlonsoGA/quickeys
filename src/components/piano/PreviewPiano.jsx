import { useMemo } from 'react';
import { LuPlay } from 'react-icons/lu';
import { playSequence } from '../../state/playback';
import { useSettings } from '../../state/SettingsProvider';
import { midiToId, octaveRangeFor } from './geometry';
import Keyboard from './Keyboard';

/** A small fitted keyboard with some notes marked, and a button to hear them. */
const PreviewPiano = ({ midis, names, arpeggio = false, playLabel = 'Play', className = 'h-32 sm:h-40', compact = false }) => {
  const { solfege } = useSettings();
  const [from, to] = octaveRangeFor(midis);
  const marked = useMemo(() => new Map(midis.map((m, i) => [m, names?.[i] ?? null])), [midis, names]);
  const play = () => playSequence(midis.map(midiToId), arpeggio ? { gap: 200, hold: 450 } : { gap: 35, hold: 1600 });

  return (
    <div>
      <Keyboard
        from={from}
        to={to}
        fit
        marked={marked}
        solfege={solfege}
        className={`rounded-2xl border border-[#d9cdbd] bg-[#2a2520] ${className}`}
      />
      <button
        type="button"
        onClick={play}
        className={`mt-3 inline-flex items-center gap-2 rounded-full bg-accent font-semibold text-accent-ink shadow-card transition hover:brightness-105 active:scale-95 ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
      >
        <LuPlay size={compact ? 12 : 14} /> {playLabel}
      </button>
    </div>
  );
};

export default PreviewPiano;
