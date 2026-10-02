import themes from '../assets/themes';
import { useSettings } from '../state/SettingsProvider';

const Themes = () => {
  const { theme, update } = useSettings();
  return (
    <div className="flex flex-col justify-around">
      <div className="border rounded-xl p-4 shadow-xl">
        <h2 className="font-spaceage">Themes</h2>
        <div className="px-20 md:px-0 grid grid-cols-1 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-11 gap-4 mt-4">
          {themes.map((t) => (
            <div key={t.name} className={`${t.gradient} p-0.5 rounded-lg ${t.name === theme.name ? '' : 'opacity-30 hover:opacity-60'}`}>
              <button
                type="button"
                aria-pressed={t.name === theme.name}
                className="w-full px-2 bg-white rounded-lg"
                onClick={() => update('theme', t.name)}
              >
                {t.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Themes;
