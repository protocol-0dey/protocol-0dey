import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to TaskFlow</h1>
        <p className={styles.hint}>Demo: any valid email and a password of 6+ characters.</p>
        <LoginForm onSuccess={() => navigate('/app', { replace: true })} />
      </div>
    </main>
  );
}
