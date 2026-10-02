import { CiCircleChevDown, CiCircleChevUp, CiCircleMinus, CiCirclePlus } from 'react-icons/ci';

/** A labelled value with −/+ buttons (zoom, octave). */
const Stepper = ({ icon: Icon, label, value, display = value, min, max, onChange, chevrons = false, className = '' }) => {
  const Down = chevrons ? CiCircleChevDown : CiCircleMinus;
  const Up = chevrons ? CiCircleChevUp : CiCirclePlus;
  return (
    <div className={`p-2 border border-gray-300 flex flex-row items-center justify-center ${className}`}>
      <div className="flex flex-row items-center mr-4 lg:mr-8">
        <Icon className="mr-2" size={22} aria-hidden />
        <span className="text-gray-500">{label}</span>
      </div>
      <div className="flex flex-row items-center">
        <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= min} className="disabled:opacity-30" onClick={() => onChange(value - 1)}>
          <Down size={20} />
        </button>
        <span className="text-gray-500 px-4 tabular-nums" aria-live="polite">{display}</span>
        <button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= max} className="disabled:opacity-30" onClick={() => onChange(value + 1)}>
          <Up size={20} />
        </button>
      </div>
    </div>
  );
};

export default Stepper;
