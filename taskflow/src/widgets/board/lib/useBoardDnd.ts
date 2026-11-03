import { useState } from 'react';
import { type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { resolveDrop, useBoardStore } from '@/entities/board';

/** Business logic for drag-and-drop, kept out of the view component. */
export function useBoardDnd() {
  const moveCard = useBoardStore((state) => state.moveCard);
  const [activeId, setActiveId] = useState<string | null>(null);

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const board = useBoardStore.getState().board;
    const target = resolveDrop(board, String(active.id), String(over.id));
    if (target) void moveCard(String(active.id), target.columnId, target.index);
  }

  function onDragCancel() {
    setActiveId(null);
  }

  return { activeId, onDragStart, onDragEnd, onDragCancel };
}
