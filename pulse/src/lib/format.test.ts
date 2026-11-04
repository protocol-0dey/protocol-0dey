import { describe, expect, it } from 'vitest';
import { niceMax } from './chart';
import { formatCurrency, formatDelta, formatLongDate } from './format';

describe('format', () => {
  it('formats currency without decimals', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });
  it('adds an explicit sign to deltas', () => {
    expect(formatDelta(0.123)).toBe('+12.3%');
    expect(formatDelta(-0.04)).toBe('-4%');
    expect(formatDelta(0)).toBe('0%');
  });
  it('formats ISO dates independent of the local time zone', () => {
    expect(formatLongDate('2026-01-05')).toBe('Jan 5, 2026');
  });
});

describe('niceMax', () => {
  it('rounds up to a tidy axis maximum', () => {
    expect(niceMax(1)).toBe(1);
    expect(niceMax(1730)).toBe(2000);
    expect(niceMax(4200)).toBe(5000);
    expect(niceMax(0)).toBe(1);
  });
});
