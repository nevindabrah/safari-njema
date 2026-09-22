// Holds the signed in user and their profile, kept in sync with Supabase. In demo mode it holds the demo user instead.
// Exists so every screen reads the same user and the same profile, and a saved username is seen everywhere at once.
import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { isDemoMode, accountsAvailable, leaveDemo, DEMO_USER, DEMO_SIGNED_IN_KEY } from '../demo/demoMode'
import { DEMO_PROFILE, PROFILE_COLUMNS, type Profile } from './profile'

export interface AppUser {
  id: string
  email?: string
}

export interface ProfileChanges {
  username?: string
  display_name?: string | null
}

export interface AuthState {
  user: AppUser | null
  loading: boolean
  profile: Profile | null
  profileLoading: boolean
  signOut: () => Promise<void>
  signInAsDemoUser: () => void
  saveProfile: (changes: ProfileChanges) => Promise<string | null>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  profile: null,
  profileLoading: true,
  signOut: async () => {},
  signInAsDemoUser: () => {},
  saveProfile: async () => null,
  refreshProfile: async () => {},
})

const SIGNED_IN_KEY = DEMO_SIGNED_IN_KEY

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

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

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setProfileLoading(false)
      return
    }
    if (isDemoMode) {
      setProfile(DEMO_PROFILE)
      setProfileLoading(false)
      return
    }
    const { data } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle()
    setProfile(data as Profile | null)
    setProfileLoading(false)
  }, [user])

  useEffect(() => {
    setProfileLoading(true)
    refreshProfile()
  }, [refreshProfile])

  async function saveProfile(changes: ProfileChanges): Promise<string | null> {
    if (!user) return 'Not signed in.'
    if (isDemoMode) {
      setProfile((current) => ({ ...(current ?? DEMO_PROFILE), ...changes }))
      return null
    }
    const { error } = await supabase.from('profiles').update(changes).eq('id', user.id)
    if (error) {
      if (error.code === '23505') return 'That username is taken.'
      if (error.code === '23514') return 'Only lower case letters, numbers and underscores, 3 to 20 characters.'
      return error.message
    }
    await refreshProfile()
    return null
  }

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

  return <AuthContext.Provider value={{ user, loading, profile, profileLoading, signOut, signInAsDemoUser, saveProfile, refreshProfile }}>{children}</AuthContext.Provider>
}
