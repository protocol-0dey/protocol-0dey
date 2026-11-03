import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { ThemeToggle } from '@/features/theme-toggle';
import { Button } from '@/shared/ui';
import styles from './Header.module.css';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        TaskFlow
      </Link>
      <div className={styles.user}>
        {user && <span className={styles.name}>{user.name}</span>}
        <ThemeToggle />
        {user && (
          <Button variant="secondary" onClick={handleLogout}>
            Sign out
          </Button>
        )}
      </div>
    </header>
  );
}
