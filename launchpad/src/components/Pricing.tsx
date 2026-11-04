import { useId } from 'react';
import {
  MAX_SEATS,
  MIN_SEATS,
  PLANS,
  YEARLY_DISCOUNT,
  clampSeats,
  formatPrice,
  quote,
  type Billing,
  type Plan,
} from '@/lib/pricing';
import { IconCheck } from './Icons';

interface PricingProps {
  billing: Billing;
  seats: number;
  onBillingChange: (billing: Billing) => void;
  onSeatsChange: (seats: number) => void;
  onChoose: (plan: Plan) => void;
}

export function Pricing({
  billing,
  seats,
  onBillingChange,
  onSeatsChange,
  onChoose,
}: PricingProps) {
  const seatsId = useId();

  return (
    <section className="section" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <h2 id="pricing-title" className="section__title">
          Simple pricing that scales with your team
        </h2>

        <div className="controls">
          <div className="segmented" role="group" aria-label="Billing period">
            <button
              type="button"
              aria-pressed={billing === 'monthly'}
              onClick={() => onBillingChange('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              aria-pressed={billing === 'yearly'}
              onClick={() => onBillingChange('yearly')}
            >
              Yearly <span className="pill">-{Math.round(YEARLY_DISCOUNT * 100)}%</span>
            </button>
          </div>

          <div className="stepper">
            <label htmlFor={seatsId}>Team size</label>
            <div className="stepper__box">
              <button
                type="button"
                aria-label="Decrease team size"
                disabled={seats <= MIN_SEATS}
                onClick={() => onSeatsChange(clampSeats(seats - 1))}
              >
                −
              </button>
              <input
                id={seatsId}
                type="number"
                inputMode="numeric"
                min={MIN_SEATS}
                max={MAX_SEATS}
                value={seats}
                onChange={(e) => onSeatsChange(clampSeats(Number(e.target.value)))}
              />
              <button
                type="button"
                aria-label="Increase team size"
                disabled={seats >= MAX_SEATS}
                onClick={() => onSeatsChange(clampSeats(seats + 1))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <ul className="plans">
          {PLANS.map((plan) => {
            const q = quote(plan, billing, seats);
            const free = plan.monthly === 0;
            return (
              <li key={plan.id} className={`card plan${plan.highlight ? ' plan--highlight' : ''}`}>
                {plan.highlight && <span className="plan__badge">Most popular</span>}
                <h3>{plan.name}</h3>
                <p className="plan__tagline">{plan.tagline}</p>
                <p className="plan__price">
                  <strong>{formatPrice(q.perSeat)}</strong>
                  <span>{free ? ' forever' : ' / seat / month'}</span>
                </p>
                <p className="plan__total" aria-live="polite">
                  {q.overLimit
                    ? `Up to ${plan.maxSeats} members on this plan`
                    : free
                      ? `${q.seats} ${q.seats === 1 ? 'member' : 'members'}, no charge`
                      : billing === 'yearly'
                        ? `${formatPrice(q.yearlyTotal)} billed yearly for ${q.seats} ${q.seats === 1 ? 'seat' : 'seats'}`
                        : `${formatPrice(q.monthlyTotal)} per month for ${q.seats} ${q.seats === 1 ? 'seat' : 'seats'}`}
                </p>
                <button
                  type="button"
                  className={plan.highlight ? 'btn' : 'btn btn--ghost'}
                  disabled={q.overLimit}
                  onClick={() => onChoose(plan)}
                >
                  {free ? 'Start for free' : `Try ${plan.name} free for 14 days`}
                </button>
                <ul className="plan__features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <IconCheck />
                      {f}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
        {billing === 'yearly' && (
          <p className="savings">
            Billing yearly saves you {formatPrice(quote(PLANS[1], 'yearly', seats).yearlySavings)} a
            year on Team for {seats} {seats === 1 ? 'seat' : 'seats'}.
          </p>
        )}
      </div>
    </section>
  );
}
