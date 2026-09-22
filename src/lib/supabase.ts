// The Supabase client, created once and shared by the whole app.
// Exists so no screen creates its own connection or reads env vars directly.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = !!url && !!anonKey

const tidy = (value: string) => value.replace(/\s+/g, '').replace(/\/+$/, '')

export const supabase: SupabaseClient = url && anonKey ? createClient(tidy(url), tidy(anonKey)) : (null as unknown as SupabaseClient)
