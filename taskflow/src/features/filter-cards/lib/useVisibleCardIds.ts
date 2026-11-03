import { useDeferredValue, useMemo } from 'react';
import { useBoardStore } from '@/entities/board';
import { isFilterActive, matchesFilter, type CardFilter } from './filter';

/** Returns the set of visible card ids, or null when no filter is active. */
export function useVisibleCardIds(filter: CardFilter): Set<string> | null {
  const cards = useBoardStore((state) => state.board.cards);
  const deferred = useDeferredValue(filter);

  return useMemo(() => {
    if (!isFilterActive(deferred)) return null;
    return new Set(
      Object.values(cards)
        .filter((card) => matchesFilter(card, deferred))
        .map((card) => card.id),
    );
  }, [cards, deferred]);
}
