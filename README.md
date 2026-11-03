# Aleks — frontend portfolio

## Projects

### [TaskFlow](taskflow/) — Kanban task manager
React 19, TypeScript (strict), Zustand, dnd-kit, React Router 7, CSS Modules, Vite. Feature-Sliced Design, optimistic updates with rollback, light/dark themes, responsive down to phones (long-press drag, bottom-sheet editor), mock API that switches to a typed HTTP client via `VITE_API_URL` (contract in [taskflow/docs/API.md](taskflow/docs/API.md)). Unit, component and e2e tests, CI on every push.

### [Concept landings](landings/) — Nexus, AquaGlow, Strato
Three single-file landing pages built from a visual direction: glassmorphism, bento grids, scroll reveal. Mobile menu, modal forms with validation and success states, keyboard and screen-reader support, one `submitLead()` function to swap for a real backend call. Brands and data are fictional.

## Quality gates
ESLint, Prettier, Husky, lint-staged, Conventional Commits, GitHub Actions.
