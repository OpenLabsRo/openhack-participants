# research.md

**Feature**: Registration Webapp
**Date**: 2025-09-21

## Unknowns identified

- Participant-facing flags endpoint confirmed: `GET /accounts/flags` (provided by user).
- Whether `/accounts/check` includes additional fields: server returns `{ registered: bool }` per API docs; user confirmed `registered` indicates whether password is set (true=login flow, false=register flow).
- Password policy specifics: assume min length 8; confirm with backend if stricter rules are required.
- Flag transport: backend may support polling or websocket; research should default to polling with optional websocket support for kicked/membership events.
- Websocket support for membership events (kicked): backend needs to provide membership events; plan assumes websocket channel available — fallback: poll `GET /teams/members`.
- Token-exchange on open: optional backend feature; plan includes tasks to support it if backend implements it.

## Decisions / Recommendations

- Frontend stack: Svelte (not SvelteKit), SPA router (fast Svelte router), TypeScript.
- HTTP client: axios as requested.
- State management: Svelte 5 runes. Create a small "store module" per entity (account, team, submission, flags) that exposes functions to perform API calls and maintains a reactive rune with the model-shaped data.
- API client library: `apiClient` wrapper around axios that returns data shaped to `models.json` (Account, Team, Flags).
- Runtime flags: implement polling every 5s by default; add websocket subscription for membership/kicked events if backend exposes it.
- Debounce saves: 800ms debounce for team/submission inputs.

## Migration notes / follow-ups

- Confirm password policy details and whether `/accounts/register` enforces additional checks.
- Confirm whether `GET /accounts/flags` requires authentication.
- Confirm websocket endpoints/payloads for kicked events and whether server emits team membership changes.
- Decide token-exchange mechanism and endpoint (backend work required).
