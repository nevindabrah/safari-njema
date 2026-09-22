// Loads one trip: the user's own, created on first visit, or a friend's trip they were invited onto when an id is given.
// Exists because the cut has no onboarding: the trip simply appears. Row Level Security decides which shared trips can be seen.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Trip } from '../../lib/types'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'
import { getLocalTrip, updateLocalTripDates } from '../demo/localStore'

const TRIP_SELECT = 'id, user_id, title, start_date, end_date'

export function useTrip(tripId: string | null = null) {
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
    setTrip(null)
    setError(null)

    async function load() {
      if (tripId) {
        const { data, error: readError } = await supabase.from('trips').select(TRIP_SELECT).eq('id', tripId).maybeSingle()
        if (cancelled) return
        if (readError) setError(readError.message)
        else if (!data) setError('That trip is not shared with you, or it was deleted.')
        else setTrip(data)
        return
      }
      const { data: existing, error: readError } = await supabase.from('trips').select(TRIP_SELECT).eq('user_id', user!.id).order('created_at').limit(1).maybeSingle()
      if (readError) {
        if (!cancelled) setError(readError.message)
        return
      }
      if (existing) {
        if (!cancelled) setTrip(existing)
        return
      }
      const { data: created, error: insertError } = await supabase.from('trips').insert({ user_id: user!.id, title: 'My trip to Kenya' }).select(TRIP_SELECT).single()
      if (!cancelled) {
        if (insertError) setError(insertError.message)
        else setTrip(created)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, tripId])

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

  const isOwner = !!trip && !!user && trip.user_id === user.id

  return { trip, error, updateDates, isOwner }
}
