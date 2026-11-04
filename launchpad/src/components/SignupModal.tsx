import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ApiError, createWorkspace } from '@/lib/api';
import { PLANS, formatPrice, planById, quote, type Billing, type PlanId } from '@/lib/pricing';
import {
  passwordStrength,
  validateAccount,
  validatePlan,
  validateWorkspace,
  type AccountValues,
  type Errors,
  type WorkspaceValues,
} from '@/lib/validation';
import { IconClose } from './Icons';

const STEPS = ['Account', 'Workspace', 'Plan'] as const;
const TEAM_SIZES = ['Just me', '2-10', '11-50', '51-200', '200+'];
const USE_CASES = ['Software development', 'Marketing', 'Design', 'Operations', 'Something else'];
const STRENGTH_LABEL = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];

export interface SignupPreset {
  plan: PlanId;
  billing: Billing;
  seats: number;
}

interface SignupModalProps {
  preset: SignupPreset;
  onClose: () => void;
}

type Status = 'editing' | 'submitting' | 'done';

export function SignupModal({ preset, onClose }: SignupModalProps) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>('editing');
  const [account, setAccount] = useState<AccountValues>({ name: '', email: '', password: '' });
  const [workspace, setWorkspace] = useState<WorkspaceValues>({
    company: '',
    teamSize: '',
    useCase: '',
  });
  const [planId, setPlanId] = useState<PlanId>(preset.plan);
  const [billing, setBilling] = useState<Billing>(preset.billing);
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountErrors, setAccountErrors] = useState<Errors<keyof AccountValues>>({});
  const [workspaceErrors, setWorkspaceErrors] = useState<Errors<keyof WorkspaceValues>>({});
  const [termsError, setTermsError] = useState<string>();
  const [formError, setFormError] = useState<string>();

  const dialog = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  // Dialog behaviour: lock scroll, trap focus, close on Escape, restore focus on unmount.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add('is-locked');
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialog.current) return;
      const items = Array.from(
        dialog.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      previous?.focus();
    };
  }, [onClose]);

  // Move focus to the step heading whenever the step (or the success screen) changes.
  useEffect(() => {
    heading.current?.focus();
  }, [step, status]);

  const plan = planById(planId);
  const q = quote(plan, billing, preset.seats);

  function focusFirstError(errors: Record<string, string | undefined>, names: string[]) {
    const first = names.find((n) => errors[n]);
    if (first) requestAnimationFrame(() => document.getElementById(id(first))?.focus());
  }

  function next() {
    setFormError(undefined);
    if (step === 0) {
      const errors = validateAccount(account);
      setAccountErrors(errors);
      if (Object.keys(errors).length) return focusFirstError(errors, ['name', 'email', 'password']);
      setStep(1);
    } else if (step === 1) {
      const errors = validateWorkspace(workspace);
      setWorkspaceErrors(errors);
      if (Object.keys(errors).length)
        return focusFirstError(errors, ['company', 'teamSize', 'useCase']);
      setStep(2);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step < 2) return next();
    const errors = validatePlan({ terms });
    setTermsError(errors.terms);
    if (errors.terms) return focusFirstError({ terms: errors.terms }, ['terms']);
    if (q.overLimit) return;

    setStatus('submitting');
    setFormError(undefined);
    try {
      await createWorkspace({ ...account, ...workspace, plan: planId, billing, seats: q.seats });
      setStatus('done');
    } catch (error) {
      setStatus('editing');
      if (error instanceof ApiError && error.field === 'email') {
        setAccountErrors({ email: error.message });
        setStep(0);
        focusFirstError({ email: error.message }, ['email']);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  const strength = passwordStrength(account.password);

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialog}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id('title')}
      >
        <button
          type="button"
          className="icon-btn modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <IconClose />
        </button>

        {status === 'done' ? (
          <div className="modal__done">
            <h2 id={id('title')} ref={heading} tabIndex={-1}>
              You are all set, {account.name.trim().split(' ')[0]}!
            </h2>
            <p>
              We created the <strong>{workspace.company.trim()}</strong> workspace on the{' '}
              {plan.name} plan and sent a confirmation to {account.email.trim()}.
            </p>
            <p className="muted">This is a concept project, so nothing was really created.</p>
            <button type="button" className="btn" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} noValidate>
            <ol className="steps" aria-label="Signup progress">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  aria-current={i === step ? 'step' : undefined}
                  className={i <= step ? 'is-reached' : ''}
                >
                  <span className="steps__dot">{i + 1}</span>
                  <span className="steps__label">{label}</span>
                </li>
              ))}
            </ol>

            <h2 id={id('title')} ref={heading} tabIndex={-1}>
              {step === 0 && 'Create your account'}
              {step === 1 && 'Set up your workspace'}
              {step === 2 && 'Choose your plan'}
            </h2>

            {step === 0 && (
              <>
                <Field id={id('name')} label="Full name" error={accountErrors.name}>
                  <input
                    id={id('name')}
                    autoComplete="name"
                    value={account.name}
                    aria-invalid={!!accountErrors.name}
                    aria-describedby={accountErrors.name ? `${id('name')}-error` : undefined}
                    onChange={(e) => setAccount({ ...account, name: e.target.value })}
                  />
                </Field>
                <Field id={id('email')} label="Work email" error={accountErrors.email}>
                  <input
                    id={id('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={account.email}
                    aria-invalid={!!accountErrors.email}
                    aria-describedby={accountErrors.email ? `${id('email')}-error` : undefined}
                    onChange={(e) => setAccount({ ...account, email: e.target.value })}
                  />
                </Field>
                <Field id={id('password')} label="Password" error={accountErrors.password}>
                  <div className="password">
                    <input
                      id={id('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={account.password}
                      aria-invalid={!!accountErrors.password}
                      aria-describedby={`${id('password')}-hint${accountErrors.password ? ` ${id('password')}-error` : ''}`}
                      onChange={(e) => setAccount({ ...account, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="meter" aria-hidden="true">
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} className={n <= strength ? `is-on s${strength}` : ''} />
                    ))}
                  </div>
                  <p id={`${id('password')}-hint`} className="hint">
                    {account.password
                      ? STRENGTH_LABEL[strength]
                      : 'At least 8 characters, with a letter and a number.'}
                  </p>
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field
                  id={id('company')}
                  label="Company or team name"
                  error={workspaceErrors.company}
                >
                  <input
                    id={id('company')}
                    autoComplete="organization"
                    value={workspace.company}
                    aria-invalid={!!workspaceErrors.company}
                    aria-describedby={
                      workspaceErrors.company ? `${id('company')}-error` : undefined
                    }
                    onChange={(e) => setWorkspace({ ...workspace, company: e.target.value })}
                  />
                </Field>
                <Field id={id('teamSize')} label="Team size" error={workspaceErrors.teamSize}>
                  <select
                    id={id('teamSize')}
                    value={workspace.teamSize}
                    aria-invalid={!!workspaceErrors.teamSize}
                    aria-describedby={
                      workspaceErrors.teamSize ? `${id('teamSize')}-error` : undefined
                    }
                    onChange={(e) => setWorkspace({ ...workspace, teamSize: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {TEAM_SIZES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  id={id('useCase')}
                  label="What will you use Launchpad for?"
                  error={workspaceErrors.useCase}
                >
                  <select
                    id={id('useCase')}
                    value={workspace.useCase}
                    aria-invalid={!!workspaceErrors.useCase}
                    aria-describedby={
                      workspaceErrors.useCase ? `${id('useCase')}-error` : undefined
                    }
                    onChange={(e) => setWorkspace({ ...workspace, useCase: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {USE_CASES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <fieldset className="plan-picker">
                  <legend className="sr-only">Plan</legend>
                  {PLANS.map((p) => (
                    <label
                      key={p.id}
                      className={`plan-option${planId === p.id ? ' is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        checked={planId === p.id}
                        onChange={() => setPlanId(p.id)}
                      />
                      <span>
                        <strong>{p.name}</strong>
                        <small>
                          {p.monthly === 0
                            ? 'Free'
                            : `${formatPrice(quote(p, billing, 1).perSeat)} / seat / month`}
                        </small>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div
                  className="segmented segmented--block"
                  role="group"
                  aria-label="Billing period"
                >
                  <button
                    type="button"
                    aria-pressed={billing === 'monthly'}
                    onClick={() => setBilling('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    aria-pressed={billing === 'yearly'}
                    onClick={() => setBilling('yearly')}
                  >
                    Yearly (-20%)
                  </button>
                </div>
                <div className="summary" aria-live="polite">
                  <div>
                    <span>
                      {plan.name}, {q.seats} {q.seats === 1 ? 'seat' : 'seats'}
                    </span>
                    <strong>
                      {plan.monthly === 0 ? 'Free' : formatPrice(q.monthlyTotal) + ' / month'}
                    </strong>
                  </div>
                  {plan.monthly > 0 && billing === 'yearly' && (
                    <div className="muted">
                      <span>Billed yearly</span>
                      <span>{formatPrice(q.yearlyTotal)}</span>
                    </div>
                  )}
                  <div className="muted">
                    <span>14-day trial, then billed. Cancel any time.</span>
                  </div>
                </div>
                {q.overLimit && (
                  <p className="error" role="alert">
                    {plan.name} allows up to {plan.maxSeats} members. Pick another plan or reduce
                    the team size.
                  </p>
                )}
                <div className="field">
                  <label className="check">
                    <input
                      id={id('terms')}
                      type="checkbox"
                      checked={terms}
                      aria-invalid={!!termsError}
                      aria-describedby={termsError ? `${id('terms')}-error` : undefined}
                      onChange={(e) => {
                        setTerms(e.target.checked);
                        setTermsError(undefined);
                      }}
                    />
                    <span>I agree to the Terms of Service and Privacy Policy</span>
                  </label>
                  {termsError && (
                    <p id={`${id('terms')}-error`} className="error">
                      {termsError}
                    </p>
                  )}
                </div>
              </>
            )}

            {formError && (
              <p className="error" role="alert">
                {formError}
              </p>
            )}

            <div className="modal__actions">
              {step > 0 && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setStep(step - 1)}
                  disabled={status === 'submitting'}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="btn"
                disabled={status === 'submitting' || (step === 2 && q.overLimit)}
              >
                {step < 2
                  ? 'Continue'
                  : status === 'submitting'
                    ? 'Creating workspace…'
                    : 'Create workspace'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p id={`${id}-error`} className="error">
          {error}
        </p>
      )}
    </div>
  );
}
