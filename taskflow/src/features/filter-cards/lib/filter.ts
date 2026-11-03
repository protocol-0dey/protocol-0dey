import type { Card, Priority } from '@/entities/board';

export interface CardFilter {
  query: string;
  priority: Priority | 'all';
}

export const EMPTY_FILTER: CardFilter = { query: '', priority: 'all' };

export function isFilterActive(filter: CardFilter): boolean {
  return filter.query.trim() !== '' || filter.priority !== 'all';
}

export function matchesFilter(card: Card, filter: CardFilter): boolean {
  const query = filter.query.trim().toLowerCase();
  const textMatch =
    query === '' ||
    card.title.toLowerCase().includes(query) ||
    card.description.toLowerCase().includes(query);
  const priorityMatch = filter.priority === 'all' || card.priority === filter.priority;
  return textMatch && priorityMatch;
}
