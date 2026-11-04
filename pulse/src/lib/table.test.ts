import { describe, expect, it } from 'vitest';
import { buildCustomers } from '@/data/mock';
import { queryCustomers, type TableQuery } from './table';

const customers = buildCustomers();
const base: TableQuery = {
  search: '',
  status: 'all',
  sortKey: 'name',
  sortDir: 'asc',
  page: 1,
  pageSize: 8,
};

describe('queryCustomers', () => {
  it('paginates and reports totals', () => {
    const result = queryCustomers(customers, base);
    expect(result.rows).toHaveLength(8);
    expect(result.total).toBe(customers.length);
    expect(result.pageCount).toBe(Math.ceil(customers.length / 8));
  });

  it('filters by status', () => {
    const result = queryCustomers(customers, { ...base, status: 'churned', pageSize: 100 });
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows.every((c) => c.status === 'churned')).toBe(true);
  });

  it('searches name, email and company case-insensitively', () => {
    const target = customers[0];
    const byCompany = queryCustomers(customers, {
      ...base,
      search: target.company.toUpperCase(),
      pageSize: 100,
    });
    expect(byCompany.rows.some((c) => c.id === target.id)).toBe(true);
    const none = queryCustomers(customers, { ...base, search: 'zzz-no-match' });
    expect(none.total).toBe(0);
    expect(none.pageCount).toBe(1);
  });

  it('sorts by MRR in both directions', () => {
    const desc = queryCustomers(customers, {
      ...base,
      sortKey: 'mrr',
      sortDir: 'desc',
      pageSize: 100,
    }).rows;
    const asc = queryCustomers(customers, {
      ...base,
      sortKey: 'mrr',
      sortDir: 'asc',
      pageSize: 100,
    }).rows;
    expect(desc[0].mrr).toBeGreaterThanOrEqual(desc[desc.length - 1].mrr);
    expect(asc[0].mrr).toBeLessThanOrEqual(asc[asc.length - 1].mrr);
  });

  it('clamps an out-of-range page', () => {
    expect(queryCustomers(customers, { ...base, page: 99 }).page).toBe(
      Math.ceil(customers.length / 8),
    );
    expect(queryCustomers(customers, { ...base, page: -3 }).page).toBe(1);
  });
});
