import { useState, type FormEvent } from 'react';
import { Button, TextField } from '@/shared/ui';
import { validateLogin, type LoginErrors } from '../lib/validateLogin';
import { useAuthStore } from '../model/store';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validation = validateLogin({ email, password });
    setErrors(validation);
    setFormError(null);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      onSuccess();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      {formError && (
        <p role="alert" className={styles.formError}>
          {formError}
        </p>
      )}
      <Button type="submit" loading={submitting}>
        Sign in
      </Button>
    </form>
  );
}
