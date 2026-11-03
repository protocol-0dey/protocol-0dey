import styles from './HeroPreview.module.css';

const COLUMNS = [
  {
    title: 'To do',
    cards: [
      ['Design onboarding', 'high'],
      ['Write API client', 'medium'],
    ],
  },
  { title: 'In progress', cards: [['Set up CI pipeline', 'medium']] },
  {
    title: 'Done',
    cards: [
      ['Fix touch drag', 'low'],
      ['Ship v1.0', 'high'],
    ],
  },
] as const;

/** Decorative, static preview of the board. The real, interactive board lives in the demo. */
export function HeroPreview() {
  return (
    <div className={styles.preview} aria-hidden="true">
      {COLUMNS.map((column) => (
        <div key={column.title} className={styles.column}>
          <div className={styles.columnTitle}>{column.title}</div>
          {column.cards.map(([title, priority]) => (
            <div key={title} className={styles.card}>
              <span>{title}</span>
              <i className={`${styles.dot} ${styles[priority]}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
