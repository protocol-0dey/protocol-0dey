import { useState, type FormEvent } from 'react';
import { useBoardStore, type Card, type Priority } from '@/entities/board';
import { Button, Modal, SelectField, TextAreaField, TextField } from '@/shared/ui';
import styles from './EditCardModal.module.css';

interface EditCardModalProps {
  cardId: string | null;
  onClose: () => void;
}

export function EditCardModal({ cardId, onClose }: EditCardModalProps) {
  const card = useBoardStore((state) => (cardId ? state.board.cards[cardId] : undefined));

  return (
    <Modal open={Boolean(card)} title="Edit card" onClose={onClose}>
      {card && <EditForm key={card.id} card={card} onClose={onClose} />}
    </Modal>
  );
}

function EditForm({ card, onClose }: { card: Card; onClose: () => void }) {
  const updateCard = useBoardStore((state) => state.updateCard);
  const removeCard = useBoardStore((state) => state.removeCard);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState<Priority>(card.priority);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    void updateCard(card.id, { title: title.trim(), description: description.trim(), priority });
    onClose();
  }

  function handleDelete() {
    void removeCard(card.id);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
      <TextAreaField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
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
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
        <span className={styles.spacer} />
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Save
        </Button>
      </div>
    </form>
  );
}
