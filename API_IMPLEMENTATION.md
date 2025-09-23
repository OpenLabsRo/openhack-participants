# API Integration & Error Handling Plan

This document captures the full context for aligning the `openhack-participants`
logic-only frontend bundle with the `openhack-backend` API. It distills the
current architecture, known mismatches, proposed helper module, error
propagation semantics, and next steps.

---

## 1. Current Architecture Snapshot

### Backend (`openhack-backend`)
- **Entry point**: `cmd/server/main.go` selects port based on deployment
  (`test`, `dev`, `prod`), attaches `/testflags`, and listens with optional
  prefork (`fiber.ListenConfig{ EnablePrefork: env.PREFORK }`).
- **App setup**: `internal/app.go` initializes environment variables,
  Mongo (`InitDB`) and Redis (`InitCache`), constructs the event emitter,
  and mounts routers for accounts, teams, and superusers.
- **Environment**: `internal/env/env.go` loads `.env` / `.VERSION`, exposes
  `JWT_SECRET`, `MONGO_URI`, `PORT`, `PREFORK`, and `BADGE_PILES`.
- **Persistence**: `internal/db/db.go` configures Mongo collections
  (`Accounts`, `Teams`, `Flags`, `SuperUsers`, `FlagStages`, `Events`, `Tags`)
  and Redis DB indices per deployment.
- **Domains**:
  - Accounts (`internal/accounts/*`) – registration, login, profile edit,
    flag retrieval. Protected via `AccountMiddleware` (JWT parse & locals).
  - Teams (`internal/teams/*`) – team lifecycle, membership, submission
    fields. Returns `token + account` for operations that mutate membership
    to refresh client JWT state.
  - Superusers (`internal/superusers/*`) – admin/staff workflows (account
    initialization, flags/stages, check-in tags, badge piles).
  - Events (`internal/events/*`) – buffered emitter storing audit events in
    Mongo with time-window idempotency helpers.
- **Contract**: `api_spec.yaml` is an OpenAPI 3.0 document enumerating all
  endpoints, request bodies, and responses (general, accounts, teams,
  superusers).

### Frontend Logic Bundle (`openhack-participants/logic-only`)
- **Build tooling**: Vite + Svelte 5, TypeScript config with `$lib` alias.
- **API client**: `src/lib/apiBase.ts` resolves base URL via
  `API_DEPLOYMENT`; `src/lib/apiClient.ts` instantiates axios and persists the
  bearer token in `localStorage` (if available).
- **Runes**:
  - `accountRune.ts` – register, login, whoami, logout, check email.
  - `teamRune.ts` – get/create/join/leave/kick team (currently mismatched).
  - `submissionRune.ts` – update submission fields, then refresh via GET.
  - `flagsRune.ts` – poll `GET /accounts/flags`, start/stop polling.
- **Types**: `src/types/*` mirror backend models (Account, Team, Submission,
  Flags, etc.).
- **Documentation**: `api_documentation.md` reflects expected endpoints but
  does not track recent backend changes (verbs, payloads).

---

## 2. Known Frontend ↔ Backend Mismatches

| Area | Current Rune Behavior | Backend Reality | Fix Strategy |
|------|-----------------------|-----------------|--------------|
| Team create | `POST /teams` → expects `Team` object; sets store to response. | `TeamCreateHandler` returns `{ token, account }` to refresh JWT; actual team data only retrievable via `GET /teams`. | After helper call, update token/account, then fetch team detail. |
| Team join | `POST /teams/${id}/join` with no params; expects team payload. | Backend exposes `PATCH /teams/join?id=` (query). Response `{ token, account, members }` with members as `Account[]`. | Call correct path/verb; refresh auth state and update a dedicated members store, then refresh team detail. |
| Team leave | `POST /teams/leave`; expects success payload, clears store. | Backend expects `PATCH /teams/leave`, returns `{ token, account, members }`. | Use helper to update auth + members store, clear `teamRune`, and optionally `GET /teams` for final snapshot. |
| Team kick | `POST /teams/kick` with JSON `{ accountId }`; assumes structured response. | Backend uses `PATCH /teams/kick?id=...`; returns `{ members }`. | Call correct route; overwrite the members store from response and re-fetch the team if needed. |
| Team delete | Rune not shown, but backend `DELETE /teams` returns `{ token, account }`. | Rune must expect this format and clear team state after success. |
| Submission operations | Rune POST/PATCH body shape OK, but relies on `teamRune` for state. Since team helpers currently mis-handle responses, derived state can be inconsistent. | Once helper module and rune refactor are in place, submission refresh via `GET /teams` will work reliably. |
| Error handling | Direct axios calls bubble raw `AxiosError`. | Backend always returns `{ message }` payload via `errmsg.StatusError`. | Wrap all calls in helper that normalizes errors to `{ status, message, payload }`. |

Additional notes:
- Backend `Team.Create` ignores incoming `name` and sets `"New Team"` by
  design. If frontends need custom names on creation, backend changes are
  required (future enhancement).
- Backend submission/name change events (`internal/events/submission_wrappers.go`)
  have an `ActorRole` typo for `SubmissionChangePres` (uses `TargetParticipant`).
  Low priority but worth tracking.

---

## 3. Helper Module Proposal (`src/lib/api/openhackApi.ts`)

### Objectives
1. Provide a typed, centralized wrapper aligned with `api_spec.yaml`.
2. Encapsulate axios usage with consistent error shaping.
3. Expose domain-grouped helpers for runes/tests (Accounts, Teams,
   Submissions, Flags, optional Superusers).
4. Offer a factory to inject alternate axios instances (useful for testing).

### File Contents Overview

```ts
import axios, { AxiosInstance } from 'axios'
import api from '../apiClient'
import type { Account } from '../../types/account'
import type { Team, Submission } from '../../types/team'
import type { Flags } from '../../types/flags'

// 3.1 Error types
export interface ApiError extends Error {
  status: number
  message: string
  payload?: unknown
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'message' in err
}

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err) && err.response) {
    const { status, data } = err.response
    const message = typeof data?.message === 'string' ? data.message : err.message
    return { name: 'ApiError', status, message, payload: data }
  }
  return {
    name: 'ApiError',
    status: 0,
    message: err instanceof Error ? err.message : 'Unknown error',
  }
}

async function request<T>(fn: () => Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await fn()
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// 3.2 DTOs derived from api_spec.yaml (extend as needed)
export interface CredentialRequest { email: string; password: string }
export interface AccountTokenResponse { token: string; account: Account }
export interface AccountMembersResponse extends AccountTokenResponse { members: Account[] }
export interface TeamMembersResponse { members: Account[] }
export interface TeamRenameRequest { name: string }
export interface SubmissionPayload { name?: string; desc?: string; repo?: string; pres?: string }

// 3.3 Helper factory
export function createApiHelpers(apiClient: AxiosInstance = api) {
  const Accounts = {
    check: (email: string) => request(() => apiClient.post('/accounts/check', { email })),
    register: (payload: CredentialRequest) =>
      request<AccountTokenResponse>(() => apiClient.post('/accounts/register', payload)),
    login: (payload: CredentialRequest) =>
      request<AccountTokenResponse>(() => apiClient.post('/accounts/login', payload)),
    whoami: () => request<Account>(() => apiClient.get('/accounts/whoami')),
    editName: (name: string) =>
      request<AccountTokenResponse>(() => apiClient.patch('/accounts', { name })),
    flags: () => request<Flags>(() => apiClient.get('/accounts/flags')),
  }

  const Teams = {
    detail: () => request<Team>(() => apiClient.get('/teams')),
    create: (name: string) =>
      request<AccountTokenResponse>(() => apiClient.post('/teams', { name })),
    rename: (payload: TeamRenameRequest) =>
      request<Team>(() => apiClient.patch('/teams', payload)),
    remove: () => request<AccountTokenResponse>(() => apiClient.delete('/teams')),
    members: () => request<Account[]>(() => apiClient.get('/teams/members')),
    join: (id: string) =>
      request<AccountMembersResponse>(() => apiClient.patch('/teams/join', undefined, { params: { id } })),
    leave: () => request<AccountMembersResponse>(() => apiClient.patch('/teams/leave')),
    kick: (id: string) =>
      request<TeamMembersResponse>(() => apiClient.patch('/teams/kick', undefined, { params: { id } })),
  }

  const Submissions = {
    updateName: (name: string) =>
      request<Team>(() => apiClient.patch('/teams/submissions/name', { name })),
    updateDesc: (desc: string) =>
      request<Team>(() => apiClient.patch('/teams/submissions/desc', { desc })),
    updateRepo: (repo: string) =>
      request<Team>(() => apiClient.patch('/teams/submissions/repo', { repo })),
    updatePres: (pres: string) =>
      request<Team>(() => apiClient.patch('/teams/submissions/pres', { pres })),
  }

  const Flags = {
    fetch: () => request<Flags>(() => apiClient.get('/accounts/flags')),
  }

  // Additional groups (Superusers, Badge piles, Flag stages) can be added later.

  return { Accounts, Teams, Submissions, Flags }
}

export const openhackApi = createApiHelpers()
```

### Extensibility Hooks
- `createApiHelpers(customClient)` enables dependency injection for tests.
- Optional future addition: `withAuth(token)` or interceptors if we move token
  management outside `apiClient`.
- The helper factory can be split into sub-modules later if domains grow.

---

## 4. Rune Refactor Strategy

After introducing `openhackApi`, update runes to handle success/error flows
consistently.

### Account Rune (`src/runes/accountRune.ts`)
- Replace direct axios calls with `openhackApi.Accounts.*`.
- Continue using `setAuthToken` + `accountRune.set` on success.
- Bubble up `ApiError` so UI can react (e.g., show toast on `status === 401`).

```ts
import { writable } from 'svelte/store'
import { openhackApi, type ApiError, isApiError } from '$lib/api/openhackApi'
import { setAuthToken } from '$lib/apiClient'
import type { Account } from '$types/account'

export const accountRune = writable<Account | null>(null)

export async function register(email: string, password: string) {
  const { token, account } = await openhackApi.Accounts.register({ email, password })
  setAuthToken(token)
  accountRune.set(account)
  return account
}

export async function login(email: string, password: string) {
  const { token, account } = await openhackApi.Accounts.login({ email, password })
  setAuthToken(token)
  accountRune.set(account)
  return account
}

export async function whoami() {
  const account = await openhackApi.Accounts.whoami()
  accountRune.set(account)
  return account
}

export function logout() {
  setAuthToken(null)
  accountRune.set(null)
}
```

### Team Rune (`src/runes/teamRune.ts`)
- Align endpoints with backend (PATCH + query params).
- Maintain a separate `teamMembersRune` (`Account[]`) fed by join/leave/kick responses; still call `detail()` when full team data is required.

```ts
import { writable } from 'svelte/store'
import {
  openhackApi,
  type AccountTokenResponse,
  type AccountMembersResponse,
  type TeamMembersResponse,
} from '$lib/api/openhackApi'
import { setAuthToken } from '$lib/apiClient'
import { accountRune } from './accountRune'
import type { Team } from '$types/team'
import type { Account } from '$types/account'

export const teamRune = writable<Team | null>(null)
export const teamMembersRune = writable<Account[]>([])

export async function getTeam() {
  const team = await openhackApi.Teams.detail()
  teamRune.set(team)
  return team
}

function applyMembers(members: Account[]) {
  teamMembersRune.set(members)
}

async function refreshAuth({ token, account }: AccountTokenResponse) {
  setAuthToken(token)
  accountRune.set(account)
}

export async function loadMembers() {
  const members = await openhackApi.Teams.members()
  applyMembers(members)
  return members
}

export async function createTeam(name: string) {
  const response = await openhackApi.Teams.create(name)
  await refreshAuth(response)
  const team = await getTeam()
  await loadMembers()
  return team
}

export async function join(teamId: string) {
  const response: AccountMembersResponse = await openhackApi.Teams.join(teamId)
  await refreshAuth(response)
  applyMembers(response.members)
  return getTeam()
}

export async function leave() {
  const response: AccountMembersResponse = await openhackApi.Teams.leave()
  await refreshAuth(response)
  teamRune.set(null)
  teamMembersRune.set([])
  return response
}

export async function kick(accountId: string) {
  const { members }: TeamMembersResponse = await openhackApi.Teams.kick(accountId)
  applyMembers(members)
  return getTeam()
}
```

### Submission Rune (`src/runes/submissionRune.ts`)
- Swap direct axios calls for `openhackApi.Submissions.*`.
- Each update still calls `getTeam()` or a refactored helper to sync `teamRune`
  and `submissionRune`.
- Since helpers now return full `Team` objects, we can set both stores in one
  place.

```ts
import { writable } from 'svelte/store'
import { openhackApi } from '$lib/api/openhackApi'
import { getTeam } from './teamRune'
import type { Submission } from '$types/team'

export const submissionRune = writable<Submission | null>(null)

async function refreshTeamSubmission() {
  try {
    const team = await getTeam()
    submissionRune.set(team?.submission ?? null)
  } catch (err) {
    // swallow errors; caller handles via ApiError if needed
  }
}

export async function updateName(name: string) {
  await openhackApi.Submissions.updateName(name)
  await refreshTeamSubmission()
}
// ...same for updateDesc/updateRepo/updatePres
```

### Flags Rune (`src/runes/flagsRune.ts`)
- Optionally switch to `openhackApi.Flags.fetch` for clarity.
- Error behavior (swallow inside polling) remains the same but errors now
  carry normalized payloads if inspected.

---

## 5. Error Propagation Example (Negative Path)

Scenario: User attempts to join a team while already on a team.

1. **Component** calls `join(teamId)` and `catch`es `ApiError`.
   ```ts
   try {
     await join(teamId)
   } catch (err) {
     if (isApiError(err) && err.status === 409) {
       toast(err.message) // "account already has a team"
     }
   }
   ```

2. **Rune** executes:
   ```ts
   const response = await openhackApi.Teams.join(teamId)
   // throws ApiError before reaching here
   ```

3. **Helper** `Teams.join` calls:
   ```ts
   request(() => api.patch('/teams/join', undefined, { params: { id: teamId } }))
   ```

4. **Backend** (`internal/teams/teammates_handlers.go:55`) detects the conflict
   and responds with HTTP 409 + JSON `{ "message": "account already has a team" }`.

5. **Axios** rejects; `request` catches and calls `toApiError`, producing:
   ```ts
   {
     name: 'ApiError',
     status: 409,
     message: 'account already has a team',
     payload: { message: 'account already has a team' },
   }
   ```

6. **Rune** receives the error; since no token/store updates occurred, state
   remains unchanged.

7. **Component** handles the error via `status`/`message`.

This flow is identical for other negative paths (e.g., wrong password, missing
team) with status codes `401`, `404`, etc.

---

## 6. Implementation Checklist

1. **Create helper module** (`src/lib/api/openhackApi.ts`) with:
   - DTO interfaces per contract path (expand beyond the sample above).
   - `ApiError` handling utilities.
   - Grouped helper functions (Accounts, Teams, Submissions, Flags; extend to
     Superusers later).

2. **Refactor runes** to use helpers and update token/account/team state
   appropriately, including populating the new `teamMembersRune` from mutation
   responses. Validate that success paths trigger store updates; failure
   paths bubble `ApiError`.

3. **Update submission rune** to rely on helpers and team refresh.

4. **Optional**: add Svelte store/unit tests with mocked axios to verify error
   propagation and state management (using `createApiHelpers(mockClient)`).

5. **Optional backend follow-up**: consider allowing team creation payload to
   set the initial name; fix `SubmissionChangePres` event actor role.

---

## 7. References

- Backend event emitter tests (`internal/events/emitter_test.go`) illustrate
  how events behave in different deployment configs.
- Backend helper-style tests (`test/helpers/*.go`) inspire the frontend helper
  structure we’re adopting.
- OpenAPI contract (`openhack-backend/api_spec.yaml`) should be the authoritative
  source when adding new helper functions. Confirm the path/method and
  request/response schema before coding.
- Existing TypeScript types (`logic-only/src/types`) align with
  `openhack-backend/models.json`. Extend them if new schemas are introduced.

---

This document should contain all the context required to continue the helper
implementation and rune refactor without re-deriving previous discussions.
