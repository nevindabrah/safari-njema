// Loads the user's one trip, creating it on first login.
// Exists because the cut has no onboarding: the trip simply appears.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Trip } from '../../lib/types'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'
import { getLocalTrip } from '../demo/localStore'

export function useTrip() {
  const { user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    if (isDemoMode) {
      setTrip(getLocalTrip())
      return
    }
    let cancelled = false

    async function load() {
      const { data: existing, error: readError } = await supabase
        .from('trips')
        .select('id, user_id, title, start_date, end_date')
        .eq('user_id', user!.id)
        .order('created_at')
        .limit(1)
        .maybeSingle()
      if (readError) {
        if (!cancelled) setError(readError.message)
        return
      }
      if (existing) {
        if (!cancelled) setTrip(existing)
        return
      }
      const { data: created, error: insertError } = await supabase
        .from('trips')
        .insert({ user_id: user!.id, title: 'My trip to Kenya' })
        .select('id, user_id, title, start_date, end_date')
        .single()
      if (!cancelled) {
        if (insertError) setError(insertError.message)
        else setTrip(created)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  return { trip, error }
}
