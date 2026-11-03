import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSeedBoard } from './seed';

vi.mock('../api/boardApi', () => ({
  boardApi: { fetch: vi.fn(), save: vi.fn() },
}));
vi.mock('@/shared/ui', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

import { toast } from '@/shared/ui';
import { boardApi } from '../api/boardApi';
import { useBoardStore } from './store';

describe('useBoardStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(boardApi.fetch).mockResolvedValue(createSeedBoard());
    vi.mocked(boardApi.save).mockResolvedValue(undefined);
    useBoardStore.setState({ board: createSeedBoard(), status: 'ready' });
  });

  it('loads the board and becomes ready', async () => {
    useBoardStore.setState({ status: 'idle' });
    await useBoardStore.getState().load();
    expect(useBoardStore.getState().status).toBe('ready');
    expect(boardApi.fetch).toHaveBeenCalledOnce();
  });

  it('sets an error status when loading fails', async () => {
    vi.mocked(boardApi.fetch).mockRejectedValueOnce(new Error('network'));
    await useBoardStore.getState().load();
    expect(useBoardStore.getState().status).toBe('error');
    expect(toast.error).toHaveBeenCalled();
  });

  it('applies changes optimistically and persists them', async () => {
    const pending = useBoardStore.getState().moveCard('c1', 'done', 0);
    expect(useBoardStore.getState().board.columns.done?.cardIds[0]).toBe('c1');
    await pending;
    expect(boardApi.save).toHaveBeenCalledOnce();
  });

  it('rolls back when saving fails', async () => {
    vi.mocked(boardApi.save).mockRejectedValueOnce(new Error('offline'));
    const before = useBoardStore.getState().board;
    await useBoardStore.getState().removeCard('c1');
    expect(useBoardStore.getState().board).toEqual(before);
    expect(toast.error).toHaveBeenCalled();
  });

  it('adds a trimmed card to the chosen column', async () => {
    await useBoardStore.getState().addCard('todo', { title: '  Ship it  ', priority: 'high' });
    const { board } = useBoardStore.getState();
    const lastId = board.columns.todo?.cardIds.at(-1) ?? '';
    expect(board.cards[lastId]?.title).toBe('Ship it');
    expect(board.cards[lastId]?.priority).toBe('high');
  });
});
