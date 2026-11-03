export type Priority = 'low' | 'medium' | 'high';

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

/** Normalized board: entities by id + ordering arrays. */
export interface BoardState {
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

export interface NewCardInput {
  title: string;
  description?: string;
  priority: Priority;
}

export type CardPatch = Partial<Pick<Card, 'title' | 'description' | 'priority'>>;
