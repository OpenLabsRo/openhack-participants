Registration Webapp frontend scaffold

This folder contains a minimal Svelte + TypeScript scaffold and integration
modules (apiClient and runes). No UI components are provided — the scaffold
is intentionally minimal so you can implement components later.

Quickstart

1. From this repo root or the `frontend/` folder, install dependencies:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm run dev
```

Tests

- Contract tests (spec-only): these tests validate the contract YAML files
  and DO NOT make network calls by default. Run from repo root:

```bash
npx vitest specs/registration-webapp/tests/contracts/*.spec.ts
```

- Unit tests (runes/apiClient): run with:

```bash
cd frontend
npx vitest
```

- Integration-mode contract tests: to run tests that hit a backend set `BACKEND_BASE` and optionally `AUTH_TOKEN`:

```bash
BACKEND_BASE=http://localhost:8000 AUTH_TOKEN=ey... npx vitest specs/registration-webapp/tests/contracts/*.spec.ts
```

3. Configure backend base URL via Vite env var `VITE_BACKEND_BASE` (e.g.
   `VITE_BACKEND_BASE=http://localhost:8000 npm run dev`). Auth token is
   stored in localStorage under `auth_token` and is managed by
   `src/lib/apiClient.ts`.

Where code lives

- `src/lib/apiClient.ts` — axios wrapper and token management
- `src/runes/*` — state runes: `accountRune`, `teamRune`, `submissionRune`, `flagsRune`

Notes

- Debounce should be implemented in UI components before calling the
  submissionRune save functions (default 800ms recommended).
- `GET /accounts/flags` requires Authorization header; use `accountRune`
  to login and set the token before calling `fetchFlags()`.
