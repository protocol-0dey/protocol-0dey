import { buildCustomers, buildSeries } from './mock';
import type { Customer, CustomerStatus, Overview, Range } from './types';
import { buildOverview } from '@/lib/overview';

/**
 * Mock API. Every function returns a Promise with artificial latency, so the UI is written
 * exactly as it would be against a real backend (loading, error and retry states included).
 * To connect a real server, replace the bodies with fetch() calls; the components stay the same.
 */
const LATENCY = Number(import.meta.env.VITE_API_LATENCY_MS ?? 600);
const wait = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY));

let customers = buildCustomers();
const series = buildSeries();

function shouldFail(): boolean {
  return typeof location !== 'undefined' && new URLSearchParams(location.search).has('error');
}

export async function getOverview(range: Range): Promise<Overview> {
  if (shouldFail())
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Could not load data')), LATENCY),
    );
  return wait(buildOverview(series, customers, range));
}

export async function getCustomers(): Promise<Customer[]> {
  if (shouldFail())
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Could not load customers')), LATENCY),
    );
  return wait(customers.map((c) => ({ ...c })));
}

export async function setCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
  const found = customers.find((c) => c.id === id);
  if (!found) throw new Error('Customer not found');
  const updated: Customer = {
    ...found,
    status,
    mrr: status === 'churned' ? 0 : found.mrr || planPrice(found),
  };
  customers = customers.map((c) => (c.id === id ? updated : c));
  return wait({ ...updated });
}

const planPrice = (c: Customer) => ({ Free: 0, Pro: 29, Business: 99 })[c.plan];
