import { useMemo, useState } from 'react';
import type { Customer, CustomerStatus } from '@/data/types';
import { formatCurrency, formatLongDate } from '@/lib/format';
import { queryCustomers, type SortDir, type SortKey } from '@/lib/table';
import { IconArrow, IconSearch } from './Icons';
import { EmptyState } from './States';
import { StatusBadge } from './StatusBadge';

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'name', label: 'Customer' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'mrr', label: 'MRR', numeric: true },
  { key: 'signedUp', label: 'Signed up' },
];

const PAGE_SIZE = 8;

interface CustomersTableProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
}

export function CustomersTable({ customers, onSelect }: CustomersTableProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomerStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('signedUp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const result = useMemo(
    () =>
      queryCustomers(customers, { search, status, sortKey, sortDir, page, pageSize: PAGE_SIZE }),
    [customers, search, status, sortKey, sortDir, page],
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'status' ? 'asc' : 'desc');
    }
    setPage(1);
  }

  const from = result.total === 0 ? 0 : (result.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(result.page * PAGE_SIZE, result.total);

  return (
    <section className="card table-card" aria-label="Customers">
      <div className="toolbar">
        <label className="search">
          <IconSearch />
          <span className="sr-only">Search customers</span>
          <input
            type="search"
            placeholder="Search name, email or company"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="select">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as CustomerStatus | 'all');
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="churned">Churned</option>
          </select>
        </label>
      </div>

      {result.total === 0 ? (
        <EmptyState title="No customers found">
          Try a different search or clear the status filter.
        </EmptyState>
      ) : (
        <table className="table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={col.numeric ? 'num' : undefined}
                  aria-sort={
                    sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                >
                  <button type="button" className="th-btn" onClick={() => toggleSort(col.key)}>
                    {col.label}
                    {sortKey === col.key && <IconArrow up={sortDir === 'asc'} />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((c) => (
              <tr key={c.id}>
                <td data-label="Customer">
                  <button type="button" className="row-btn" onClick={() => onSelect(c)}>
                    <span className="avatar" aria-hidden="true">
                      {c.name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')}
                    </span>
                    <span>
                      <strong>{c.name}</strong>
                      <small>{c.company}</small>
                    </span>
                  </button>
                </td>
                <td data-label="Plan">{c.plan}</td>
                <td data-label="Status">
                  <StatusBadge status={c.status} />
                </td>
                <td data-label="MRR" className="num">
                  {formatCurrency(c.mrr)}
                </td>
                <td data-label="Signed up">{formatLongDate(c.signedUp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pager">
        <span>
          {from}–{to} of {result.total}
        </span>
        <div>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={result.page <= 1}
            onClick={() => setPage(result.page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={result.page >= result.pageCount}
            onClick={() => setPage(result.page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
