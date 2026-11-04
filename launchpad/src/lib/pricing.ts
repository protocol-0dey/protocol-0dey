export type Billing = 'monthly' | 'yearly';
export type PlanId = 'starter' | 'team' | 'business';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** USD per seat per month when billed monthly. */
  monthly: number;
  /** Largest team the plan allows. */
  maxSeats: number;
  features: string[];
  highlight?: boolean;
}

export const YEARLY_DISCOUNT = 0.2;
export const MIN_SEATS = 1;
export const MAX_SEATS = 50;

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For individuals and tiny teams getting started.',
    monthly: 0,
    maxSeats: 3,
    features: [
      'Up to 3 members',
      '3 active projects',
      'Kanban and list views',
      '7-day activity history',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    tagline: 'For growing teams that ship every week.',
    monthly: 12,
    maxSeats: 50,
    highlight: true,
    features: [
      'Unlimited projects',
      'Timeline and calendar views',
      'Custom fields and automations',
      '1-year activity history',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For companies that need control and support.',
    monthly: 24,
    maxSeats: 50,
    features: [
      'Everything in Team',
      'Single sign-on (SSO)',
      'Roles and audit log',
      'Priority support',
    ],
  },
];

export const planById = (id: PlanId): Plan => PLANS.find((p) => p.id === id) ?? PLANS[0];

/** Price per seat per month for the chosen billing period, rounded to cents. */
export function seatPrice(plan: Plan, billing: Billing): number {
  const price = billing === 'yearly' ? plan.monthly * (1 - YEARLY_DISCOUNT) : plan.monthly;
  return Math.round(price * 100) / 100;
}

export function clampSeats(seats: number): number {
  if (!Number.isFinite(seats)) return MIN_SEATS;
  return Math.min(MAX_SEATS, Math.max(MIN_SEATS, Math.round(seats)));
}

export interface Quote {
  seats: number;
  perSeat: number;
  /** Charged every month (monthly billing) or equivalent per month (yearly billing). */
  monthlyTotal: number;
  /** What is charged once a year when billed yearly, otherwise the same as monthlyTotal * 12. */
  yearlyTotal: number;
  /** Money saved per year compared with monthly billing. */
  yearlySavings: number;
  overLimit: boolean;
}

export function quote(plan: Plan, billing: Billing, seats: number): Quote {
  const count = clampSeats(seats);
  const perSeat = seatPrice(plan, billing);
  const monthlyTotal = Math.round(perSeat * count * 100) / 100;
  const yearlyTotal = Math.round(monthlyTotal * 12 * 100) / 100;
  const yearlySavings = Math.round(plan.monthly * count * 12 * YEARLY_DISCOUNT * 100) / 100;
  return {
    seats: count,
    perSeat,
    monthlyTotal,
    yearlyTotal,
    yearlySavings,
    overLimit: count > plan.maxSeats,
  };
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** "$9.60" or "$12" (whole dollars lose the cents). */
export const formatPrice = (value: number): string =>
  (Number.isInteger(value) ? usdWhole : usd).format(value);
