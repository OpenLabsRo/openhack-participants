# OpenHack Participants — Registration Webapp

This repository contains artifacts for the Registration Webapp (frontend spec, runes, and contract tests). It includes a small Svelte + TypeScript frontend scaffold (no UI yet), contract YAMLs used for spec-only testing, and unit tests for the client runes.

## Quick overview

- Frontend source: `frontend/src`
- Frontend tests: `frontend/test`
- Contract specs & tests: `specs/registration-webapp/contracts` and `specs/registration-webapp/tests`

## Prerequisites

- Node.js (16+ recommended)
- npm (or yarn)

## Frontend — install & run

Open a terminal (zsh):

```bash
cd frontend
npm install
npm run dev
```

The dev server runs via Vite. The app entry is `frontend/src/main.ts` and the API client is `frontend/src/lib/apiClient.ts`.

## Frontend — tests

Run unit tests for the frontend (vitest):

```bash
cd frontend
npx vitest
```

Tests live in `frontend/test/` and mock network calls using vitest mocks. The tests target the rune modules that manage state and API interactions.

## Contract tests (spec-only)

These tests validate the presence and structure of local contract YAMLs (spec-only; they do not call the backend unless configured).

```bash
cd specs/registration-webapp
npm install
npx vitest
```

Contract YAML files are in `specs/registration-webapp/contracts/`.

## Formatting

Prettier is used to format frontend files. To run Prettier across the frontend folder:

```bash
cd /path/to/repo
npx prettier --write "frontend/**/*.{ts,js,css,html,json,md,scss}"
```

You can pin a specific Prettier version with `npx prettier@2.8.8 --write ...` as used in earlier runs.

## Notes on architecture

- API client: `frontend/src/lib/apiClient.ts` exports an `axios` instance and `setAuthToken` helper. Token storage uses `localStorage` when available and guards for Node test environments.
- Runes: `frontend/src/runes/*.ts` implement small Svelte stores and network helpers for accounts, teams, submissions, and flags. Tests exercise their exported functions and store side-effects.

## Contributing & next steps

- If you add integration contract tests that call a live backend, add an environment-based toggle (e.g., `BACKEND_BASE`) so spec-only tests remain fast and safe.
- Consider adding a `.prettierrc` for consistent formatting across contributors.

## Troubleshooting

- If tests fail due to missing types for `js-yaml`, run `npm install --save-dev @types/js-yaml` in the `specs/registration-webapp` package or leave the provided ambient declaration in `specs/registration-webapp/types/js-yaml.d.ts`.

---

If you'd like, I can:

- Run the frontend unit tests and fix any failures.
- Add a `.prettierrc` and an npm script for formatting.
- Create a small CI job to run unit and contract tests.
