// The Supabase client, created once and shared by the whole app.
// Exists so no screen creates its own connection or reads env vars directly.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Without these values the app runs as the demo. Sign up, login and saved trips need a real project. See docs/SETUP.md.
export const isSupabaseConfigured = !!url && !!anonKey

// In a demo build there is no client, and nothing may call it: every use sits behind a check for demo mode.
// Vite knows the two values at build time, so in a demo build the bundler removes the Supabase library altogether.
// The condition is written out here, not read from the constant above, because the bundler only removes code it can see is dead.
export const supabase: SupabaseClient = url && anonKey ? createClient(url, anonKey) : (null as unknown as SupabaseClient)
