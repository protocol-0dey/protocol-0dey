import { useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardStore } from '@/entities/board';
import { EditCardModal } from '@/features/edit-card';
import { useBoardDnd } from '../lib/useBoardDnd';
import { CardPreview } from './CardItem';
import { ColumnView } from './ColumnView';
import styles from './Board.module.css';

interface BoardProps {
  visibleIds: Set<string> | null;
}

export function Board({ visibleIds }: BoardProps) {
  const columnOrder = useBoardStore((state) => state.board.columnOrder);
  const activeCard = useBoardStore((state) => state.board.cards);
  const { activeId, onDragStart, onDragEnd, onDragCancel } = useBoardDnd();
  const [editingId, setEditingId] = useState<string | null>(null);
  const openCard = useCallback((id: string) => setEditingId(id), []);
  const closeCard = useCallback(() => setEditingId(null), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Long-press to drag on touch screens, so vertical scrolling still works.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const dragged = activeId ? activeCard[activeId] : undefined;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className={styles.board}>
          {columnOrder.map((columnId) => (
            <ColumnView
              key={columnId}
              columnId={columnId}
              visibleIds={visibleIds}
              onOpenCard={openCard}
            />
          ))}
        </div>
        <DragOverlay>{dragged ? <CardPreview card={dragged} /> : null}</DragOverlay>
      </DndContext>
      <EditCardModal cardId={editingId} onClose={closeCard} />
    </>
  );
}
