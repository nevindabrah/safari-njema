// Decides whether this visit runs as the demo: always when Supabase is not configured, and otherwise when the visitor chose "Try the demo".
// Exists so one site can serve both a recruiter who wants to look around with no sign up and a student who wants a real account.
import { isSupabaseConfigured } from '../../lib/supabase'

export const accountsAvailable = isSupabaseConfigured

const CHOSE_DEMO_KEY = 'safari-njema-chose-demo'
export const DEMO_SIGNED_IN_KEY = 'safari-njema-demo-signed-in'

function visitorChoseDemo(): boolean {
  try {
    return localStorage.getItem(CHOSE_DEMO_KEY) === '1'
  } catch {
    return false
  }
}

export const isDemoMode = !isSupabaseConfigured || visitorChoseDemo()

export const DEMO_USER = { id: 'demo-user', email: 'demo@safari-njema.app' }

export function enterDemo() {
  localStorage.setItem(CHOSE_DEMO_KEY, '1')
  localStorage.setItem(DEMO_SIGNED_IN_KEY, '1')
  window.location.assign('/trip')
}

export function leaveDemo(goTo = '/') {
  localStorage.removeItem(CHOSE_DEMO_KEY)
  localStorage.removeItem(DEMO_SIGNED_IN_KEY)
  window.location.assign(goTo)
}
