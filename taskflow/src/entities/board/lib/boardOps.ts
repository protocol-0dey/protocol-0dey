import type { BoardState, Card, CardPatch } from '../model/types';

export function findColumnId(board: BoardState, cardId: string): string | undefined {
  return board.columnOrder.find((columnId) => board.columns[columnId]?.cardIds.includes(cardId));
}

export function addCard(board: BoardState, columnId: string, card: Card): BoardState {
  const column = board.columns[columnId];
  if (!column) return board;
  return {
    ...board,
    cards: { ...board.cards, [card.id]: card },
    columns: { ...board.columns, [columnId]: { ...column, cardIds: [...column.cardIds, card.id] } },
  };
}

export function updateCard(board: BoardState, cardId: string, patch: CardPatch): BoardState {
  const card = board.cards[cardId];
  if (!card) return board;
  return { ...board, cards: { ...board.cards, [cardId]: { ...card, ...patch } } };
}

export function removeCard(board: BoardState, cardId: string): BoardState {
  if (!board.cards[cardId]) return board;
  const { [cardId]: _removed, ...cards } = board.cards;
  const columns = Object.fromEntries(
    Object.entries(board.columns).map(([id, column]) => [
      id,
      { ...column, cardIds: column.cardIds.filter((existing) => existing !== cardId) },
    ]),
  );
  return { ...board, cards, columns };
}

/** Moves a card to `toColumnId` at `toIndex` (index is clamped to the valid range). */
export function moveCard(
  board: BoardState,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): BoardState {
  const fromColumnId = findColumnId(board, cardId);
  const target = board.columns[toColumnId];
  if (!fromColumnId || !target) return board;

  const source = board.columns[fromColumnId];
  if (!source) return board;
  const sourceIds = source.cardIds.filter((id) => id !== cardId);
  const baseTargetIds = fromColumnId === toColumnId ? sourceIds : target.cardIds;
  const index = Math.max(0, Math.min(toIndex, baseTargetIds.length));
  const targetIds = [...baseTargetIds.slice(0, index), cardId, ...baseTargetIds.slice(index)];

  return {
    ...board,
    columns: {
      ...board.columns,
      [fromColumnId]: { ...source, cardIds: sourceIds },
      [toColumnId]: { ...target, cardIds: targetIds },
    },
  };
}

export interface DropTarget {
  columnId: string;
  index: number;
}

/** Translates a drag-and-drop "over" id (a card or a column) into a concrete drop target. */
export function resolveDrop(
  board: BoardState,
  activeId: string,
  overId: string,
): DropTarget | null {
  if (activeId === overId) return null;

  const overColumn = board.columns[overId];
  if (overColumn) return { columnId: overColumn.id, index: overColumn.cardIds.length };

  const overColumnId = findColumnId(board, overId);
  if (!overColumnId) return null;
  const column = board.columns[overColumnId];
  if (!column) return null;
  return { columnId: overColumnId, index: column.cardIds.indexOf(overId) };
}
