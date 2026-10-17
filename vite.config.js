// vite.config.js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  // In production (GitHub Pages), files live under /listbuilder_we/
  // In dev (npm run dev), files live at /
  base: command === 'build' ? '/listbuilder_we/' : '/',
}))