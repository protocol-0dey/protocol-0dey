import { RouterProvider } from 'react-router-dom';
import { useThemeSync } from '@/features/theme-toggle';
import { Toaster } from '@/shared/ui';
import { router } from './router';

export function App() {
  useThemeSync();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
