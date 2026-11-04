import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { ToastProvider } from './hooks/useToast';

vi.stubEnv('VITE_API_LATENCY_MS', '0');

function renderApp() {
  return render(
    <ToastProvider>
      <App />
    </ToastProvider>,
  );
}

describe('Pulse', () => {
  it('shows KPIs and the chart, and reacts to the range switch', async () => {
    renderApp();
    expect(await screen.findByText('Revenue', { selector: '.kpi__label' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /last 30 days/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '7 days' }));
    expect(await screen.findByRole('img', { name: /last 7 days/i })).toBeInTheDocument();
  });

  it('filters the customers table by search', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'Customers' }));
    const search = await screen.findByRole('searchbox');
    await userEvent.type(search, 'zzz-no-match');
    expect(await screen.findByText('No customers found')).toBeInTheDocument();
  });

  it('opens the drawer, marks a customer as churned and closes with Escape', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'Customers' }));
    const table = await screen.findByRole('table');
    const firstRow = within(table).getAllByRole('row')[1];
    await userEvent.click(within(firstRow).getByRole('button'));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const action = within(dialog).getByRole('button', { name: /mark as churned|reactivate/i });
    await userEvent.click(action);
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/churned|reactivated/i),
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
