import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from './LandingPage';

vi.stubEnv('VITE_API_LATENCY_MS', '0');

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<p>board screen</p>} />
        <Route path="/login" element={<p>login screen</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  it('presents the product and both entry points', () => {
    renderLanding();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/plan work/i);
    expect(screen.getAllByRole('button', { name: /demo/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /sign in/i }).length).toBeGreaterThan(0);
  });

  it('opens the app after starting the demo', async () => {
    renderLanding();
    await userEvent.click(screen.getByRole('button', { name: 'Try the live demo' }));
    await waitFor(() => expect(screen.getByText('board screen')).toBeInTheDocument());
  });
});
