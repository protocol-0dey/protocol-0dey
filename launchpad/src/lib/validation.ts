export type Errors<T extends string> = Partial<Record<T, string>>;

export interface AccountValues {
  name: string;
  email: string;
  password: string;
}
export interface WorkspaceValues {
  company: string;
  teamSize: string;
  useCase: string;
}
export interface PlanValues {
  terms: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateAccount(v: AccountValues): Errors<keyof AccountValues> {
  const errors: Errors<keyof AccountValues> = {};
  if (v.name.trim().length < 2) errors.name = 'Enter your name (at least 2 characters).';
  if (!EMAIL.test(v.email.trim())) errors.email = 'Enter a valid email address.';
  if (v.password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (!/[a-zA-Z]/.test(v.password) || !/\d/.test(v.password)) {
    errors.password = 'Include at least one letter and one number.';
  }
  return errors;
}

export function validateWorkspace(v: WorkspaceValues): Errors<keyof WorkspaceValues> {
  const errors: Errors<keyof WorkspaceValues> = {};
  if (v.company.trim().length < 2) errors.company = 'Enter your company or team name.';
  if (!v.teamSize) errors.teamSize = 'Choose your team size.';
  if (!v.useCase) errors.useCase = 'Pick what you will use Launchpad for.';
  return errors;
}

export function validatePlan(v: PlanValues): Errors<keyof PlanValues> {
  return v.terms ? {} : { terms: 'Please accept the terms to continue.' };
}

/** 0 (too weak) to 4 (strong). Only used for the visual hint, never as a validation rule. */
export function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}
