import { useIsLg, useIsXl } from '../../hooks/useMediaQuery';
import { useSettings } from '../../state/SettingsProvider';
import Switch from './Switch';

const Customizable = () => {
  const settings = useSettings();
  const { update, reset, volume } = settings;
  const isLg = useIsLg();
  const isXl = useIsXl();

  const switches = [
    isLg && ['showKeyLabels', 'Show Computer Keys On Notes'],
    ['showPlayedNames', 'Reveal Played Notes and Chord Names'],
    isLg && ['autoScroll', 'Keyboard Auto-Scrolling (played notes always in view)'],
    isXl && ['showKeymap', 'Show Key Mapping'],
    ['showAllNames', 'Note Name On Every Key'],
    ['solfege', 'Solfège Notation (Do, Re, Mi instead of C, D, E)'],
    ['sustainLatch', isLg ? 'Sustain Pedal Always On (or hold Space)' : 'Sustain Pedal'],
    ['hideScrollbar', 'Hide Scrollbar'],
    ['showMiniKeyboard', 'Show Keyboard Position'],
  ].filter(Boolean);

  return (
    <div className="flex flex-col w-full bg-gray-200 mt-2">
      {switches.map(([key, label], i) => (
        <Switch key={key} label={label} checked={settings[key]} onChange={(v) => update(key, v)} shaded={i % 2 === 0} />
      ))}
      <label className={`${switches.length % 2 === 0 ? 'bg-gray-300' : ''} py-2 w-full flex flex-row items-center px-12 justify-between gap-4`}>
        <span className="text-gray-500">Volume</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => update('volume', Number(e.target.value) / 100)}
          className="w-32 accent-green-700"
        />
      </label>
      <div className="py-2 px-12 flex justify-end">
        <button type="button" className="text-sm text-gray-500 underline" onClick={reset}>
          Reset all settings
        </button>
      </div>
    </div>
  );
};

export default Customizable;
