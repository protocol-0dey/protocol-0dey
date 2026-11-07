import { useEffect, useId, useMemo, useRef, useState, type PointerEvent } from 'react';
import type { SeriesPoint } from '@/data/types';
import { niceMax } from '@/lib/chart';
import { formatCurrency, formatShortDate } from '@/lib/format';

const DEFAULT_WIDTH = 800;
const PAD = { top: 16, right: 16, bottom: 28, left: 52 };

export function RevenueChart({ series }: { series: SeriesPoint[] }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  // Draw in real pixels instead of scaling a fixed viewBox, so axis labels stay readable on phones.
  useEffect(() => {
    const node = wrapper.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0);
      if (next > 0) setWidth(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const W = Math.max(280, width);
  const H = W < 560 ? 230 : 280;

  const geometry = useMemo(() => {
    const max = niceMax(Math.max(...series.map((p) => p.revenue)));
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i: number) =>
      PAD.left + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
    const line = series
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.revenue).toFixed(1)}`)
      .join(' ');
    const area = `${line} L${x(series.length - 1).toFixed(1)},${PAD.top + innerH} L${x(0).toFixed(1)},${PAD.top + innerH} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ value: max * t, y: y(max * t) }));
    return { x, y, line, area, ticks, innerW };
  }, [series, W, H]);

  const total = series.reduce((sum, p) => sum + p.revenue, 0);
  const labelEvery = Math.ceil(series.length / Math.max(2, Math.floor(W / 100)));

  function handleMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    const svgX = ratio * W;
    const index = Math.round(((svgX - PAD.left) / geometry.innerW) * (series.length - 1));
    setHover(Math.min(series.length - 1, Math.max(0, index)));
  }

  const active = hover === null ? null : series[hover];

  return (
    <div className="chart" ref={wrapper}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Daily revenue for the last ${series.length} days, ${formatCurrency(total)} in total`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {geometry.ticks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={tick.y}
              y2={tick.y}
              className="chart__grid"
            />
            <text x={PAD.left - 8} y={tick.y + 4} textAnchor="end" className="chart__label">
              {formatCurrency(tick.value)}
            </text>
          </g>
        ))}
        {series.map((p, i) =>
          i % labelEvery === 0 ? (
            <text
              key={p.date}
              x={geometry.x(i)}
              y={H - 6}
              textAnchor="middle"
              className="chart__label"
            >
              {formatShortDate(p.date)}
            </text>
          ) : null,
        )}
        <path d={geometry.area} fill={`url(#${gradientId})`} />
        <path d={geometry.line} className="chart__line" />
        {active && hover !== null && (
          <g>
            <line
              x1={geometry.x(hover)}
              x2={geometry.x(hover)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              className="chart__cursor"
            />
            <circle
              cx={geometry.x(hover)}
              cy={geometry.y(active.revenue)}
              r={5}
              className="chart__dot"
            />
          </g>
        )}
      </svg>
      <div className="chart__readout" aria-live="off">
        {active ? (
          <>
            <strong>{formatCurrency(active.revenue)}</strong>
            <span>{formatShortDate(active.date)}</span>
          </>
        ) : (
          <span>Hover the chart to see daily revenue</span>
        )}
      </div>
    </div>
  );
}
