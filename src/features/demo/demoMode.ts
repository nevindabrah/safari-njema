// Test mode is on whenever Supabase is not configured. You are signed in as a test user and data stays in this browser.
// Exists so the whole loop can be tried on a fresh clone, before any account or key is set up. It never runs on the live site.
import { isSupabaseConfigured } from '../../lib/supabase'

export const isTestMode = !isSupabaseConfigured

export const TEST_USER = { id: 'test-user', email: 'tester@safari-njema.test' }
