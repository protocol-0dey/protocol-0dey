import type { BoardState } from './types';

const now = Date.now();

export function createSeedBoard(): BoardState {
  return {
    cards: {
      c1: {
        id: 'c1',
        title: 'Design the onboarding flow',
        description: 'Wireframes for the first-run experience.',
        priority: 'high',
        createdAt: now - 4000,
      },
      c2: {
        id: 'c2',
        title: 'Set up CI pipeline',
        description: 'Lint, typecheck, unit and e2e tests on every PR.',
        priority: 'medium',
        createdAt: now - 3000,
      },
      c3: {
        id: 'c3',
        title: 'Write API client',
        description: 'Typed wrapper with error handling and retries.',
        priority: 'medium',
        createdAt: now - 2000,
      },
      c4: {
        id: 'c4',
        title: 'Fix drag-and-drop on touch devices',
        description: '',
        priority: 'low',
        createdAt: now - 1000,
      },
    },
    columns: {
      todo: { id: 'todo', title: 'To do', cardIds: ['c1', 'c2'] },
      doing: { id: 'doing', title: 'In progress', cardIds: ['c3'] },
      done: { id: 'done', title: 'Done', cardIds: ['c4'] },
    },
    columnOrder: ['todo', 'doing', 'done'],
  };
}
