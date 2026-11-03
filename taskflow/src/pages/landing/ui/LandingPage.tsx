import { Link, useNavigate } from 'react-router-dom';
import { DemoLoginButton } from '@/features/auth';
import { ThemeToggle } from '@/features/theme-toggle';
import { HeroPreview } from './HeroPreview';
import styles from './LandingPage.module.css';

const FEATURES = [
  {
    icon: '⇄',
    title: 'Drag and drop',
    text: 'Move cards between columns with mouse, touch or keyboard. Reordering feels instant.',
  },
  {
    icon: '▭',
    title: 'Works on any screen',
    text: 'A layout that adapts from phones to wide monitors, with a bottom-sheet editor on mobile.',
  },
  {
    icon: '↻',
    title: 'Instant sync',
    text: 'Changes show up in every open tab immediately, and failed saves roll back safely.',
  },
  {
    icon: '◐',
    title: 'Light and dark',
    text: 'Follows your system theme, remembers your choice and never flashes on load.',
  },
] as const;

export function LandingPage() {
  const navigate = useNavigate();
  const goToApp = () => navigate('/app');

  return (
    <div className={styles.page}>
      <nav className={styles.nav} aria-label="Main">
        <span className={styles.logo}>TaskFlow</span>
        <div className={styles.navActions}>
          <ThemeToggle />
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </div>
      </nav>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Kanban for small teams</p>
            <h1 className={styles.title}>Plan work. Ship faster.</h1>
            <p className={styles.lead}>
              A calm, fast board for tasks that actually get done. No setup, no clutter: just
              columns, cards and momentum.
            </p>
            <div className={styles.cta}>
              <DemoLoginButton onSuccess={goToApp} />
              <Link to="/login" className={styles.secondary}>
                Sign in
              </Link>
            </div>
            <p className={styles.note}>No sign-up needed. The demo opens a ready-made board.</p>
          </div>
          <HeroPreview />
        </section>

        <section className={styles.features} aria-labelledby="features-title">
          <h2 id="features-title" className={styles.sectionTitle}>
            Everything you need, nothing you do not
          </h2>
          <ul className={styles.grid}>
            {FEATURES.map((feature) => (
              <li key={feature.title} className={styles.feature}>
                <span className={styles.icon} aria-hidden="true">
                  {feature.icon}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.band}>
          <h2>See it in action</h2>
          <p>Open the demo board and move a card. It takes ten seconds.</p>
          <DemoLoginButton onSuccess={goToApp}>Open the demo board</DemoLoginButton>
        </section>
      </main>

      <footer className={styles.footer}>Built with React, TypeScript and Zustand.</footer>
    </div>
  );
}
