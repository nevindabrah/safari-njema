// Demo mode's stand-in for the database: one trip, its stops and their lessons, kept in localStorage.
// Exists so the hooks can swap Supabase for this file with a single if, and nothing else in the app changes.
import type { Lesson } from '../../lib/lessonSchema'
import type { Phrase, StopRow, Trip } from '../../lib/types'
import type { PickedPlace } from '../trip/usePlaceSearch'
import { DEMO_USER } from './demoMode'

export interface StoredLesson {
  lesson: Lesson
  phrases: Phrase[]
  generatedBy: string
}

interface LocalData {
  trip: Trip
  stops: StopRow[]
  lessons: Record<string, StoredLesson>
}

const KEY = 'safari-njema-demo-data-v2'
const SEEDED_KEY = 'safari-njema-demo-seeded-v2'

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function newTrip(): Trip {
  const start = new Date()
  start.setDate(start.getDate() + 14)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return { id: crypto.randomUUID(), user_id: DEMO_USER.id, title: 'My trip to Kenya', start_date: isoDay(start), end_date: isoDay(end) }
}

export function wasDemoSeeded(): boolean {
  return localStorage.getItem(SEEDED_KEY) !== null
}

export function markDemoSeeded() {
  localStorage.setItem(SEEDED_KEY, '1')
}

function read(): LocalData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as LocalData
  } catch {
  }
  const fresh: LocalData = { trip: newTrip(), stops: [], lessons: {} }
  write(fresh)
  return fresh
}

function write(data: LocalData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getLocalTrip(): Trip {
  return read().trip
}

export function listLocalStops(): StopRow[] {
  return read().stops
}

export function addLocalStop(place: PickedPlace, visitDate: string | null, activities: string[]): StopRow {
  const data = read()
  const placeId = crypto.randomUUID()
  const stop: StopRow = {
    id: crypto.randomUUID(),
    trip_id: data.trip.id,
    user_id: DEMO_USER.id,
    place_id: placeId,
    visit_date: visitDate,
    activities,
    position: data.stops.length + 1,
    lesson_status: 'generating',
    private: false,
    place: {
      id: placeId,
      google_place_id: place.googlePlaceId,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      google_types: place.googleTypes,
      place_type: place.placeType,
      region: place.region,
    },
    user_lessons: [],
  }
  data.stops.push(stop)
  write(data)
  return stop
}

export function attachLocalLesson(stopId: string, lesson: StoredLesson) {
  const data = read()
  const stop = data.stops.find((s) => s.id === stopId)
  if (!stop) return
  const userLessonId = crypto.randomUUID()
  data.lessons[userLessonId] = lesson
  stop.user_lessons = [{ id: userLessonId, status: 'ready' }]
  stop.lesson_status = 'ready'
  write(data)
}

export function deleteLocalStop(stopId: string) {
  const data = read()
  const stop = data.stops.find((s) => s.id === stopId)
  for (const userLesson of stop?.user_lessons ?? []) delete data.lessons[userLesson.id]
  data.stops = data.stops.filter((s) => s.id !== stopId)
  data.stops.forEach((s, index) => (s.position = index + 1))
  write(data)
}

export function updateLocalStopDate(stopId: string, visitDate: string | null) {
  const data = read()
  const stop = data.stops.find((s) => s.id === stopId)
  if (stop) stop.visit_date = visitDate
  write(data)
}

export function updateLocalTripDates(startDate: string | null, endDate: string | null): Trip {
  const data = read()
  data.trip.start_date = startDate
  data.trip.end_date = endDate
  write(data)
  return data.trip
}

export function getLocalLesson(userLessonId: string): StoredLesson | null {
  return read().lessons[userLessonId] ?? null
}

export function getLocalLessonPlaceId(userLessonId: string): string | null {
  const stop = read().stops.find((s) => s.user_lessons.some((l) => l.id === userLessonId))
  return stop?.place.google_place_id ?? null
}

export function listLocalKangas() {
  const data = read()
  return data.stops.flatMap((stop) => {
    const userLesson = stop.user_lessons[0]
    const kanga = userLesson && data.lessons[userLesson.id]?.lesson.kanga
    if (!userLesson || !kanga) return []
    return [{ userLessonId: userLesson.id, placeName: stop.place.name, googlePlaceId: stop.place.google_place_id, proverb: kanga.proverb, meaning: kanga.meaning, earned: userLesson.status === 'completed' }]
  })
}

export function completeLocalLesson(userLessonId: string) {
  const data = read()
  for (const stop of data.stops) {
    for (const userLesson of stop.user_lessons) {
      if (userLesson.id === userLessonId) userLesson.status = 'completed'
    }
  }
  write(data)
}

export function startEmptyTrip() {
  markDemoSeeded()
  write({ trip: newTrip(), stops: [], lessons: {} })
}
