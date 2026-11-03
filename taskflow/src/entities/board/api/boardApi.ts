import { getApiBaseUrl, request } from '@/shared/api';
import { delay, readJson, writeJson } from '@/shared/lib';
import { createSeedBoard } from '../model/seed';
import type { BoardState } from '../model/types';

const STORAGE_KEY = 'taskflow:board';

/** Built-in mock backend persisted in localStorage. Used when VITE_API_URL is not set. */
const mockApi = {
  async fetch(): Promise<BoardState> {
    await delay();
    return readJson<BoardState>(STORAGE_KEY) ?? createSeedBoard();
  },
  async save(board: BoardState): Promise<void> {
    await delay();
    writeJson(STORAGE_KEY, board);
  },
};

/** Real backend: see docs/API.md for the contract. */
const httpApi = {
  fetch: () => request<BoardState>('/board'),
  save: (board: BoardState) => request<void>('/board', { method: 'PUT', body: board }),
};

/** Stores and components depend only on this object, never on the transport. */
export const boardApi = {
  fetch: () => (getApiBaseUrl() ? httpApi : mockApi).fetch(),
  save: (board: BoardState) => (getApiBaseUrl() ? httpApi : mockApi).save(board),
};
