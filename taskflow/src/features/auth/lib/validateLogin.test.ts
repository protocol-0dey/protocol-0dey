import { describe, expect, it } from 'vitest';
import { validateLogin } from './validateLogin';

describe('validateLogin', () => {
  it('accepts valid credentials', () => {
    expect(validateLogin({ email: 'dev@example.com', password: 'secret1' })).toEqual({});
  });

  it('rejects an invalid email', () => {
    expect(validateLogin({ email: 'not-an-email', password: 'secret1' }).email).toBeDefined();
  });

  it('rejects a short password', () => {
    expect(validateLogin({ email: 'dev@example.com', password: '123' }).password).toBeDefined();
  });

  it('reports both errors at once', () => {
    const errors = validateLogin({ email: '', password: '' });
    expect(Object.keys(errors)).toEqual(['email', 'password']);
  });
});
