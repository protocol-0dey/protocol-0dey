import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge, type Card } from '@/entities/board';
import styles from './CardItem.module.css';

interface CardItemProps {
  card: Card;
  disabled: boolean;
  onOpen: (cardId: string) => void;
}

export const CardItem = memo(function CardItem({ card, disabled, onOpen }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(card.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen(card.id);
        listeners?.onKeyDown?.(event);
      }}
    >
      <p className={styles.title}>{card.title}</p>
      {card.description && <p className={styles.description}>{card.description}</p>}
      <PriorityBadge priority={card.priority} />
    </li>
  );
});

/** Non-interactive copy rendered inside the DragOverlay. */
export function CardPreview({ card }: { card: Card }) {
  return (
    <div className={`${styles.card} ${styles.overlay}`}>
      <p className={styles.title}>{card.title}</p>
      <PriorityBadge priority={card.priority} />
    </div>
  );
}
