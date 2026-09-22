// Loads the user's one trip, creating it on first login.
// Exists because the cut has no onboarding: the trip simply appears.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Trip } from '../../lib/types'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'
import { getLocalTrip, updateLocalTripDates } from '../demo/localStore'

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

  async function updateDates(startDate: string | null, endDate: string | null) {
    if (!trip) return
    const end = startDate && endDate && endDate < startDate ? startDate : endDate
    if (isDemoMode) {
      setTrip({ ...updateLocalTripDates(startDate, end) })
      return
    }
    setTrip({ ...trip, start_date: startDate, end_date: end })
    await supabase.from('trips').update({ start_date: startDate, end_date: end }).eq('id', trip.id)
  }

  return { trip, error, updateDates }
}
