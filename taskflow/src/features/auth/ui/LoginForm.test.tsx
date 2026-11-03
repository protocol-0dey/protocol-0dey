import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

vi.stubEnv('VITE_API_LATENCY_MS', '0');

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors and does not submit invalid data', async () => {
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess for valid credentials', async () => {
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText('Email'), 'dev@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret1');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('shows a server error for rejected credentials', async () => {
    render(<LoginForm onSuccess={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Email'), 'dev@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i);
  });
});
