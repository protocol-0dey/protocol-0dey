import { useToastStore } from './toastStore';
import styles from './Toaster.module.css';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className={`${styles.toast} ${styles[item.kind]}`}>
          <span>{item.message}</span>
          <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
