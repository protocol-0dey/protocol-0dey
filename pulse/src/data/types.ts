export type Plan = 'Free' | 'Pro' | 'Business';
export type CustomerStatus = 'active' | 'trial' | 'churned';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  plan: Plan;
  status: CustomerStatus;
  /** Monthly recurring revenue in USD. */
  mrr: number;
  /** ISO date (YYYY-MM-DD). */
  signedUp: string;
}

export interface SeriesPoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  revenue: number;
  signups: number;
}

export type Range = 7 | 30 | 90;

export interface Kpi {
  id: 'revenue' | 'customers' | 'signups' | 'churn';
  label: string;
  value: number;
  /** Relative change versus the previous period, e.g. 0.12 for +12%. */
  delta: number;
  format: 'currency' | 'number' | 'percent';
  /** For churn a decrease is good news. */
  invertDelta?: boolean;
}

export interface Overview {
  kpis: Kpi[];
  series: SeriesPoint[];
}
