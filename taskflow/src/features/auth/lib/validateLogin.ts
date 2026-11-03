export interface LoginValues {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address';
  if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}
