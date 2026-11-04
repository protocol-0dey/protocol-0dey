import { useEffect, useRef } from 'react';
import type { Customer } from '@/data/types';
import { formatCurrency, formatLongDate } from '@/lib/format';
import { IconClose } from './Icons';
import { StatusBadge } from './StatusBadge';

interface CustomerDrawerProps {
  customer: Customer;
  onClose: () => void;
  onToggleChurn: (customer: Customer) => void;
}

/** Side panel (bottom sheet on phones) with details and one action. Closes on Escape or backdrop click. */
export function CustomerDrawer({ customer, onClose, onToggleChurn }: CustomerDrawerProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.body.classList.add('is-locked');

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      previous?.focus();
    };
  }, [onClose]);

  const churned = customer.status === 'churned';

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header className="drawer__head">
          <div>
            <h2 id="drawer-title">{customer.name}</h2>
            <p>{customer.email}</p>
          </div>
          <button
            ref={closeBtn}
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            <IconClose />
          </button>
        </header>
        <dl className="details">
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={customer.status} />
            </dd>
          </div>
          <div>
            <dt>Plan</dt>
            <dd>{customer.plan}</dd>
          </div>
          <div>
            <dt>MRR</dt>
            <dd>{formatCurrency(customer.mrr)}</dd>
          </div>
          <div>
            <dt>Company</dt>
            <dd>{customer.company}</dd>
          </div>
          <div>
            <dt>Country</dt>
            <dd>{customer.country}</dd>
          </div>
          <div>
            <dt>Signed up</dt>
            <dd>{formatLongDate(customer.signedUp)}</dd>
          </div>
        </dl>
        <button
          type="button"
          className={churned ? 'btn' : 'btn btn--danger'}
          onClick={() => onToggleChurn(customer)}
        >
          {churned ? 'Reactivate customer' : 'Mark as churned'}
        </button>
      </div>
    </div>
  );
}
