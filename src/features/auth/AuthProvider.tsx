// Holds the signed in user and keeps it in sync with Supabase auth. In demo mode it holds the demo user instead.
// Exists so every screen reads the user from one context instead of asking Supabase again.
import { createContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { isDemoMode, DEMO_USER } from '../demo/demoMode'

// The only parts of a user the app reads. A Supabase user fits this shape.
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

// Demo visitors start signed out, so the landing page comes first. One tap on the demo button signs them in.
const SIGNED_IN_KEY = 'safari-njema-demo-signed-in'

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
