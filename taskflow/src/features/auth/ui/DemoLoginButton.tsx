import { useState } from 'react';
import { Button, toast } from '@/shared/ui';
import { useAuthStore } from '../model/store';

interface DemoLoginButtonProps {
  onSuccess: () => void;
  children?: string;
}

/** One-click guest session so visitors can try the product without registering. */
export function DemoLoginButton({
  onSuccess,
  children = 'Try the live demo',
}: DemoLoginButtonProps) {
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await login({ email: 'demo@taskflow.app', password: 'demo-demo' });
      onSuccess();
    } catch {
      toast.error('Could not start the demo. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={() => void handleClick()} loading={loading}>
      {children}
    </Button>
  );
}
