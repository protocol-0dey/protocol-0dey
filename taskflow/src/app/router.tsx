import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/features/auth';

/** Route-level code splitting: each page is loaded on demand. */
export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => ({ Component: (await import('@/pages/landing')).LandingPage }),
  },
  {
    path: '/login',
    lazy: async () => ({ Component: (await import('@/pages/login')).LoginPage }),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/app',
        lazy: async () => ({ Component: (await import('@/pages/board')).BoardPage }),
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
