import { describe, expect, it } from 'vitest';
import { createSeedBoard } from '../model/seed';
import { addCard, findColumnId, moveCard, removeCard, resolveDrop, updateCard } from './boardOps';

describe('boardOps', () => {
  it('adds a card to the end of a column', () => {
    const board = addCard(createSeedBoard(), 'todo', {
      id: 'new',
      title: 'New',
      description: '',
      priority: 'low',
      createdAt: 1,
    });
    expect(board.columns.todo?.cardIds).toEqual(['c1', 'c2', 'new']);
    expect(board.cards.new?.title).toBe('New');
  });

  it('ignores adding to an unknown column', () => {
    const board = createSeedBoard();
    const result = addCard(board, 'nope', {
      id: 'x',
      title: 'x',
      description: '',
      priority: 'low',
      createdAt: 1,
    });
    expect(result).toBe(board);
  });

  it('updates a card without mutating the original board', () => {
    const board = createSeedBoard();
    const next = updateCard(board, 'c1', { title: 'Renamed' });
    expect(next.cards.c1?.title).toBe('Renamed');
    expect(board.cards.c1?.title).toBe('Design the onboarding flow');
  });

  it('removes a card from entities and columns', () => {
    const next = removeCard(createSeedBoard(), 'c2');
    expect(next.cards.c2).toBeUndefined();
    expect(next.columns.todo?.cardIds).toEqual(['c1']);
  });

  it('moves a card to another column at a given index', () => {
    const next = moveCard(createSeedBoard(), 'c1', 'doing', 0);
    expect(next.columns.todo?.cardIds).toEqual(['c2']);
    expect(next.columns.doing?.cardIds).toEqual(['c1', 'c3']);
    expect(findColumnId(next, 'c1')).toBe('doing');
  });

  it('reorders a card within the same column', () => {
    const next = moveCard(createSeedBoard(), 'c1', 'todo', 1);
    expect(next.columns.todo?.cardIds).toEqual(['c2', 'c1']);
  });

  it('clamps an out-of-range index', () => {
    const next = moveCard(createSeedBoard(), 'c1', 'done', 99);
    expect(next.columns.done?.cardIds).toEqual(['c4', 'c1']);
  });

  describe('resolveDrop', () => {
    const board = createSeedBoard();

    it('returns null when dropped on itself', () => {
      expect(resolveDrop(board, 'c1', 'c1')).toBeNull();
    });

    it('targets the end of a column when dropped on the column', () => {
      expect(resolveDrop(board, 'c1', 'doing')).toEqual({ columnId: 'doing', index: 1 });
    });

    it('targets the position of the card it was dropped on', () => {
      expect(resolveDrop(board, 'c1', 'c2')).toEqual({ columnId: 'todo', index: 1 });
    });

    it('returns null for unknown targets', () => {
      expect(resolveDrop(board, 'c1', 'ghost')).toBeNull();
    });
  });
});
