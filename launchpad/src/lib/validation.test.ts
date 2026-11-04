import { describe, expect, it } from 'vitest';
import { passwordStrength, validateAccount, validatePlan, validateWorkspace } from './validation';

describe('validateAccount', () => {
  it('accepts a valid account', () => {
    expect(
      validateAccount({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret123' }),
    ).toEqual({});
  });
  it('reports every invalid field', () => {
    const errors = validateAccount({ name: 'A', email: 'nope', password: 'short' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'name', 'password']);
  });
  it('requires a letter and a number in the password', () => {
    expect(
      validateAccount({ name: 'Ada', email: 'a@b.co', password: 'onlyletters' }).password,
    ).toBeDefined();
    expect(
      validateAccount({ name: 'Ada', email: 'a@b.co', password: '12345678' }).password,
    ).toBeDefined();
  });
});

describe('validateWorkspace and validatePlan', () => {
  it('requires all workspace fields', () => {
    expect(Object.keys(validateWorkspace({ company: '', teamSize: '', useCase: '' }))).toHaveLength(
      3,
    );
    expect(validateWorkspace({ company: 'Acme', teamSize: '2-10', useCase: 'Design' })).toEqual({});
  });
  it('requires accepted terms', () => {
    expect(validatePlan({ terms: false }).terms).toBeDefined();
    expect(validatePlan({ terms: true })).toEqual({});
  });
});

describe('passwordStrength', () => {
  it('increases with length and variety', () => {
    expect(passwordStrength('abc')).toBe(0);
    expect(passwordStrength('abcdefg1')).toBe(1);
    expect(passwordStrength('Abcdefghijk1!')).toBe(4);
  });
});
