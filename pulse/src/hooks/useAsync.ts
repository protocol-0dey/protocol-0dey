import { useCallback, useEffect, useState } from 'react';

type State<T> =
  | { fn: () => Promise<T>; attempt: number; status: 'success'; data: T }
  | { fn: () => Promise<T>; attempt: number; status: 'error'; error: Error };

export interface AsyncResult<T> {
  status: 'loading' | 'success' | 'error';
  data?: T;
  error?: Error;
  reload: () => void;
  /** Replace the cached data locally (used for optimistic updates). */
  setData: (updater: (current: T) => T) => void;
}

/**
 * Runs `fn` whenever its identity changes (wrap it in useCallback) or `reload()` is called.
 * Loading is derived from "the stored result belongs to an older request", so no state is set
 * synchronously inside the effect.
 */
export function useAsync<T>(fn: () => Promise<T>): AsyncResult<T> {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fn()
      .then((data) => !cancelled && setState({ fn, attempt, status: 'success', data }))
      .catch(
        (error: unknown) =>
          !cancelled &&
          setState({
            fn,
            attempt,
            status: 'error',
            error: error instanceof Error ? error : new Error('Unknown error'),
          }),
      );
    return () => {
      cancelled = true;
    };
  }, [fn, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const setData = useCallback((updater: (current: T) => T) => {
    setState((s) => (s && s.status === 'success' ? { ...s, data: updater(s.data) } : s));
  }, []);

  const fresh = state !== null && state.fn === fn && state.attempt === attempt;
  if (!fresh || !state) return { status: 'loading', reload, setData };
  if (state.status === 'error') return { status: 'error', error: state.error, reload, setData };
  return { status: 'success', data: state.data, reload, setData };
}
