import type { Priority } from '../model/types';
import styles from './PriorityBadge.module.css';

const LABELS: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High' };

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`${styles.badge} ${styles[priority]}`}>{LABELS[priority]}</span>;
}
