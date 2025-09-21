# data-model.md

**Feature**: Registration Webapp
**Date**: 2025-09-21

This document maps backend models (`models.json`) to client-side types and
explains how the client stores them in runes.

## Backend model -> Client types

- Account

  - id: string
  - email: string
  - password: string (empty string for preinitialized accounts)
  - name: string
  - teamID: string (empty string if the user has no team)

- Team

  - id: string
  - name: string
  - members: string[] (array of account ids)
  - submission: { name: string, desc: string, repo: string, pres: string }
  - deleted: boolean

- Flags
  - flags: Record<string, boolean>
  - stage: { id: string, name: string, turnoff: string[], turnon: string[] }

## Client-side runes (state modules)

We will create small modules that export a rune and functions to interact
with the backend. Each rune holds the model-shaped data and is the single
source of truth for the UI.

- accountRune module

  - rune: `accountRune` -> reactive Account | null
  - functions: `check(email)`, `register(email,password)`, `login(email,password)`, `whoami()`, `updateName(name)`, `logout()`
  - behavior: each function performs axios call via `apiClient`, updates
    `accountRune` with returned `Account` object (shaped exactly like
    models.json), and persists token locally when relevant.

- teamRune module

  - rune: `teamRune` -> reactive Team | null
  - functions: `get()`, `create(name)`, `updateName(name)`, `delete()`, `join(teamId)`, `leave()`, `kick(accountId)`, `getMembers()`
  - behavior: functions call mapped endpoints, update `teamRune` with the
    returned `team` object; `getMembers()` may populate a separate
    `membersRune` if richer member objects are needed.

- submissionRune module

  - rune: `submissionRune` -> reactive submission object
  - functions: `updateName(name)`, `updateDesc(desc)`, `updateRepo(repo)`, `updatePres(pres)` — each debounced and saves via the
    specific PATCH endpoints; on success update `teamRune.submission`.
  - note: debounce SHOULD be implemented in the UI layer (components) — i.e. the
    input component debounces user typing and calls the rune's save function
    after the configured idle interval (default 800ms). Runes expose the
    low-level save functions (e.g. `updateDesc`) and MAY also export an
    optional debounced helper, but the canonical behavior is: UI debounces,
    then calls rune to persist. This keeps intent explicit and keeps runes
    simple and testable.

- flagsRune module
  - rune: `flagsRune` -> reactive Flags
  - functions: `fetchFlags()`, `subscribeWs()`
  - behavior: polling default + optional websocket subscription.

## Data flow

- On app boot: accountRune attempts to read token from localStorage and
  call `whoami()` to populate `accountRune` and `teamRune` (if team
  exists). The `teamID` on the returned `Account` will be an empty string
  when the user has no team. If no token or `whoami()` returns 401/404 → redirect to
  onboarding.
- UI components read from runes directly and do not call axios directly.
- Runes mediate all writes; for example `submissionRune.updateDesc()` will
  validate locally then PATCH to `/teams/submissions/desc` and
  update `teamRune.submission` on success. Validation and the debounce
  behavior belong in the UI component which calls `submissionRune.updateDesc()`;
  the rune itself performs the network call and state update.
