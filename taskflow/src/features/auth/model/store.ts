import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type User } from '../api/authApi';
import type { LoginValues } from '../lib/validateLogin';

interface AuthStore {
  user: User | null;
  login: (values: LoginValues) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: async (values) => {
        const user = await authApi.login(values);
        set({ user });
      },
      logout: () => set({ user: null }),
    }),
    { name: 'taskflow:auth', partialize: (state) => ({ user: state.user }) },
  ),
);
