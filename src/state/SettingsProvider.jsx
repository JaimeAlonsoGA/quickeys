/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { DEFAULT_BASE_OCTAVE, clampOctave } from '../music/keymap';
import { ACCENTS } from '../site';

export const STORAGE_KEY = 'quickeys:settings';

export const DEFAULT_SETTINGS = {
  accent: ACCENTS[0].id,
  colorScheme: 'system', // 'system' | 'light' | 'dark'
  solfege: false, // Do Re Mi instead of C D E
  showKeyLabels: true, // computer keys on the piano keys
  sustainLatch: false,
  baseOctave: DEFAULT_BASE_OCTAVE,
  zoom: 3,
  volume: 0.8,
};

export const ZOOM_LEVELS = [28, 32, 36, 40, 46, 54, 64]; // white key width in px

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function sanitize(stored) {
  const settings = { ...DEFAULT_SETTINGS };
  if (!stored || typeof stored !== 'object') return settings;
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (typeof stored[key] === typeof DEFAULT_SETTINGS[key]) settings[key] = stored[key];
  }
  if (!ACCENTS.some((a) => a.id === settings.accent)) settings.accent = DEFAULT_SETTINGS.accent;
  if (!['system', 'light', 'dark'].includes(settings.colorScheme)) settings.colorScheme = 'system';
  settings.zoom = clamp(Math.round(settings.zoom), 0, ZOOM_LEVELS.length - 1);
  settings.baseOctave = clampOctave(settings.baseOctave);
  settings.volume = clamp(settings.volume, 0, 1);
  return settings;
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  // Start from the defaults so the prerendered HTML hydrates cleanly, then
  // apply the saved settings before the first paint.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useIsomorphicLayoutEffect(() => {
    try {
      setSettings(sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY))));
    } catch {
      // No storage: keep the defaults.
    }
  }, []);

  useEffect(() => {
    if (settings === DEFAULT_SETTINGS) return; // not loaded yet: don't overwrite
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable: settings just won't persist.
    }
  }, [settings]);

  // Theme lives on <html> (also set by an inline script before paint).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = settings.accent;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = settings.colorScheme === 'dark' || (settings.colorScheme === 'system' && media.matches);
      root.classList.toggle('dark', dark);
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [settings.accent, settings.colorScheme]);

  const update = useCallback((key, value) => {
    setSettings((prev) => {
      const next = typeof value === 'function' ? value(prev[key]) : value;
      return prev[key] === next ? prev : sanitize({ ...prev, [key]: next });
    });
  }, []);

  const value = useMemo(() => ({ ...settings, update }), [settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
