import type { Customer, CustomerStatus, Plan, SeriesPoint } from './types';

/** Small seeded PRNG so the demo data is the same on every load (and in tests). */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  'Ava',
  'Liam',
  'Mia',
  'Noah',
  'Zoe',
  'Ethan',
  'Ivy',
  'Lucas',
  'Nina',
  'Oscar',
  'Rita',
  'Sam',
];
const LAST = [
  'Brooks',
  'Chen',
  'Dubois',
  'Evans',
  'Fischer',
  'Garcia',
  'Hansen',
  'Ito',
  'Kowalski',
  'Lopez',
  'Novak',
  'Petrov',
];
const COMPANIES = [
  'Northwind',
  'Lumen Labs',
  'Brightly',
  'Orbit',
  'Kestrel',
  'Fable',
  'Harbor',
  'Quanta',
  'Nimbus',
  'Atlas',
  'Vertex',
  'Pixel & Co',
];
const COUNTRIES = ['USA', 'Germany', 'Poland', 'UK', 'France', 'Canada', 'Spain', 'Netherlands'];
const PLAN_MRR: Record<Plan, number> = { Free: 0, Pro: 29, Business: 99 };

export const TODAY = '2026-11-04';

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildCustomers(count = 48): Customer[] {
  const rnd = mulberry32(42);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rnd() * list.length)];
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const company = pick(COMPANIES);
    const planRoll = rnd();
    const plan: Plan = planRoll < 0.25 ? 'Free' : planRoll < 0.72 ? 'Pro' : 'Business';
    const statusRoll = rnd();
    const status: CustomerStatus =
      plan === 'Free'
        ? 'trial'
        : statusRoll < 0.78
          ? 'active'
          : statusRoll < 0.9
            ? 'trial'
            : 'churned';
    const seats = plan === 'Business' ? 1 + Math.floor(rnd() * 4) : 1;
    return {
      id: `c-${String(i + 1).padStart(3, '0')}`,
      name: `${first} ${last}`,
      email: `${first}.${last}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`.toLowerCase(),
      company,
      country: pick(COUNTRIES),
      plan,
      status,
      mrr: status === 'churned' ? 0 : PLAN_MRR[plan] * seats,
      signedUp: addDays(TODAY, -Math.floor(rnd() * 360)),
    };
  });
}

/** 180 days of daily revenue and signups with a gentle upward trend and weekly seasonality. */
export function buildSeries(days = 180): SeriesPoint[] {
  const rnd = mulberry32(7);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(TODAY, -(days - 1 - i));
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 0.72 : 1;
    const trend = 1 + i / days;
    const revenue = Math.round((900 + rnd() * 380) * trend * weekend);
    const signups = Math.round((6 + rnd() * 8) * trend * weekend);
    return { date, revenue, signups };
  });
}
