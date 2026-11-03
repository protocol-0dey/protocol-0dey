import { create } from 'zustand';
import { createId, realtime } from '@/shared/lib';
import { toast } from '@/shared/ui';
import { boardApi } from '../api/boardApi';
import * as ops from '../lib/boardOps';
import type { BoardState, CardPatch, NewCardInput } from './types';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface BoardStore {
  board: BoardState;
  status: Status;
  load: (options?: { silent?: boolean }) => Promise<void>;
  addCard: (columnId: string, input: NewCardInput) => Promise<void>;
  updateCard: (cardId: string, patch: CardPatch) => Promise<void>;
  removeCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => Promise<void>;
}

const emptyBoard: BoardState = { cards: {}, columns: {}, columnOrder: [] };

export const useBoardStore = create<BoardStore>((set, get) => {
  /** Optimistic update: apply locally, persist, roll back on failure. */
  async function commit(next: BoardState): Promise<void> {
    const previous = get().board;
    if (next === previous) return;
    set({ board: next });
    try {
      await boardApi.save(next);
      realtime.publish('board-updated');
    } catch {
      set({ board: previous });
      toast.error('Could not save your changes. They were rolled back.');
    }
  }

  return {
    board: emptyBoard,
    status: 'idle',

    load: async ({ silent = false } = {}) => {
      if (!silent) set({ status: 'loading' });
      try {
        const board = await boardApi.fetch();
        set({ board, status: 'ready' });
      } catch {
        set({ status: 'error' });
        toast.error('Failed to load the board.');
      }
    },

    addCard: (columnId, input) => {
      const card = {
        id: createId('card'),
        title: input.title.trim(),
        description: input.description?.trim() ?? '',
        priority: input.priority,
        createdAt: Date.now(),
      };
      return commit(ops.addCard(get().board, columnId, card));
    },

    updateCard: (cardId, patch) => commit(ops.updateCard(get().board, cardId, patch)),

    removeCard: (cardId) => commit(ops.removeCard(get().board, cardId)),

    moveCard: (cardId, toColumnId, toIndex) =>
      commit(ops.moveCard(get().board, cardId, toColumnId, toIndex)),
  };
});
