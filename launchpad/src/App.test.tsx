import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

vi.stubEnv('VITE_API_LATENCY_MS', '0');

async function fillAccount(user: ReturnType<typeof userEvent.setup>, email = 'ada@example.com') {
  await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Work email'), email);
  await user.type(screen.getByLabelText('Password'), 'secret1234');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

describe('Launchpad pricing', () => {
  it('switches billing and recalculates the price', async () => {
    const user = userEvent.setup();
    render(<App />);
    const pricing = screen.getByRole('region', { name: /simple pricing/i });
    // default is yearly with 5 seats: 9.60 per seat
    expect(within(pricing).getAllByText('$9.60').length).toBeGreaterThan(0);
    await user.click(within(pricing).getByRole('button', { name: 'Monthly' }));
    expect(within(pricing).getAllByText('$12').length).toBeGreaterThan(0);
  });

  it('updates totals when the team size changes and blocks Starter above its limit', async () => {
    const user = userEvent.setup();
    render(<App />);
    const pricing = screen.getByRole('region', { name: /simple pricing/i });
    await user.click(within(pricing).getByRole('button', { name: 'Increase team size' }));
    expect(within(pricing).getByRole('spinbutton')).toHaveValue(6);
    expect(within(pricing).getByRole('button', { name: 'Start for free' })).toBeDisabled();
  });

  it('toggles FAQ answers', async () => {
    const user = userEvent.setup();
    render(<App />);
    const question = screen.getByRole('button', { name: /credit card/i });
    expect(question).toHaveAttribute('aria-expanded', 'true');
    await user.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Launchpad signup flow', () => {
  it('validates each step and then creates the workspace', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'Start free trial' })[0]);
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(within(dialog).getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Work email')).toHaveAttribute('aria-invalid', 'true');

    await fillAccount(user);
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(within(dialog).getByText('Enter your company or team name.')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Company or team name'), 'Acme');
    await user.selectOptions(within(dialog).getByLabelText('Team size'), '2-10');
    await user.selectOptions(within(dialog).getByLabelText(/use Launchpad for/i), 'Design');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));

    await user.click(within(dialog).getByRole('button', { name: 'Create workspace' }));
    expect(within(dialog).getByText('Please accept the terms to continue.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByRole('button', { name: 'Create workspace' }));

    expect(await screen.findByText(/You are all set, Ada/)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows a server error on the email field and returns to step one', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'Start free trial' })[0]);
    const dialog = await screen.findByRole('dialog');
    await fillAccount(user, 'taken@example.com');
    await user.type(within(dialog).getByLabelText('Company or team name'), 'Acme');
    await user.selectOptions(within(dialog).getByLabelText('Team size'), '2-10');
    await user.selectOptions(within(dialog).getByLabelText(/use Launchpad for/i), 'Design');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByRole('button', { name: 'Create workspace' }));

    expect(await within(dialog).findByText(/already registered/i)).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Work email')).toHaveAttribute('aria-invalid', 'true');
  });
});
