// Checks a Supabase project against what Safari Njema needs, using only the public values in .env.
// Exists so setup mistakes show up as a plain list in the terminal, not as a blank screen in the browser.
// Run: node scripts/checkSupabase.ts
import { existsSync, readFileSync } from 'node:fs'

if (!existsSync('.env')) {
  console.log('No .env file. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  process.exit(1)
}
const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n').filter((line) => line.includes('=') && !line.trim().startsWith('#')).map((line) => {
    const at = line.indexOf('=')
    return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
  }),
)
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.log('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is empty in .env.')
  process.exit(1)
}

const headers = { apikey: key, Authorization: `Bearer ${key}` }
let problems = 0
function report(ok: boolean, good: string, bad: string) {
  console.log(ok ? `  ok    ${good}` : `  FIX   ${bad}`)
  if (!ok) problems++
}

console.log(`Checking ${url}\n`)

// 1. Every table exists. Row Level Security hides the rows from this anonymous check, so a 200 with no rows is a pass.
const tables = ['profiles', 'user_settings', 'trips', 'places', 'trip_stops', 'phrases', 'proverbs', 'lessons', 'user_lessons', 'phrase_progress', 'speaking_attempts', 'phrase_reports', 'user_kangas']
for (const table of tables) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers })
  const rows = response.ok ? ((await response.json()) as unknown[]) : []
  report(response.ok, `table ${table}`, `table ${table} is missing (HTTP ${response.status}). Run supabase/setup.sql in the SQL editor.`)
  // An anonymous visitor must never see rows. If one comes back, Row Level Security is off for that table.
  if (response.ok && rows.length > 0) report(false, '', `table ${table} shows rows to an anonymous visitor. Row Level Security is not protecting it.`)
}

// 2. The phrase bank has the sort_order column from the fourth migration.
const sortOrder = await fetch(`${url}/rest/v1/phrases?select=sort_order&limit=1`, { headers })
report(sortOrder.ok, 'phrases.sort_order column', 'phrases.sort_order is missing. Migration 0004 has not been run.')

// 3. The database function that adds a stop.
const rpc = await fetch(`${url}/rest/v1/rpc/add_trip_stop`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: '{}' })
report(rpc.status !== 404, 'function add_trip_stop', 'function add_trip_stop is missing. Migration 0003 has not been run.')

// 4. Sign in settings.
const settings = await fetch(`${url}/auth/v1/settings`, { headers })
if (settings.ok) {
  const auth = (await settings.json()) as { external?: Record<string, boolean>; disable_signup?: boolean; mailer_autoconfirm?: boolean }
  report(auth.external?.email === true, 'email sign up is on', 'email sign up is off. Turn it on under Authentication, Sign In / Providers.')
  report(auth.external?.google === true, 'Google sign in is on', 'Google sign in is off. Follow "Google sign in" in docs/SETUP.md.')
  report(auth.disable_signup !== true, 'new sign ups are allowed', 'new sign ups are disabled under Authentication settings.')
  console.log(`  note  email confirmation is ${auth.mailer_autoconfirm ? 'OFF, so sign up logs you straight in' : 'ON, so new users must click a link in their inbox first'}`)
} else {
  report(false, '', `could not read the auth settings (HTTP ${settings.status}). Check the URL and anon key.`)
}

// 5. The Edge Function. Without a signed in user it should refuse with 401, which proves it is deployed.
const fn = await fetch(`${url}/functions/v1/generate-lesson`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: '{}' })
report(fn.status !== 404, `Edge Function generate-lesson is deployed (answered ${fn.status})`, 'Edge Function generate-lesson is not deployed. Run: npx supabase functions deploy generate-lesson')

console.log(problems === 0 ? '\nEverything this script can see is ready.' : `\n${problems} thing${problems === 1 ? '' : 's'} to fix.`)
console.log('It cannot see whether the phrases were seeded, because Row Level Security hides them. Sign in to the app and add a stop to check that.')
process.exit(problems === 0 ? 0 : 1)
