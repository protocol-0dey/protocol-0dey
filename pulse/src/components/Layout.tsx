import type { ReactNode } from 'react';
import { IconMoon, IconOverview, IconSun, IconUsers } from './Icons';
import type { Theme } from '@/hooks/useTheme';

export type View = 'overview' | 'customers';

const NAV: { id: View; label: string; icon: ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <IconOverview /> },
  { id: 'customers', label: 'Customers', icon: <IconUsers /> },
];

interface LayoutProps {
  view: View;
  onViewChange: (view: View) => void;
  theme: Theme;
  onToggleTheme: () => void;
  children: ReactNode;
}

/** Sidebar on desktop, bottom tab bar on phones (same nav, restyled by CSS). */
export function Layout({ view, onViewChange, theme, onToggleTheme, children }: LayoutProps) {
  return (
    <div className="shell">
      <aside className="nav">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true" />
          Pulse
        </div>
        <nav aria-label="Main">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav__item"
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => onViewChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="brand brand--mobile">
            <span className="brand__mark" aria-hidden="true" />
            Pulse
          </div>
          <h1 className="topbar__title">{view === 'overview' ? 'Overview' : 'Customers'}</h1>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
