import { useState } from 'react';
import { GiMusicalNotes } from 'react-icons/gi';
import { IoMdArrowDropdown, IoMdArrowDropright } from 'react-icons/io';
import { IoSettings } from 'react-icons/io5';
import { MdOutlineZoomIn } from 'react-icons/md';
import { useIsLg, useIsSm } from '../../hooks/useMediaQuery';
import { MAX_BASE_OCTAVE, MIN_BASE_OCTAVE, rangeOf } from '../../music/keymap';
import { noteByMidi } from '../../music/notes';
import { ZOOM_MIN, useSettings } from '../../state/SettingsProvider';
import Customizable from './Customizable';
import Stepper from './Stepper';

// Wider keys are only useful on large screens.
const ZOOM_MAX_SMALL = 20;

const Settings = () => {
  const [open, setOpen] = useState(false);
  const { zoom, baseOctave, solfege, update } = useSettings();
  const isSm = useIsSm();
  const isLg = useIsLg();

  const zoomStepper = (
    <Stepper
      icon={MdOutlineZoomIn}
      label="Zoom"
      value={zoom}
      min={ZOOM_MIN}
      max={isSm ? ZOOM_MAX_SMALL : 30}
      onChange={(z) => update('zoom', z)}
      className="rounded-r-2xl"
    />
  );

  const [lo, hi] = rangeOf(baseOctave);
  const name = (midi) => {
    const n = noteByMidi.get(midi);
    return `${solfege ? n.solfege : n.english}${n.octave}`;
  };

  return (
    <div className="lg:w-full flex flex-col items-center">
      <div className="w-full flex-col flex sm:flex-row justify-around">
        {!isSm && zoomStepper}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex flex-row border border-gray-300 p-2 rounded-l-xl items-center"
        >
          <IoSettings size={22} aria-hidden />
          <span className="px-4">More Settings</span>
          {open ? <IoMdArrowDropdown size={22} color="gray" /> : <IoMdArrowDropright size={22} color="gray" />}
        </button>
        {isLg && (
          <Stepper
            icon={GiMusicalNotes}
            label="Octave"
            value={baseOctave}
            display={`${name(lo)} – ${name(hi)}`}
            min={MIN_BASE_OCTAVE}
            max={MAX_BASE_OCTAVE}
            onChange={(o) => update('baseOctave', o)}
            chevrons
            className="px-2 py-3 rounded-xl"
          />
        )}
        {isSm && zoomStepper}
      </div>
      {open && <Customizable />}
    </div>
  );
};

export default Settings;
