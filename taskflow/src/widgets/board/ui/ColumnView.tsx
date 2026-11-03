import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '@/entities/board';
import { AddCardForm } from '@/features/add-card';
import { CardItem } from './CardItem';
import styles from './ColumnView.module.css';

interface ColumnViewProps {
  columnId: string;
  visibleIds: Set<string> | null;
  onOpenCard: (cardId: string) => void;
}

export const ColumnView = memo(function ColumnView({
  columnId,
  visibleIds,
  onOpenCard,
}: ColumnViewProps) {
  const column = useBoardStore((state) => state.board.columns[columnId]);
  const cards = useBoardStore((state) => state.board.cards);
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  if (!column) return null;

  const visibleCards = column.cardIds
    .filter((id) => !visibleIds || visibleIds.has(id))
    .map((id) => cards[id])
    .filter((card) => card !== undefined);
  const filtering = visibleIds !== null;

  return (
    <section className={styles.column} aria-label={column.title}>
      <header className={styles.header}>
        <h2 className={styles.title}>{column.title}</h2>
        <span className={styles.count}>{visibleCards.length}</span>
      </header>
      <SortableContext
        items={visibleCards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul ref={setNodeRef} className={`${styles.list} ${isOver ? styles.over : ''}`}>
          {visibleCards.map((card) => (
            <CardItem key={card.id} card={card} disabled={filtering} onOpen={onOpenCard} />
          ))}
          {visibleCards.length === 0 && (
            <li className={styles.empty}>{filtering ? 'No matching cards' : 'No cards yet'}</li>
          )}
        </ul>
      </SortableContext>
      {!filtering && <AddCardForm columnId={column.id} />}
    </section>
  );
});
