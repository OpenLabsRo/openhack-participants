# Tasks: Registration Webapp

**Input**: plan.md, data-model.md, contracts/, research.md, quickstart.md
**Feature dir**: `specs/registration-webapp`

Guiding rules applied:

- Tests (contract & integration) are authored first and must fail before implementing code (TDD).
- Each contract file → a contract test task marked [P].
- Each entity in `data-model.md` → a model/types creation task marked [P].
- Endpoints → implementation tasks; tasks touching the same file are sequential.
- Provide exact file paths and minimal commands/examples for parallel runs.

---

Phase 1 — Setup

- T001 Initialize frontend project scaffold (if not present) and commit

  - Path: `/frontend/package.json`, `/frontend/vite.config.ts`, `/frontend/src/`
  - Action: Ensure `package.json` contains scripts: `dev`, `build`, `preview`, `test`.
  - If scaffold exists, verify versions and update as needed.
  - Agent command example: (from repo root)
    ```bash
    cd frontend && npm install
    ```
  - Dependency: none

- T002 Add dev tooling (lint, format, test runner)
  - Files to create: `.eslintrc.json`, `.prettierrc`, `frontend/vitest.config.ts` (if desired)
  - Purpose: keep code consistent and allow running unit tests (vitest).
  - Dependency: T001

Phase 2 — Contract tests (TDD) [P]
Note: These tests validate the API contract files under `specs/registration-webapp/contracts/`.

- T003 [P] Contract test: accounts contract

  - File: `specs/registration-webapp/tests/contracts/test_accounts_contract.ts`
  - What to do: Write a vitest test that loads `specs/registration-webapp/contracts/accounts.yaml`, builds a minimal request example for each described path and — when env var `BACKEND_BASE` is set — issues HTTP requests to validate responses match the OpenAPI schemas (use ajv to validate JSON schema). The test should also run in "spec-only" mode (validate the YAML compiles to JSON schema).
  - Command to run: `BACKEND_BASE=http://localhost:8000 npx vitest specs/registration-webapp/tests/contracts/test_accounts_contract.ts`

- T004 [P] Contract test: teams contract

  - File: `specs/registration-webapp/tests/contracts/test_teams_contract.ts`
  - What to do: same pattern as T003 but for `contracts/teams.yaml` (test GET /teams, POST /teams, PATCH /teams/submissions/\*, /teams/members, /teams/join, /teams/leave, /teams/kick).

- T005 [P] Contract test: flags contract
  - File: `specs/registration-webapp/tests/contracts/test_flags_contract.ts`
  - What to do: validate `contracts/flags.yaml`; ensure GET /accounts/flags is covered and test auth-required behavior (fail when no token).

Parallel note: T003/T004/T005 can run in parallel because they are independent files and only read the contracts directory.

Phase 3 — Model & type artifacts (TDD preparatory) [P]

- T006 [P] Create `Account` TypeScript type

  - File: `frontend/src/types/account.ts`
  - Content: export an `Account` interface matching `data-model.md` (id,email,password,name,teamID:string (empty when no team)).

- T007 [P] Create `Team` TypeScript type

  - File: `frontend/src/types/team.ts`
  - Content: export `Team` interface with id,name,members[],submission,deleted as per data-model.

- T008 [P] Create `Flags` TypeScript type
  - File: `frontend/src/types/flags.ts`
  - Content: export `Flags` interface: flags:Record<string,boolean> and stage shape.

Phase 4 — Core client integration (runes & apiClient) — TDD: tests first then implement

Tests to write first (integration/unit stubs):

- T009 [P] Unit tests for `apiClient` token behavior

  - File: `frontend/test/apiClient.spec.ts`
  - What to test: `setAuthToken(token)` stores token in localStorage and sets axios header; clearing token removes header. Mock `localStorage` and axios defaults.

- T010 [P] Unit tests for `accountRune` behavior

  - File: `frontend/test/accountRune.spec.ts`
  - What to test: `check()` returns shape `{ registered }` when axios returns it; `register()` and `login()` call `setAuthToken` and set `accountRune`. Use a mocked axios instance.

- T011 [P] Unit tests for `submissionRune` network calls
  - File: `frontend/test/submissionRune.spec.ts`
  - What to test: `updateDesc()` calls PATCH `/teams/submissions/desc` and then refreshes team via `GET /teams` (mock responses).

Implementation tasks (sequential for files touched)

- T012 Implement/verify `apiClient` wrapper

  - File: `frontend/src/lib/apiClient.ts`
  - Action: Ensure axios instance reads `VITE_BACKEND_BASE`, exposes `setAuthToken()` and on-init loads token from `localStorage`. Add comments and single place to add interceptors.
  - Dependency: T009 (tests should fail first)

- T013 Implement `accountRune` functions

  - File: `frontend/src/runes/accountRune.ts`
  - Action: Implement `check`, `register`, `login`, `whoami`, `logout` to call `apiClient` exactly per contracts. Ensure `teamID` is typed string and empty when no team.
  - Dependency: T010

- T014 Implement `teamRune` functions

  - File: `frontend/src/runes/teamRune.ts`
  - Action: Implement `getTeam`, `createTeam`, `join`, `leave`, `kick`, and `getMembers()`. Match request methods and paths from `contracts/teams.yaml` (GET `/teams`, POST `/teams`, PATCH `/teams/*`, etc.).
  - Dependency: T011 (submission tests) and T013

- T015 Implement `submissionRune` functions

  - File: `frontend/src/runes/submissionRune.ts`
  - Action: Implement `updateName/Desc/Repo/Pres` as plain network functions (no debounce) and refresh `teamRune` on success. Keep UI-level debounce responsibility.
  - Dependency: T011, T014

- T016 Implement `flagsRune` fetch + polling + auth checks
  - File: `frontend/src/runes/flagsRune.ts`
  - Action: Implement `fetchFlags()` to GET `/accounts/flags`. Implement `configurePolling()`, `startPolling()` and `stopPolling()` with default 5000ms and ensure `fetchFlags()` requires Authorization. Keep `subscribeWs()` as TODO with clear placeholder.
  - Dependency: T013 (auth must be wired)

Phase 5 — Integration tests (TDD) [P]

- T017 [P] Integration test: Onboarding flow (email check → register or login)

  - File: `specs/registration-webapp/tests/integration/test_onboarding_flow.ts`
  - Steps: Mock backend (or run against BACKEND_BASE) to return `{registered:false}` for check → assert client calls register; when `{registered:true}`, assert client navigates to login flow. Test should run with `VITE_BACKEND_BASE` or mocked axios.
  - Dependency: T003, T010, T013

- T018 [P] Integration test: Submission editing (debounced UI behavior)

  - File: `specs/registration-webapp/tests/integration/test_submission_debounce.ts`
  - Steps: Using a component test or simulated calls, assert UI-level debounce triggers a single `updateDesc()` call after configured idle (800ms default).
  - Dependency: T011, T015

- T019 [P] Integration test: Flags visibility & auth
  - File: `specs/registration-webapp/tests/integration/test_flags_auth.ts`
  - Steps: Assert `GET /accounts/flags` fails when no token and succeeds when token set; test polling updates the store periodically.
  - Dependency: T005, T016

Phase 6 — Real-time & robustness

- T020 Implement websocket subscription when backend available (optional)

  - File: `frontend/src/runes/flagsRune.ts` (extend) and `frontend/src/lib/ws.ts` (new)
  - Action: Implement `subscribeWs()` to connect to backend WS URL (configurable via env), parse events (kicked, flags update), update `flagsRune` and handle kicked-case (redirect/logout).
  - Dependency: T016 and backend websocket contract (research)

- T021 Add axios interceptors for 401 handling and optional token-exchange
  - File: `frontend/src/lib/apiClient.ts`
  - Action: Add response interceptor that, on 401, attempts token-exchange (if backend implements) or calls `accountRune.logout()` and navigates to onboarding.
  - Dependency: T013

Phase 7 — Polish & docs [P]

- T022 [P] Unit tests for runes

  - File: `frontend/test/*` (accountRune.spec.ts, teamRune.spec.ts, submissionRune.spec.ts, flagsRune.spec.ts)
  - Action: Add comprehensive unit tests for positive & negative cases (mock axios). These can run in parallel.

- T023 [P] Update `specs/registration-webapp/quickstart.md` with exact commands and env vars to run tests and the dev server

  - File: `specs/registration-webapp/quickstart.md`

- T024 [P] Documentation: IMPLEMENTATION_README.md
  - File: `specs/registration-webapp/IMPLEMENTATION_README.md`
  - Action: Describe how runes map to endpoints, where to add websocket handlers, and testing commands.

---

Dependencies & ordering summary

- Setup (T001-T002) → Contract tests (T003-T005) + Model types (T006-T008)
- Contract tests + types → apiClient & rune unit tests (T009-T011)
- Tests must exist and fail → Implementations (T012-T016)
- Implementations → Integration tests (T017-T019)
- Integration success → Real-time (T020-T021) → Polish (T022-T024)

Parallel execution examples

- Run all contract tests in parallel (independent files):

  - `npx vitest specs/registration-webapp/tests/contracts/test_accounts_contract.ts &`
  - `npx vitest specs/registration-webapp/tests/contracts/test_teams_contract.ts &`
  - `npx vitest specs/registration-webapp/tests/contracts/test_flags_contract.ts &`

- Run model/type generation tasks in parallel (independent files):
  - T006, T007, T008 can be implemented concurrently.

Acceptance / exit criteria

- All contract tests (T003-T005) are authored and pass against `BACKEND_BASE` (or at least compile in spec-only mode).
- Unit tests for runes pass (T009-T011, T022).
- Integration tests (T017-T019) pass against a test instance of backend or a mocked server.

Notes / assumptions / TODOs

- The repository's `.specify/scripts/.../check-task-prerequisites.sh` failed because we are not on a feature branch; I proceeded with local inspection of `specs/registration-webapp` and generated tasks accordingly. To enable automation that needs canonical feature metadata, run the check script on a properly named feature branch (e.g. `001-registration-webapp`).
- Backend websocket schema and token-exchange endpoint were not available; T020 and T021 are gated behind those confirmations.
- File paths assume the frontend scaffold is at `/frontend` per the plan. If you prefer `web/` or another layout, update task file paths accordingly.

If you want, I can now:

- create the contract test skeleton files (T003-T005) and commit them, or
- create the TypeScript type files (T006-T008) and commit them, or
- open a feature branch and re-run the prerequisites check script.

# Tasks: Registration Webapp

**Input**: Design documents from `spec.md` and `plan.md`
**Prerequisites**: plan.md (required), research.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
2. Load design documents: data-model.md, contracts/
3. Generate tasks by category: Setup, Tests, Core, Integration, Polish
4. Order tasks: Tests before implementation
```

## Phase 3.1: Setup

- [ ] T001 Create frontend project scaffold (TypeScript, React)
- [ ] T002 Configure linting, formatting (ESLint, Prettier)
- [ ] T003 Add testing stack (vitest/jest + testing-library)
- [ ] T004 Install utility libs: QR generator, debounce, axios/fetch

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE IMPLEMENTATION

- [ ] T005 [P] Contract test: `GET /flags` returns expected flags object
- [ ] T006 [P] Contract test: `GET /accounts?email=` returns account
- [ ] T007 [P] Contract test: `POST /accounts/{id}/set-password`
- [ ] T008 [P] Contract test: `POST /auth/login` returns session token
- [ ] T009 [P] Contract test: `PATCH /teams/{teamId}/submission`
- [ ] T010 [P] Integration test: Register flow (initialized account -> set
      password -> main screen shown)
- [ ] T011 [P] Integration test: Login flow (existing password -> login)
- [ ] T012 [P] Integration test: Flag-driven UI (flag toggles cause UI
      changes)

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T013 Auth module: `apiClient`, `authClient` for login/register
- [ ] T014 Flags module: fetch + subscription API + react hook
- [ ] T015 UI: Login/Register screen and flows
- [ ] T016 UI: Main screen with QR code and profile display
- [ ] T017 Teams page: create/join team flows, copy join link
- [ ] T018 Teams page: teammate list + kick action (with confirm)
- [ ] T019 Submissions page: text inputs + debounced save
- [ ] T020 Voting banner: global banner component that reacts to flags
- [ ] T021 Local persistence: selected tab + session token

## Phase 3.4: Integration

- [ ] T022 Connect flags to UI (poll/ws) and verify UI updates
- [ ] T023 Error handling: unobtrusive user notices and retry logic
- [ ] T024 Clipboard: implement copy join link + unit test
- [ ] T025 Accessibility checks for forms and banner

## Phase 3.5: Polish

- [ ] T026 Unit tests for validation utilities
- [ ] T027 Performance: ensure debounce and renders are efficient
- [ ] T028 Add telemetry events for key flows (login, register, team
      changes)
- [ ] T029 Update docs/quickstart and add QA steps

## Notes

- [P] tasks indicate tasks that can run in parallel (different files)
- Contract tests must be created and failing before implementation
- Each task must include an exact file path when created
