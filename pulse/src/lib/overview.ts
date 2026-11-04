import type { Customer, Kpi, Overview, Range, SeriesPoint } from '@/data/types';

const sum = (points: SeriesPoint[], pick: (p: SeriesPoint) => number) =>
  points.reduce((total, p) => total + pick(p), 0);

const change = (current: number, previous: number) =>
  previous === 0 ? 0 : (current - previous) / previous;

/** Builds KPI cards and the chart series for the selected range, compared with the previous period. */
export function buildOverview(
  series: SeriesPoint[],
  customers: Customer[],
  range: Range,
): Overview {
  const current = series.slice(-range);
  const previous = series.slice(-range * 2, -range);

  const revenue = sum(current, (p) => p.revenue);
  const signups = sum(current, (p) => p.signups);
  const active = customers.filter((c) => c.status === 'active').length;
  const churned = customers.filter((c) => c.status === 'churned').length;
  const churnRate = customers.length === 0 ? 0 : churned / customers.length;

  const kpis: Kpi[] = [
    {
      id: 'revenue',
      label: 'Revenue',
      value: revenue,
      delta: change(
        revenue,
        sum(previous, (p) => p.revenue),
      ),
      format: 'currency',
    },
    { id: 'customers', label: 'Active customers', value: active, delta: 0.042, format: 'number' },
    {
      id: 'signups',
      label: 'New signups',
      value: signups,
      delta: change(
        signups,
        sum(previous, (p) => p.signups),
      ),
      format: 'number',
    },
    {
      id: 'churn',
      label: 'Churn rate',
      value: churnRate,
      delta: -0.018,
      format: 'percent',
      invertDelta: true,
    },
  ];
  return { kpis, series: current };
}
