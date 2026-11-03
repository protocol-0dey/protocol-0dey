import { describe, expect, it } from 'vitest';
import type { Card } from '@/entities/board';
import { EMPTY_FILTER, isFilterActive, matchesFilter } from './filter';

const card: Card = {
  id: '1',
  title: 'Fix login bug',
  description: 'Users cannot sign in on Safari',
  priority: 'high',
  createdAt: 0,
};

describe('matchesFilter', () => {
  it('matches everything with an empty filter', () => {
    expect(matchesFilter(card, EMPTY_FILTER)).toBe(true);
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
  });

  it('matches by title, case-insensitively', () => {
    expect(matchesFilter(card, { query: 'LOGIN', priority: 'all' })).toBe(true);
  });

  it('matches by description', () => {
    expect(matchesFilter(card, { query: 'safari', priority: 'all' })).toBe(true);
  });

  it('filters by priority', () => {
    expect(matchesFilter(card, { query: '', priority: 'low' })).toBe(false);
    expect(matchesFilter(card, { query: '', priority: 'high' })).toBe(true);
  });

  it('requires both query and priority to match', () => {
    expect(matchesFilter(card, { query: 'safari', priority: 'low' })).toBe(false);
  });
});
