// Demo mode is on whenever Supabase is not configured. Visitors get a ready-made account that lives in their browser.
// Exists so a recruiter or a fresh clone can try the whole product with no sign up, no keys and no server.
import { isSupabaseConfigured } from '../../lib/supabase'

export const isDemoMode = !isSupabaseConfigured

export const DEMO_USER = { id: 'demo-user', email: 'demo@safari-njema.app' }
