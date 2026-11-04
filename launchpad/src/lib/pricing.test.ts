import { describe, expect, it } from 'vitest';
import { PLANS, clampSeats, formatPrice, planById, quote, seatPrice } from './pricing';

const team = planById('team');
const starter = planById('starter');

describe('pricing', () => {
  it('applies the 20% yearly discount per seat', () => {
    expect(seatPrice(team, 'monthly')).toBe(12);
    expect(seatPrice(team, 'yearly')).toBe(9.6);
    expect(seatPrice(starter, 'yearly')).toBe(0);
  });

  it('calculates totals for a team', () => {
    const monthly = quote(team, 'monthly', 5);
    expect(monthly.monthlyTotal).toBe(60);
    expect(monthly.yearlyTotal).toBe(720);

    const yearly = quote(team, 'yearly', 5);
    expect(yearly.monthlyTotal).toBe(48);
    expect(yearly.yearlyTotal).toBe(576);
    expect(yearly.yearlySavings).toBe(144);
  });

  it('flags teams that exceed the Starter limit', () => {
    expect(quote(starter, 'monthly', 3).overLimit).toBe(false);
    expect(quote(starter, 'monthly', 4).overLimit).toBe(true);
  });

  it('keeps seats within bounds and ignores garbage input', () => {
    expect(clampSeats(0)).toBe(1);
    expect(clampSeats(999)).toBe(50);
    expect(clampSeats(Number.NaN)).toBe(1);
    expect(clampSeats(4.6)).toBe(5);
  });

  it('formats whole dollars without cents', () => {
    expect(formatPrice(12)).toBe('$12');
    expect(formatPrice(9.6)).toBe('$9.60');
    expect(PLANS).toHaveLength(3);
  });
});
