import { describe, expect, it } from 'vitest';
import { buildCustomers, buildSeries } from '@/data/mock';
import { buildOverview } from './overview';

describe('buildOverview', () => {
  const series = buildSeries();
  const customers = buildCustomers();

  it('slices the chart series to the selected range', () => {
    expect(buildOverview(series, customers, 7).series).toHaveLength(7);
    expect(buildOverview(series, customers, 90).series).toHaveLength(90);
  });

  it('sums revenue for the period and compares with the previous one', () => {
    const { kpis } = buildOverview(series, customers, 30);
    const revenue = kpis.find((k) => k.id === 'revenue')!;
    const current = series.slice(-30).reduce((s, p) => s + p.revenue, 0);
    const previous = series.slice(-60, -30).reduce((s, p) => s + p.revenue, 0);
    expect(revenue.value).toBe(current);
    expect(revenue.delta).toBeCloseTo((current - previous) / previous);
  });
});
