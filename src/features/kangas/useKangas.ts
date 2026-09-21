// Loads the kanga shelf: one kanga per lesson, earned when the lesson is finished.
// Exists so the screen only draws. A kanga comes from the lesson's own content, so nothing extra is stored.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { isDemoMode } from '../demo/demoMode'
import { listLocalKangas } from '../demo/localStore'
import { ensureDemoTrip } from '../demo/demoTrip'

export interface ShelfKanga {
  userLessonId: string
  placeName: string
  googlePlaceId: string
  proverb: string
  meaning: string
  earned: boolean
}

interface LessonRow {
  id: string
  status: string
  lesson: { content: { kanga?: { proverb: string; meaning: string } } } | null
  trip_stop: { position: number; place: { name: string; google_place_id: string } } | null
}

export function useKangas() {
  const [kangas, setKangas] = useState<ShelfKanga[] | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (isDemoMode) {
        await ensureDemoTrip()
        if (!cancelled) setKangas(listLocalKangas())
        return
      }
      const { data } = await supabase.from('user_lessons').select('id, status, lesson:lessons(content), trip_stop:trip_stops(position, place:places(name, google_place_id))')
      const rows = ((data ?? []) as unknown as LessonRow[]).filter((r) => r.lesson?.content.kanga && r.trip_stop)
      rows.sort((a, b) => a.trip_stop!.position - b.trip_stop!.position)
      if (!cancelled) {
        setKangas(rows.map((r) => ({
          userLessonId: r.id,
          placeName: r.trip_stop!.place.name,
          googlePlaceId: r.trip_stop!.place.google_place_id,
          proverb: r.lesson!.content.kanga!.proverb,
          meaning: r.lesson!.content.kanga!.meaning,
          earned: r.status === 'completed',
        })))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return kangas
}
