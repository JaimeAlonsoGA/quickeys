const WIDTH = 30;
const HANDLE = 15;
const OFFSET = 1.5;

const Switch = ({ label, checked, onChange, shaded = false }) => (
  <label className={`${shaded ? 'bg-gray-300' : ''} py-2 w-full flex flex-row items-center px-12 justify-between gap-4 cursor-pointer`}>
    <span className="text-gray-500 text-left">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 rounded-full transition-colors duration-200"
      style={{ width: WIDTH, height: HANDLE + 2 * OFFSET, background: checked ? 'green' : 'gray' }}
    >
      <span
        className="absolute rounded-full bg-white transition-all duration-200"
        style={{ width: HANDLE, height: HANDLE, top: OFFSET, left: checked ? WIDTH - HANDLE - OFFSET : OFFSET }}
      />
    </button>
  </label>
);

export default Switch;
