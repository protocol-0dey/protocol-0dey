import type { Kpi } from '@/data/types';
import { formatCurrency, formatDelta, formatNumber, formatPercent } from '@/lib/format';
import { IconArrow } from './Icons';

function formatValue(kpi: Kpi): string {
  if (kpi.format === 'currency') return formatCurrency(kpi.value);
  if (kpi.format === 'percent') return formatPercent(kpi.value);
  return formatNumber(kpi.value);
}

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <ul className="kpis">
      {kpis.map((kpi) => {
        const good = kpi.invertDelta ? kpi.delta <= 0 : kpi.delta >= 0;
        return (
          <li key={kpi.id} className="card kpi">
            <span className="kpi__label">{kpi.label}</span>
            <strong className="kpi__value">{formatValue(kpi)}</strong>
            <span className={`kpi__delta ${good ? 'is-good' : 'is-bad'}`}>
              <IconArrow up={kpi.delta >= 0} />
              {formatDelta(kpi.delta)}
              <span className="kpi__vs"> vs previous period</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function KpiSkeleton() {
  return (
    <ul className="kpis" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="card kpi">
          <span className="skeleton" style={{ width: '40%', height: 12 }} />
          <span className="skeleton" style={{ width: '65%', height: 28 }} />
          <span className="skeleton" style={{ width: '50%', height: 12 }} />
        </li>
      ))}
    </ul>
  );
}
