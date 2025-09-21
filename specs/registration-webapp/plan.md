# Implementation Plan: Registration Webapp

**Branch**: `###-registration-webapp` | **Date**: 2025-09-21 | **Spec**: spec.md
**Input**: Feature specification from `spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type: Web SPA + Backend API
   → Set Structure Decision: frontend SPA (React/Vue/Svelte) + API
     backend (existing)
3. Fill the Constitution Check section based on the content of the
   constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific
   template file updates.
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

## Technical Context

**Language/Version**: Frontend: TypeScript + Svelte (no SvelteKit)
**Primary Dependencies**: Svelte 5, `tinro` router (tiny/fast),
axios, QR code generator, debounce utility  
**Storage**: localStorage for tab/session persistence  
**Testing**: vitest/jest + testing-library for unit and integration  
**Target Platform**: Modern browsers (Chrome, Firefox, Edge, Safari)
**Project Type**: Web SPA (frontend) connecting to existing backend API
**Performance Goals**: Interactive actions responsive <100ms; p95
latency for API calls < 200ms

Notes:

- Debounce interval MUST be configurable in the runes modules (default 800ms).
- `GET /accounts/flags` requires Authorization: Bearer token.

## Constitution Check

_Gate: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Principle: Test-First — The plan adopts TDD: contract tests + unit
  tests before implementation (see tasks.md)
- Principle: Observability — Emit client-side metrics for key actions
  (login/register, team changes, submissions) and log network errors
- Principle: Library-First — Encapsulate flags handling, auth, and API
  clients as small reusable modules

**Status**: PASS (no violations found). See Complexity Tracking below.

## Project Structure

```
specs/registration-webapp/
├── spec.md
├── plan.md
└── tasks.md
```

## Phase 0: Outline & Research

1. Identify unknowns:
1. Identify unknowns:
   - Confirm participant-facing flags endpoint and shape (backend
     exposes `/superusers/flags` for admins; confirm `GET /flags` for
     participants).
   - Confirm whether `POST /accounts/check` includes `passwordSet` or
     whether the client must infer password state via other calls.
   - Password policy specifics (min length, complexity)
   - Flag transport: polling interval or websocket support
1. Research tasks:

- Confirm backend contract shapes and example payloads for:
  - `POST /accounts/check` (body `{ email }`, response `{ registered }`)
  - `POST /accounts/register` and `POST /accounts/login` (responses
    return `{ token, account }`)
  - `/teams` endpoints and `/teams/members` payloads
  - participant flags endpoint `GET /accounts/flags` and update
    transport (polling vs websocket)
  - websocket or push events for membership changes (kicked events)
  - token-exchange on app open (optional flow where old token is
    exchanged for a new one) — backend implementation required
- Confirm mappings to models in `models.json` (Account, Team,
  Flags) and resolve any differences.
- Choose state management library and testing stack

**Output**: research.md with decisions

## Phase 1: Design & Contracts

1. Generate contract schemas for `/accounts`, `/auth/login`, `/teams/*`
2. Create failing contract tests (one per endpoint)
3. Design client modules: auth, flags, api-client, qr, local-persistence
4. Integration tests for flag-driven UI behavior and tab persistence

**Output**: contracts/, data-model.md, quickstart.md, failing tests

## Complexity Tracking

- No major complexity deviations. If realtime flags are required and
  websocket integration is used, that adds marginal complexity; justify
  in research.md.

## Progress Tracking

- [ ] Phase 0: Research complete
- [ ] Phase 1: Design complete
- [ ] Phase 2: Task planning complete

---

_Based on Constitution v2.1.2 - See `/memory/constitution.md`_
