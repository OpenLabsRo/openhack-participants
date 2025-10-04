import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import * as path from 'path'

export default defineConfig({
  plugins: [svelte()],
  server: { port: 5173 },
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $components: path.resolve('./src/lib/components'),
      $runes: path.resolve('./src/runes'),
      $routes: path.resolve('./src/routes'),
      $api: path.resolve('./src/lib/api'),
      $types: path.resolve('./src/types'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})
