import { defineConfig } from "vite";

// NOTE: The real Svelte plugin is intentionally not imported here to avoid
// ESM-only resolution issues when running node-based test runners in the
// surrounding workspace. Add `@sveltejs/vite-plugin-svelte` back for local
// dev runs if necessary.

export default defineConfig({
  server: { port: 5173 },
});
