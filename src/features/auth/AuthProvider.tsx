// Holds the signed in user and keeps it in sync with Supabase auth. In demo mode it holds the demo user instead.
// Exists so every screen reads the user from one context instead of asking Supabase again.
import { createContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { isDemoMode, accountsAvailable, leaveDemo, DEMO_USER, DEMO_SIGNED_IN_KEY } from '../demo/demoMode'

export interface AppUser {
  id: string
  email?: string
}

export interface AuthState {
  user: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
  signInAsDemoUser: () => void
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signOut: async () => {},
  signInAsDemoUser: () => {},
})

const SIGNED_IN_KEY = DEMO_SIGNED_IN_KEY

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setUser(localStorage.getItem(SIGNED_IN_KEY) ? DEMO_USER : null)
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
    if (isDemoMode) {
      if (accountsAvailable) return leaveDemo()
      localStorage.removeItem(SIGNED_IN_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  function signInAsDemoUser() {
    if (!isDemoMode) return
    localStorage.setItem(SIGNED_IN_KEY, '1')
    setUser(DEMO_USER)
  }

  return <AuthContext.Provider value={{ user, loading, signOut, signInAsDemoUser }}>{children}</AuthContext.Provider>
}
