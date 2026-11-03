export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

/** Base URL of the real backend, or null when the app should use its built-in mock API. */
export function getApiBaseUrl(): string | null {
  const value: unknown = import.meta.env.VITE_API_URL;
  return typeof value === 'string' && value.trim() !== '' ? value.trim().replace(/\/+$/, '') : null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
  } catch {
    // The body was empty or not JSON: fall back to the status text.
  }
  return response.statusText || `Request failed with status ${response.status}`;
}

/** Typed JSON request helper with a timeout and normalized errors. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('VITE_API_URL is not configured');

  const response = await fetch(`${base}${path}`, {
    method: options.method ?? 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) throw new ApiError(response.status, await readErrorMessage(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
