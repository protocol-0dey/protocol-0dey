import { useState, type FormEvent } from 'react';
import { useBoardStore, type Priority } from '@/entities/board';
import { Button, SelectField, TextField } from '@/shared/ui';
import styles from './AddCardForm.module.css';

export function AddCardForm({ columnId }: { columnId: string }) {
  const addCard = useBoardStore((state) => state.addCard);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  function reset() {
    setTitle('');
    setPriority('medium');
    setOpen(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    void addCard(columnId, { title, priority });
    reset();
  }

  if (!open) {
    return (
      <Button variant="ghost" className={styles.trigger} onClick={() => setOpen(true)}>
        + Add card
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} aria-label="Add card">
      <TextField
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What needs to be done?"
        autoFocus
      />
      <SelectField
        label="Priority"
        value={priority}
        onChange={(event) => setPriority(event.target.value as Priority)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </SelectField>
      <div className={styles.actions}>
        <Button type="submit" disabled={!title.trim()}>
          Add
        </Button>
        <Button variant="ghost" onClick={reset}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
