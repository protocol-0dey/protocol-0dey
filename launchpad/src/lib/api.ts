import type { Billing, PlanId } from './pricing';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  company: string;
  teamSize: string;
  useCase: string;
  plan: PlanId;
  billing: Billing;
  seats: number;
}

export class ApiError extends Error {
  readonly field?: 'email';
  constructor(message: string, field?: 'email') {
    super(message);
    this.field = field;
  }
}

const LATENCY = Number(import.meta.env.VITE_API_LATENCY_MS ?? 900);

/**
 * Mock signup endpoint. To connect a real backend replace the body with, for example:
 *   const res = await fetch('/api/signup', { method: 'POST', headers: {...}, body: JSON.stringify(payload) });
 *   if (!res.ok) throw new ApiError((await res.json()).message);
 * The UI already handles pending, field-level and generic errors.
 */
export async function createWorkspace(payload: SignupPayload): Promise<{ workspaceId: string }> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY));
  if (payload.email.trim().toLowerCase() === 'taken@example.com') {
    throw new ApiError('This email is already registered. Try signing in instead.', 'email');
  }
  return {
    workspaceId: `ws_${payload.company
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`,
  };
}
