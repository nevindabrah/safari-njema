// Row types for the tables the app reads. They mirror supabase/migrations.
// Exists so screens and hooks share one description of the data shapes.

export type PlaceType =
  | 'city' | 'park' | 'beach' | 'market' | 'restaurant' | 'hotel'
  | 'airport' | 'station' | 'religious_site' | 'museum' | 'other'

export type Region =
  | 'nairobi' | 'coast' | 'rift_valley_mara' | 'central_mt_kenya'
  | 'western_lake' | 'north'

export type LessonStatus = 'generating' | 'ready' | 'failed'

export interface Trip {
  id: string
  user_id: string
  title: string
  start_date: string | null
  end_date: string | null
}

export interface Place {
  id: string
  google_place_id: string
  name: string
  lat: number
  lng: number
  google_types: string[]
  place_type: PlaceType
  region: Region
}

export interface TripStop {
  id: string
  trip_id: string
  user_id: string
  place_id: string
  visit_date: string | null
  activities: string[]
  position: number
  lesson_status: LessonStatus
  place: Place
}

// A stop as the itinerary shows it: the stop, its place, and the id of its lesson once there is one.
export interface StopRow extends TripStop {
  user_lessons: { id: string; status?: string }[]
}

export interface Phrase {
  id: string
  swahili: string
  pronunciation: string
  english: string
  tags: string[]
  verified: boolean
}

export const ACTIVITIES = [
  'eating out', 'shopping', 'game drive', 'beach', 'nightlife',
  'meeting family', 'public transport', 'hiking', 'business meeting',
] as const

export type Activity = (typeof ACTIVITIES)[number]
