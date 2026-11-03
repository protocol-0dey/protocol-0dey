import styles from './BoardSkeleton.module.css';

const COLUMNS = [3, 2, 1];

export function BoardSkeleton() {
  return (
    <div className={styles.board} aria-busy="true" aria-label="Loading board">
      {COLUMNS.map((cards, column) => (
        <div key={column} className={styles.column}>
          <div className={`${styles.block} ${styles.heading}`} />
          {Array.from({ length: cards }, (_, index) => (
            <div key={index} className={`${styles.block} ${styles.card}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
