// Browser tests run against the demo build, so they need no Supabase project, no keys and no network. With LIVE=1 a third project runs e2e/live against the project in .env.
// Exists so the flows a student uses most are checked on a phone, a tablet and a laptop on every push, and the account flows can be checked on demand.
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:5190', trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'npx vite --port 5190 --strictPort',
      url: 'http://localhost:5190',
      reuseExistingServer: !process.env.CI,
      env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '', VITE_GOOGLE_MAPS_KEY: '', VITE_GOOGLE_MAP_ID: '' },
    },
    ...(process.env.LIVE && !process.env.LIVE_URL ? [{ command: 'npx vite --port 5191 --strictPort', url: 'http://localhost:5191', reuseExistingServer: true }] : []),
  ],
  projects: [
    { name: 'phone', testIgnore: /live/, use: { ...devices['Pixel 7'] } },
    { name: 'tablet', testIgnore: /live/, use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'laptop', testIgnore: /live/, use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    ...(process.env.LIVE ? [{ name: 'live', testMatch: /live/, use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, baseURL: process.env.LIVE_URL ?? 'http://localhost:5191' } }] : []),
  ],
})
