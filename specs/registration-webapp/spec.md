# Feature Specification: Registration Webapp

**Feature Branch**: `###-registration-webapp`
**Created**: 2025-09-21
**Status**: Draft
**Input**: User description and backend API models

Tech choices: Svelte (no SvelteKit), TypeScript, tiny SPA router: `tinro`,
HTTP client: axios, state: Svelte 5 runes. Debounce interval MUST be
configurable (default 800ms).

## Execution Flow (main)

```
1. Participant opens the webapp (SPA) on supported browsers
   → App requests feature flags from the backend at `GET /accounts/flags`.
     (This participant-facing endpoint exists per your update.)
2. Sign-up/registration flow (pre-initialized accounts):
   → User enters email address
   → App calls `POST /accounts/check` with `{ "email": "..." }`
     to verify the account exists. The backend returns `{ "registered": <bool> }`.
   → Interpreting `registered`: if `registered: true` then the account
     already has a password set and the Login form should be shown. If
     `registered: false` then the account is preinitialized (password is
     an empty string) and the Register flow (create password) should be shown.
   → Initializing accounts by administrators (via `POST /superusers/accounts/initialize`) is a
     prerequisite: participants cannot register unless the account was initialized.
   → If `POST /accounts/check` returns 404 → show "Account not found" and
     surface error messaging per error handling rules below.
3. Create Password / Register:
   → Validate password local rules (length >= 8 by default; confirm policy with backend).
   → If valid: POST `/accounts/register` with `{ "email", "password" }`.
   → Handle errors such as 400 (account already registered) and
     500; surface unobtrusive errors to the user and log for telemetry.
   → On success (200) server returns `{ "token", "account" }`; store token and
     mark user as logged in.
   → Note: Administrators can pre-initialize accounts using
     `POST /superusers/accounts/initialize` (admin-only).
4. Login:
   → User enters email and password → POST `/accounts/login` with
     `{ "email", "password" }`. Handle 401 Unauthorized (wrong
     password) and 404 Not Found (account missing) with clear messages.
   → On success server returns `{ "token", "account" }`; store token locally and call `GET /accounts/whoami` to
     populate account state.
5. Post-login (Main Screen):
   → Display participant info (name, accountId, teamID) from `Account`
     model (see models.json).
   → Show QR code with `account.id` for check-in (superusers use
     `/superusers/checkin/scan?id={accountId}` to scan).
   → Show persistent tab bar (Profile/Main, Teams, Submissions, Voting)
6. Teams tab:
   → If user has no team: show "Create Team" and "Join Team" flows
     (map to `POST /teams` and `PATCH /teams/join?id={teamId}`).
   → If team exists: show team name, join link (copy button) if team
     not full, teammates list from `GET /teams/members`.
   → On teammate card: show name and a "Kick" button which calls
     `PATCH /teams/kick?id={accountId}`. Any teammate may kick another
     teammate provided the request is authenticated with a token that
     belongs to a member of that team (no admin role required).
   → Handle 401/404/500 errors for these actions and show unobtrusive
     error messages and retry options when suitable.
7. Submissions tab:
   → Linked to team; disabled (greyed) if user has no team (server
     returns 404 for `/teams`).
   → Text-only inputs for the submission fields (name, desc, repo,
     pres). Local validation applies.
   → Debounced saves (800ms) map to specific endpoints per field:
     - PATCH `/teams/submissions/name` { name }
     - PATCH `/teams/submissions/desc` { desc }
     - PATCH `/teams/submissions/repo` { repo }
     - PATCH `/teams/submissions/pres` { pres }
   → On 200 update UI with returned `team` object.
8. Voting tab:
   → Controlled by flags. Initially greyed out. When `voting_open` flag
     becomes true: show banner on every page "Voting is open — please
     cast your vote".
9. Runtime flags behavior:
   → On init: fetch flags from `GET /accounts/flags` and apply
     visibility/editability rules. `GET /accounts/flags` REQUIRES an
     Authorization: Bearer token. The Flags model (from backend
     `models.json`) is `{ flags: map[string]bool, stage: FlagStage }`.
     Note: `stage` handling is admin-only and not used by participants,
     but kept in the model.
   → While open: poll the flags endpoint (default interval 5s) and
     apply deltas to the UI. Websocket support is planned but not
     available yet — when implemented the flagsRune SHOULD support a
     websocket subscription. The app MUST handle transient network
     errors when fetching flags and fall back to the last-known flags
     state.
10. Local remembrance:
  → Remember selected tab in localStorage; on app start open that tab
    unless it's been disabled by flags, then open Main/Profile.
  → Remember session token securely in localStorage or secure
    storage; if backend provides a token-exchange on open the client
    SHOULD exchange the old token for a new one (note: backend
    implementation required). If not available, rely on standard token
    expiry/refresh flows.
  → Preinitialized accounts store an empty string for the `password`
    field (not `null`) in the `Account` model per your update.
```

---

## Quick Guidelines

- UX MUST clearly separate "account initialized" vs "account
  registered" states.
- All inputs MUST be validated locally and provide unobtrusive, clear
  error messages.
- All network saves MUST be debounced (800ms) and only send when
  fields are valid.
- All state transitions MUST be testable with unit and integration
  tests.

### Mandatory sections

- Authentication flows (register + login)
- Flags-driven UI visibility/editability
- Teams model and membership flows
- Submissions (team-scoped) and Voting gating
- Client-side persistence (localStorage/session storage)

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a hackathon participant, I want to register an account that was
pre-initialized for my email, log in, see my profile and QR check-in
code, manage or join a team, add submissions for my team (if allowed),
and vote when voting is opened so I can participate in the event.

### Acceptance Scenarios

1. Given an initialized account without a password, When I provide my
   email and create a password, Then the app registers the password,
   returns a session, and shows the main screen with a QR code.
2. Given an initialized account with a password, When I provide email
   and correct password, Then I am logged in and shown the main screen.
3. Given I have no team, the Submissions tab is disabled and cannot be
   edited or accessed.
4. Given `voting_open=false`, When I navigate the app, Then no voting
   banner is shown; when `voting_open=true`, a banner appears on all
   pages.
5. Given I edit a team field with invalid input, When I stop typing,
   Then the field shows an error and no network request is sent.
6. Given I edit a team field with valid input, When I stop typing for
   800ms, Then a debounced PATCH to the backend saves the change.

### Edge Cases

- Network flaps during debounced save — client must retry with
  exponential backoff and inform the user unobtrusively.
- Remembered tab is disabled by flags — app opens profile/main tab.
- Team full — Copy join link should be disabled and show reason.
- Race condition: member kicked while viewing team — UI must refresh
  state and surface a transient notice.

## Requirements _(mandatory)_

### Functional Requirements (mapped to documented API)

- **FR-001**: Client MUST obtain Flags on init and subscribe to updates
  from `GET /accounts/flags`. `stage` is present in the model but is
  admin-only; participants ignore stage logic.
- **FR-002**: Client MUST POST `/accounts/check` with `{ email }` to
  verify account existence. Map 200 `{ registered: true }` to an
  existing account (meaning password is set). If `{ registered: false }`
  then the account is preinitialized (password is an empty string) and
  the register flow is shown. 404 -> Account not found.
- **FR-003**: To create a password / register, client MUST call
  `POST /accounts/register` with `{ email, password }`. On success the
  server returns `{ token, account }` (200). Client MUST handle 400
  (account already registered), 500 and show appropriate unobtrusive
  messages.
- **FR-004**: Login MUST use `POST /accounts/login` with `{ email,
password }` and persist the returned `{ token, account }` locally.
- **FR-005**: Client MUST call `GET /accounts/whoami` to fetch current
  account details after authentication; fields map to `Account` model
  (see models.json: `id, email, password, name, teamID`).
- **FR-006**: Teams endpoints to implement UI behavior:
  - `GET /teams` → returns `{ "team": Team }` or 404 if no team
  - `POST /teams` `{ name }` → create team
  - `PATCH /teams` `{ name }` → rename team
  - `DELETE /teams` → delete team's account
  - `GET /teams/members` → list members
  - `PATCH /teams/join?id={teamId}` → join
  - `PATCH /teams/leave` → leave
  - `PATCH /teams/kick?id={accountId}` → kick
- **FR-007**: Submission edits MUST call the mapped endpoints:
- **FR-010**: The client MUST maintain a websocket (or similar)
  subscription for membership events where available; if a participant
  is kicked from their team, the backend will emit a kicked event and
  the frontend MUST update state immediately (e.g., remove team data,
  disable submissions tab) and surface a transient notice.

  - `PATCH /teams/submissions/name` `{ name }`
  - `PATCH /teams/submissions/desc` `{ desc }`
  - `PATCH /teams/submissions/repo` `{ repo }`
  - `PATCH /teams/submissions/pres` `{ pres }`
    These return updated `team` objects.

- **FR-008**: Inputs on Teams and Submissions pages MUST validate
  locally and only send requests when valid and debounced (800ms).
- **FR-009**: Client MUST remember selected tab and stored session
  token and restore them on next open.

### Key Entities (from backend models.json)

- **Account**: `{ id, email, password, name, teamID }` — `password` may
  be empty for preinitialized accounts (TODO confirm). The client MUST
  not store raw password; use it only for login/register requests.
- **Team**: `{ id, name, members: [accountId], submission: { name,
desc, repo, pres }, deleted }` — use `GET /teams` and `GET
/teams/members` to populate UI.
- **Submission**: stored as part of `Team.submission` with fields
  `name`, `desc`, `repo`, `pres`.
- **Flags**: `{ flags: map[string]bool, stage: FlagStage }` (see
  models.json). Flags to use: `teams_visible`, `teams_editable`,
  `submissions_visible`, `submissions_editable`, `voting_open`,
  `voting_visible`.

### Assumptions and TODOs

- TODO: Confirm participant-facing flags endpoint (assume `GET /flags`)
  and whether it requires authentication.
- TODO: Confirm whether `POST /accounts/check` returns a `passwordSet`
  boolean; if not available the client should infer flow by attempting
  login or request additional endpoint.

---

## Review & Acceptance Checklist

- [ ] FR-001..FR-009 implemented with tests
- [ ] Unit tests for input validation
- [ ] Contract tests for `/accounts`, `/accounts/login`, `/teams/*`
- [ ] Integration tests for flag-driven UI behavior
- [ ] Manual QA for QR code and clipboard copy

---

## Execution Status

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed
