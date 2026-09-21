// Holds the signed in user and keeps it in sync with Supabase auth. In test mode it holds the test user instead.
// Exists so every screen reads the user from one context instead of asking Supabase again.
import { createContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { isTestMode, TEST_USER } from '../testmode/testMode'

// The only parts of a user the app reads. A Supabase user fits this shape.
export interface AppUser {
  id: string
  email?: string
}

export interface AuthState {
  user: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
  signInAsTester: () => void
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signOut: async () => {},
  signInAsTester: () => {},
})

// Test mode remembers a sign out, so the public pages and the login screen can be tried too.
const SIGNED_OUT_KEY = 'safari-njema-test-signed-out'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isTestMode) {
      setUser(localStorage.getItem(SIGNED_OUT_KEY) ? null : TEST_USER)
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signOut() {
    if (isTestMode) {
      localStorage.setItem(SIGNED_OUT_KEY, '1')
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  function signInAsTester() {
    if (!isTestMode) return
    localStorage.removeItem(SIGNED_OUT_KEY)
    setUser(TEST_USER)
  }

  return <AuthContext.Provider value={{ user, loading, signOut, signInAsTester }}>{children}</AuthContext.Provider>
}
