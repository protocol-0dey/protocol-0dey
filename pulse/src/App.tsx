import { useCallback, useState } from 'react';
import { CustomerDrawer } from './components/CustomerDrawer';
import { CustomersTable } from './components/CustomersTable';
import { KpiCards, KpiSkeleton } from './components/KpiCards';
import { Layout, type View } from './components/Layout';
import { RevenueChart } from './components/RevenueChart';
import { ErrorState } from './components/States';
import { StatusBadge } from './components/StatusBadge';
import { getCustomers, getOverview, setCustomerStatus } from './data/api';
import type { Customer, Range } from './data/types';
import { useAsync } from './hooks/useAsync';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { formatCurrency } from './lib/format';

const RANGES: Range[] = [7, 30, 90];

export function App() {
  const { theme, toggle } = useTheme();
  const [view, setView] = useState<View>('overview');

  return (
    <Layout view={view} onViewChange={setView} theme={theme} onToggleTheme={toggle}>
      {view === 'overview' ? (
        <OverviewView onOpenCustomers={() => setView('customers')} />
      ) : (
        <CustomersView />
      )}
    </Layout>
  );
}

function OverviewView({ onOpenCustomers }: { onOpenCustomers: () => void }) {
  const [range, setRange] = useState<Range>(30);
  const overview = useAsync(useCallback(() => getOverview(range), [range]));
  const customers = useAsync(getCustomers);

  const top = customers.data ? [...customers.data].sort((a, b) => b.mrr - a.mrr).slice(0, 5) : [];

  return (
    <>
      <div className="section-head">
        <h2>Business at a glance</h2>
        <div className="segmented" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>
              {r} days
            </button>
          ))}
        </div>
      </div>

      {overview.status === 'error' && (
        <ErrorState message={overview.error?.message} onRetry={overview.reload} />
      )}
      {overview.status === 'loading' && <KpiSkeleton />}
      {overview.status === 'success' && overview.data && (
        <>
          <KpiCards kpis={overview.data.kpis} />
          <section className="card chart-card" aria-label="Revenue">
            <h3>Revenue</h3>
            <RevenueChart series={overview.data.series} />
          </section>
        </>
      )}

      <section className="card top-card" aria-label="Top customers">
        <div className="section-head">
          <h3>Top customers by MRR</h3>
          <button type="button" className="btn btn--ghost" onClick={onOpenCustomers}>
            View all
          </button>
        </div>
        {customers.status === 'loading' && (
          <div className="skeleton" style={{ height: 120 }} aria-hidden="true" />
        )}
        {customers.status === 'error' && (
          <ErrorState message={customers.error?.message} onRetry={customers.reload} />
        )}
        {customers.status === 'success' && (
          <ul className="top-list">
            {top.map((c) => (
              <li key={c.id}>
                <span>
                  <strong>{c.name}</strong>
                  <small>{c.company}</small>
                </span>
                <StatusBadge status={c.status} />
                <span className="num">{formatCurrency(c.mrr)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function CustomersView() {
  const toast = useToast();
  const customers = useAsync(getCustomers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { setData } = customers;

  const selected = customers.data?.find((c) => c.id === selectedId) ?? null;
  const close = useCallback(() => setSelectedId(null), []);

  async function toggleChurn(customer: Customer) {
    const next = customer.status === 'churned' ? 'active' : 'churned';
    const snapshot = customer;
    // Optimistic update: show the change immediately, roll back if the request fails.
    setData((list) => list.map((c) => (c.id === customer.id ? { ...c, status: next } : c)));
    try {
      const saved = await setCustomerStatus(customer.id, next);
      setData((list) => list.map((c) => (c.id === saved.id ? saved : c)));
      toast.show(
        next === 'churned' ? `${customer.name} marked as churned` : `${customer.name} reactivated`,
      );
    } catch {
      setData((list) => list.map((c) => (c.id === snapshot.id ? snapshot : c)));
      toast.show('Could not update the customer. Changes were reverted.', 'error');
    }
  }

  if (customers.status === 'loading') {
    return (
      <section className="card table-card" aria-busy="true" aria-label="Loading customers">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: 44, margin: '12px 16px' }} />
        ))}
      </section>
    );
  }
  if (customers.status === 'error' || !customers.data) {
    return <ErrorState message={customers.error?.message} onRetry={customers.reload} />;
  }

  return (
    <>
      <CustomersTable customers={customers.data} onSelect={(c) => setSelectedId(c.id)} />
      {selected && (
        <CustomerDrawer
          customer={selected}
          onClose={close}
          onToggleChurn={(c) => void toggleChurn(c)}
        />
      )}
    </>
  );
}
