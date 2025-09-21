Integration test runner

This folder contains integration test specs and optional MSW-based mocks for deterministic runs.

How to run:

- Unit tests (fast, default):

  npm run test

- Integration tests (live against API):

  # WARNING: this hits the resolved API base and may change real data

  npm run test:integration:live

- Integration tests with mocks (deterministic):

  # Runs the integration specs while starting the MSW node server defined in test/integration/mocks

  npm run test:integration:mock

Notes:

- The mock handlers live at `test/integration/mocks/handlers.ts` and are only used when `USE_MOCKS=true`.
- `test:integration:live` requires `CONFIRM_LIVE=true` in the environment to avoid accidental live runs.
