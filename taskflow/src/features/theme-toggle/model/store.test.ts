import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from './store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark' });
  });

  it('toggles between dark and light', () => {
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe('light');
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('sets an explicit theme', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('persists the choice to localStorage', () => {
    useThemeStore.getState().setTheme('light');
    const saved = JSON.parse(localStorage.getItem('taskflow:theme') ?? '{}') as {
      state?: { theme?: string };
    };
    expect(saved.state?.theme).toBe('light');
  });
});
