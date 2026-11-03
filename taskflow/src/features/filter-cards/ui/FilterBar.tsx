import type { Priority } from '@/entities/board';
import { Button } from '@/shared/ui';
import { isFilterActive, EMPTY_FILTER, type CardFilter } from '../lib/filter';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  value: CardFilter;
  onChange: (value: CardFilter) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className={styles.bar} role="search">
      <input
        type="search"
        className={styles.input}
        placeholder="Search cards…"
        aria-label="Search cards"
        value={value.query}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
      />
      <select
        className={styles.select}
        aria-label="Filter by priority"
        value={value.priority}
        onChange={(event) =>
          onChange({ ...value, priority: event.target.value as Priority | 'all' })
        }
      >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      {isFilterActive(value) && (
        <Button variant="ghost" onClick={() => onChange(EMPTY_FILTER)}>
          Clear
        </Button>
      )}
    </div>
  );
}
