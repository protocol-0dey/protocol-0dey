import { useEffect } from 'react';
import { useThemeStore } from '../model/store';

/** Mirrors the selected theme onto <html data-theme>, which the CSS variables key off. */
export function useThemeSync(): void {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
