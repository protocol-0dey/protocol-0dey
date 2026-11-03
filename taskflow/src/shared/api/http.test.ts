import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getApiBaseUrl, request } from './http';

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('http client', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reports no base URL when VITE_API_URL is empty', () => {
    vi.stubEnv('VITE_API_URL', '');
    expect(getApiBaseUrl()).toBeNull();
  });

  it('strips trailing slashes from the base URL', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com//');
    expect(getApiBaseUrl()).toBe('https://api.example.com');
  });

  it('sends JSON requests and parses the response', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await request<{ ok: boolean }>('/board', { method: 'PUT', body: { a: 1 } });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/board');
    expect(init.method).toBe('PUT');
    expect(init.body).toBe('{"a":1}');
  });

  it('returns undefined for 204 responses', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(request('/board', { method: 'PUT' })).resolves.toBeUndefined();
  });

  it('throws ApiError with the server message on failure', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'Invalid credentials' }, { status: 401 })),
    );

    const error = await request('/auth/login', { method: 'POST' }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).message).toBe('Invalid credentials');
  });

  it('refuses to run without a configured base URL', async () => {
    vi.stubEnv('VITE_API_URL', '');
    await expect(request('/board')).rejects.toThrow(/not configured/);
  });
});
