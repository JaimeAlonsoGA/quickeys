import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  const subscribe = useCallback((onChange) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

// Tailwind's default breakpoints.
export const useIsSm = () => useMediaQuery('(min-width: 640px)');
export const useIsLg = () => useMediaQuery('(min-width: 1024px)');
export const useIsXl = () => useMediaQuery('(min-width: 1280px)');
