// Loads the trip's stops and handles add, delete and lesson generation.
// Exists so TripScreen only renders and this file owns the data calls.
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { StopRow } from '../../lib/types'
import { isDemoMode } from '../demo/demoMode'
import { addLocalStop, attachLocalLesson, deleteLocalStop, listLocalStops } from '../demo/localStore'
import { buildLocalLesson } from '../demo/localLessons'
import { ensureDemoTrip } from '../demo/demoTrip'
import type { PickedPlace } from './usePlaceSearch'

const STOP_SELECT = 'id, trip_id, user_id, place_id, visit_date, activities, position, lesson_status, place:places(*), user_lessons(id, status)'

export function useStops(tripId: string | null) {
  const [stops, setStops] = useState<StopRow[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!tripId) return
    if (isDemoMode) {
      await ensureDemoTrip()
      setStops(listLocalStops())
      setLoading(false)
      return
    }
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

  // Test mode: same steps as the real path, but the lesson is built in the browser.
  async function addLocalStopWithLesson(place: PickedPlace, visitDate: string | null, activities: string[]) {
    const stop = addLocalStop(place, visitDate, activities)
    await reload()
    // A short wait so the "Preparing your lesson" state can be seen, as it would be with a real server.
    await new Promise((resolve) => setTimeout(resolve, 900))
    const lesson = await buildLocalLesson({ placeName: place.name, placeType: place.placeType, region: place.region, activities, firstStop: stop.position === 1 })
    attachLocalLesson(stop.id, lesson)
    await reload()
  }

  async function addStop(place: PickedPlace, visitDate: string | null, activities: string[]) {
    if (isDemoMode) return addLocalStopWithLesson(place, visitDate, activities)
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
    if (isDemoMode) {
      deleteLocalStop(stopId)
      return reload()
    }
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
