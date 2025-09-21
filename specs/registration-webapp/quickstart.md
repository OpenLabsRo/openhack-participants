# quickstart.md

This quickstart shows how to run the frontend locally and exercise the
basic register/login flows against the backend.

Prerequisites

- Node.js 18+
- Backend running and accessible at configured BASE_URL

Steps

1. Create a new Svelte project (not SvelteKit). Use TypeScript.
2. Install dependencies:
   - axios
   - svelte-run (Svelte 5 runes)
   - a fast Svelte router (e.g., @roxi/routify or tinro)
   - qrcode generator (eg. qrcode)
   - debounce utility (eg. lodash.debounce)
   - vitest + testing-library
3. Implement `src/lib/apiClient.ts` wrapping axios and normalizing
   responses to `models.json` shapes.
4. Implement runes modules in `src/lib/runes/` (accountRune, teamRune,
   submissionRune, flagsRune) as described in `data-model.md`.
5. Run the dev server and test flows:
   - Open the app, test `POST /accounts/check` with a preinitialized
     account email → follow register flow.
   - Test login with `POST /accounts/login`.
   - After login, verify team flows and submissions.

Notes

- Default polling interval for flags is 5s; if websocket is available
  update `flagsRune.subscribeWs()` to use the socket.
- Debounced saves: 800ms.
