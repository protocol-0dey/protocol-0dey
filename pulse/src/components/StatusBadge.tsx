import type { CustomerStatus } from '@/data/types';

const LABEL: Record<CustomerStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  churned: 'Churned',
};

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return <span className={`badge badge--${status}`}>{LABEL[status]}</span>;
}
