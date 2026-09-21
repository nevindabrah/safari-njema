// Loads the trip's stops and handles add, delete and lesson generation.
// Exists so TripScreen only renders and this file owns the data calls.
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { TripStop } from '../../lib/types'
import type { PickedPlace } from './usePlaceSearch'

export interface StopRow extends TripStop {
  user_lessons: { id: string }[]
}

const STOP_SELECT = 'id, trip_id, user_id, place_id, visit_date, activities, position, lesson_status, place:places(*), user_lessons(id)'

export function useStops(tripId: string | null) {
  const [stops, setStops] = useState<StopRow[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!tripId) return
    const { data } = await supabase.from('trip_stops').select(STOP_SELECT).eq('trip_id', tripId).order('position')
    setStops((data ?? []) as unknown as StopRow[])
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    reload()
  }, [reload])

  // Calls the Edge Function and waits for it. No realtime subscriptions.
  async function generateLesson(stopId: string) {
    const { error } = await supabase.functions.invoke('generate-lesson', { body: { trip_stop_id: stopId } })
    if (error) {
      await supabase.from('trip_stops').update({ lesson_status: 'failed' }).eq('id', stopId)
    }
    await reload()
  }

  async function addStop(place: PickedPlace, visitDate: string | null, activities: string[]) {
    const { data: stopId, error } = await supabase.rpc('add_trip_stop', {
      p_trip_id: tripId,
      p_google_place_id: place.googlePlaceId,
      p_name: place.name,
      p_lat: place.lat,
      p_lng: place.lng,
      p_google_types: place.googleTypes,
      p_place_type: place.placeType,
      p_region: place.region,
      p_visit_date: visitDate,
      p_activities: activities,
    })
    if (error || !stopId) return
    await reload()
    await generateLesson(stopId as string)
  }

  async function deleteStop(stopId: string) {
    setStops((list) => list.filter((s) => s.id !== stopId))
    await supabase.from('trip_stops').delete().eq('id', stopId)
    await reload()
  }

  async function retryLesson(stopId: string) {
    await supabase.from('trip_stops').update({ lesson_status: 'generating' }).eq('id', stopId)
    await reload()
    await generateLesson(stopId)
  }

  return { stops, loading, addStop, deleteStop, retryLesson }
}
