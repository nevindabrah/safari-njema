/// <reference types="vitest/config" />
// Vite build config. Adds the React and Tailwind plugins and points Vitest at the lib tests.
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // The libraries change far less often than our code, so they get their own files and stay cached across deploys.
        manualChunks(id: string) {
          if (id.includes('node_modules/@supabase')) return 'supabase'
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react'
        },
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'supabase/functions/_shared/*.test.ts'],
  },
})
