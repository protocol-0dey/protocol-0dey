import { useEffect, useState } from 'react';
import type { Theme } from '@/hooks/useTheme';
import { IconClose, IconMenu, IconMoon, IconSun } from './Icons';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onStart: () => void;
}

export function Header({ theme, onToggleTheme, onStart }: HeaderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('is-locked');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth >= 760 && setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
      <header className="header">
        <div className="container header__bar">
          <a className="logo" href="#top" onClick={() => setOpen(false)}>
            <span className="logo__mark" aria-hidden="true" />
            Launchpad
          </a>
          <nav className="header__nav" aria-label="Main">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="header__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <button type="button" className="btn btn--sm header__cta" onClick={onStart}>
              Start free trial
            </button>
            <button
              type="button"
              className="icon-btn header__burger"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div id="mobile-menu" className="mobile-menu">
          <nav aria-label="Mobile">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <button
              type="button"
              className="btn"
              onClick={() => {
                setOpen(false);
                onStart();
              }}
            >
              Start free trial
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
