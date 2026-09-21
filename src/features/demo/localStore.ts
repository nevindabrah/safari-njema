// Test mode's stand-in for the database: one trip, its stops and their lessons, kept in localStorage.
// Exists so the hooks can swap Supabase for this file with a single if, and nothing else in the app changes.
import type { Lesson } from '../../lib/lessonSchema'
import type { Phrase, StopRow, Trip } from '../../lib/types'
import type { PickedPlace } from '../trip/usePlaceSearch'
import { TEST_USER } from './testMode'

export interface StoredLesson {
  lesson: Lesson
  phrases: Phrase[]
  generatedBy: string
  completed: boolean
}

interface LocalData {
  trip: Trip
  stops: StopRow[]
  lessons: Record<string, StoredLesson>
}

const KEY = 'safari-njema-test-data'

function emptyData(): LocalData {
  return {
    trip: { id: crypto.randomUUID(), user_id: TEST_USER.id, title: 'My trip to Kenya', start_date: null, end_date: null },
    stops: [],
    lessons: {},
  }
}

function read(): LocalData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as LocalData
  } catch {
    // Unreadable data is replaced with a fresh trip below.
  }
  const fresh = emptyData()
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

// Adds the stop in the "generating" state, exactly as the database function does.
export function addLocalStop(place: PickedPlace, visitDate: string | null, activities: string[]): StopRow {
  const data = read()
  const placeId = crypto.randomUUID()
  const stop: StopRow = {
    id: crypto.randomUUID(),
    trip_id: data.trip.id,
    user_id: TEST_USER.id,
    place_id: placeId,
    visit_date: visitDate,
    activities,
    position: data.stops.length + 1,
    lesson_status: 'generating',
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
  stop.user_lessons = [{ id: userLessonId }]
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

export function getLocalLesson(userLessonId: string): StoredLesson | null {
  return read().lessons[userLessonId] ?? null
}

export function completeLocalLesson(userLessonId: string) {
  const data = read()
  if (data.lessons[userLessonId]) data.lessons[userLessonId].completed = true
  write(data)
}

export function resetLocalData() {
  localStorage.removeItem(KEY)
}
