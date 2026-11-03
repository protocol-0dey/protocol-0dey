const DEFAULT_LATENCY_MS = 300;

/** Simulates network latency for the mock backend. Configurable via VITE_API_LATENCY_MS. */
export function delay(ms?: number): Promise<void> {
  const fromEnv = Number(import.meta.env.VITE_API_LATENCY_MS);
  const value = ms ?? (Number.isFinite(fromEnv) ? fromEnv : DEFAULT_LATENCY_MS);
  return new Promise((resolve) => setTimeout(resolve, value));
}
