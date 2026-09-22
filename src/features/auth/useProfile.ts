// Loads and updates the signed in user's profile row: display name and username.
// Exists so the welcome step, the account page and the friends screen read one profile from one place.
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from './useAuth'
import { isDemoMode } from '../demo/demoMode'

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  is_teacher: boolean
}

const DEMO_PROFILE: Profile = { id: 'demo-user', username: 'demo', display_name: 'Demo traveller', is_teacher: false }

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) return
    if (isDemoMode) {
      setProfile(DEMO_PROFILE)
      setLoading(false)
      return
    }
    const { data } = await supabase.from('profiles').select('id, username, display_name, is_teacher').eq('id', user.id).maybeSingle()
    setProfile(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  async function save(changes: { username?: string; display_name?: string | null }): Promise<string | null> {
    if (!user) return 'Not signed in.'
    if (isDemoMode) {
      setProfile((p) => ({ ...(p ?? DEMO_PROFILE), ...changes }))
      return null
    }
    const { error } = await supabase.from('profiles').update(changes).eq('id', user.id)
    if (error) {
      if (error.code === '23505') return 'That username is taken.'
      if (error.code === '23514') return 'Only lower case letters, numbers and underscores, 3 to 20 characters.'
      return error.message
    }
    await reload()
    return null
  }

  return { profile, loading, save, reload }
}
