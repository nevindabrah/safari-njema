// The Supabase client, created once and shared by the whole app.
// Exists so no screen creates its own connection or reads env vars directly.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Without these values the app still boots, so the public pages and the sample lesson work.
// Sign up, login and the trip planner need a real project. See the README.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'not-configured')
