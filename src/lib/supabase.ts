// The Supabase client, created once and shared by the whole app.
// Exists so no screen creates its own connection or reads env vars directly.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').replace(/\s+/g, '').replace(/\/+$/, '') || undefined
const anonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '').replace(/\s+/g, '') || undefined

export const isSupabaseConfigured = !!url && !!anonKey

export const supabase: SupabaseClient = url && anonKey ? createClient(url, anonKey) : (null as unknown as SupabaseClient)
