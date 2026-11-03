import { getApiBaseUrl, request } from '@/shared/api';
import { delay } from '@/shared/lib';
import type { LoginValues } from '../lib/validateLogin';

export interface User {
  id: string;
  email: string;
  name: string;
}

/** Mock endpoint. Any valid credentials succeed, except the password "wrong-password". */
const mockApi = {
  async login({ email, password }: LoginValues): Promise<User> {
    await delay();
    if (password === 'wrong-password') throw new Error('Invalid email or password');
    const name = email.split('@')[0] ?? 'user';
    return { id: `user_${name}`, email, name };
  },
};

/** Real backend: see docs/API.md for the contract. */
const httpApi = {
  login: (values: LoginValues) => request<User>('/auth/login', { method: 'POST', body: values }),
};

export const authApi = {
  login: (values: LoginValues) => (getApiBaseUrl() ? httpApi : mockApi).login(values),
};
