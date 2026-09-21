/// <reference types="vitest/config" />
// Vite build config. Adds the React and Tailwind plugins and points Vitest at the lib tests.
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts', 'supabase/functions/_shared/*.test.ts'],
  },
})
