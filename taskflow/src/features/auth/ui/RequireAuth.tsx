import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../model/store';

export function RequireAuth() {
  const user = useAuthStore((state) => state.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
