# TaskFlow

> A Kanban task manager (Trello-style) built to production standards: typed, tested, linted, and deployed through CI.

[![CI](https://github.com/protocol-0dey/protokol-0dey/actions/workflows/ci.yml/badge.svg)](https://github.com/protocol-0dey/protokol-0dey/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)

**🔗 Live demo: add the Vercel URL here** (the landing page has a one-click demo; to sign in manually use any valid email + a password of 6+ characters)

<!-- Add a screenshot or GIF: docs/screenshot.png -->

![TaskFlow board](docs/screenshot.png)

## The problem

Small teams need a lightweight board to track work without the weight of enterprise tools. TaskFlow gives them columns, cards with priorities, drag-and-drop, search, and instant sync across browser tabs.

## Features

- **Landing page with a one-click demo** that opens a ready-made board, no sign-up
- **Responsive on any device:** fluid layouts, long-press drag on touch screens, bottom-sheet editor on phones
- **Light and dark themes** that follow the system setting, persist, and never flash on load
- **Loading skeletons, empty states and error states** for every screen
- **Auth flow** with form validation, protected routes and a persisted session
- **Drag-and-drop** between columns and reordering, with mouse, touch and keyboard (dnd-kit)
- **Create / edit / delete cards** with priorities
- **Search and priority filter** (deferred for smooth typing on large boards)
- **Optimistic updates** with automatic rollback and a toast when saving fails
- **Realtime sync across tabs** through a transport abstraction (BroadcastChannel now, WebSocket-ready)
- **Accessible UI:** labelled controls, focus management in modals, `aria-live` notifications

## Tech stack and why

| Tool                                             | Why this one                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| React 19 + TypeScript (strict)                   | Type safety end to end, mature ecosystem                                                    |
| Zustand                                          | Minimal API and a small bundle; enough for this state shape without Redux boilerplate       |
| Normalized state                                 | Cards and columns stored by id, so moves and updates are O(1) lookups and avoid deep copies |
| dnd-kit                                          | Accessible drag-and-drop with keyboard sensors, unlike HTML5 DnD                            |
| React Router 7                                   | Route-level code splitting through `lazy`                                                   |
| CSS Modules                                      | Scoped styles with zero runtime cost                                                        |
| Vite                                             | Fast dev server and builds                                                                  |
| Vitest + Testing Library                         | Fast unit and component tests                                                               |
| Playwright                                       | e2e for the critical user flows                                                             |
| ESLint, Prettier, Husky, lint-staged, commitlint | Consistent code, checks before every commit                                                 |
| GitHub Actions + Vercel                          | CI on every PR, automatic deploys                                                           |

## Architecture: Feature-Sliced Design

```
src/
├─ app/        # entry, router, global styles, providers
├─ pages/      # route-level screens (landing, login, board), lazy-loaded
├─ widgets/    # large UI blocks (board, header)
├─ features/   # user scenarios (auth, add-card, edit-card, filter-cards, realtime-sync, theme-toggle)
├─ entities/   # business entities (board: types, store, pure operations, API)
└─ shared/     # ui kit, helpers, storage and realtime transports
```

Imports only go downward (`pages → widgets → features → entities → shared`), and each slice exposes a public API through `index.ts`.

Key decisions:

- **Business logic is separate from UI.** Pure board operations (`moveCard`, `resolveDrop`, ...) live in `entities/board/lib` and are unit-tested without React. Hooks such as `useBoardDnd` and `useVisibleCardIds` connect them to components.
- **Ready for a backend.** `boardApi` and `authApi` use a built-in mock by default and switch to a typed HTTP client when `VITE_API_URL` is set. Stores and components never change. The endpoints and payloads are documented in [docs/API.md](docs/API.md).
- **Design tokens.** Colors, radii and shadows are CSS variables, and the light theme is just a second set of values, so new components get theming for free.
- **Optimistic updates.** The store applies a change immediately, persists it, and rolls back with a toast on failure.

## Performance

- Route-level code splitting (`lazy`), vendor and drag-and-drop libraries in separate chunks
- `memo` on `ColumnView` and `CardItem`, stable callbacks via `useCallback`
- `useDeferredValue` + `useMemo` for filtering
- Narrow Zustand selectors so components re-render only on relevant changes

## Getting started

```bash
git clone https://github.com/protocol-0dey/protokol-0dey.git
cd protokol-0dey/taskflow
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the dev server               |
| `npm run build`     | Typecheck and build for production |
| `npm run preview`   | Preview the production build       |
| `npm run lint`      | ESLint                             |
| `npm run format`    | Prettier                           |
| `npm run typecheck` | TypeScript check                   |
| `npm test`          | Unit and component tests (Vitest)  |
| `npm run e2e`       | End-to-end tests (Playwright)      |

First e2e run: `npx playwright install chromium`.

## Testing

- **Unit:** board operations, drop resolution, filtering, login validation, theme store, HTTP client
- **Store:** optimistic updates, rollback on failure, loading and error states (API mocked)
- **Component:** login form validation and error handling, landing page demo flow
- **e2e (Playwright):** protected routes, one-click demo, theme switch, add / edit / delete a card, search, keyboard drag-and-drop

## Quality gates

- Husky `pre-commit` runs lint-staged (ESLint + Prettier on changed files)
- Husky `commit-msg` enforces [Conventional Commits](https://www.conventionalcommits.org/)
- GitHub Actions runs lint, typecheck, unit tests, build and e2e on every pull request

## Deployment

Import the repository in Vercel, set Root Directory to `taskflow` (framework preset: Vite). `vercel.json` rewrites all routes to `index.html` for the SPA router.

## Roadmap

- [ ] Real backend (REST or GraphQL) with WebSocket live updates
- [ ] Multiple boards and column management
- [ ] Storybook for the shared UI components
- [ ] Card comments and assignees

## License

MIT
