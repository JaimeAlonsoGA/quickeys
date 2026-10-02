/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import themes from '../assets/themes';
import { DEFAULT_BASE_OCTAVE, clampOctave } from '../music/keymap';

const STORAGE_KEY = 'musickeyboard:settings';

export const DEFAULT_SETTINGS = {
  theme: themes[0].name,
  zoom: 10,
  solfege: true, // Do Re Mi instead of C D E
  showAllNames: false, // note name on every key
  showPlayedNames: true, // played notes and chord names
  showKeyLabels: true, // computer keys on the piano keys
  showKeymap: false,
  showMiniKeyboard: true,
  hideScrollbar: false,
  autoScroll: true,
  sustainLatch: false,
  baseOctave: DEFAULT_BASE_OCTAVE,
  volume: 0.8,
};

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 30;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Ignore anything stored that doesn't match the current settings shape.
function sanitize(stored) {
  const settings = { ...DEFAULT_SETTINGS };
  if (!stored || typeof stored !== 'object') return settings;
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (typeof stored[key] === typeof DEFAULT_SETTINGS[key]) settings[key] = stored[key];
  }
  if (!themes.some((t) => t.name === settings.theme)) settings.theme = DEFAULT_SETTINGS.theme;
  settings.zoom = clamp(Math.round(settings.zoom), ZOOM_MIN, ZOOM_MAX);
  settings.baseOctave = clampOctave(settings.baseOctave);
  settings.volume = clamp(settings.volume, 0, 1);
  return settings;
}

function loadSettings() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable (private mode, quota…): settings just won't persist.
    }
  }, [settings]);

  const update = useCallback((key, value) => {
    setSettings((prev) => {
      const next = typeof value === 'function' ? value(prev[key]) : value;
      return prev[key] === next ? prev : sanitize({ ...prev, [key]: next });
    });
  }, []);

  const reset = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  const value = useMemo(() => ({
    ...settings,
    theme: themes.find((t) => t.name === settings.theme),
    update,
    reset,
  }), [settings, update, reset]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
