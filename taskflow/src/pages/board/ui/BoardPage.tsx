import { useEffect, useState } from 'react';
import { useBoardStore } from '@/entities/board';
import {
  EMPTY_FILTER,
  FilterBar,
  useVisibleCardIds,
  type CardFilter,
} from '@/features/filter-cards';
import { useRealtimeSync } from '@/features/realtime-sync';
import { Board, BoardSkeleton } from '@/widgets/board';
import { Header } from '@/widgets/header';
import styles from './BoardPage.module.css';

export function BoardPage() {
  const status = useBoardStore((state) => state.status);
  const load = useBoardStore((state) => state.load);
  const [filter, setFilter] = useState<CardFilter>(EMPTY_FILTER);
  const visibleIds = useVisibleCardIds(filter);

  useRealtimeSync();

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.toolbar}>
          <h1 className={styles.title}>Project board</h1>
          <FilterBar value={filter} onChange={setFilter} />
        </div>
        {(status === 'idle' || status === 'loading') && <BoardSkeleton />}
        {status === 'error' && (
          <p className={styles.state} role="alert">
            Could not load the board.{' '}
            <button type="button" className={styles.retry} onClick={() => void load()}>
              Retry
            </button>
          </p>
        )}
        {status === 'ready' && <Board visibleIds={visibleIds} />}
      </main>
    </>
  );
}
