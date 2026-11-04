import type { Customer, CustomerStatus } from '@/data/types';

export type SortKey = 'name' | 'plan' | 'status' | 'mrr' | 'signedUp';
export type SortDir = 'asc' | 'desc';

export interface TableQuery {
  search: string;
  status: CustomerStatus | 'all';
  sortKey: SortKey;
  sortDir: SortDir;
  page: number;
  pageSize: number;
}

export interface TableResult {
  rows: Customer[];
  total: number;
  pageCount: number;
  page: number;
}

const PLAN_ORDER = { Free: 0, Pro: 1, Business: 2 } as const;

function compare(a: Customer, b: Customer, key: SortKey): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'plan':
      return PLAN_ORDER[a.plan] - PLAN_ORDER[b.plan];
    case 'status':
      return a.status.localeCompare(b.status);
    case 'mrr':
      return a.mrr - b.mrr;
    case 'signedUp':
      return a.signedUp.localeCompare(b.signedUp);
  }
}

/** Pure filter + sort + paginate step, kept separate from React so it is easy to test. */
export function queryCustomers(customers: Customer[], query: TableQuery): TableResult {
  const needle = query.search.trim().toLowerCase();
  const filtered = customers.filter((c) => {
    if (query.status !== 'all' && c.status !== query.status) return false;
    if (!needle) return true;
    return [c.name, c.email, c.company].some((field) => field.toLowerCase().includes(needle));
  });

  const direction = query.sortDir === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort(
    (a, b) => compare(a, b, query.sortKey) * direction || a.id.localeCompare(b.id),
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * query.pageSize;
  return {
    rows: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    pageCount,
    page,
  };
}
